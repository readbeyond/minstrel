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

#import <Cordova/CDV.h>
#import "RBLibrarian.h"
#import "FormatHandler.h"
#import "FormatHandlerABZ.h"
#import "FormatHandlerCBZ.h"
#import "FormatHandlerEPUB.h"
#import "Publication.h"
#import "UIImage+SimpleResize.h"
#import "../../Objective-Zip/FileInZipInfo.h"
#import "../../Objective-Zip/ZipFile.h"
#import "../../Objective-Zip/ZipReadStream.h"

@implementation RBLibrarian

NSString * const RBLIBRARIAN_ARGUMENT_MODE                              = @"mode";
NSString * const RBLIBRARIAN_ARGUMENT_MODE_CREATE_THUMBNAIL_DIRECTORY   = @"createThumbnailDirectory";
NSString * const RBLIBRARIAN_ARGUMENT_MODE_EMPTY_THUMBNAIL_DIRECTORY    = @"emptyThumbnailDirectory";
NSString * const RBLIBRARIAN_ARGUMENT_MODE_FULL                         = @"full";
NSString * const RBLIBRARIAN_ARGUMENT_MODE_SINGLE                       = @"single";
NSString * const RBLIBRARIAN_ARGUMENT_MODE_CUSTOM                       = @"custom";

NSString * const RBLIBRARIAN_ARGUMENT_PATH                              = @"path";

NSString * const RBLIBRARIAN_ARGUMENT_ARGS                              = @"args";
NSString * const RBLIBRARIAN_ARGUMENT_ARGS_ENTIRE_VOLUME                = @"entireVolume";
NSString * const RBLIBRARIAN_ARGUMENT_ARGS_PATHS                        = @"paths";
NSString * const RBLIBRARIAN_ARGUMENT_ARGS_RECURSIVE                    = @"recursive";
NSString * const RBLIBRARIAN_ARGUMENT_ARGS_IGNOREHIDDEN                 = @"ignoreHidden";
NSString * const RBLIBRARIAN_ARGUMENT_ARGS_FORMAT                       = @"format";
NSString * const RBLIBRARIAN_ARGUMENT_ARGS_FORMATS                      = @"formats";
NSString * const RBLIBRARIAN_ARGUMENT_ARGS_THUMBNAILDIRECTORY           = @"thumbnailDirectory";
NSString * const RBLIBRARIAN_ARGUMENT_ARGS_THUMBNAILWIDTH               = @"thumbnailWidth";
NSString * const RBLIBRARIAN_ARGUMENT_ARGS_THUMBNAILHEIGHT              = @"thumbnailHeight";

NSString * const RBLIBRARIAN_FORMAT_EPUB                                = @"epub";
NSString * const RBLIBRARIAN_FORMAT_ABZ                                 = @"abz";
NSString * const RBLIBRARIAN_FORMAT_CBZ                                 = @"cbz";

- (void)librarian:(CDVInvokedUrlCommand *)command
{
    
    [self.commandDelegate runInBackground:^{
        
        CDVPluginResult *pluginResult       = nil;

        // jsonObject
        NSDictionary *jsonObject            = [command.arguments objectAtIndex:0];
        
        // read arguments
        NSString     *mode                  = [jsonObject objectForKey:RBLIBRARIAN_ARGUMENT_MODE];
        NSString     *path                  = [jsonObject objectForKey:RBLIBRARIAN_ARGUMENT_PATH];
        NSString     *jsonString            = [jsonObject objectForKey:RBLIBRARIAN_ARGUMENT_ARGS];
        NSData       *jsonData              = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
        NSDictionary *parameters            = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:nil];
        
        //BOOL         entireVolume           = [[parameters objectForKey:RBLIBRARIAN_ARGUMENT_ARGS_ENTIRE_VOLUME] boolValue];
        NSString     *format                = [parameters  objectForKey:RBLIBRARIAN_ARGUMENT_ARGS_FORMAT];
        NSDictionary *formats               = [parameters  objectForKey:RBLIBRARIAN_ARGUMENT_ARGS_FORMATS];
        //BOOL         ignoreHidden           = [[parameters objectForKey:RBLIBRARIAN_ARGUMENT_ARGS_IGNOREHIDDEN] boolValue];
        //NSArray      *paths                 = [parameters  objectForKey:RBLIBRARIAN_ARGUMENT_ARGS_PATHS];
        //BOOL         recursive              = [[parameters objectForKey:RBLIBRARIAN_ARGUMENT_ARGS_RECURSIVE] boolValue];
        NSString     *thumbnailDirectory    = [parameters  objectForKey:RBLIBRARIAN_ARGUMENT_ARGS_THUMBNAILDIRECTORY];
        long         thumbnailHeight        = [[parameters objectForKey:RBLIBRARIAN_ARGUMENT_ARGS_THUMBNAILHEIGHT] intValue];
        long         thumbnailWidth         = [[parameters objectForKey:RBLIBRARIAN_ARGUMENT_ARGS_THUMBNAILWIDTH] intValue];
        
        // result string
        NSString *result                    = @"";
        
        // make sure the thumbnail directory exists
        if ([mode isEqualToString:RBLIBRARIAN_ARGUMENT_MODE_CREATE_THUMBNAIL_DIRECTORY]) {
            [RBLibrarian ensureThumbnailDirectoryExist:thumbnailDirectory delete:NO];
            result = @"";
        }
        
        // empty the thumbnail directory (if any)
        if ([mode isEqualToString:RBLIBRARIAN_ARGUMENT_MODE_EMPTY_THUMBNAIL_DIRECTORY]) {
            [RBLibrarian ensureThumbnailDirectoryExist:thumbnailDirectory delete:YES];
            result = @"";
        }
        
        // mode full or single
        if ([mode isEqualToString:RBLIBRARIAN_ARGUMENT_MODE_FULL] || [mode isEqualToString:RBLIBRARIAN_ARGUMENT_MODE_SINGLE]) {
            
            // make sure the thumbnail directory exists
            [RBLibrarian ensureThumbnailDirectoryExist:thumbnailDirectory delete:NO];
            
            NSMutableArray *publications = [[NSMutableArray alloc] init];
            
            // single
            if ([mode isEqualToString:RBLIBRARIAN_ARGUMENT_MODE_SINGLE]) {
                id fh = [RBLibrarian getFormatHandler:format];
                if ((fh != nil) && ([fh conformsToProtocol:@protocol(FormatHandler)])) {
                    [fh setThumbnailInfo:thumbnailDirectory width:thumbnailWidth height:thumbnailHeight];
                    [RBLibrarian discoverSingleFile:path formatHandler:fh publications:publications];
                }
            }
            
            // full
            if ([mode isEqualToString:RBLIBRARIAN_ARGUMENT_MODE_FULL]) {
                NSEnumerator *iter = [formats keyEnumerator];
                id f;
                while ((f = [iter nextObject]) != nil) {
                    NSArray *extensions2 = [formats valueForKey:f];
                    id fh = [RBLibrarian getFormatHandler:f];
                    if ((fh != nil) && ([fh conformsToProtocol:@protocol(FormatHandler)])) {
                        [fh addAllowedLowercasedExtensions:extensions2];
                        [fh setThumbnailInfo:thumbnailDirectory width:thumbnailWidth height:thumbnailHeight];
                        [RBLibrarian discoverPublicationFiles:[RBLibrarian getDocumentsDirectoryPath] formatHandler:fh publications:publications];
                    }
                }
            }
            
            // set main format, title, and cover
            for (int i = 0; i < [publications count]; i++) {
                @try {
                    Publication *p                                  = [publications objectAtIndex:i];
                    Format      *defaultFormat                      = [[p getFormats] objectAtIndex:0];
                    NSString    *defaultFormatTitle                 = [defaultFormat getMetadatum:@"title"];
                    NSString    *defaultFormatRelativePathThumbnail = [defaultFormat getMetadatum:@"relativePathThumbnail"];
                    [p setMainFormat:[defaultFormat getName]];
                    if ((defaultFormatTitle != nil) && (![defaultFormatTitle isEqualToString:@""])) {
                        [p setTitle:defaultFormatTitle];
                    }
                    if ((defaultFormatRelativePathThumbnail != nil) && (![defaultFormatRelativePathThumbnail isEqualToString:@""])) {
                        [p setAbsolutePathThumbnail:[thumbnailDirectory stringByAppendingPathComponent:defaultFormatRelativePathThumbnail]];
                        [p setRelativePathThumbnail:defaultFormatRelativePathThumbnail];
                    }
                } @catch (NSException *e) {
                    // nop
                }
            }
            
            result = [RBLibrarian stringify:publications mainKey:@"publications"];
        }
        
        // mode custom
        if ([mode isEqualToString:RBLIBRARIAN_ARGUMENT_MODE_CUSTOM]) {
            result = @"";
            id fh = [RBLibrarian getFormatHandler:format];
            if ((fh != nil) && ([fh conformsToProtocol:@protocol(FormatHandler)])) {
                result = [fh customAction:path parameters:parameters];
            }
        }
        
        // return JSON string
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:result];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
    }]; // close background
}




+ (void)discoverPublicationFiles:(NSString *)rootDirectory formatHandler:(id)fh publications:(NSMutableArray *)publications
{
    BOOL ignoreHidden = YES; // in iOS the visit always ignores hidden files
    //BOOL recursive = YES;  // in iOS the visit is always recursive
    
    NSDirectoryEnumerator *files = [[NSFileManager defaultManager] enumeratorAtPath:rootDirectory];
    for (NSString *f in files) {
        NSString *fullPathCurrentFile = [rootDirectory stringByAppendingPathComponent:f];
        NSString *n = [fullPathCurrentFile lastPathComponent];
        BOOL ignoreFile = (([n hasPrefix:@"."]) && (ignoreHidden));
        if ([RBLibrarian isDirectory:fullPathCurrentFile]) {
            // f is a directory
            if (ignoreFile) {
                [files skipDescendants];
            }
        } else {
            // f is a regular file
            if ((!ignoreFile) && ([fh isParsable:[n lowercaseString]])) {
                [RBLibrarian discoverSingleFile:fullPathCurrentFile formatHandler:fh publications:publications];
            }
        }
    }
}

+ (void)discoverSingleFile:(NSString *)path formatHandler:(id)fh publications:(NSMutableArray *)publications
{
    Publication *p = [fh parseFile:path];
    if ([p isValid]) {
        [publications addObject:p];
    }
}

+ (void)ensureThumbnailDirectoryExist:(NSString*)thumbnailDirectoryPath delete:(BOOL)delete
{
    NSError *error = nil;
    if (delete) {
        if ([[NSFileManager defaultManager] fileExistsAtPath:thumbnailDirectoryPath] == YES) {
            [[NSFileManager defaultManager] removeItemAtPath:thumbnailDirectoryPath error:&error];
        }
    }
    if ([[NSFileManager defaultManager] fileExistsAtPath:thumbnailDirectoryPath] == NO) {
        [[NSFileManager defaultManager] createDirectoryAtPath:thumbnailDirectoryPath withIntermediateDirectories:YES attributes:nil error:&error];
    }
}

+ (id)getFormatHandler:(NSString *)format
{
    if ([format isEqualToString:RBLIBRARIAN_FORMAT_ABZ]) {
        return [[FormatHandlerABZ alloc] init];
    }
    if ([format isEqualToString:RBLIBRARIAN_FORMAT_CBZ]) {
        return [[FormatHandlerCBZ alloc] init];
    }
    if ([format isEqualToString:RBLIBRARIAN_FORMAT_EPUB]) {
        return [[FormatHandlerEPUB alloc] init];
    }
    return nil;
}

+ (BOOL)isDirectory:(NSString*)path
{
    NSDictionary *attrs = [[NSFileManager defaultManager] attributesOfItemAtPath:path error:nil];
    return [[attrs fileType] isEqualToString:@"NSFileTypeDirectory"];
}

+ (NSString *)getDocumentsDirectoryPath
{
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    if ([paths count] > 0) {
        return [paths objectAtIndex:0];
    }
    return nil;
}

+ (NSString *)stringify:(NSMutableArray *)items mainKey:(NSString *)mainKey
{
    NSMutableDictionary *obj = [[NSMutableDictionary alloc] init];
    @try {
        NSMutableDictionary *main = [[NSMutableDictionary alloc] init];
        NSMutableArray      *arr  = [[NSMutableArray alloc] init];
        for (int i = 0; i < [items count]; i++) {
            id jItem = [items objectAtIndex:i];
            if ((jItem != nil) && ([jItem conformsToProtocol:@protocol(JSONPrintable)])) {
                [arr addObject:[jItem toJSONObject]];
            }
        }
        [main setObject:arr  forKey:@"items"];
        [obj  setObject:main forKey:mainKey];
    } @catch (NSException *e) {
        // nop
    }
    
    NSString *result;
    if ([NSJSONSerialization isValidJSONObject:obj]) {
        result = [[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:obj options:0 error:nil] encoding:NSUTF8StringEncoding];
    } else {
        // TODO
        result = [NSString stringWithFormat:@"{ \"%@\": { \"items\": [] }}", mainKey];
    }

    return result;
}

@end
