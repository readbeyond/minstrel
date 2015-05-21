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
    utils = require('cordova/utils');

var mediaObjects = {};

/**
 * Creates new Audio node and with necessary event listeners attached
 * @param  {MediaRB} media MediaRB object
 * @return {Audio}       Audio element 
 */
function createNode (media) {
    var node = new Audio();

    node.onloadstart = function () {
        MediaRB.onStatus(media.id, MediaRB.MEDIA_STATE, MediaRB.MEDIA_STARTING);
    };

    node.onplaying = function () {
        MediaRB.onStatus(media.id, MediaRB.MEDIA_STATE, MediaRB.MEDIA_RUNNING);
    };

    node.ondurationchange = function (e) {
        MediaRB.onStatus(media.id, MediaRB.MEDIA_DURATION, e.target.duration || -1);
    };

    node.onerror = function (e) {
        // Due to media.spec.15 It should return MediaErrorRB for bad filename
        var err = e.target.error.code === MediaErrorRB.MEDIA_ERR_SRC_NOT_SUPPORTED ?
            { code: MediaErrorRB.MEDIA_ERR_ABORTED } :
            e.target.error;

        MediaRB.onStatus(media.id, MediaRB.MEDIA_ERROR, err);
    };

    node.onended = function () {
        MediaRB.onStatus(media.id, MediaRB.MEDIA_STATE, MediaRB.MEDIA_STOPPED);
    };

    if (media.src) {
        node.src = media.src;
    }

    return node;
}

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

    MediaRB.onStatus(this.id, MediaRB.MEDIA_STATE, MediaRB.MEDIA_STARTING);
    
    try {
        this.node = createNode(this);
    } catch (err) {
        MediaRB.onStatus(this.id, MediaRB.MEDIA_ERROR, { code: MediaErrorRB.MEDIA_ERR_ABORTED });
    }
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

/**
 * Start or resume playing audio file.
 */
MediaRB.prototype.play = function() {

    // if MediaRB was released, then node will be null and we need to create it again
    if (!this.node) {
        try {
            this.node = createNode(this);
        } catch (err) {
            MediaRB.onStatus(this.id, MediaRB.MEDIA_ERROR, { code: MediaErrorRB.MEDIA_ERR_ABORTED });
        }
    }

    this.node.play();
};

/**
 * Stop playing audio file.
 */
MediaRB.prototype.stop = function() {
    try {
        this.pause();
        this.seekTo(0);
        MediaRB.onStatus(this.id, MediaRB.MEDIA_STATE, MediaRB.MEDIA_STOPPED);
    } catch (err) {
        MediaRB.onStatus(this.id, MediaRB.MEDIA_ERROR, err);
    }
};

/**
 * Seek or jump to a new time in the track..
 */
MediaRB.prototype.seekTo = function(milliseconds) {
    try {
        this.node.currentTime = milliseconds / 1000;
    } catch (err) {
        MediaRB.onStatus(this.id, MediaRB.MEDIA_ERROR, err);
    }
};

/**
 * Pause playing audio file.
 */
MediaRB.prototype.pause = function() {
    try {
        this.node.pause();
        MediaRB.onStatus(this.id, MediaRB.MEDIA_STATE, MediaRB.MEDIA_PAUSED);
    } catch (err) {
        MediaRB.onStatus(this.id, MediaRB.MEDIA_ERROR, err);
    }};

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
    try {
        var p = this.node.currentTime;
        MediaRB.onStatus(this.id, MediaRB.MEDIA_POSITION, p);
        success(p);
    } catch (err) {
        fail(err);
    }
};

/**
 * Release the resources.
 */
MediaRB.prototype.release = function() {
    try {
        delete this.node;
    } catch (err) {
        MediaRB.onStatus(this.id, MediaRB.MEDIA_ERROR, err);
    }};

/**
 * Adjust the volume.
 */
MediaRB.prototype.setVolume = function(volume) {
    this.node.volume = volume;
};

/**
 * Adjust the playback speed.
 */
MediaRB.prototype.setPlaybackSpeed = function(speed) {
    this.node.playbackRate = speed;
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
