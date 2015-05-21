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

// be strict, be safe
'use strict';

/** @namespace RB */
var RB = RB || {};

/** @namespace RB.ABZReader */
RB.ABZReader = RB.ABZReader || {};

/* constants */
RB.ABZReader.notificationDuration             = 1000;             // (ms) duration of on screen notifications

/*  variables */
RB.ABZReader.createdManagers                  = false;
RB.ABZReader.assetManager                     = null;
RB.ABZReader.drs                              = null;

RB.ABZReader.unzipAll                         = false;
RB.ABZReader.orientation                      = 'auto';
RB.ABZReader.usePlaylist                      = true;
RB.ABZReader.wrapAround                       = false;
RB.ABZReader.showTrackNumber                  = true;

RB.ABZReader.preventSwipe                     = false;
RB.ABZReader.sliderIsChanging                 = false;

RB.ABZReader.tracks                           = [];
RB.ABZReader.item                             = null;
RB.ABZReader.itemID                           = null;
RB.ABZReader.itemPath                         = null;
RB.ABZReader.appStatusBeforeBackgrounded      = null;
RB.ABZReader.invertedTimer                    = false;

RB.ABZReader.playbackSpeed                    = 1.0;
RB.ABZReader.volume                           = 1.0;
RB.ABZReader.currentTrackDuration             = null;
RB.ABZReader.preventTrackListScroll           = false;

//  UI
RB.ABZReader.UI                               = {};
RB.ABZReader.UI.divReader                     = 'divReader';
RB.ABZReader.UI.divHeader                     = 'divHeader';
RB.ABZReader.UI.txtTitle                      = 'txtABZReaderTitle';
RB.ABZReader.UI.btnHeaderMenu                 = 'btnHeaderMenu';
RB.ABZReader.UI.divContentContainer           = 'divContentContainer';
RB.ABZReader.UI.divFooterAll                  = 'divFooterAll';
RB.ABZReader.UI.divFooterSliderLeft           = 'divFooterSliderLeft';
RB.ABZReader.UI.divFooterSliderContainerInner = 'divFooterSliderContainerInner';
RB.ABZReader.UI.divFooterPlayer               = 'divFooterPlayer';
RB.ABZReader.UI.sliderID                      = 'sldAudio';
RB.ABZReader.UI.txtSliderAudioPosition        = 'txtSliderAudioPosition';
RB.ABZReader.UI.lstTracks                     = 'lstTracks';
RB.ABZReader.UI.btnPrevious                   = 'btnABZPrevious';
RB.ABZReader.UI.btnRewind                     = 'btnABZRewind';
RB.ABZReader.UI.btnPlay                       = 'btnABZPlay';
RB.ABZReader.UI.btnForward                    = 'btnABZForward';
RB.ABZReader.UI.btnNext                       = 'btnABZNext';
RB.ABZReader.UI.popupPreferences              = 'divPopupPreferences';

/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.ABZReader.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();
    
    // if running on a small screen, reduce bottom bar button text
    RB.UI.reduceOnSmallScreen(RB.ABZReader.UI.divFooterPlayer);
    RB.UI.reduceOnSmallScreen(RB.ABZReader.UI.divFooterSliderLeft);
};

// initialize page
RB.ABZReader.initializePage = function() {
    // set app variables
    RB.ABZReader.loadVariables();
    
    // create manager objects
    RB.ABZReader.createManagers();
    RB.ABZReader.drs.update();
    
    // bind events
    RB.ABZReader.bindEvents();
    
    // force dimming system bar
    RB.UI.dimSystemBar(true);

    // show or hide speed in preferences
    RB.UI.showHide('divPreferencesPopupSpeed', RB.Storage.isAppParameterTrue(RB.Storage.Keys.MEDIAPLAYER_ENABLE_PLAYBACK_SPEED));
    
    // load tracks
    RB.UI.showSpinner(true);
    RB.ABZReader.loadTracks();
};

// bind events
RB.ABZReader.bindEvents = function() {
    // orientation
    $(window).on('orientationchange', RB.ABZReader.onOrientationChange);
    
    // resume and pause events
    document.addEventListener('pause',  RB.ABZReader.onAppPause);
    document.addEventListener('resume', RB.ABZReader.onAppResume);
};

// handle back button
RB.ABZReader.onBackButton = function() {
    // delete tmp directory
    RB.ABZReader.assetManager.deleteTmpDirectory();
    
    // save settings
    RB.ABZReader.drs.save();
    
    // save position and metadata
    if (RB.ABZReader.audioPlayer) {
        RB.App.saveItemData(RB.ABZReader.itemID, ['position', RB.Plugins.Format.formatNames.ABZ], {
            'track':  RB.ABZReader.audioPlayer.getCurrentTrackIndex(),
            'seekTo': RB.ABZReader.audioPlayer.getCurrentTrackPosition()
        });
    }
    if (RB.ABZReader.tracks) {
        RB.App.saveItemData(RB.ABZReader.itemID, ['structure', RB.Plugins.Format.formatNames.ABZ, 'tracks'], RB.ABZReader.tracks);
    }
    
    // go back
    RB.UI.onBackButton();
};

// called when the app is sent to background
RB.ABZReader.onAppPause = function() {
    if (!RB.ABZReader.backgroundAudio) {
        var state = RB.ABZReader.audioPlayer.getState();
        if (state === 'playing') {
            RB.ABZReader.playPause();
            RB.ABZReader.appStatusBeforeBackgrounded = RB.App.AppStatusBeforeBackground.PLAYING;
        } else if (state === 'paused') {
            RB.ABZReader.appStatusBeforeBackgrounded = RB.App.AppStatusBeforeBackground.PAUSED;
        } else {
            RB.ABZReader.appStatusBeforeBackgrounded = RB.App.AppStatusBeforeBackground.STOPPED;
        }
    }
};

// called when the app is resumed from background
RB.ABZReader.onAppResume = function() {
    if (RB.ABZReader.appStatusBeforeBackgrounded === RB.App.AppStatusBeforeBackground.PLAYING) {
        RB.ABZReader.playPause();
    }
    RB.ABZReader.appStatusBeforeBackgrounded = null;
};

// on orientation change, redraw content containers
RB.ABZReader.onOrientationChange = function() {
    var act = function() {
        RB.UI.resizeSidePopup();
        RB.ABZReader.scrollTrackList();
    };
    RB.App.delay(act, RB.UI.ON_ORIENTATION_CHANGE_DELAY);
};

RB.ABZReader.scrollTrackList = function() {
    if (RB.ABZReader.preventTrackListScroll) {
        RB.ABZReader.preventTrackListScroll = false;
    } else {
        try {
            var id  = 'track' + RB.ABZReader.audioPlayer.getCurrentTrackIndex();
            var res = RB.UI.computeVisibleArea(RB.ABZReader.UI.divHeader, RB.ABZReader.UI.divFooterAll);
            RB.UI.silentScroll(RB.UI.getOffsetTop(id) - RB.UI.getHeight(RB.ABZReader.UI.divHeader) - res[3]/3);
        } catch (e) {
            // nop
        }
    }
};

// load variables from storage
RB.ABZReader.loadVariables = function() {
    // current item
    RB.ABZReader.itemPath        = RB.App.unescapeQuotes(RB.Storage.get(RB.Storage.Keys.OPEN_ITEM_FILE_PATH));
    RB.ABZReader.itemID          = RB.Storage.get(RB.Storage.Keys.OPEN_ITEM_ID);
    RB.ABZReader.item            = RB.Storage.getDictionary(RB.Storage.Keys.LIBRARY_BOOKS)[RB.ABZReader.itemID];
    
    // load settings
    RB.ABZReader.backgroundAudio = RB.Storage.isAppParameterTrue(RB.Storage.Keys.ABZ_BACKGROUND_AUDIO);
    RB.ABZReader.wrapAround      = RB.Storage.isAppParameterTrue(RB.Storage.Keys.ABZ_WRAP_AROUND);
    RB.ABZReader.autoStartAudio  = RB.Storage.isAppParameterTrue(RB.Storage.Keys.ABZ_AUTO_START_AUDIO);
    RB.ABZReader.usePlaylist     = RB.Storage.isAppParameterTrue(RB.Storage.Keys.ABZ_USE_PLAYLIST);
    RB.ABZReader.showTrackNumber = RB.Storage.isAppParameterTrue(RB.Storage.Keys.ABZ_SHOW_TRACK_NUMBER);
    RB.ABZReader.orientation     = RB.Storage.get(RB.Storage.Keys.UI_ORIENTATION);
    RB.ABZReader.preloadPrevNext = RB.Storage.isAppParameterTrue(RB.Storage.Keys.ABZ_PRELOAD_PREV_NEXT);
    RB.ABZReader.unzipAll        = RB.Storage.isAppParameterTrue(RB.Storage.Keys.ABZ_UNZIP_ALL);
};

// create manager objects
RB.ABZReader.createManagers = function() {
    // if already created, abort
    if (RB.ABZReader.createdManagers) {
        return;
    }
    
    // asset manager object
    RB.ABZReader.assetManager = new RB.App.zipAssetsManager(RB.ABZReader.itemPath, RB.App.joinPaths([RB.App.getTmpDirectory(), RB.ABZReader.itemID]), !RB.ABZReader.unzipAll);
    
    // preference manager object
    RB.ABZReader.drs = new RB.App.drsManager(RB.ABZReader.itemID, RB.Plugins.Format.formatNames.ABZ, false);
    
    RB.ABZReader.drs.registerSetting('ABZ_PLAYBACK_VOLUME', 'cycle', RB.Config.ABZReader.availablePlaybackVolumes, [
        { 'id': 'btnPreferencesPopupVolumeIncrease',    'notification': true,  'circular': false, 'increase': true,  'compact': false, 'callback': RB.ABZReader.updateVolume },
        { 'id': 'btnPreferencesPopupVolumeDecrease',    'notification': true,  'circular': false, 'increase': false, 'compact': false, 'callback': RB.ABZReader.updateVolume },
    ]);

    RB.ABZReader.drs.registerSetting('ABZ_PLAYBACK_SPEED', 'cycle', RB.Config.ABZReader.availablePlaybackSpeeds, [
        { 'id': 'btnPreferencesPopupSpeedReset',        'notification': true , 'special':  true,  'callahead': RB.ABZReader.resetPlaybackSpeed },
        { 'id': 'btnPreferencesPopupSpeedFaster',       'notification': true,  'circular': false, 'increase': true,  'compact': false, 'callback': RB.ABZReader.updatePlaybackSpeed },
        { 'id': 'btnPreferencesPopupSpeedSlower',       'notification': true,  'circular': false, 'increase': false, 'compact': false, 'callback': RB.ABZReader.updatePlaybackSpeed },
    ]);
    
    // register simple buttons
    RB.UI.bindSimpleButtonEvents(RB.ABZReader.UI.btnPrevious,           { 'tap': RB.ABZReader.previousTrack     }, false);
    RB.UI.bindSimpleButtonEvents(RB.ABZReader.UI.btnRewind,             { 'tap': RB.ABZReader.rewindTrack       }, false);
    RB.UI.bindSimpleButtonEvents(RB.ABZReader.UI.btnPlay,               { 'tap': RB.ABZReader.playPause         }, false);
    RB.UI.bindSimpleButtonEvents(RB.ABZReader.UI.btnForward,            { 'tap': RB.ABZReader.forwardTrack      }, false);
    RB.UI.bindSimpleButtonEvents(RB.ABZReader.UI.btnNext,               { 'tap': RB.ABZReader.nextTrack         }, false);
    RB.UI.bindSimpleButtonEvents(RB.ABZReader.UI.divFooterSliderLeft,   {
        'tap':          RB.ABZReader.playPause,
        'doubletap':    RB.ABZReader.invertTimer
    }, true);
    RB.UI.bindSimpleButtonEvents(RB.ABZReader.UI.btnHeaderMenu,         { 'tap': RB.ABZReader.openPreferences   }, true);

    // reset flag
    RB.ABZReader.createdManagers = true;
};

// button actions
RB.ABZReader.updateVolume = function() {
    if (RB.ABZReader.audioPlayer) {
        RB.ABZReader.audioPlayer.setVolume(RB.ABZReader.drs.getValue('ABZ_PLAYBACK_VOLUME'));
    }
};
RB.ABZReader.updatePlaybackSpeed = function() {
    if (RB.ABZReader.audioPlayer) {
        RB.ABZReader.audioPlayer.setPlaybackSpeed(RB.ABZReader.drs.getValue('ABZ_PLAYBACK_SPEED'));
    }
};

RB.ABZReader.resetPlaybackSpeed = function() {
    RB.ABZReader.drs.setValue('ABZ_PLAYBACK_SPEED', '1.0');
    RB.ABZReader.updatePlaybackSpeed();
};
RB.ABZReader.previousTrack = function() {
    RB.ABZReader.playTrack(-1, 0, false);
};
RB.ABZReader.rewindTrack = function() {
    RB.ABZReader.seekTrack(-30, false);
};
RB.ABZReader.forwardTrack = function() {
    RB.ABZReader.seekTrack(30, false);
};
RB.ABZReader.nextTrack = function() {
    RB.ABZReader.playTrack(1, 0, false);
};
RB.ABZReader.invertTimer = function() {
    RB.ABZReader.invertedTimer = !RB.ABZReader.invertedTimer;
    try {
        var value = parseInt(RB.UI.getSliderValue(RB.ABZReader.UI.sliderID));
        RB.ABZReader.setTimerText(value);
    } catch (e) {
        // nop
    }
};

// generic error message
RB.ABZReader.onErrorLoadingABZFile = function() {
    RB.App.message('A fatal error occurred while reading this ABZ file.', RB.App.MessageSeverityEnum.CRITICAL);
};

// get the list of tracks contained in this ABZ file
RB.ABZReader.loadTracks = function() {
    var tracks = RB.App.readItemData(RB.ABZReader.itemID, ['structure', RB.Plugins.Format.formatNames.ABZ, 'tracks']);
    if (tracks) {
        // load from storage (from the second time on)
        RB.ABZReader.tracks = tracks;
        RB.ABZReader.performUnzipAll();
        return;
    }
    
    // if here, we failed to load from storage
    // load from file (first item)
    var onSuccess = function(message) {
        
        // DEBUG
        //alert(message);
        
        // store track paths (relative to archive root dir)
        RB.ABZReader.tracks = [];
        var a = (JSON.parse(message)).assets.items;
        for (var i = 0; i < a.length; i++) {
            var track = {};
            track['href']     = a[i].path;
            track['title']    = RB.Utilities.getLastPathComponent(a[i].path);
            track['duration'] = '';
            if ('metadata' in a[i]) {
                if ('title' in a[i].metadata) {
                    track['title'] = a[i].metadata.title;
                }
                if ('duration' in a[i].metadata) {
                    track['duration'] = a[i].metadata.duration;
                }
            }
            RB.ABZReader.tracks.push(track);
        }
        RB.ABZReader.performUnzipAll();
    };
    // get metadata
    var args  = {};
    try {
        args['internalPathPlaylist'] = RB.ABZReader.item.formats[RB.Plugins.Format.formatNames.ABZ].metadata.internalPathPlaylist;
    } catch (e) {
        // nop
    }
    args['format'] = RB.Plugins.Format.formatNames.ABZ;
    RB.ABZReader.assetManager.getSortedListOfAssets(args, onSuccess, RB.ABZReader.onErrorLoadingABZFile);
};

// unzip all or call init completed
RB.ABZReader.performUnzipAll = function() {
    if (RB.ABZReader.unzipAll) {
        RB.ABZReader.assetManager.unzipAll(RB.ABZReader.initializationCompleted, RB.ABZReader.onErrorLoadingABZFile);
    } else {
        RB.ABZReader.initializationCompleted();
    }
};

// we can start playing tracks
RB.ABZReader.initializationCompleted = function() {
    // create slider callbacks
    var onSlideStart = function() {
        RB.ABZReader.sliderIsChanging = true;
    };
    var onSlideStop = function() {
        RB.ABZReader.sliderIsChanging = false;
        RB.ABZReader.seekTrack(parseInt(RB.UI.getSliderValue(RB.ABZReader.UI.sliderID)), true);
    };
    var onSlideChanging = function() {
        var value = parseInt(RB.UI.getSliderValue(RB.ABZReader.UI.sliderID));
        RB.ABZReader.setTimerText(value);
    };
    
    // create slider
    // NOTE: the correct max value will be set later, after loading the audio file
    RB.UI.createSlider(RB.ABZReader.UI.sliderID, RB.ABZReader.UI.divFooterSliderContainerInner, 0, 100, onSlideStart, onSlideStop, onSlideChanging);
    
    // populate track list
    RB.ABZReader.populateTrackList();
    
    // open at saved position
    var saved  = RB.App.readItemData(RB.ABZReader.itemID, ['position', RB.Plugins.Format.formatNames.ABZ]);
    var index  = 0;
    var seekTo = 0;
    if (saved) {
        index  = RB.App.ensureValueInRange(saved['track'],  0, RB.ABZReader.tracks.length - 1, 0);
        seekTo = RB.App.ensureValueInRange(saved['seekTo'], 0, null, 0);
    }

    // hide spinner
    RB.UI.showSpinner(false);

    // set audioPlayer object up
    var options                          = {};
    options['mode']                      = RB.Storage.get(RB.Storage.Keys.MEDIAPLAYER_MODE);
    options['enablePlaybackSpeed']       = RB.Storage.isAppParameterTrue(RB.Storage.Keys.MEDIAPLAYER_ENABLE_PLAYBACK_SPEED);
    options['wrapAround']                = RB.ABZReader.wrapAround;
    options['autoStart']                 = RB.ABZReader.autoStartAudio;
    options['showSpinner']               = true;
    options['trackPreparedCallback']     = RB.ABZReader.onTrackPrepared;
    options['trackStartingCallback']     = RB.ABZReader.onTrackStarting;
    options['playlistCompletedCallback'] = RB.ABZReader.onPlaylistCompleted;
    options['trackPlayPauseCallback']    = RB.ABZReader.onTrackPlayPause;
    options['trackTimerCallback']        = RB.ABZReader.onTrackTimer;
    options['preload']                   = RB.ABZReader.preloadPrevNext;
    RB.ABZReader.audioPlayer             = new RB.App.audioPlayer(RB.ABZReader.assetManager, RB.ABZReader.tracks, options);
    RB.ABZReader.updateVolume();
    RB.ABZReader.updatePlaybackSpeed();
    RB.ABZReader.playTrack(index, seekTo, true);
};

RB.ABZReader.setTrackDurationInPlaylist = function(index, duration) {
    RB.UI.setText('numberTrack' + index, RB.Utilities.prettifyClockValue(duration, true), true);
    if (!RB.ABZReader.tracks[index].duration) {
        RB.ABZReader.tracks[index].duration = duration;
    }
};

RB.ABZReader.populateTrackList = function() {
   
    var duration = RB.ABZReader.item.formats[RB.Plugins.Format.formatNames.ABZ].metadata.duration;
    if (duration) {
        duration = RB.Utilities.clockValueToSeconds(duration);
    } else {
        duration = 0;
        for (var i = 0; i < RB.ABZReader.tracks.length; i++) {
            var t = RB.ABZReader.tracks[i];
            if (t['duration']) {
                duration += parseInt(t['duration']);
            }
        }
    }
    var totalDuration = RB.Utilities.prettifyClockValue(duration, true);
    
    if (RB.ABZReader.showTrackNumber) {
        var numberOfDigits = (RB.ABZReader.tracks.length + '').length;
        var trackMask = '%0' + numberOfDigits + 'd';
        var padding = '';
        for (var i = 0; i < numberOfDigits + 2; i++) {
            padding += '&#160;';
        }
    }
   
    RB.ABZReader.setTitle(RB.ABZReader.item['title']);
    
        /*
        // total
        var p = '';
        p += '<li data-icon="false" id="total">';
        p += '<a onclick="RB.ABZReader.playPause();">';
        p += '<h4>';
        if (RB.ABZReader.showTrackNumber) {
            p += '<span class="playlistNumber">' + padding + '</span>';
        }
        p += '<strong>';
        p += RB.ABZReader.item["title"];
        p += '</strong>';
        p += '</h4>';
        p += '<span class="ui-li-count">' + totalDuration + '</span>';
        p += '</a>';
        p += '</li>';
        RB.UI.append(RB.ABZReader.UI.lstTracks, p);
        */

    for (var i = 0; i < RB.ABZReader.tracks.length; i++) {
        var t = RB.ABZReader.tracks[i];
        var duration = t['duration'];
        if (duration) {
            duration = RB.Utilities.prettifyClockValue(t['duration'], true);
        } else {
            duration = '';
        }
        var p = '';
        p += '<li data-icon="false" id="track' + i + '">';
        p += '<a onclick="RB.ABZReader.clickOnTrack(' + i + ');">';
        p += '<h4>';
        if (RB.ABZReader.showTrackNumber) {
            p += '<span class="playlistNumber">' + sprintf(trackMask, i+1) + '. </span>';
        }
        p += '<strong>';
        p += t['title'];
        p += '</strong>';
        p += '</h4>';
        p += '<span class="ui-li-count" id="numberTrack' + i + '">' + duration + '</span>';
        p += '</a>';
        p += '</li>';
        RB.UI.append(RB.ABZReader.UI.lstTracks, p);
    }
    
    RB.UI.refreshListview(RB.ABZReader.UI.lstTracks);

};

// user selected a track in the track list
RB.ABZReader.clickOnTrack = function(index) {
    RB.ABZReader.preventTrackListScroll = true;
    RB.ABZReader.playTrack(index, 0, true);
};

// play/pause
RB.ABZReader.playPause = function() {
    if (RB.ABZReader.audioPlayer) {
        RB.ABZReader.audioPlayer.playPause();
    }
};

// set playback speed
RB.ABZReader.setPlaybackSpeed = function(value) {
    RB.ABZReader.playbackSpeed = value;
    RB.ABZReader.audioPlayer.setPlaybackSpeed(value);
};

// set volume
RB.ABZReader.setVolume = function(value) {
    RB.ABZReader.volume = value;
    RB.ABZReader.audioPlayer.setVolume(RB.ABZReader.volume);
};

// play the given track
RB.ABZReader.playTrack = function(index, pos, absolute) {
    if (RB.ABZReader.audioPlayer) {
        if (absolute) {
            RB.ABZReader.audioPlayer.playTrack(index, pos);
        } else {
            RB.ABZReader.audioPlayer.playTrackRelative(index);
        }
    }
};

// seek the current track to the given position
RB.ABZReader.seekTrack = function(position, absolute) {
    if (RB.ABZReader.audioPlayer) {
        if (absolute) {
            RB.ABZReader.audioPlayer.seekTrack(position);
        } else {
            RB.ABZReader.audioPlayer.seekTrackRelative(position);
        }
    }
};

// callback to set the player timer
RB.ABZReader.onTrackTimer = function(value) {
    // set slider
    if (! RB.ABZReader.sliderIsChanging) {
        RB.UI.setSliderValue(RB.ABZReader.UI.sliderID, value);
    }
    // set timer
    RB.ABZReader.setTimerText(value);
};
RB.ABZReader.setTimerText = function(value) {
    if ((RB.ABZReader.invertedTimer) && (RB.ABZReader.currentTrackDuration != null)) {
        value = '-' + RB.Utilities.prettifyClockValue(RB.ABZReader.currentTrackDuration - value, true);
    } else {
        value = RB.Utilities.prettifyClockValue(value, true);
    }
    RB.UI.setText(RB.ABZReader.UI.txtSliderAudioPosition, value, true);
};

// called when the audioPlayer is put on play/pause state
RB.ABZReader.onTrackPlayPause = function(state) {
    if (state === 'playing') {
        RB.UI.setText(RB.ABZReader.UI.btnPlay, RB.UI.i18n('btnABZAudioPlayPauseTextPause'));
    } else {
        RB.UI.setText(RB.ABZReader.UI.btnPlay, RB.UI.i18n('btnABZAudioPlayPauseTextPlay'));
    }
    RB.UI.setBooleanPlayIcon(RB.ABZReader.UI.btnPlay, (state === 'playing'));
};

// called before loading track (duration is not available yet)
RB.ABZReader.onTrackStarting = function(index) {
    for (var i = 0; i < RB.ABZReader.tracks.length; i++) {
        RB.ABZReader.hightlightTrack(i, true);
    }
    RB.ABZReader.hightlightTrack(index);
    RB.ABZReader.setTitle('[' + (index+1) + '/' + RB.ABZReader.tracks.length + '] ' + RB.ABZReader.item['title']);
};

// called when the track has been prepared (duration is now available)
// => reset slider max to duration (= the current track duration, in seconds)
RB.ABZReader.onTrackPrepared = function(index, duration) {
    RB.ABZReader.currentTrackDuration = duration;
    RB.ABZReader.setTrackDurationInPlaylist(index, duration);
    RB.UI.setAttr(RB.ABZReader.UI.sliderID, 'max', duration);
};

// called when the playlist has been completed (and wrapAround is false)
RB.ABZReader.onPlaylistCompleted = function() {
    RB.ABZReader.audioPlayer.stop();
    RB.ABZReader.onTrackTimer(0, 0);
    for (var i = 0; i < RB.ABZReader.tracks.length; i++) {
        RB.ABZReader.hightlightTrack(i, true);
    }
    RB.ABZReader.onTrackPlayPause('completed');
    RB.ABZReader.setTitle(RB.ABZReader.item['title']);
};

// highlight the current track
RB.ABZReader.hightlightTrack = function(index, remove) {
    var id = 'track' + index;
    if (remove) {
        RB.UI.removeClass(id, 'playlistCurrent');
    } else {
        RB.UI.addClass(id, 'playlistCurrent');
        RB.ABZReader.scrollTrackList();
    }
};

// open preferences popup
RB.ABZReader.openPreferences = function() {
    if (RB.UI.dialogOpen) {
        RB.UI.closeDialog();
    } else {
        RB.UI.openSidePopup(RB.ABZReader.UI.popupPreferences, RB.ABZReader.UI.divHeader, RB.ABZReader.UI.divFooterAll, 0.25);
    }
};

// set title
RB.ABZReader.setTitle = function(s) {
    RB.UI.setText(RB.ABZReader.UI.txtTitle, s, true);
};



