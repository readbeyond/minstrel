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
#import "RBUnzipper.h"
#import "../../Objective-Zip/FileInZipInfo.h"
#import "../../Objective-Zip/ZipFile.h"
#import "../../Objective-Zip/ZipReadStream.h"

@implementation RBUnzipper

NSString * const RBUNZIPPER_ARGUMENT_SRC_PATH                   = @"srcPath";
NSString * const RBUNZIPPER_ARGUMENT_DST_PATH                   = @"dstPath";
NSString * const RBUNZIPPER_ARGUMENT_MODE                       = @"mode";
NSString * const RBUNZIPPER_ARGUMENT_ARGS                       = @"args";
NSString * const RBUNZIPPER_ARGUMENT_ARGS_ENTRIES               = @"entries";
NSString * const RBUNZIPPER_ARGUMENT_ARGS_EXCLUDE_EXTENSIONS    = @"excludeExtensions";
NSString * const RBUNZIPPER_ARGUMENT_ARGS_EXTENSIONS            = @"extensions";
NSString * const RBUNZIPPER_ARGUMENT_ARGS_MAXIMUM_FILE_SIZE     = @"maximumFileSize";

NSString * const RBUNZIPPER_ARGUMENT_MODE_ALL                   = @"all";
NSString * const RBUNZIPPER_ARGUMENT_MODE_ALL_NON_MEDIA         = @"allNonMedia";
NSString * const RBUNZIPPER_ARGUMENT_MODE_ALL_SMALL             = @"allSmall";
NSString * const RBUNZIPPER_ARGUMENT_MODE_ALL_STRUCTURE         = @"allStructure";
NSString * const RBUNZIPPER_ARGUMENT_MODE_LIST                  = @"list";
NSString * const RBUNZIPPER_ARGUMENT_MODE_SELECTED              = @"selected";

int        const BUFFER_SIZE                                    = 4096; // unzip in chunks of 4 KB

- (void)unzip:(CDVInvokedUrlCommand *)command
{
    
    [self.commandDelegate runInBackground:^{
    
        CDVPluginResult *pluginResult   = nil;

        // jsonObject
        NSDictionary *jsonObject = [command.arguments objectAtIndex:0];
        
        // mode of the action
        NSString *mode           = [jsonObject objectForKey:RBUNZIPPER_ARGUMENT_MODE];
       
        // path of the epub file
        NSString *srcPath        = [jsonObject objectForKey:RBUNZIPPER_ARGUMENT_SRC_PATH];
        
        // path of the thumbnails directory
        NSString *dstPath        = [jsonObject objectForKey:RBUNZIPPER_ARGUMENT_DST_PATH];
        
        // args of the action
        NSString     *jsonString = [jsonObject objectForKey:RBUNZIPPER_ARGUMENT_ARGS];
        NSData       *jsonData   = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
        NSDictionary *parameters = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:nil];
        
        // result to be returned
        NSMutableString *result = [NSMutableString stringWithString:@""];
            
        // prepend the cache directory path
        //dstPath = [cacheDirectory stringByAppendingPathComponent:dstPath];
        
        if ([mode isEqualToString:RBUNZIPPER_ARGUMENT_MODE_LIST]) {
            // list files in zip
            result = [RBUnzipper list:srcPath];
        } else {
            // perform unzip
            result = [RBUnzipper unzip:srcPath destinationDirectory:dstPath mode:mode parameters:parameters];
            if (result == nil) {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"unzip failed"];
                [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                return;
            }
        }

        // return result string
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:result];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        
    }]; // close background call
}

+ (BOOL)isFile:(NSString *)lower ofKind:(NSArray *)array
{
    for (NSString* ext in array) {
        if ([lower hasSuffix:ext]) {
            //NSLog(@"Skipping %@", lower);
            return TRUE;
        }
    }
    return FALSE;
}

+ (NSMutableString *)list:(NSString *)inputZip
{
    // list all files
    ZipFile *unzipFile      = [[ZipFile alloc] initWithFileName:inputZip mode:ZipFileModeUnzip];
    NSArray *infos          = [unzipFile listFileInZipInfos];
    NSMutableArray *entries = [[NSMutableArray alloc] init];
    for (FileInZipInfo *info in infos) {
        [entries addObject:info.name];
    }
    [unzipFile close];
    
    // sort
    [entries sortUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
    
    // build result string
    return [RBUnzipper stringify:entries];
}

+ (NSMutableString *)stringify:(NSMutableArray *)entries
{
    // TODO use JSON stringifier
    
    NSMutableString *result = [NSMutableString stringWithString:@""];
    result = [NSMutableString stringWithString:@"{\"files\": {"];
    [result appendString:@" \"items\": ["];
    for (int i = 0; i < [entries count]; i++) {
        [result appendString: @"\""];
        [result appendString: [RBUnzipper escape:[entries objectAtIndex:i]]];
        [result appendString: @"\""];
        if (i < [entries count] - 1) {
            [result appendString: @","];
        }
    }
    [result appendString:@"]"];
    [result appendString:@"}}"];
    return result;
}

+ (NSString *)escape:(NSString *)unescaped {
    if (unescaped == nil) {
        return @"";
    }
    return [unescaped stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""];
}

+ (NSMutableString *)unzip:(NSString *)inputZip destinationDirectory:(NSString *) destinationDirectory mode:(NSString *)mode parameters:(NSDictionary *)parameters
{
    NSError *error = nil;
    NSMutableArray *decompressed = [[NSMutableArray alloc] init];
    
    @try {
    
        ZipFile *unzipFile           = [[ZipFile alloc] initWithFileName:inputZip mode:ZipFileModeUnzip];
        NSArray *infos               = [unzipFile listFileInZipInfos];
        NSMutableArray *listName     = [[NSMutableArray alloc] init];
        //NSMutableArray *listLength   = [[NSMutableArray alloc] init];
        
        // extract all files
        if ([mode isEqualToString:RBUNZIPPER_ARGUMENT_MODE_ALL]) {
            for (FileInZipInfo *info in infos) {
                [listName addObject:info.name];
                //[listLength addObject:[NSNumber numberWithInt:info.length]];
            }
        }
        
        // extract all files except audio and video
        // (determined by file extension)
        if ([mode isEqualToString:RBUNZIPPER_ARGUMENT_MODE_ALL_NON_MEDIA]) {
            NSArray *excludeExtensions = [parameters objectForKey:RBUNZIPPER_ARGUMENT_ARGS_EXCLUDE_EXTENSIONS];
            for (FileInZipInfo *info in infos) {
                NSString *lower = [info.name lowercaseString];
                if (! [RBUnzipper isFile:lower ofKind:excludeExtensions]) {
                    [listName addObject:info.name];
                    //[listLength addObject:[NSNumber numberWithInt:info.length]];
                }
            }
        }
        
        // extract all small files
        // maximum size is passed in args parameter
        if ([mode isEqualToString:RBUNZIPPER_ARGUMENT_MODE_ALL_SMALL]) {
            // TODO why is this a float instead of a long?
            float maximum_size = [[parameters objectForKey:RBUNZIPPER_ARGUMENT_ARGS_MAXIMUM_FILE_SIZE] floatValue];
            for (FileInZipInfo *info in infos) {
                if (info.length <= maximum_size) {
                    [listName addObject:info.name];
                    //[listLength addObject:[NSNumber numberWithInt:info.length]];
                }
            }
        }
        
        // extract only the requested file
        if ([mode isEqualToString:RBUNZIPPER_ARGUMENT_MODE_SELECTED]) {
            NSArray *entries = [parameters objectForKey:RBUNZIPPER_ARGUMENT_ARGS_ENTRIES];
            for (NSString *entry in entries) {
                BOOL success = [unzipFile locateFileInZip:entry];
                if (success == TRUE) {
                    [listName addObject:entry];
                    //int length = [[unzipFile getCurrentFileInZipInfo] length];
                    //[listLength addObject:[NSNumber numberWithInt:length]];
                }
            }
        }

        // extract all "structural" files
        if ([mode isEqualToString:RBUNZIPPER_ARGUMENT_MODE_ALL_STRUCTURE]) {
            NSArray *extensions = [parameters objectForKey:RBUNZIPPER_ARGUMENT_ARGS_EXTENSIONS];
            for (FileInZipInfo *info in infos) {
                NSString *lower = [info.name lowercaseString];
                if ([RBUnzipper isFile:lower ofKind:extensions]) {
                    [listName addObject:info.name];
                    //[listLength addObject:[NSNumber numberWithInt:info.length]];
                }
            }
        }
        
        // NOTE list contains only valid zip entries
        // perform unzip
        for (NSString *zipEntryName in listName) {
            
            // prevent extracting empty directories
            if (![zipEntryName hasSuffix:@"/"]) {
                [unzipFile locateFileInZip:zipEntryName];
                
                // destination file
                NSString *destinationFile = [destinationDirectory stringByAppendingPathComponent:zipEntryName];
                
                // check that the parent directory exists
                // if not, create it (recursively)
                NSString *destinationParent = [destinationFile stringByDeletingLastPathComponent];
                if ([[NSFileManager defaultManager] fileExistsAtPath:destinationParent] == FALSE) {
                    [[NSFileManager defaultManager] createDirectoryAtPath:destinationParent withIntermediateDirectories:TRUE attributes:nil error:&error];
                }
                
                ZipReadStream *read = [unzipFile readCurrentFileInZip];
                
                /*
                // in memory read => not good
                NSMutableData *data = [[NSMutableData alloc] initWithLength: [[listLength objectAtIndex: i] intValue]];
                [read readDataWithBuffer: data];
                [read finishedReading];
                 */
                
                // buffered read
                if ([[NSFileManager defaultManager] fileExistsAtPath:destinationFile] == FALSE) {
                    [[NSFileManager defaultManager] createFileAtPath:destinationFile contents:nil attributes:nil];
                }
                NSFileHandle  *file = [NSFileHandle fileHandleForWritingAtPath:destinationFile];
                NSMutableData *data = [[NSMutableData alloc] initWithLength:BUFFER_SIZE];
                do {
                    // reset buffer
                    [data setLength:BUFFER_SIZE];
                    
                    // next chunk
                    NSUInteger bytesRead = [read readDataWithBuffer:data];
                    if (bytesRead > 0) {
                        // write what we have read
                        [data setLength:bytesRead];
                        [file writeData:data];
                    } else {
                        break;
                    }
                } while (TRUE);
                
                // write to disk
                
                // in memory read
                // [data writeToFile:destinationFile atomically:TRUE];
                
                // buffered read
                [file synchronizeFile];
                [file closeFile];
                [read finishedReading];

                [decompressed addObject:zipEntryName];
            } // end if to prevent extracting empty directories
        }
        
        [unzipFile close];
    } // end try
    @catch (NSException *e) {
        // do nothing
        NSLog(@"Exception: %@", e);
        return nil;
    }
    return [RBUnzipper stringify:decompressed];
}

@end
