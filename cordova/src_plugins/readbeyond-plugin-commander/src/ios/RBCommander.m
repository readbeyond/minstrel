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
#import "RBCommander.h"
#import "MainViewController.h"

@implementation RBCommander

// argument names
NSString * const RBCOMMANDER_ARGUMENT_COMMAND  = @"command";
NSString * const RBCOMMANDER_ARGUMENT_OPTION   = @"option";

// command values
NSString * const COMMAND_SET_BRIGHTNESS        = @"setbrightness";
NSString * const COMMAND_GET_BRIGHTNESS        = @"getbrightness";
NSString * const COMMAND_ORIENT                = @"orient";
NSString * const COMMAND_OPEN_EXTERNAL_URL     = @"openExternalURL";
NSString * const COMMAND_FILESYSTEM_INFO       = @"filesystemInfo";
NSString * const COMMAND_CHECK_FILE_EXISTS     = @"checkFileExists";
NSString * const COMMAND_DELETE_RELATIVE       = @"deleteRelative";
NSString * const COMMAND_DELETE_ABSOLUTE       = @"deleteAbsolute";
NSString * const COMMAND_WRITE_TO_FILE         = @"writeToFile";
NSString * const COMMAND_COPY                  = @"copy";
NSString * const COMMAND_MOVE                  = @"move";
NSString * const COMMAND_COPY_FROM_ASSETS_WWW  = @"copyFromAssetsWWW";

// orient options 
NSString * const ORIENT_OPTION_AUTO            = @"auto";
NSString * const ORIENT_OPTION_LANDSCAPE       = @"landscape";
NSString * const ORIENT_OPTION_PORTRAIT        = @"portrait";

// return messages
NSString * const MESSAGE_REFRESH               = @"refresh";
NSString * const MESSAGE_NO_REFRESH            = @"norefresh";
NSString * const MESSAGE_FILE_EXISTS           = @"fileexists";
NSString * const MESSAGE_FILE_DOES_NOT_EXIST   = @"filedoesnotexist";
NSString * const MESSAGE_FILE_WRITTEN          = @"filewritten";
NSString * const MESSAGE_FILE_NOT_WRITTEN      = @"filenotwritten";
NSString * const MESSAGE_FILE_COPIED           = @"filecopied";
NSString * const MESSAGE_FILE_MOVED            = @"filemoved";
NSString * const MESSAGE_ERROR_WHILE_COPYING   = @"errorwhilecopying";

- (void)commander:(CDVInvokedUrlCommand *)command
{

    [self.commandDelegate runInBackground:^{
    
        CDVPluginResult *pluginResult       = nil;
       
        // jsonObject
        NSDictionary *jsonObject            = [command.arguments objectAtIndex:0];

        // command name
        NSString     *commandName           = [jsonObject objectForKey:RBCOMMANDER_ARGUMENT_COMMAND];
        
        // parameters
        NSString     *jsonString            = [jsonObject objectForKey:RBCOMMANDER_ARGUMENT_OPTION];
        NSData       *jsonData              = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
        NSDictionary *parameters            = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:nil];
        
        // result to be returned
        NSString     *result                = @"";
        
        // check FS
        NSString     *documentsDirectory    = nil;
        NSString     *cacheDirectory        = nil;
        
        // is Documents available?
        NSArray *pathDocuments = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        if ([pathDocuments count] > 0) {
            documentsDirectory = [pathDocuments objectAtIndex:0];
        }
        
        // is Cache directory available?
        NSArray *pathCache = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
        if ([pathCache count] > 0) {
            cacheDirectory = [pathCache objectAtIndex:0];
        }
        
        // set screen brightness
        if ([commandName isEqualToString:COMMAND_SET_BRIGHTNESS]) {
            result = [RBCommander setBrightness:[parameters objectForKey:@"value"]];
        }
        
        // get screen brightness
        if ([commandName isEqualToString:COMMAND_GET_BRIGHTNESS]) {
            result = [RBCommander getBrightness];
        }
        
        // set screen orientation
        if ([commandName isEqualToString:COMMAND_ORIENT]) {
            result = [RBCommander orient:[self.appDelegate viewController] option:[parameters objectForKey:@"value"]];
        }

        // open external URL
        if ([commandName isEqualToString:COMMAND_OPEN_EXTERNAL_URL]) {
            result = [RBCommander openExternalURL:[parameters objectForKey:@"url"]];
        }

        // get filesystem info
        if ([commandName isEqualToString:COMMAND_FILESYSTEM_INFO]) {
            result = [RBCommander getFilesystemInfoJSONString:documentsDirectory cache:cacheDirectory];
            
            NSLog(@"=======================================================================");
            NSLog(@"DOCUM %@", documentsDirectory);
            NSLog(@"\n");
            NSLog(@"CACHE %@", cacheDirectory);
            NSLog(@"=======================================================================");
        }

        // check whether the given file exists
        if  ([commandName isEqualToString:COMMAND_CHECK_FILE_EXISTS]) {
            if ([RBCommander doesFileExist:[parameters objectForKey:@"path"] withBase:documentsDirectory]) {
                result = MESSAGE_FILE_EXISTS;
            } else {
                result = MESSAGE_FILE_DOES_NOT_EXIST;
            }
        }

        // relative to app home dir
        if  ([commandName isEqualToString:COMMAND_DELETE_RELATIVE]) {
            NSString *normalizedPath = [RBCommander normalizePath:[parameters objectForKey:@"path"] withBase:cacheDirectory];
            result = [RBCommander delete:normalizedPath];
        }
        
        // absolute path in the file system
        if  ([commandName isEqualToString:COMMAND_DELETE_ABSOLUTE]) {
            result = [RBCommander delete:[parameters objectForKey:@"path"]];
        }
        
        // copy file option into option2
        if  ([commandName isEqualToString:COMMAND_COPY]) {
            result = [RBCommander copyFile:[parameters objectForKey:@"source"] destination:[parameters objectForKey:@"destination"] withBase:cacheDirectory];
        }
        
        // copy file option from assets/www/ into option2
        if  ([commandName isEqualToString:COMMAND_COPY_FROM_ASSETS_WWW]) {
            result = [RBCommander copyFileFromAssetsWWW:[parameters objectForKey:@"source"] destination:[parameters objectForKey:@"destination"] withBase:documentsDirectory];
        }
        
        // move file option into option2
        if  ([commandName isEqualToString:COMMAND_MOVE]) {
            result = [RBCommander moveFile:[parameters objectForKey:@"source"] destination:[parameters objectForKey:@"destination"] withBase:cacheDirectory];
        }
        
        // write string to file
        if  ([commandName isEqualToString:COMMAND_WRITE_TO_FILE]) {
            result = [RBCommander writeStringToFile:[parameters objectForKey:@"destination"] string:[parameters objectForKey:@"string"] withBase:cacheDirectory];
        }
        
        // return result string
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:result];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        
    }]; // close background call
}

+ (NSString *)setBrightness:(NSString *)value
{
    float brightness = [value floatValue];
    [[UIScreen mainScreen] setBrightness:brightness];
    return @"";
}

+ (NSString *)getBrightness
{
    float brightness = [UIScreen mainScreen].brightness;
    return [NSMutableString stringWithFormat:@"%0.2f", brightness];
}

+ (NSString *)orient:(UIViewController *)vc option:(NSString *)option
{
    if ([vc isKindOfClass:[MainViewController class]]) {
        // cast
        MainViewController *mvc = (MainViewController *)vc;

        // NOTE: this requires modifying the MainViewController generated by Cordova
        //       to support setting the interface orientation on the go
        //       by calling the setter setMySupportedInterfaceOrientations
        //
        // set the requested orientation mode
        if ([option isEqualToString:ORIENT_OPTION_PORTRAIT]) {
            [mvc setMySupportedInterfaceOrientations:UIInterfaceOrientationMaskPortrait | UIInterfaceOrientationMaskPortraitUpsideDown];
        } else if ([option isEqualToString:ORIENT_OPTION_LANDSCAPE]) {
            [mvc setMySupportedInterfaceOrientations:UIInterfaceOrientationMaskLandscapeLeft | UIInterfaceOrientationMaskLandscapeRight];
        } else if ([option isEqualToString:ORIENT_OPTION_AUTO]) {
            [mvc setMySupportedInterfaceOrientations:UIInterfaceOrientationMaskAll];
        } else {
            [mvc setMySupportedInterfaceOrientations:UIInterfaceOrientationMaskAll];
        }
    }
    return @"";
}

+ (NSString *)openExternalURL:(NSString *)url
{
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:url]];
    return @"";
}

+ (NSString *)getFilesystemInfoJSONString:(NSString *)documentsDirectory cache:(NSString *)cacheDirectory
{
    // TODO use JSON stringifier
    
    NSMutableString *result = [NSMutableString stringWithString:@"{"];
    
    [result appendString: @"\"root\": \""];
    [result appendString: [RBCommander escape:cacheDirectory]];
    [result appendString: @"\","];
    
    [result appendString: @"\"separator\": \""];
    [result appendString: [RBCommander escape:@"/"]];
    [result appendString: @"\","];
    
    [result appendString: @"\"documentsDir\": \""];
    [result appendString: [RBCommander escape:documentsDirectory]];
    [result appendString: @"\","];
    
    [result appendString: @"\"cacheDir\": \""];
    [result appendString: [RBCommander escape:cacheDirectory]];
    [result appendString: @"\","];

    [result appendString: @"\"storageRoots\": \""];
    [result appendString: @"[]"];
    [result appendString: @"\""];

    [result appendString:@"}"];
    
    return result;
}

+ (BOOL) doesFileExist:(NSString *)path withBase:(NSString *)base
{
    NSString *normalizedPath = [RBCommander normalizePath:path withBase:base];
    return ([[NSFileManager defaultManager] fileExistsAtPath:normalizedPath] == YES);
}

+ (NSString *)copyFile:(NSString *)source destination:(NSString *)destination withBase:(NSString *)base
{
    NSString *normalizedPathSource      = [RBCommander normalizePath:source      withBase:base];
    NSString *normalizedPathDestination = [RBCommander normalizePath:destination withBase:base];
    NSString *result;
    if ([[NSFileManager defaultManager] fileExistsAtPath:normalizedPathSource] == TRUE) {
        NSError *error = nil;
        NSString *destinationParentDirectory = [normalizedPathDestination stringByDeletingLastPathComponent];
        if ([[NSFileManager defaultManager] fileExistsAtPath:destinationParentDirectory] == NO) {
            // create parent directory
            [[NSFileManager defaultManager] createDirectoryAtPath:destinationParentDirectory withIntermediateDirectories:YES attributes:nil error:&error];
        }
        if (!error) {
            // copy file
            [[NSFileManager defaultManager] copyItemAtPath:normalizedPathSource toPath:normalizedPathDestination error:&error];
            if (!error) {
                result = MESSAGE_FILE_COPIED;
            } else {
                result = MESSAGE_ERROR_WHILE_COPYING;
            }
        } else {
            result = MESSAGE_ERROR_WHILE_COPYING;
        }
    } else {
        result = MESSAGE_FILE_DOES_NOT_EXIST;
    }
    return result;
}

+ (NSString *)copyFileFromAssetsWWW:(NSString *)source destination:(NSString *)destination withBase:(NSString *)base
{
    NSString *normalizedPathSource      = [[[[NSBundle mainBundle] resourcePath] stringByAppendingPathComponent:@"www"] stringByAppendingPathComponent:source];
    NSString *normalizedPathDestination = [RBCommander normalizePath:destination withBase:base];
    NSString *result;
    if ([[NSFileManager defaultManager] fileExistsAtPath:normalizedPathSource] == TRUE) {
        NSError *error = nil;
        NSString *destinationParentDirectory = [normalizedPathDestination stringByDeletingLastPathComponent];
        if ([[NSFileManager defaultManager] fileExistsAtPath:destinationParentDirectory] == NO) {
            // create parent directory
            [[NSFileManager defaultManager] createDirectoryAtPath:destinationParentDirectory withIntermediateDirectories:YES attributes:nil error:&error];
        }
        if (!error) {
            // copy file
            [[NSFileManager defaultManager] copyItemAtPath:normalizedPathSource toPath:normalizedPathDestination error:&error];
            if (!error) {
                result = MESSAGE_FILE_COPIED;
            } else {
                result = MESSAGE_ERROR_WHILE_COPYING;
            }
        } else {
            result = MESSAGE_ERROR_WHILE_COPYING;
        }
    } else {
        result = MESSAGE_FILE_DOES_NOT_EXIST;
    }
    return result;
}

+ (NSString *)moveFile:(NSString *)source destination:(NSString *)destination withBase:(NSString *)base
{
    NSString *normalizedPathSource      = [RBCommander normalizePath:source      withBase:base];
    NSString *normalizedPathDestination = [RBCommander normalizePath:destination withBase:base];
    NSString *result;
    if ([[NSFileManager defaultManager] fileExistsAtPath:normalizedPathSource] == TRUE) {
        NSError *error = nil;
        NSString *destinationParentDirectory = [normalizedPathDestination stringByDeletingLastPathComponent];
        if ([[NSFileManager defaultManager] fileExistsAtPath:destinationParentDirectory] == NO) {
            // create parent directory
            [[NSFileManager defaultManager] createDirectoryAtPath:destinationParentDirectory withIntermediateDirectories:YES attributes:nil error:&error];
        }
        if (!error) {
            // move file
            [[NSFileManager defaultManager] moveItemAtPath:normalizedPathSource toPath:normalizedPathDestination error:&error];
            if (!error) {
                result = MESSAGE_FILE_MOVED;
            } else {
                result = MESSAGE_ERROR_WHILE_COPYING;
            }
        } else {
            result = MESSAGE_ERROR_WHILE_COPYING;
        }
    } else {
        result = MESSAGE_FILE_DOES_NOT_EXIST;
    }
    return result;
}

+ (NSString *)writeStringToFile:(NSString *)destination string:(NSString *)string withBase:(NSString *)base
{
    NSError *error = nil;
    NSString *normalizedPath = [RBCommander normalizePath:destination withBase:base];
    [string writeToFile:normalizedPath atomically:TRUE encoding:NSUTF8StringEncoding error:&error];
    if (!error) {
        return MESSAGE_FILE_WRITTEN;
    }
    return MESSAGE_FILE_NOT_WRITTEN;
}

+ (NSString *)escape:(NSString *)unescaped
{
    if (unescaped == nil) {
        return @"";
    }
    return [unescaped stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""];
}

+ (NSString *)delete:(NSString *)file
{
    NSError *error = nil;
    if ([[NSFileManager defaultManager] fileExistsAtPath:file] == YES) {
        [[NSFileManager defaultManager] removeItemAtPath:file error:&error];
    }
    return @"";
}

+ (NSString *)normalizePath:(NSString *)path withBase:(NSString *)base {
    if (([path length] > 0) && ([[path substringWithRange:NSMakeRange(0, 1)] isEqualToString:@"/"])) {
        // path is an absolute path, like /sdcard0/minstrel/foo => return it
        return path;
    } else if (([path length] > 7) && ([[path substringWithRange:NSMakeRange(0, 7)] isEqualToString:@"file://"])) {
        // path is a prefixed path, like file:///sdcard0/minstrel/foo => strip file://
        return [path substringFromIndex:7];
    } else {
        // path is relative => returns base/path
        return [base stringByAppendingPathComponent:path];
    }
}

@end
