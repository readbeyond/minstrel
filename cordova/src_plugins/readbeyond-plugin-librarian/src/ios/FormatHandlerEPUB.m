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

#import "EPUBContainerParser.h"
#import "EPUBOPFParser.h"
#import "FormatHandlerEPUB.h"

@implementation FormatHandlerEPUB

NSString * const EPUB_FORMAT         = @"epub";
NSString * const EPUB_CONTAINER_PATH = @"META-INF/container.xml";

- (id)init
{
    if (self == [super init]) {
        [super setFormatName:EPUB_FORMAT];
    }
    return self;
}

- (Publication *)parseFile:(NSString *)file
{
    Publication *p                   = [super parseFile:file];
    Format      *format              = [[Format alloc] init:EPUB_FORMAT];
    
    @try {
        ZipFile *unzipFile = [[ZipFile alloc] initWithFileName:file mode:ZipFileModeUnzip];
        
        // get path of OPF file, relative to the EPUB container (aka ZIP) root
        NSMutableData *containerData     = [FormatHandlerAbstractZIP getZipEntryData:unzipFile entryPath:EPUB_CONTAINER_PATH];
        if (containerData != nil) {
            EPUBContainerParser *p1      = [[EPUBContainerParser alloc] init:containerData];
            if (p1.OPFPath != nil) {
                NSString        *OPFPath = p1.OPFPath;
                NSMutableData   *OPFData = [FormatHandlerAbstractZIP getZipEntryData:unzipFile entryPath:OPFPath];
                if (OPFData != nil) {
                    // parse metadata
                    EPUBOPFParser *p2    = [[EPUBOPFParser alloc] init:OPFData];
                    [format addMetadatum:p2.title       forKey:@"title"];
                    [format addMetadatum:p2.author      forKey:@"author"];
                    [format addMetadatum:p2.language    forKey:@"language"];
                    [format addMetadatum:p2.duration    forKey:@"duration"];
                    [format addMetadatum:p2.narrator    forKey:@"narrator"];
                    [format addMetadatum:p2.series      forKey:@"series"];
                    [format addMetadatum:p2.seriesIndex forKey:@"seriesIndex"];
                    [p setIsValid:YES];

                    // set the cover path, relative to the EPUB container (aka ZIP) root
                    if ((p2.pathThumbnailSourceRelativeToOPF != nil) && (![p2.pathThumbnailSourceRelativeToOPF isEqualToString:@""])) {
                        [format addMetadatum:[[OPFPath stringByDeletingLastPathComponent] stringByAppendingPathComponent:p2.pathThumbnailSourceRelativeToOPF] forKey:@"internalPathCover"];
                    }
                }
            }
        }
        
        [unzipFile close];
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

@end
