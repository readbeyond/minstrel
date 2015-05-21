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

#import "FormatHandlerCBZ.h"
#import "RBLibrarian.h"
#import "ZipAsset.h"

@implementation FormatHandlerCBZ

NSString * const CBZ_FORMAT              = @"cbz";
NSString * const CBZ_DEFAULT_COVER_JPG   = @"cover.jpg";
NSString * const CBZ_DEFAULT_COVER_PNG   = @"cover.png";
NSString * const CBZ_FILE_METADATA       = @"metadata.txt";
NSString * const CBZ_FILE_PLAYLIST       = @"playlist.txt";
NSMutableArray * CBZ_IMAGE_EXTENSIONS;

- (id)init
{
    if (self == [super init]) {
        [super setFormatName:CBZ_FORMAT];
    }

    // set extensions
    [self populateExtensionArray];

    return self;
}

- (void)populateExtensionArray
{
    CBZ_IMAGE_EXTENSIONS = [[NSMutableArray alloc] init];
    [CBZ_IMAGE_EXTENSIONS addObject: @".apng"];
    [CBZ_IMAGE_EXTENSIONS addObject: @".bmp"];
    [CBZ_IMAGE_EXTENSIONS addObject: @".gif"];
    [CBZ_IMAGE_EXTENSIONS addObject: @".jpeg"];
    [CBZ_IMAGE_EXTENSIONS addObject: @".jpg"];
    [CBZ_IMAGE_EXTENSIONS addObject: @".png"];
    [CBZ_IMAGE_EXTENSIONS addObject: @".svg"];
    [CBZ_IMAGE_EXTENSIONS addObject: @".tiff"];
}

- (Publication *)parseFile:(NSString *)file
{
    Publication *p                   = [super parseFile:file];
    Format      *format              = [[Format alloc] init:CBZ_FORMAT];

    @try {
        BOOL foundMetadataFile  = FALSE;
        BOOL foundCover         = FALSE;
        BOOL foundPlaylist      = FALSE;
        NSString *zeCover       = nil;
        NSString *zePlaylist    = nil;
        NSMutableArray *assets  = [[NSMutableArray alloc] init];
        
        ZipFile *unzipFile  = [[ZipFile alloc] initWithFileName:file mode:ZipFileModeUnzip];
        NSArray *infos      = [unzipFile listFileInZipInfos];
        for (FileInZipInfo *info in infos) {
            NSString *name  = info.name;
            NSString *lower = [info.name lowercaseString];
            
            if (([lower hasSuffix:CBZ_DEFAULT_COVER_JPG]) || ([lower hasSuffix:CBZ_DEFAULT_COVER_PNG])) {
                [p setIsValid:YES];
                zeCover = name;
                [assets addObject:name];
            } else if ([lower hasSuffix:CBZ_FILE_PLAYLIST]) {
                zePlaylist = name;
            } else if ([FormatHandlerAbstractZIP fileHasAllowedExtension:lower allowed:CBZ_IMAGE_EXTENSIONS]) {
                [p setIsValid:YES];
                [assets addObject:name];
            } else if ([lower hasSuffix:CBZ_FILE_METADATA]) {
                [p setIsValid:YES];
                foundMetadataFile = YES;
                [FormatHandlerAbstractZIP parseMetadataFile:unzipFile info:info format:format];
                if ([format getMetadatum:@"internalPathPlaylist"] != nil) {
                    foundPlaylist = YES;
                }
                if ([format getMetadatum:@"internalPathCover"] != nil) {
                    foundCover = YES;
                }
            }
        }
        
        [unzipFile close];
        
        // set cover
        if (!foundCover) {
            // no cover found from metadata
            
            // found defaul?
            if (zeCover != nil) {
                // use default
                [format addMetadatum:zeCover forKey:@"internalPathCover"];
            } else {
                // sort and use the first image found
                if ([assets count] > 0) {
                    [assets sortUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
                    [format addMetadatum:[assets objectAtIndex:0] forKey:@"internalPathCover"];
                }
            }
        }
        
        // default playlist found?
        if ((! foundPlaylist) && (zePlaylist != nil)) {
            [format addMetadatum:zePlaylist forKey:@"internalPathPlaylist"];
        }
        
        // set number of assets
        [format addMetadatum:[NSString stringWithFormat:@"%lu", (unsigned long)[assets count]] forKey:@"numberOfAssets"];
    }
    @catch (NSException *e) {
        // invalidate item, so it will not be added to library
        [p setIsValid:NO];
    }
    
    // add format
    [p addFormat:format];

    // extract cover
    [super extractCover:file format:format publicationId:[p getId]];
    
    return p;
}

- (NSString *)customAction:(NSString *)path parameters:(NSDictionary *)parameters
{
    if (parameters != nil) {
        NSString *command = [parameters objectForKey:@"command"];
        if (command != nil) {
            
            // get sorted list of assets
            if ([command isEqualToString:@"getSortedListOfAssets"]) {
                NSString *playlistEntry = [parameters objectForKey:@"internalPathPlaylist"];
                NSMutableArray *assets;
                if ((playlistEntry == nil) || ([playlistEntry isEqualToString:@""])) {
                    assets = [FormatHandlerAbstractZIP getListOfAssets:path allowed:CBZ_IMAGE_EXTENSIONS];
                } else {
                    assets = [FormatHandlerCBZ parseImagePlaylistEntry:path playlistEntry:playlistEntry];
                }
                return [RBLibrarian stringify:assets mainKey:@"assets"];
            }
        }
    }
    return @"";
}

+ (NSMutableArray *)parseImagePlaylistEntry:(NSString *)path playlistEntry:(NSString *)playlistEntry
{
    NSMutableArray *assets  = [[NSMutableArray alloc] init];
    @try {
        ZipFile *unzipFile  = [[ZipFile alloc] initWithFileName:path mode:ZipFileModeUnzip];
        NSArray *lines      = [[FormatHandlerAbstractZIP getZipEntryText:unzipFile entryPath:playlistEntry]componentsSeparatedByString:@"\n"];
        
        // if we have lines
        if ([lines count] > 0) {
            for (int i = 0; i < [lines count]; i++) {
                NSString *line  = [[lines objectAtIndex:i] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                
                // do we have a file name?
                if (([line length] > 0) && (![line hasPrefix:@"#"])) {
                    NSMutableDictionary *meta = [[NSMutableDictionary alloc] init];
                    
                    // duration
                    if (i + 1 < [lines count]) {
                        NSString *line2 = [[lines objectAtIndex:i+1] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                        if (([line2 length] > 0) && (![line2 hasPrefix:@"#"])) {
                            i += 1;
                            [meta setObject:line2 forKey:@"duration"];
                            
                            // title
                            if (i + 1 < [lines count]) {
                                NSString *line3 = [[lines objectAtIndex:i+1] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                                if (([line3 length] > 0) && (![line3 hasPrefix:@"#"])) {
                                    i += 1;
                                    [meta setObject:line3 forKey:@"title"];
                                }
                            }
                        }
                    }
                    
                    // generate entry path
                    line = [[playlistEntry stringByDeletingLastPathComponent] stringByAppendingPathComponent: line];
                    
                    // add asset
                    [assets addObject:[[ZipAsset alloc] init:line medatada:meta]];
                    
                } else {
                    // either comment or blank line => continue
                }
            }
        }
        
        [unzipFile close];
    }
    @catch (NSException *e) {
        // nop
    }
    return assets;
}

@end
