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

/** @namespace RB.EPUBSettings */
RB.EPUBSettings = RB.EPUBSettings || {};

/* constants */
// UI
RB.EPUBSettings.UI                                           = {};

// Pages
RB.EPUBSettings.UI.Pages                                     = {};
RB.EPUBSettings.UI.Pages.settings                            = 'settings';
RB.EPUBSettings.UI.Pages.drs                                 = 'drs';

// DRS
RB.EPUBSettings.UI.DRS                                       = {};
RB.EPUBSettings.UI.DRS.txtDRSHeader                          = 'txtDRSHeader';
RB.EPUBSettings.UI.DRS.divLoremContainer                     = 'loremcontainer';
RB.EPUBSettings.UI.DRS.divLorem                              = 'loremipsum';
RB.EPUBSettings.UI.DRS.spanLoremHighlighted                  = 'loremhighlighted';
RB.EPUBSettings.UI.DRS.colDRSAdvanced                        = 'colDRSAdvanced';
RB.EPUBSettings.UI.DRS.btnDRSReinitialize                    = 'btnDRSReinitialize';
RB.EPUBSettings.UI.DRS.txtDRSReinitializeDone                = 'txtDRSReinitializeDone';
RB.EPUBSettings.UI.DRS.colDRSAdvanced                        = 'colDRSAdvanced';

// Settings
RB.EPUBSettings.UI.Settings                                  = {};
RB.EPUBSettings.UI.Settings.txtEPUBSettingsHeader            = 'txtEPUBSettingsHeader';
RB.EPUBSettings.UI.Settings.txtToggleAllowFXLWarning         = 'txtToggleAllowFXLWarning';
RB.EPUBSettings.UI.Settings.txtToggleStripCSSWarning         = 'txtToggleStripCSSWarning';
RB.EPUBSettings.UI.Settings.txtToggleInjectCustomCSSWarning  = 'txtToggleInjectCustomCSSWarning';
RB.EPUBSettings.UI.Settings.txtToggleRunJavascriptWarning    = 'txtToggleRunJavascriptWarning';

RB.EPUBSettings.UI.Settings.colSettingsReader                = 'colSettingsReader';
RB.EPUBSettings.UI.Settings.colSettingsInteractions          = 'colSettingsInteractions';
RB.EPUBSettings.UI.Settings.colSettingsTouchZones            = 'colSettingsTouchZones';
RB.EPUBSettings.UI.Settings.colSettingsAudio                 = 'colSettingsAudio';
RB.EPUBSettings.UI.Settings.colSettingsFootnotes             = 'colSettingsFootnotes';
RB.EPUBSettings.UI.Settings.colSettingsAdvanced              = 'colSettingsAdvanced';



/* variables */
RB.EPUBSettings.createdManagers                              = false;
RB.EPUBSettings.drs                                          = null;

/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.EPUBSettings.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();

    // open first collapsible
    RB.UI.expand(RB.EPUBSettings.UI.Settings.colSettingsReader);
    
    // create manager objects
    RB.EPUBSettings.createManagers();
    RB.EPUBSettings.drs.update();
};

// initialize page
RB.EPUBSettings.initializePage = function() {
    // bind events
    RB.EPUBSettings.bindEvents();

    // dim system bar
    RB.UI.dimSystemBar();
};

// bind events
RB.EPUBSettings.bindEvents = function() {
    // bind load localization and settings update
    RB.UI.getElement(RB.EPUBSettings.UI.Pages.drs).on('pagebeforeshow', function() {
        RB.UI.loadLocalization();
        RB.EPUBSettings.drs.update();
    });
    
    // scroll when collapsible is expanded
    RB.UI.bindScrollOnCollapsibleExpanded(RB.EPUBSettings.UI.Settings);
    RB.UI.bindScrollOnCollapsibleExpanded(RB.EPUBSettings.UI.DRS);
};

// create manager objects
RB.EPUBSettings.createManagers = function() {
    // if already created, abort
    if (RB.EPUBSettings.createdManagers) {
        return;
    }

    // preference manager object
    RB.EPUBSettings.drs = new RB.App.drsManager(null, null, true, RB.EPUBSettings.onDRSUpdate);
    
    var booleans = [
        ['EPUB_SHOW_HEADER',                        'chkToggleHeader',                          null],
        ['EPUB_SHOW_SLIDER',                        'chkToggleSlider',                          null],
        ['EPUB_SHOW_NAVBAR',                        'chkToggleBottomBar',                       null],
        ['EPUB_SHOW_QUICKBAR',                      'chkToggleQuickBar',                        null],
        ['EPUB_SHOW_FIRST_TIME_POPUP',              'chkToggleFTP',                             null],
        ['EPUB_OPEN_FIRST_CHAPTER_WITH_AUDIO',      'chkToggleOverrideInitialPage',             null],
        ['EPUB_CONFIRM_QUIT',                       'chkToggleConfirmQuit',                     null],
        ['EPUB_CLOSE_TOC_IMMEDIATELY',              'chkToggleCloseTOCImmediately',             null],
        ['EPUB_CLOSE_PLAYLIST_IMMEDIATELY',         'chkToggleClosePlaylistImmediately',        null],
        ['EPUB_INVERT_SWIPE',                       'chkToggleInvertSwipe',                     null],
        ['EPUB_SCROLL_TO_TOP_ON_PREVIOUS_CHAPTER',  'chkToggleScrollToTopOnPreviousChapter',    null],
        ['EPUB_WAIT_BEFORE_TURNING_CHAPTER',        'chkToggleWaitBeforeTurningChapter',        null],
        ['EPUB_BACKGROUND_AUDIO',                   'chkToggleBackAudio',                       null],
        ['EPUB_SMART_PLAY',                         'chkToggleSmartPlay',                       null],
        ['EPUB_ANIMATED_SCROLL',                    'chkToggleAnimatedScroll',                  null],
        ['EPUB_PRELOAD_PREV_NEXT',                  'chkTogglePreloadPrevNext',                 null],
        ['EPUB_SHOW_WARNING_ON_NOT_AUDIOEBOOK',     'chkToggleShowNoticePopup',                 null],
        ['EPUB_ENABLE_FOOTNOTE_LINKS',              'chkToggleFootnoteLinks',                   null],
        ['EPUB_ENABLE_TRANSLATION_LINKS',           'chkToggleTranslationLinks',                null],
        ['EPUB_PAUSE_ON_EXTRA',                     'chkTogglePauseOnExtra',                    null],
        ['EPUB_ADD_LINK_EXTRA',                     'chkToggleAddLinkExtra',                    null],
        ['EPUB_NOTE_LINK_DETECTION',                'chkToggleNoteLinkDetection',               null],
        ['EPUB_HIGHLIGHT_NOTE_LINK_TARGET',         'chkToggleHighlightNoteLinkTarget',         null],
        ['EPUB_SKIP_NON_LINEAR',                    'chkToggleSkipNonLinear',                   null],
        ['EPUB_TREAT_NON_LINEAR_AS_CUL_DE_SAC',     'chkToggleTreatNonLinearAsCulDeSac',        null],
        ['EPUB_ENABLE_READBEYOND_HACKS',            'chkToggleEnableReadBeyondHacks',           null],
        ['EPUB_ALLOW_FXL',                          'chkToggleAllowFXL',                        function(){ RB.EPUBSettings.showWarningExperimentalFeature('EPUB_ALLOW_FXL'); }],
        ['EPUB_STRIP_CSS',                          'chkToggleStripCSS',                        function(){ RB.EPUBSettings.showWarningExperimentalFeature('EPUB_STRIP_CSS'); }],
        ['EPUB_INJECT_CUSTOM_CSS',                  'chkToggleInjectCustomCSS',                 function(){ RB.EPUBSettings.showWarningExperimentalFeature('EPUB_INJECT_CUSTOM_CSS'); }],
        ['EPUB_RUN_JAVASCRIPT',                     'chkToggleRunJavascript',                   function(){ RB.EPUBSettings.showWarningExperimentalFeature('EPUB_RUN_JAVASCRIPT'); }],
        
        ['EPUB_APPLY_TYPO',                         'optPreferencesDialogApplyTypo',            null],
        ['EPUB_PAGINATE_REFLOWABLE',                'optPreferencesDialogPaginateReflowable',   null],
        ['EPUB_APPLY_HIGHLIGHT',                    'optPreferencesDialogHighlight',            null],
        ['EPUB_AUTO_SCROLL',                        'optPreferencesDialogScroll',               null],
        ['EPUB_TAP_TO_PLAY',                        'optPreferencesDialogTapToPlay',            null],
        ['EPUB_ACTION_ZONES_ENABLED',               'chkToggleEPUBZonesEnabled',                null],
    ];
    for (var i = 0; i < booleans.length; i++) {
        RB.EPUBSettings.drs.registerSetting(booleans[i][0], 'boolean', null, [
            { 'id': booleans[i][1], 'callback': booleans[i][2] }
        ]);
    }

    var cycles = [
        ['EPUB_SWIPE_GESTURE',              RB.Config.EPUBReader.availableSwipeGestures,            'btnSettingsChangeSwipe',               true, null],
        //['EPUB_BORDER_GESTURE',             RB.Config.EPUBReader.availableBorderGestures,           'btnSettingsChangeBorder',              true, null],
        ['EPUB_DOUBLE_TAP_GESTURE',         RB.Config.EPUBReader.availableDoubleTapGestures,        'btnSettingsChangeDoubleTap',           true, null],
        ['EPUB_TWO_FINGERS_TAP_GESTURE',    RB.Config.EPUBReader.availableTwoFingersTapGestures,    'btnSettingsChangeTwoFingersTap',       true, null],
        ['EPUB_FONT_FAMILY',                RB.Config.EPUBReader.availableFontFamilies,             'optPreferencesDialogFont',             true, null],
        ['EPUB_FONT_SIZE',                  RB.Config.EPUBReader.availableFontSizes,                'optPreferencesDialogFontSize',         true, null],
        ['EPUB_TEXT_ALIGN',                 RB.Config.EPUBReader.availableTextAligns,               'optPreferencesDialogTextAlign',        true, null],
        ['EPUB_TEXT_TRANSFORM',             RB.Config.EPUBReader.availableTextTransforms,           'optPreferencesDialogTextTransform',    true, null],
        ['EPUB_LINE_SPACING_FACTOR',        RB.Config.EPUBReader.availableLineSpacingFactors,       'optPreferencesDialogSpacing',          true, null],
        ['EPUB_LEFT_MARGIN_SIZE',           RB.Config.EPUBReader.availableLeftMarginSizes,          'optPreferencesDialogMarginLeft',       true, null],
        ['EPUB_RIGHT_MARGIN_SIZE',          RB.Config.EPUBReader.availableRightMarginSizes,         'optPreferencesDialogMarginRight',      true, null],
        ['EPUB_HIGHLIGHT_STYLE',            RB.Config.EPUBReader.availableHighLightStyles,          'optPreferencesDialogHighlightStyle',   true, null],
        ['EPUB_PLAYBACK_VOLUME',            RB.Config.EPUBReader.availablePlaybackVolumes,          'optPreferencesDialogVolume',           true, null],
        ['EPUB_PLAYBACK_SPEED',             RB.Config.EPUBReader.availablePlaybackSpeeds,           'optPreferencesDialogSpeed',            true, null],
        ['EPUB_SCROLL_AMOUNT',              RB.Config.EPUBReader.availableScrollAmounts,            'btnSettingsChangeScrollAmount',        true, null],
    ];
    for (var i = 0; i < cycles.length; i++) {
        RB.EPUBSettings.drs.registerSetting(cycles[i][0], 'cycle', cycles[i][1], [
            { 'id': cycles[i][2], 'notification': false, 'circular': true, 'increase': true, 'compact': cycles[i][3], 'callback': cycles[i][4] }
        ]);
    }
    
    var palettes = [
        ['EPUB_CONTENT_BACKGROUND_COLOR', 'optPreferencesDialogBackColor', null],
        ['EPUB_CONTENT_FONT_COLOR',       'optPreferencesDialogFontColor', null],
    ];
    for (var i = 0; i < palettes.length; i++) {
        RB.EPUBSettings.drs.registerSetting(palettes[i][0], 'palette', null, [
            { 'id': palettes[i][1], 'compact': true, 'callback': palettes[i][2] }
        ]);
    }

    // register simple buttons
    RB.UI.bindSimpleButtonEvents('btnSettingsOpenDRS', { 'click': RB.EPUBSettings.openDRS,         }, false);
    RB.UI.bindSimpleButtonEvents('btnDRSReinitialize', { 'click': RB.EPUBSettings.reinitializeDRS, }, false);
    
    // touch zones
    for (var i = 0; i < 9; i++) {
        (function(index) {
            RB.EPUBSettings.drs.registerSetting('EPUB_ACTION_ZONE_' + i, 'cycle', RB.Config.EPUBReader.availableZoneActions, [
                { 'id':           ('btnEPUBZone'+ i),
                  'notification': false,
                  'circular':     true,
                  'increase':     true,
                  'compact':      true,
                  'onlyvalue':    true,
                  'setinnertext': true,
                  'labels':       'btnEPUBZoneLabels',
                  'callback':     function(){RB.UI.showClick('btnEPUBZone' + index);} },
            ]);
        }(i));
    }
    
    // reset flag
    RB.EPUBSettings.createdManagers = true;
};
RB.EPUBSettings.openDRS = function() {
    RB.UI.changePage(RB.EPUBSettings.UI.Pages.drs);
};
RB.EPUBSettings.showWarningExperimentalFeature = function(key) {
    var msg = {
        'EPUB_ALLOW_FXL':         RB.EPUBSettings.UI.Settings.txtToggleAllowFXLWarning,
        'EPUB_STRIP_CSS':         RB.EPUBSettings.UI.Settings.txtToggleStripCSSWarning,
        'EPUB_INJECT_CUSTOM_CSS': RB.EPUBSettings.UI.Settings.txtToggleInjectCustomCSSWarning,
        'EPUB_RUN_JAVASCRIPT':    RB.EPUBSettings.UI.Settings.txtToggleRunJavascriptWarning,
    };
    if (RB.EPUBSettings.drs.getValue(key)) {
        RB.UI.showNotification(RB.UI.i18n(msg[key]));
    }
};
RB.EPUBSettings.reinitializeDRS = function() {
    var properties = [
        'EPUB_APPLY_TYPO',
        'EPUB_FONT_FAMILY',
        'EPUB_FONT_SIZE',
        'EPUB_TEXT_ALIGN',
        'EPUB_TEXT_TRANSFORM',
        'EPUB_LINE_SPACING_FACTOR',
        'EPUB_LEFT_MARGIN_SIZE',
        'EPUB_RIGHT_MARGIN_SIZE',
        'EPUB_CONTENT_BACKGROUND_COLOR',
        'EPUB_CONTENT_FONT_COLOR',
        'EPUB_APPLY_HIGHLIGHT',
        'EPUB_HIGHLIGHT_STYLE',
        'EPUB_AUTO_SCROLL',
        'EPUB_TAP_TO_PLAY',
        'EPUB_PLAYBACK_VOLUME',
        'EPUB_PLAYBACK_SPEED'
    ];
    for (var i = 0; i < properties.length; ++i) {
        var key = properties[i];
        RB.EPUBSettings.drs.setValue(key, RB.Config.defaultValues[RB.Storage.Keys[key]]);
    }
    RB.EPUBSettings.drs.update();
    RB.UI.collapse(RB.EPUBSettings.UI.DRS.colDRSAdvanced);
    RB.UI.showNotification(RB.UI.i18n(RB.EPUBSettings.UI.DRS.txtDRSReinitializeDone));
};
RB.EPUBSettings.onDRSUpdate = function() {
    var id;
    var apply = RB.EPUBSettings.drs.getValue('EPUB_APPLY_TYPO');
    if (apply) {
        // if none, align should be removed
        var al  = RB.EPUBSettings.drs.getValue('EPUB_TEXT_ALIGN');
        if (RB.EPUBSettings.drs.getValue('EPUB_TEXT_ALIGN') === 'none') {
            al = '';
        }
        // compute line height
        var raw = RB.EPUBSettings.drs.getValue('EPUB_FONT_SIZE').replace('px', '');
        var lh  = Math.floor(RB.EPUBSettings.drs.getValue('EPUB_LINE_SPACING_FACTOR') * raw) + 'px';
        
        // apply
        id = RB.EPUBSettings.UI.DRS.divLorem;
        RB.UI.applyCSS(id, 'font-family',       RB.EPUBSettings.drs.getValue('EPUB_FONT_FAMILY'));
        RB.UI.applyCSS(id, 'font-size',         RB.EPUBSettings.drs.getValue('EPUB_FONT_SIZE'));
        RB.UI.applyCSS(id, 'text-transform',    RB.EPUBSettings.drs.getValue('EPUB_TEXT_TRANSFORM'));
        RB.UI.applyCSS(id, 'text-align',        al);
        RB.UI.applyCSS(id, 'line-height',       lh);
        RB.UI.applyCSS(id, 'margin-left',       RB.EPUBSettings.drs.getValue('EPUB_LEFT_MARGIN_SIZE'));
        RB.UI.applyCSS(id, 'margin-right',      RB.EPUBSettings.drs.getValue('EPUB_RIGHT_MARGIN_SIZE'));
        
        id = RB.EPUBSettings.UI.DRS.divLoremContainer;
        RB.UI.applyCSS(id, 'background',        RB.EPUBSettings.drs.getValue('EPUB_CONTENT_BACKGROUND_COLOR'));
        RB.UI.applyCSS(id, 'color',             RB.EPUBSettings.drs.getValue('EPUB_CONTENT_FONT_COLOR'));
    } else {
        // reset
        id = RB.EPUBSettings.UI.DRS.divLorem;
        RB.UI.applyCSS(id, 'font-family',       '');
        RB.UI.applyCSS(id, 'font-size',         '');
        RB.UI.applyCSS(id, 'text-transform',    '');
        RB.UI.applyCSS(id, 'text-align',        '');
        RB.UI.applyCSS(id, 'line-height',       '');
        RB.UI.applyCSS(id, 'margin-left',       '');
        RB.UI.applyCSS(id, 'margin-right',      '');
        
        id = RB.EPUBSettings.UI.DRS.divLoremContainer;
        RB.UI.applyCSS(id, 'background',        '');
        RB.UI.applyCSS(id, 'color',             '');
    }
    
    id = RB.EPUBSettings.UI.DRS.spanLoremHighlighted;
    RB.UI.removeClass(id);
    if (RB.EPUBSettings.drs.getValue('EPUB_APPLY_HIGHLIGHT')) {
        var style_key = RB.EPUBSettings.drs.getValue('EPUB_HIGHLIGHT_STYLE');
        if (style_key === '-1') {
            // use style 0 also for '-1' which represents author's choice
            style_key = '0';
        }
        RB.UI.addClass(id, 'rbActive' + style_key);
    }
};



