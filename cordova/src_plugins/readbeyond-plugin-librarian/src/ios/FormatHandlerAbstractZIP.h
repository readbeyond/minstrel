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

#import "FormatHandler.h"
#import "UIImage+SimpleResize.h"
#import "../../Objective-Zip/FileInZipInfo.h"
#import "../../Objective-Zip/ZipFile.h"
#import "../../Objective-Zip/ZipReadStream.h"

@interface FormatHandlerAbstractZIP : NSObject <FormatHandler>
{
    NSString    * _thumbnailDirectoryPath;
    long          _thumbnailWidth;
    long          _thumbnailHeight;
    NSArray     * _allowedLowercasedExtensions;
    NSString    * _formatName;
}

- (id)init;
- (void)setFormatName:(NSString *)formatName;
- (void)extractCover:(NSString *)f format:(Format *)format publicationId:(NSString *)publicationId;
+ (NSString *)getZipEntryText:(ZipFile *)zipfile entryPath:(NSString *)entryPath;
+ (NSMutableData *)getZipEntryData:(ZipFile *)zipfile entryPath:(NSString *)entryPath;
+ (BOOL)fileHasAllowedExtension:(NSString *)lower allowed:(NSArray *)array;
+ (NSMutableArray *)getListOfAssets:(NSString *)file allowed:(NSArray *)array;
+ (BOOL)parseMetadataFile:(ZipFile *)unzipFile info:(FileInZipInfo *)info format:(Format *)format;

@end
