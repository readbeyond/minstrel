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

/** @namespace RB.Settings */
RB.Settings = RB.Settings || {};

/* constants */
// UI
RB.Settings.UI                                   = {};
RB.Settings.UI.lstFormats                        = 'lstFormats';
RB.Settings.UI.divSettingsChangeStorageDirectory = 'divSettingsChangeStorageDirectory';
RB.Settings.UI.divSettingsChangeMediaPlayerMode  = 'divSettingsChangeMediaPlayerMode';
RB.Settings.UI.divSettingsChangeUIBrightness     = 'divSettingsChangeUIBrightness';
RB.Settings.UI.colSettingsScreen                 = 'colSettingsScreen';
RB.Settings.UI.colSettingsLibrary                = 'colSettingsLibrary';
RB.Settings.UI.colSettingsAudio                  = 'colSettingsAudio';
RB.Settings.UI.colSettingsAdvanced               = 'colSettingsAdvanced';

/* variables */
RB.Settings.pluginsLoadedWhenOpen                = null;
RB.Settings.createdManagers                      = false;
RB.Settings.drs                                  = null;

/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.Settings.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();

    // hide if not Android
    var isAndroid = RB.App.isAndroid();
    RB.UI.showHide(RB.Settings.UI.divSettingsChangeStorageDirectory, isAndroid);
    RB.UI.showHide(RB.Settings.UI.divSettingsChangeMediaPlayerMode,  isAndroid);
  
    // hide brightness if not enabled
    RB.UI.showHide(RB.Settings.UI.divSettingsChangeUIBrightness, RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_ENABLE_BRIGHTNESS));

    // populate format list
    // NOTE: PLUGINS_LOADED is actually a dictionary, but here we get it as a string for comparing on exit
    RB.Settings.pluginsLoadedWhenOpen = RB.Storage.get(RB.Storage.Keys.PLUGINS_LOADED);
    RB.Settings.populateFormatList();
    
    // create manager objects
    RB.Settings.createManagers();
    RB.Settings.drs.update();
};

// initialize page
RB.Settings.initializePage = function() {
    // bind events
    RB.Settings.bindEvents();
    
    // dim system bar
    RB.UI.dimSystemBar();
};

// bind events
RB.Settings.bindEvents = function() {
    // scroll when collapsible is expanded
    RB.UI.bindScrollOnCollapsibleExpanded(RB.Settings.UI);
};

// handle back button
RB.Settings.onBackButton = function() {
    // if the list of plugins loaded is
    if (RB.Storage.get(RB.Storage.Keys.PLUGINS_LOADED) !== RB.Settings.pluginsLoadedWhenOpen) {
        RB.Storage.set(RB.Storage.Keys.PLUGINS_LOADED_CHANGED, true);
    }
    
    // go back
    RB.UI.onBackButton();
};

// populate format list
RB.Settings.populateFormatList = function() {
    var lv_id = RB.Settings.UI.lstFormats;
    RB.UI.empty(lv_id);
    
    // DEBUG
    //RB.Storage.setArray(RB.Storage.Keys.PLUGINS_LOADED, []);
    //RB.Storage.setDictionary(RB.Storage.Keys.PLUGINS_LOADED, {'epub': true});
    //RB.Storage.setArray(RB.Storage.Keys.PLUGINS_LOADED, ['abz', 'epub']);

    var available_formats = RB.Plugins.Format.availablePlugins;
    var loaded_formats = RB.Storage.getDictionary(RB.Storage.Keys.PLUGINS_LOADED);
    if (available_formats.length > 0) {
        for (var i = 0; i < available_formats.length; i++) {
            var f = available_formats[i];
            var icon = 'check-empty';
            if (f in loaded_formats) {
                icon = 'check';
            }
            var listItem = '<li id="format-' + f + '">';
            listItem    += '<a onclick="RB.Settings.openFormatSettings(\'' + f + '\');">';
            listItem    += '<img src="' + RB.Plugins[f].settingsIcon + '" class="smaller-icon"/>';
            listItem    += '<h4><strong>' + RB.UI.i18n('txtSettingsFormatSettingsLabel') + ' ' + RB.Plugins[f].settingsLabel + '</strong></h4>';
            listItem    += '<p>(' + RB.Utilities.joinStrings(RB.Plugins[f].settingsFileExtensions, ', ', '') + ')</p>';
            listItem    += '</a>';
            listItem    += '<a data-icon="' + icon + '" onclick="RB.Settings.toggleFormat(\'' + f + '\');"></a>';
            listItem    += '</li>';
            
            RB.UI.append(lv_id, listItem);
        }
        RB.UI.refreshListview(lv_id);
    }
};
RB.Settings.openFormatSettings = function(format) {
    var page = RB.Plugins[format].settingsFilePath;
    if (page) {
        RB.App.openPage(page);
    }
};
RB.Settings.toggleFormat = function(format) {
    var loaded_formats = RB.Storage.getDictionary(RB.Storage.Keys.PLUGINS_LOADED);
    if (format in loaded_formats) {
        delete loaded_formats[format]
    } else {
        loaded_formats[format] = true;
    }
    RB.Storage.setDictionary(RB.Storage.Keys.PLUGINS_LOADED, loaded_formats);
    RB.Settings.populateFormatList();
};

// create manager objects
RB.Settings.createManagers = function() {
    // if already created, abort
    if (RB.Settings.createdManagers) {
        return;
    }

    // preference manager object
    RB.Settings.drs = new RB.App.drsManager(null, null, true);
    
    var booleans = [
        ['LIBRARY_SHOW_HIDDEN_BOOKS',         'chkToggleShowHiddenBooks',                   null],
        ['LIBRARY_HIDE_BOOKS_ON_SORT',        'chkToggleHideBooksOnSort',                   null],
        ['LIBRARY_OPEN_NEW_BOOK',             'chkToggleOpenNewBook',                       null],
        ['LIBRARY_CACHE_METADATA',            'chkToggleCacheMetadata',                     null],
        ['MEDIAPLAYER_ENABLE_PLAYBACK_SPEED', 'chkToggleEnablePlaybackSpeed',               null],
        ['UI_NIGHT_MODE',                     'btnToggleUINightMode',                       RB.UI.applyNightMode],
        ['UI_ENABLE_BRIGHTNESS',              'btnSettingsChangeEnableBrightness',          RB.Settings.applyBrightness],
        ['UI_ANIMATED_MENU',                  'btnToggleUIAnimatedMenu',                    null],
        ['OPEN_URLS_IN_SYSTEM_BROWSER',       'btnSettingsChangeOpenURLsInSystemBrowser',   null]
    ];
    for (var i = 0; i < booleans.length; i++) {
        RB.Settings.drs.registerSetting(booleans[i][0], 'boolean', null, [
            { 'id': booleans[i][1], 'callback': booleans[i][2] }
        ]);
    }
    
    var cycles = [
        ['UI_LANGUAGE',      RB.Config.UI.availableLanguages,        'btnSettingsChangeLanguage',        false, RB.Settings.applyLanguage],
        ['UI_FONT',          RB.Config.UI.availableFonts,            'btnSettingsChangeUIFont',          true,  RB.UI.applyUIFont],
        ['UI_BRIGHTNESS',    RB.Config.UI.availableBrightnessValues, 'btnSettingsChangeUIBrightness',    true,  RB.Settings.applyBrightness],
        ['UI_ORIENTATION',   RB.Config.UI.availableOrientations,     'btnSettingsChangeOrientation',     true,  RB.UI.applyOrientation],
        ['MEDIAPLAYER_MODE', RB.Config.availableMediaPlayerModes,    'btnSettingsChangeMediaPlayerMode', true,  null],
    ];
    for (var i = 0; i < cycles.length; i++) {
        RB.Settings.drs.registerSetting(cycles[i][0], 'cycle', cycles[i][1], [
            { 'id': cycles[i][2], 'notification': false, 'circular': true, 'increase': true, 'compact': cycles[i][3], 'callback': cycles[i][4] }
        ]);
    }

    // register simple buttons
    RB.UI.bindSimpleButtonEvents('btnDeleteRecentInfos',              { 'click': RB.Settings.deleteRecentInfos      }, false);
    RB.UI.bindSimpleButtonEvents('btnDeleteReadingPositions',         { 'click': RB.Settings.deleteReadingPositions }, false);
    RB.UI.bindSimpleButtonEvents('btnDeleteLibraryItems',             { 'click': RB.Settings.deleteLibraryItems     }, false);
    RB.UI.bindSimpleButtonEvents('btnReinitialize',                   { 'click': RB.Settings.reinitializeSettings   }, false);
    RB.UI.bindSimpleButtonEvents('btnSettingsChangeStorageDirectory', { 'click': RB.Settings.changeStorageDirectory }, false);

    // reset flag
    RB.Settings.createdManagers = true;
};

// apply language and reload UI
RB.Settings.applyLanguage = function() {
    RB.UI.language = RB.Storage.get(RB.Storage.Keys.UI_LANGUAGE);
    RB.Settings.initializeUI();
};

// apply brightness
RB.Settings.applyBrightness = function() {
    if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_ENABLE_BRIGHTNESS)) {
        RB.UI.show(RB.Settings.UI.divSettingsChangeUIBrightness);
        var value = RB.Storage.get(RB.Storage.Keys.UI_BRIGHTNESS);
        RB.UI.setBrightness(value);
    } else {
        RB.UI.hide(RB.Settings.UI.divSettingsChangeUIBrightness);
        RB.UI.setBrightness(-1.0);
    }
};

// change storage directory
RB.Settings.changeStorageDirectory = function() {
    RB.App.openPage(RB.App.PagesEnum.FILECHOOSER);
};

// delete recent info for all items
RB.Settings.deleteRecentInfos = function() {
    RB.UI.showNotification(RB.UI.i18n('txtDeleteRecentInfosDone'));
    RB.Settings.resetItemsData('resetRecentInfo');
    RB.UI.collapse(RB.Settings.UI.colSettingsAdvanced);
};

// delete reading position for all items
RB.Settings.deleteReadingPositions = function() {
    RB.UI.showNotification(RB.UI.i18n('txtDeleteReadingPositionsDone'));
    RB.Settings.resetItemsData('resetReadingPosition');
    RB.UI.collapse(RB.Settings.UI.colSettingsAdvanced);
};

// delete library items
RB.Settings.deleteLibraryItems = function() {
    RB.UI.showNotification(RB.UI.i18n('txtDeleteLibraryItemsDone'));
    var items = RB.Storage.getDictionary(RB.Storage.Keys.LIBRARY_BOOKS);
    var ids = Object.keys(items);
    for (var i = 0; i < ids.length; i++) {
        RB.App.deleteItemData(ids[i]);
    }
    RB.Storage.setDictionary(RB.Storage.Keys.LIBRARY_BOOKS, {});
    RB.UI.collapse(RB.Settings.UI.colSettingsAdvanced);
};

// reinitialize all settings
RB.Settings.reinitializeSettings = function() {
    RB.UI.showNotification(RB.UI.i18n('txtReinitializeDone'));
    RB.App.resetAppSettings();
    RB.App.openPage(RB.App.PagesEnum.SETTINGS);
    RB.UI.collapse(RB.Settings.UI.colSettingsAdvanced);
};

// delete from extra
RB.Settings.resetItemsData = function(mode) {
    // delete from item data
    var books = RB.Storage.getDictionary(RB.Storage.Keys.LIBRARY_BOOKS);
    var arr = Object.keys(books);
    for (var j = 0; j < arr.length; ++j) {
        var itemID   = arr[j];
        if (mode === 'resetRecentInfo') {
            RB.App.saveItemData(itemID, ['library', 'lastTimeOpened'], null);
        }
        if (mode === 'resetReadingPosition') {
            RB.App.saveItemData(itemID, ['library', 'isNew'], true);
            RB.App.deleteItemData(itemID, ['position']);
        }
        if (mode === 'resetMetadata') {
            RB.App.deleteItemData(itemID, ['metadata']);
            RB.App.deleteItemData(itemID, ['structure']);
        }
    }
};


