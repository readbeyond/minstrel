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

#import "FormatHandlerABZ.h"
#import "RBLibrarian.h"
#import "ZipAsset.h"

@implementation FormatHandlerABZ

NSString * const ABZ_FORMAT             = @"abz";
NSString * const ABZ_DEFAULT_COVER_JPG  = @"cover.jpg";
NSString * const ABZ_DEFAULT_COVER_PNG  = @"cover.png";
NSString * const ABZ_EXTENSION_PLAYLIST = @".m3u";
NSString * const ABZ_FILE_METADATA      = @"metadata.txt";
NSString * const ABZ_M3U_HEADER         = @"#EXTM3U";
NSString * const ABZ_M3U_LINE_PATTERN   = @"#EXTINF:([0-9]+),(.*)";
NSString * const ABZ_M3U_LINE_PREAMBLE  = @"#EXTINF:";
NSMutableArray * ABZ_AUDIO_EXTENSIONS;

- (id)init
{
    if (self == [super init]) {
        [super setFormatName:ABZ_FORMAT];
    }

    // set extensions
    [self populateExtensionArray];

    return self;
}

- (void)populateExtensionArray
{
    ABZ_AUDIO_EXTENSIONS = [[NSMutableArray alloc] init];
    [ABZ_AUDIO_EXTENSIONS addObject: @".aac"];
    [ABZ_AUDIO_EXTENSIONS addObject: @".flac"];
    [ABZ_AUDIO_EXTENSIONS addObject: @".m4a"];
    [ABZ_AUDIO_EXTENSIONS addObject: @".mp3"];
    [ABZ_AUDIO_EXTENSIONS addObject: @".mp4"];
    [ABZ_AUDIO_EXTENSIONS addObject: @".oga"];
    [ABZ_AUDIO_EXTENSIONS addObject: @".ogg"];
    [ABZ_AUDIO_EXTENSIONS addObject: @".wav"];
    [ABZ_AUDIO_EXTENSIONS addObject: @".webm"];
}

- (Publication *)parseFile:(NSString *)file
{
    Publication *p                   = [super parseFile:file];
    Format      *format              = [[Format alloc] init:ABZ_FORMAT];

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
            
            if (([lower hasSuffix:ABZ_DEFAULT_COVER_JPG]) || ([lower hasSuffix:ABZ_DEFAULT_COVER_PNG])) {
                zeCover = name;
            } else if ([lower hasSuffix:ABZ_EXTENSION_PLAYLIST]) {
                zePlaylist = name;
            } else if ([FormatHandlerAbstractZIP fileHasAllowedExtension:lower allowed:ABZ_AUDIO_EXTENSIONS]) {
                [p setIsValid:YES];
                [assets addObject:name];
            } else if ([lower hasSuffix:ABZ_FILE_METADATA]) {
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
        
        // close ZIP
        [unzipFile close];
        
        // default cover found?
        if ((! foundCover) && (zeCover != nil)) {
            [format addMetadatum:zeCover forKey:@"internalPathCover"];
        }
        
        // default playlist found?
        if ((!foundPlaylist) && (zePlaylist != nil)) {
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
                    assets = [FormatHandlerAbstractZIP getListOfAssets:path allowed:ABZ_AUDIO_EXTENSIONS];
                } else {
                    assets = [FormatHandlerABZ parseM3UPlaylistEntry:path playlistEntry:playlistEntry];
                }
                return [RBLibrarian stringify:assets mainKey:@"assets"];
            }
        }
    }
    return @"";
}

+ (NSMutableArray *)parseM3UPlaylistEntry:(NSString *)path playlistEntry:(NSString *)playlistEntry
{
    NSMutableArray *assets  = [[NSMutableArray alloc] init];
    @try {
        ZipFile *unzipFile  = [[ZipFile alloc] initWithFileName:path mode:ZipFileModeUnzip];
        NSArray *lines      = [[FormatHandlerAbstractZIP getZipEntryText:unzipFile entryPath:playlistEntry]componentsSeparatedByString:@"\n"];
        
        // check that the first line starts with the M3U header
        if (([lines count] > 0) && ([[lines objectAtIndex:0] hasPrefix:ABZ_M3U_HEADER])) {
            
            NSRegularExpression *regex = [[NSRegularExpression alloc] initWithPattern:ABZ_M3U_LINE_PATTERN options:0 error:nil];
            
            for (int i = 1; i < [lines count]; i++) {
                NSString *line  = [[lines objectAtIndex:i] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                
                // if line starts with the M3U preamble, parse it
                if ([line hasPrefix:ABZ_M3U_LINE_PREAMBLE]) {
                    NSMutableDictionary *meta = [[NSMutableDictionary alloc] init];
                    
                    NSRange r = NSMakeRange(0, [line length]);
                    NSArray *matches = [regex matchesInString:line options:0 range:r];
                    if ([matches count] > 0) {
                        [meta setObject:[[line substringWithRange:[[matches objectAtIndex:0] rangeAtIndex:1]] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]] forKey:@"duration"];
                        [meta setObject:[[line substringWithRange:[[matches objectAtIndex:0] rangeAtIndex:2]] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]] forKey:@"title"];
                    }
                    
                    // add asset
                    NSString *line2 = [[lines objectAtIndex:i+1] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                    line2 = [[playlistEntry stringByDeletingLastPathComponent] stringByAppendingPathComponent: line2];
                    
                    // add asset
                    [assets addObject:[[ZipAsset alloc] init:line2 medatada:meta]];
                    
                    // go to the next pair of lines
                    i += 1;
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
