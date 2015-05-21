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

/** @namespace RB.CBZSettings */
RB.CBZSettings = RB.CBZSettings || {};

/* constants */
RB.CBZSettings.UI                                = {};
RB.CBZSettings.UI.colCBZSettingsAppearance       = 'colCBZSettingsAppearance';
RB.CBZSettings.UI.colCBZSettingsInteractions     = 'colCBZSettingsInteractions';
RB.CBZSettings.UI.colCBZSettingsTouchZones       = 'colCBZSettingsTouchZones';
RB.CBZSettings.UI.colCBZSettingsImageInformation = 'colCBZSettingsImageInformation';
RB.CBZSettings.UI.colCBZSettingsAdvanced         = 'colCBZSettingsAdvanced';
RB.CBZSettings.UI.colCBZSettingsHelp             = 'colCBZSettingsHelp';

/* variables */
RB.CBZSettings.createdManagers                   = false;
RB.CBZSettings.drs                               = null;

/* functions */


// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.CBZSettings.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();
    
    // open first collapsible
    RB.UI.expand(RB.CBZSettings.UI.colCBZSettingsAppearance);
    
    // create manager objects
    RB.CBZSettings.createManagers();
    RB.CBZSettings.drs.update();
};

// initialize page
RB.CBZSettings.initializePage = function() {
    // bind events
    RB.CBZSettings.bindEvents();

    // dim system bar
    RB.UI.dimSystemBar();
};

// bind events
RB.CBZSettings.bindEvents = function() {
    // scroll when collapsible is expanded
    RB.UI.bindScrollOnCollapsibleExpanded(RB.CBZSettings.UI);
};

// create manager objects
RB.CBZSettings.createManagers = function() {
    // if already created, abort
    if (RB.CBZSettings.createdManagers) {
        return;
    }

    // preference manager object
    RB.CBZSettings.drs = new RB.App.drsManager(null, null, true, RB.CBZSettings.onDRSUpdate);
    
    var booleans = [
        ['CBZ_EXTRACT_COVER',               'chkCBZToggleExtractCover'],
        ['CBZ_WRAP_AROUND',                 'chkCBZToggleWrapAround'],
        ['CBZ_AUTOHIDE_MENU',               'chkCBZToggleAutohideMenu' ],
        ['CBZ_RESET_SCALE_ON_IMAGE_CHANGE', 'chkCBZToggleResetScaleOnImageChange'],
        ['CBZ_LOCK_SCROLL_ON_FIT_OTHER',    'chkCBZToggleLockScrollOnFitOther'],
        ['CBZ_SNAP_TO_BORDER',              'chkCBZToggleSnapToBorder'],
        ['CBZ_SHOW_INFO',                   'chkCBZToggleShowInfo'],
        ['CBZ_PERSISTENT_INFO',             'chkCBZTogglePersistentInfo'],
        ['CBZ_INVERT_SWIPE',                'chkCBZToggleInvertSwipe'],
        ['CBZ_COMICS_MODE',                 'chkCBZToggleComicsMode'],
        ['CBZ_PRELOAD_PREV_NEXT',           'chkCBZTogglePreloadPrevNext'],
        ['CBZ_UNZIP_ALL',                   'chkCBZToggleUnzipAll'],
    ];
    for (var i = 0; i < booleans.length; i++) {
        RB.CBZSettings.drs.registerSetting(booleans[i][0], 'boolean', null, [
            { 'id': booleans[i][1] }
        ]);
    }

    var cycles = [
        ['CBZ_DEFAULT_ZOOM_MODE',      RB.Config.CBZReader.availableZoomModes,            'btnCBZSettingsChangeDefaultZoomMode', 'optbtnCBZZoomMode'],
        ['CBZ_AUTOHIDE_MENU_DURATION', RB.Config.CBZReader.availableMenuDurationValues,   'btnCBZSettingsChangeMenuDuration',     null],
        ['CBZ_BORDER',                 RB.Config.CBZReader.availableBorderValues,         'btnCBZSettingsChangeBorder',           null],
        ['CBZ_SLIDESHOW_TIMER',        RB.Config.CBZReader.availableSlideshowTimerValues, 'btnCBZSettingsChangeSlideshowTimer',   null],
    ];
    for (var i = 0; i < cycles.length; i++) {
        RB.CBZSettings.drs.registerSetting(cycles[i][0], 'cycle', cycles[i][1], [
            { 'id':           cycles[i][2],
              'notification': false,
              'circular':     true,
              'increase':     true,
              'compact':      true,
              'labels':       cycles[i][3] }
        ]);
    }
    
    var palettes = [
        ['CBZ_BACKGROUND_COLOR', 'btnCBZSettingsChangeBackgroundColor'],
        ['CBZ_INFO_COLOR',       'btnCBZSettingsChangeInfoColor'],
    ];
    for (var i = 0; i < palettes.length; i++) {
        RB.CBZSettings.drs.registerSetting(palettes[i][0], 'palette', null, [
            { 'id':      palettes[i][1],
              'compact': true }
        ]);
    }
    
    for (var i = 0; i < 9; i++) {
        (function(index) {
            RB.CBZSettings.drs.registerSetting('CBZ_ACTION_ZONE_' + i, 'cycle', RB.Config.CBZReader.availableZoneActions, [
                { 'id':           ('btnCBZZone'+ i),
                  'notification': false,
                  'circular':     true,
                  'increase':     true,
                  'compact':      true,
                  'onlyvalue':    true,
                  'setinnertext': true,
                  'labels':       'btnCBZZoneLabels',
                  'callback':     function(){RB.UI.showClick('btnCBZZone' + index);} },
            ]);
        }(i));
    }
    
    RB.CBZSettings.createdManagers = true;
};


