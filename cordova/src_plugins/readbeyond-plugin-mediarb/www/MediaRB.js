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

var argscheck = require('cordova/argscheck'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec');

var mediaObjects = {};

/**
 * This class provides access to the device media, interfaces to both sound and video
 *
 * @constructor
 * @param src                   The file name or url to play
 * @param successCallback       The callback to be called when the file is done playing or recording.
 *                                  successCallback()
 * @param errorCallback         The callback to be called if there is an error.
 *                                  errorCallback(int errorCode) - OPTIONAL
 * @param statusCallback        The callback to be called when media status has changed.
 *                                  statusCallback(int statusCode) - OPTIONAL
 */
var MediaRB = function(src, successCallback, errorCallback, statusCallback, mode) {
    // S = string, F = function
    argscheck.checkArgs('SFFFS', 'MediaRB', arguments);
    this.id = utils.createUUID();
    mediaObjects[this.id] = this;
    this.src = src;
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.statusCallback = statusCallback;
    this.mode = mode;
    this._duration = -1;
    this._position = -1;
    exec(null, this.errorCallback, "MediaRB", "create", [this.id, this.src, this.mode]);
};

// MediaRB messages
MediaRB.MEDIA_STATE = 1;
MediaRB.MEDIA_DURATION = 2;
MediaRB.MEDIA_POSITION = 3;
MediaRB.MEDIA_ERROR = 9;

// MediaRB states
MediaRB.MEDIA_NONE = 0;
MediaRB.MEDIA_STARTING = 1;
MediaRB.MEDIA_RUNNING = 2;
MediaRB.MEDIA_PAUSED = 3;
MediaRB.MEDIA_STOPPED = 4;
MediaRB.MEDIA_COMPLETED = 5;
MediaRB.MEDIA_MSG = ["None", "Starting", "Running", "Paused", "Stopped", "Completed"];

// "static" function to return existing objs.
MediaRB.get = function(id) {
    return mediaObjects[id];
};

/**
 * Start or resume playing audio file.
 */
MediaRB.prototype.play = function(options) {
    exec(null, null, "MediaRB", "startPlayingAudio", [this.id, this.src, options]);
};

/**
 * Stop playing audio file.
 */
MediaRB.prototype.stop = function() {
    var me = this;
    exec(function() {
        me._position = 0;
    }, this.errorCallback, "MediaRB", "stopPlayingAudio", [this.id]);
};

/**
 * Seek or jump to a new time in the track..
 */
MediaRB.prototype.seekTo = function(milliseconds) {
    var me = this;
    exec(function(p) {
        me._position = p;
    }, this.errorCallback, "MediaRB", "seekToAudio", [this.id, milliseconds]);
};

/**
 * Pause playing audio file.
 */
MediaRB.prototype.pause = function() {
    exec(null, this.errorCallback, "MediaRB", "pausePlayingAudio", [this.id]);
};

/**
 * Get duration of an audio file.
 * The duration is only set for audio that is playing, paused or stopped.
 *
 * @return      duration or -1 if not known.
 */
MediaRB.prototype.getDuration = function() {
    return this._duration;
};

/**
 * Get position of audio.
 */
MediaRB.prototype.getCurrentPosition = function(success, fail) {
    var me = this;
    exec(function(p) {
        me._position = p;
        success(p);
    }, fail, "MediaRB", "getCurrentPositionAudio", [this.id]);
};

/**
 * Release the resources.
 */
MediaRB.prototype.release = function() {
    exec(null, this.errorCallback, "MediaRB", "release", [this.id]);
};

/**
 * Adjust the volume.
 */
MediaRB.prototype.setVolume = function(volume) {
    exec(null, null, "MediaRB", "setVolume", [this.id, volume]);
};

/**
 * Adjust the playback speed.
 */
MediaRB.prototype.setPlaybackSpeed = function(speed) {
    exec(null, null, "MediaRB", "setPlaybackSpeed", [this.id, speed]);
};

/**
 * Audio has status update.
 * PRIVATE
 *
 * @param id            The media object id (string)
 * @param msgType       The 'type' of update this is
 * @param value         Use of value is determined by the msgType
 */
MediaRB.onStatus = function(id, msgType, value) {

    var media = mediaObjects[id];

    if(media) {
        switch(msgType) {
            case MediaRB.MEDIA_STATE :
                media.statusCallback && media.statusCallback(value);
                if(value === MediaRB.MEDIA_COMPLETED) {
                    media.successCallback && media.successCallback();
                }
                break;
            case MediaRB.MEDIA_DURATION :
                media._duration = value;
                break;
            case MediaRB.MEDIA_ERROR :
                media.errorCallback && media.errorCallback(value);
                break;
            case MediaRB.MEDIA_POSITION :
                media._position = Number(value);
                break;
            default :
                console.error && console.error("Unhandled MediaRB.onStatus :: " + msgType);
                break;
        }
    } else {
         console.error && console.error("Received MediaRB.onStatus callback for unknown media :: " + id);
    }
};

module.exports = MediaRB;

function onMessageFromNative(msg) {
    if (msg.action === 'status') {
        MediaRB.onStatus(msg.status.id, msg.status.msgType, msg.status.value);
    } else {
        throw new Error('Unknown media action' + msg.action);
    }
}

if (cordova.platformId === 'android' || cordova.platformId === 'amazon-fireos' || cordova.platformId === 'windowsphone') {

    var channel = require('cordova/channel');

    channel.createSticky('onMediaRBPluginReady');
    channel.waitForInitialization('onMediaRBPluginReady');

    channel.onCordovaReady.subscribe(function() {
        exec(onMessageFromNative, undefined, 'MediaRB', 'messageChannel', []);
        channel.initializationComplete('onMediaRBPluginReady');
    });
}
