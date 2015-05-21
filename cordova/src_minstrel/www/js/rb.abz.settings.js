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

/** @namespace RB.ABZSettings */
RB.ABZSettings = RB.ABZSettings || {};

/* constants */
// UI
RB.ABZSettings.UI                    = {};
RB.ABZSettings.UI.colABZSettingsHelp = 'colABZSettingsHelp';

/* variables */
RB.ABZSettings.createdManagers       = false;
RB.ABZSettings.drs                   = null;

/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.ABZSettings.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();
    
    // create manager objects
    RB.ABZSettings.createManagers();
    RB.ABZSettings.drs.update();
};

// initialize page
RB.ABZSettings.initializePage = function() {
    // bind events
    RB.ABZSettings.bindEvents();

    // dim system bar
    RB.UI.dimSystemBar();
};

// bind events
RB.ABZSettings.bindEvents = function() {
    // scroll when collapsible is expanded
    RB.UI.bindScrollOnCollapsibleExpanded(RB.ABZSettings.UI);
};

// create manager objects
RB.ABZSettings.createManagers = function() {
    // if already created, abort
    if (RB.ABZSettings.createdManagers) {
        return;
    }

    // preference manager object
    RB.ABZSettings.drs = new RB.App.drsManager(null, null, true);
    var booleans = [
        ['ABZ_WRAP_AROUND',        'chkABZToggleWrapAround'],
        ['ABZ_BACKGROUND_AUDIO',   'chkABZToggleBackgroundAudio'],
        ['ABZ_AUTO_START_AUDIO',   'chkABZToggleAutoStartAudio'],
        ['ABZ_USE_PLAYLIST',       'chkABZToggleUsePlaylist'],
        //['ABZ_SHOW_LARGE_COVER', 'chkABZToggleShowLargeCover'],
        ['ABZ_SHOW_TRACK_NUMBER',  'chkABZToggleShowTrackNumber'],
        ['ABZ_PRELOAD_PREV_NEXT',  'chkABZTogglePreloadPrevNext'],
        ['ABZ_UNZIP_ALL',          'chkABZToggleUnzipAll'],
    ];
    for (var i = 0; i < booleans.length; i++) {
        RB.ABZSettings.drs.registerSetting(booleans[i][0], 'boolean', null, [
            { 'id': booleans[i][1] }
        ]);
    }
    
    // reset flag
    RB.ABZSettings.createdManagers = true;
};

