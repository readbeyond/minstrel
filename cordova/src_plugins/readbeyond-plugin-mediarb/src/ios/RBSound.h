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

// based on the source code of the official Cordova Media plugin
// available under the Apache License Version 2.0 License
// https://github.com/apache/cordova-plugin-media

#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioServices.h>
#import <AVFoundation/AVFoundation.h>
#import <Cordova/CDVPlugin.h>

enum RBMediaError {
    MEDIA_ERR_ABORTED        = 1,
    MEDIA_ERR_NETWORK        = 2,
    MEDIA_ERR_DECODE         = 3,
    MEDIA_ERR_NONE_SUPPORTED = 4
};
typedef NSUInteger RBMediaError;

enum RBMediaStates {
    MEDIA_NONE      = 0,
    MEDIA_STARTING  = 1,
    MEDIA_RUNNING   = 2,
    MEDIA_PAUSED    = 3,
    MEDIA_STOPPED   = 4,
    MEDIA_COMPLETED = 5,
};
typedef NSUInteger RBMediaStates;

enum RBMediaMsg {
    MEDIA_STATE    = 1,
    MEDIA_DURATION = 2,
    MEDIA_POSITION = 3,
    MEDIA_ERROR    = 9
};
typedef NSUInteger RBMediaMsg;

@interface RBAudioPlayer : AVAudioPlayer
{
    NSString* mediaId;
}
@property (nonatomic, copy) NSString* mediaId;
@end

@interface RBAudioFile : NSObject
{
    NSString* resourcePath;
    NSURL* resourceURL;
    RBAudioPlayer* player;
    NSNumber* volume;
    NSNumber* speed;
}

@property (nonatomic, strong) NSString* resourcePath;
@property (nonatomic, strong) NSURL* resourceURL;
@property (nonatomic, strong) RBAudioPlayer* player;
@property (nonatomic, strong) NSNumber* volume;
@property (nonatomic, strong) NSNumber* speed;

@end

@interface RBSound : CDVPlugin <AVAudioPlayerDelegate>
{
    NSMutableDictionary* soundCache;
    AVAudioSession* avSession;
}
@property (nonatomic, strong) NSMutableDictionary* soundCache;
@property (nonatomic, strong) AVAudioSession* avSession;

- (void)startPlayingAudio:(CDVInvokedUrlCommand*)command;
- (void)pausePlayingAudio:(CDVInvokedUrlCommand*)command;
- (void)stopPlayingAudio:(CDVInvokedUrlCommand*)command;
- (void)seekToAudio:(CDVInvokedUrlCommand*)command;
- (void)release:(CDVInvokedUrlCommand*)command;
- (void)getCurrentPositionAudio:(CDVInvokedUrlCommand*)command;

- (BOOL)hasAudioSession;

// helper methods
- (NSURL*)urlForPlaying:(NSString*)resourcePath;
- (NSURL*)urlForResource:(NSString*)resourcePath CDV_DEPRECATED(2.5, "Use specific api for playing or recording");

- (RBAudioFile*)audioFileForResource:(NSString*)resourcePath withId:(NSString*)mediaId CDV_DEPRECATED(2.5, "Use updated audioFileForResource api");

- (RBAudioFile*)audioFileForResource:(NSString*)resourcePath withId:(NSString*)mediaId doValidation:(BOOL)bValidate forRecording:(BOOL)bRecord;
- (BOOL)prepareToPlay:(RBAudioFile*)audioFile withId:(NSString*)mediaId;
- (NSString*)createMediaErrorWithCode:(RBMediaError)code message:(NSString*)message;

- (void)setVolume:(CDVInvokedUrlCommand*)command;
- (void)setPlaybackSpeed:(CDVInvokedUrlCommand*)command;

@end
