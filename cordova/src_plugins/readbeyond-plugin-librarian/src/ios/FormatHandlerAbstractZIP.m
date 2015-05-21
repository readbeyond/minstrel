//
//            _           _            _ 
//           (_)         | |          | |
//  _ __ ___  _ _ __  ___| |_ _ __ ___| |
// | '_ ` _ \| | '_ \/ __| __| '__/ _ \ |
// | | | | | | | | | \__ \ |_| | |  __/ |
// |_| |_| |_|_|_| |_|___/\__|_|  \___|_|
//
// Author:      Alberto Pettarin (www.albertopettarin.it)
// Copyright:   Copyright 2013-2015, ReadBeyond Srl (www.readbeyond.it)
// License:     MIT
// Email:       minstrel@readbeyond.it
// Web:         http://www.readbeyond.it/minstrel/
// Status:      Production
//

#import "FormatHandlerAbstractZIP.h"
#import "RBLibrarian.h"
#import "ZipAsset.h"

@implementation FormatHandlerAbstractZIP

NSString * const PATTERN_AUTHOR             = @"author:(.*?)[\r\n]";
NSString * const PATTERN_COVER              = @"cover:(.*?)[\r\n]";
NSString * const PATTERN_DURATION           = @"duration:(.*?)[\r\n]";
NSString * const PATTERN_LANGUAGE           = @"language:(.*?)[\r\n]";
NSString * const PATTERN_NARRATOR           = @"narrator:(.*?)[\r\n]";
NSString * const PATTERN_PLAYLIST           = @"playlist:(.*?)[\r\n]";
NSString * const PATTERN_SERIES             = @"series:(.*?)[\r\n]";
NSString * const PATTERN_SERIES_INDEX       = @"seriesindex:(.*?)[\r\n]";
NSString * const PATTERN_TITLE              = @"title:(.*?)[\r\n]";

- (id)init
{
    if (self == [super init]) {
        _allowedLowercasedExtensions = nil;
    }
    return self;
}

// add allowed (lowercased) extensions
- (void)addAllowedLowercasedExtensions:(NSArray *)allowedLowercasedExtensions
{
    _allowedLowercasedExtensions = allowedLowercasedExtensions;
}

// set thumbnail info
- (void)setThumbnailInfo:(NSString *)thumbnailDirectoryPath width:(long)thumbnailWidth height:(long)thumbnailHeight
{
    _thumbnailDirectoryPath = thumbnailDirectoryPath;
    _thumbnailHeight        = thumbnailHeight;
    _thumbnailWidth         = thumbnailWidth;
}

// get the format name
- (NSString *)getFormatName
{
    return _formatName;
}
- (void)setFormatName:(NSString *)formatName
{
    _formatName = formatName;
}

// determine whether the given file extension is supported by this FormatHandler
- (BOOL)isParsable:(NSString *)lowercasedFilename
{
    if (_allowedLowercasedExtensions == nil) {
        return YES;
    }
    return [FormatHandlerAbstractZIP fileHasAllowedExtension:lowercasedFilename allowed:_allowedLowercasedExtensions];
}

// return the parsed Publication out of the given file
- (Publication *)parseFile:(NSString *)file
{
    Publication *p = [[Publication alloc] init];
    NSString    *name   = [file lastPathComponent];
    NSString    *ap     = file;
    NSString    *rp     = [file substringFromIndex:([[RBLibrarian getDocumentsDirectoryPath] length]+1)];
    NSString    *id     = [NSString stringWithFormat:@"%lx", (unsigned long)[rp hash]];
    NSString    *title  = [NSString stringWithFormat:@"File %@", name];
    NSDictionary *attrs = [[NSFileManager defaultManager] attributesOfItemAtPath:ap error:nil];

    [p setAbsolutePath:ap];
    [p setRelativePath:rp];
    [p setId:id];
    [p setSize:[attrs fileSize]];
    [p setTitle:title];

    return p;
}

// perform a custom action
- (NSString *)customAction:(NSString *)path parameters:(NSDictionary *)parameters
{
    return @"";
}

+ (NSString *)getZipEntryText:(ZipFile *)zipfile entryPath:(NSString *)entryPath
{
    NSMutableData *data = [FormatHandlerAbstractZIP getZipEntryData:zipfile entryPath:entryPath];
    NSString *text = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    text = [text stringByReplacingOccurrencesOfString:@"\r\n" withString:@"\n"];
    text = [text stringByReplacingOccurrencesOfString:@"\r" withString:@"\n"];
    return text;
}

+ (NSMutableData *)getZipEntryData:(ZipFile *)zipfile entryPath:(NSString *)entryPath
{
    @try {
        BOOL found = [zipfile locateFileInZip:entryPath];
        if (found) {
            // get contents of container
            FileInZipInfo *info = [zipfile getCurrentFileInZipInfo];
            ZipReadStream *read = [zipfile readCurrentFileInZip];
            NSMutableData *data = [[NSMutableData alloc] initWithLength:info.length];
            [read readDataWithBuffer:data];
            [read finishedReading];
            return data;
        }
    }
    @catch (NSException *e) {
        // nop
    }
    return nil;
}

+ (BOOL)fileHasAllowedExtension:(NSString *)lower allowed:(NSArray *)array
{
    for (int i = 0; i < [array count]; i++) {
        if ([lower hasSuffix:[array objectAtIndex:i]]) {
            return YES;
        }
    }
    return NO;
}

+ (NSMutableArray *)getListOfAssets:(NSString *)file allowed:(NSArray *)array
{
    NSMutableArray *assets  = [[NSMutableArray alloc] init];
    @try {
        // open ZIP
        ZipFile *unzipFile  = [[ZipFile alloc] initWithFileName:file mode:ZipFileModeUnzip];
        NSArray *infos      = [unzipFile listFileInZipInfos];
        for (FileInZipInfo *info in infos) {
            NSString *name  = info.name;
            NSString *lower = [info.name lowercaseString];
            if ([FormatHandlerAbstractZIP fileHasAllowedExtension:lower allowed:array]) {
                [assets addObject:[[ZipAsset alloc] init:name medatada:nil]];
            }
        }
        
        // close ZIP
        [unzipFile close];
        
        // sort assets
        [assets sortUsingSelector:@selector(compare:)];
    }
    @catch (NSException *e) {
        // nop
    }
    return assets;
}

- (void)extractCover:(NSString *)f format:(Format *)format publicationId:(NSString *)publicationId
{
    NSString *destinationName = [NSString stringWithFormat:@"%@.%@.png", publicationId, [format getName]];
    NSString *entryName       = [format getMetadatum:@"internalPathCover"];
    
    if ((entryName == nil) || ([entryName isEqualToString:@""])) {
        [format addMetadatum:@"" forKey:@"relativePathThumbnail"];
        return;
    }
    
    @try {
        // read data from entry
        ZipFile *unzipFile  = [[ZipFile alloc] initWithFileName:f mode:ZipFileModeUnzip];
        NSMutableData *data = [FormatHandlerAbstractZIP getZipEntryData:unzipFile entryPath:entryName];
        [unzipFile close];

        // resize
        UIImage* thumb = [[[UIImage alloc] initWithData:data] scaleImageToSizeAspectFill:CGSizeMake(_thumbnailWidth, _thumbnailHeight)];

        // compress to PNG
        NSData* thumbData = UIImagePNGRepresentation(thumb);

        // write to file
        NSString *destinationFile = [_thumbnailDirectoryPath stringByAppendingPathComponent:destinationName];
        [thumbData writeToFile:destinationFile atomically:YES];
        
        // set relativePathThumbnail
        [format addMetadatum:destinationName forKey:@"relativePathThumbnail"];
    }
    @catch (NSException *e) {
        // nop
    }
}

+ (BOOL)parseMetadataFile:(ZipFile *)unzipFile info:(FileInZipInfo *)info format:(Format *)format
{
    @try {
        NSString *name = info.name;
        
        NSMutableData *data = [FormatHandlerAbstractZIP getZipEntryData:unzipFile entryPath:name];
        NSString *metadata  = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        NSRange r = NSMakeRange(0, [metadata length]);
        NSString *m;
        
        m = [FormatHandlerAbstractZIP getFirstGroupFirstMatch: [[NSRegularExpression alloc] initWithPattern:PATTERN_TITLE options:0 error:nil] onString:metadata onRange:r];
        if (m != nil) {
            [format addMetadatum:m forKey:@"title"];
        }
        
        m = [FormatHandlerAbstractZIP getFirstGroupFirstMatch: [[NSRegularExpression alloc] initWithPattern:PATTERN_AUTHOR options:0 error:nil] onString:metadata onRange:r];
        if (m != nil) {
            [format addMetadatum:m forKey:@"author"];
        }

        m = [FormatHandlerAbstractZIP getFirstGroupFirstMatch: [[NSRegularExpression alloc] initWithPattern:PATTERN_NARRATOR options:0 error:nil] onString:metadata onRange:r];
        if (m != nil) {
            [format addMetadatum:m forKey:@"narrator"];
        }
        
        m = [FormatHandlerAbstractZIP getFirstGroupFirstMatch: [[NSRegularExpression alloc] initWithPattern:PATTERN_LANGUAGE options:0 error:nil] onString:metadata onRange:r];
        if (m != nil) {
            [format addMetadatum:m forKey:@"language"];
        }
        
        m = [FormatHandlerAbstractZIP getFirstGroupFirstMatch: [[NSRegularExpression alloc] initWithPattern:PATTERN_DURATION options:0 error:nil] onString:metadata onRange:r];
        if (m != nil) {
            [format addMetadatum:m forKey:@"duration"];
        }
        
        m = [FormatHandlerAbstractZIP getFirstGroupFirstMatch: [[NSRegularExpression alloc] initWithPattern:PATTERN_SERIES options:0 error:nil] onString:metadata onRange:r];
        if (m != nil) {
            [format addMetadatum:m forKey:@"series"];
        }
        
        m = [FormatHandlerAbstractZIP getFirstGroupFirstMatch: [[NSRegularExpression alloc] initWithPattern:PATTERN_SERIES_INDEX options:0 error:nil] onString:metadata onRange:r];
        if (m != nil) {
            [format addMetadatum:m forKey:@"seriesIndex"];
        }
        
        m = [FormatHandlerAbstractZIP getFirstGroupFirstMatch: [[NSRegularExpression alloc] initWithPattern:PATTERN_PLAYLIST options:0 error:nil] onString:metadata onRange:r];
        if (m != nil) {
            NSString *path = [[name stringByDeletingLastPathComponent] stringByAppendingPathComponent: m];
            [format addMetadatum:path forKey:@"internalPathPlaylist"];
        }
        
        m = [FormatHandlerAbstractZIP getFirstGroupFirstMatch: [[NSRegularExpression alloc] initWithPattern:PATTERN_COVER options:0 error:nil] onString:metadata onRange:r];
        if (m != nil) {
            NSString *path = [[name stringByDeletingLastPathComponent] stringByAppendingPathComponent: m];
            [format addMetadatum:path forKey:@"internalPathCover"];
        }
        
        return YES;
    } // end try
    @catch (NSException *e) {
        // nop
    }
    return FALSE;
}
+ (NSString *)getFirstGroupFirstMatch:(NSRegularExpression *)regex onString:(NSString *)s onRange:(NSRange)r
{
    NSArray *matches = [regex matchesInString:s options:0 range:r];
    if ([matches count] > 0) {
        return [[s substringWithRange:[[matches objectAtIndex:0] rangeAtIndex:1]] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
    }
    return nil;
}

@end
