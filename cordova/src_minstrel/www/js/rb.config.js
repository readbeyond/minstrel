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

/** @namespace RB.Config */
RB.Config = RB.Config || {};

// running in debug (PC) mode?
// remember to set to false
RB.Config.debug                     = false;

// is this a spinoff?
// TODO refactor
RB.Config.Spinoff                   = {};
RB.Config.isSpinoff                 = false;  // true
RB.Config.Spinoff.name              = '';     // e.g., 'mySpinoff' (see below)
RB.Config.Spinoff.Help              = {};
RB.Config.Spinoff.Help.title        = '';
RB.Config.Spinoff.Help.p1           = '';
RB.Config.Spinoff.Help.p2           = '';
RB.Config.Spinoff.Help.p3           = '';
RB.Config.Spinoff.Help.p4           = '';
RB.Config.Spinoff.Help.p5           = '';
RB.Config.Spinoff.Help.web          = '';
RB.Config.Spinoff.Help.webURL       = '';
RB.Config.Spinoff.Help.mail         = '';

// public name and version strings
RB.Config.Minstrel                  = {};
RB.Config.Minstrel.publicName       = 'Minstrel';
RB.Config.Minstrel.publicVersion    = '3.0.1';
RB.Config.Minstrel.publicBuild      = '7fa72ad0';
RB.Config.Minstrel.publicDate       = '2015-05-20';
RB.Config.Minstrel.epubRSName       = 'Minstrel';
RB.Config.Minstrel.epubRSVersion    = '3.0.1';

// private version string
// used for checking updates (change it at each release!)
RB.Config.Minstrel.version          = '3.0.1.main.coding.005';





/* constants */
RB.Config.tmpDirectory                              = 'tmp'; // NOTE no trailing '/', this will be created inside RB.Config.Library.mainDirectory
RB.Config.pathGuideEPUB                             = 'ebooks/guide.epub'; // path of EPUB guide inside www/ directory; this will be copied inside RB.Config.Library.mainDirectory

// TODO refactor
// we should allow the librarian plugin to extract
// thumbnails respecting the original aspect ratios
RB.Config.librarianThumbnailWidth                   = 300;
RB.Config.librarianThumbnailHeight                  = 400;

// in Android, we have two playing modes
// when using the Sonic library
// to compensate for false readings of MP3 properties
// resulting in bad audio stream settings
// mode '1' appears to be OK for most devices
// mode '2' works for some devices/manufacturers
RB.Config.availableMediaPlayerModes                 = [ '1',
                                                        '2' ];

// TODO refactor
RB.Plugins                                          = {};
RB.Plugins.Format                                   = {};
RB.Plugins.Format.formatNames                       = { 'ABZ':  'abz',
                                                        'CBZ':  'cbz',
                                                        'EPUB': 'epub',
                                                        'E0':   'ezero' };

RB.Plugins.Reader                                   = {};
RB.Plugins.availablePlugins                         = [ 'abz', 'cbz', 'epub' ];   // , 'ezero'
RB.Plugins.Format.availablePlugins                  = [ 'abz', 'cbz', 'epub' ];   // , 'ezero'

RB.Plugins.abz                                      = {};
RB.Plugins.abz.stockThumbnail                       = 'img/stock_abz.png';
RB.Plugins.abz.settingsLabel                        = 'ABZ';
RB.Plugins.abz.settingsFileExtensions               = ['.abz', '.abz.zip'];
RB.Plugins.abz.settingsIcon                         = 'img/format_abz.png';
RB.Plugins.abz.settingsFilePath                     = 'abz.settings.html';
RB.Plugins.abz.availableViewerFilePaths             = ['abz.reader.html'];
RB.Plugins.abz.enabledViewerFilePaths               = ['abz.reader.html'];
RB.Plugins.abz.defaultViewerFilePath                = 'abz.reader.html';
RB.Plugins.abz.previewerFilePath                    = 'preview.html';

RB.Plugins.cbz                                      = {};
RB.Plugins.cbz.stockThumbnail                       = 'img/stock_cbz.png';
RB.Plugins.cbz.settingsLabel                        = 'CBZ';
RB.Plugins.cbz.settingsFileExtensions               = ['.cbz', '.cbz.zip'];
RB.Plugins.cbz.settingsIcon                         = 'img/format_cbz.png';
RB.Plugins.cbz.settingsFilePath                     = 'cbz.settings.html';
RB.Plugins.cbz.availableViewerFilePaths             = ['cbz.reader.html'];
RB.Plugins.cbz.enabledViewerFilePaths               = ['cbz.reader.html'];
RB.Plugins.cbz.defaultViewerFilePath                = 'cbz.reader.html';
RB.Plugins.cbz.previewerFilePath                    = 'preview.html';

RB.Plugins.epub                                     = {};
RB.Plugins.epub.stockThumbnail                      = 'img/stock_epub.png';
RB.Plugins.epub.settingsLabel                       = 'EPUB';
RB.Plugins.epub.settingsFileExtensions              = ['.epub', '.epub.zip'];
RB.Plugins.epub.settingsIcon                        = 'img/format_epub.png';
RB.Plugins.epub.settingsFilePath                    = 'epub.settings.html';
RB.Plugins.epub.availableViewerFilePaths            = ['epub.reader.html',  'abz.reader.html', 'cbz.reader.html'];
RB.Plugins.epub.availableViewerDescriptions         = ['EPUB (ReadBeyond)', 'ABZ',             'CBZ'];
//RB.Plugins.epub.enabledViewerFilePaths              = ['epub.reader.html',  'abz.reader.html', 'cbz.reader.html'];
RB.Plugins.epub.enabledViewerFilePaths              = ['epub.reader.html'];
RB.Plugins.epub.defaultViewerFilePath               = 'epub.reader.html';
RB.Plugins.epub.previewerFilePath                   = 'preview.html';

RB.Plugins.ezero                                    = {};
RB.Plugins.ezero.stockThumbnail                     = 'img/stock_ezero.png';
RB.Plugins.ezero.settingsLabel                      = 'E0/HTML5';
RB.Plugins.ezero.settingsFileExtensions             = ['.e0', '.htm', '.html', '.html5', '.zip'];
RB.Plugins.ezero.settingsIcon                       = 'img/format_ezero.png';
RB.Plugins.ezero.settingsFilePath                   = 'ezero.settings.html';
RB.Plugins.ezero.availableViewerFilePaths           = ['ezero.reader.html'];
RB.Plugins.ezero.enabledViewerFilePaths             = ['ezero.reader.html'];
RB.Plugins.ezero.defaultViewerFilePath              = 'ezero.reader.html';
RB.Plugins.ezero.previewerFilePath                  = 'preview.html';



RB.Config.UI                                        = {};
RB.Config.UI.availableFonts                         = [ 'Roboto',
                                                        'OpenDyslexic',
                                                        'TestMeSans' ];
RB.Config.UI.availableOrientations                  = [ 'auto',
                                                        'portrait',
                                                        'landscape' ];
RB.Config.UI.availableBrightnessValues              = [ '0.01',                 // 0.00 seems to cause problems in Android
                                                        '0.05',
                                                        '0.10',
                                                        '0.15',
                                                        '0.20',
                                                        '0.25',
                                                        '0.30',
                                                        '0.35',
                                                        '0.40',
                                                        '0.45',
                                                        '0.50',
                                                        '0.55',
                                                        '0.60',
                                                        '0.65',
                                                        '0.70',
                                                        '0.75',
                                                        '0.80',
                                                        '0.85',
                                                        '0.90',
                                                        '0.95',
                                                        '1.00' ];
RB.Config.UI.availableLanguages                     = [ 'da',
                                                        'de',
                                                        'en',
                                                        'es',
                                                        'fr',
                                                        'it',
                                                        'pl',
                                                        'tr' ];

// library
RB.Config.Library                                   = {};
RB.Config.Library.mainDirectory                     = 'minstrel'; // NOTE no trailing '/'
RB.Config.Library.thumbnailsDirectory               = '.thumbnails'; // NOTE no trailing '/', this will be created inside RB.Config.Library.mainDirectory
RB.Config.Library.refreshMeFile                     = 'refresh.me';  // NOTE this will be created inside RB.Config.Library.mainDirectory
RB.Config.Library.availableSortMethods              = [ 'title',
                                                        'author',
                                                        'narrator',
                                                        'duration',
                                                        'language',
                                                        'series',
                                                        'recent' ];

// EPUB reader
RB.Config.EPUBReader                                = {};
RB.Config.EPUBReader.customCSSFileNameLight         = 'custom.css';           // name of custom CSS, normal/light mode
RB.Config.EPUBReader.customCSSFileNameDark          = 'custom.night.css';     // name of custom CSS, night/dark mode

RB.Config.EPUBReader.availableFontFamilies          = [ "sans-serif",         // system sans-serif
                                                        "serif",              // system serif
                                                        "'gentium'",          // see font.css, note the single quote chars
                                                        "'charis'",
                                                        "'ebgaramond'",
                                                        "'opendyslexic'",
                                                        "'andika'",
                                                        "'averiaserif'",
                                                        "'amaranth'",
                                                        "'volkhov'",
                                                        "'testmesans'",
                                                        "'testmeserif'",
                                                        "'robotoembedded'",
                                                        "'robotocondensedembedded'" ];
RB.Config.EPUBReader.availableFontSizes             = [ '8px',
                                                        '9px',
                                                        '10px',
                                                        '11px',
                                                        '12px',
                                                        '13px',
                                                        '14px',
                                                        '15px',
                                                        '16px',
                                                        '17px',
                                                        '18px',
                                                        '19px',
                                                        '20px',
                                                        '22px',
                                                        '24px',
                                                        '26px',
                                                        '28px',
                                                        '30px',
                                                        '32px',
                                                        '34px',
                                                        '36px',
                                                        '38px',
                                                        '40px',
                                                        '44px',
                                                        '48px',
                                                        '52px',
                                                        '60px',
                                                        '72px' ];
RB.Config.EPUBReader.availableTextAligns            = [ 'none',
                                                        'justify',
                                                        'left',
                                                        'center',
                                                        'right' ];
RB.Config.EPUBReader.availableTextTransforms        = [ 'none',
                                                        'uppercase',
                                                        'lowercase' ];
RB.Config.EPUBReader.availableLineSpacingFactors    = [ '0.5',
                                                        '0.6',
                                                        '0.7',
                                                        '0.8',
                                                        '0.9',
                                                        '1.0',
                                                        '1.1',
                                                        '1.2',
                                                        '1.3',
                                                        '1.4',
                                                        '1.5',
                                                        '1.6',
                                                        '1.7',
                                                        '1.8',
                                                        '1.9',
                                                        '2',
                                                        '2.25',
                                                        '2.5',
                                                        '2.75',
                                                        '3',
                                                        '3.25',
                                                        '3.5',
                                                        '4',
                                                        '5',
                                                        '6' ];
RB.Config.EPUBReader.availableLeftMarginSizes       = [ '0%',
                                                        '2%',
                                                        '4%',
                                                        '6%',
                                                        '8%',
                                                        '10%',
                                                        '15%',
                                                        '20%',
                                                        '25%',
                                                        '30%' ];
RB.Config.EPUBReader.availableRightMarginSizes      = [ '0%',
                                                        '2%',
                                                        '4%',
                                                        '6%',
                                                        '8%',
                                                        '10%',
                                                        '15%',
                                                        '20%',
                                                        '25%',
                                                        '30%' ];
RB.Config.EPUBReader.availableHighLightStyles       = [ '-1',
                                                        '0',
                                                        '1',
                                                        '2',
                                                        '3',
                                                        '4',
                                                        '5',
                                                        '6',
                                                        '7',
                                                        '8',
                                                        '9',
                                                        '10',
                                                        '11',
                                                        '12',
                                                        '13',
                                                        '14',
                                                        '15' ];
RB.Config.EPUBReader.availablePlaybackSpeeds        = [ '0.5',
                                                        '0.6',
                                                        '0.7',
                                                        '0.8',
                                                        '0.85',
                                                        '0.9',
                                                        '0.95',
                                                        '1.0',
                                                        '1.1',
                                                        '1.2',
                                                        '1.35',
                                                        '1.5',
                                                        '1.75',
                                                        '2.0' ];
RB.Config.EPUBReader.availablePlaybackVolumes       = [ '0.00',
                                                        '0.05',
                                                        '0.10',
                                                        '0.15',
                                                        '0.20',
                                                        '0.25',
                                                        '0.30',
                                                        '0.35',
                                                        '0.40',
                                                        '0.45',
                                                        '0.50',
                                                        '0.55',
                                                        '0.60',
                                                        '0.65',
                                                        '0.70',
                                                        '0.75',
                                                        '0.80',
                                                        '0.85',
                                                        '0.90',
                                                        '0.95',
                                                        '1.00' ];
RB.Config.EPUBReader.availableSwipeGestures         = [ 'none',
                                                        'chapter',
                                                        'page' ];
RB.Config.EPUBReader.availableBorderGestures        = [ 'none',
                                                        'chapter',
                                                        'page' ];
RB.Config.EPUBReader.availableDoubleTapGestures     = [ 'none',
                                                        'preferences',
                                                        'toc',
                                                        'touch' ];
RB.Config.EPUBReader.availableTwoFingersTapGestures = [ 'none',
                                                        'preferences',
                                                        'toc',
                                                        'touch' ];
RB.Config.EPUBReader.availableZoneActions           = [ 'none',
                                                        'preferences',
                                                        'toc',
                                                        'footer',
                                                        'prevchapter',
                                                        'nextchapter',
                                                        'prevpage',
                                                        'nextpage',
                                                        'playpause',
                                                        'touch' ];
RB.Config.EPUBReader.availableScrollAmounts         = [ '0.00',
                                                        '0.05',
                                                        '0.10',
                                                        '0.15',
                                                        '0.20',
                                                        '0.25',
                                                        '0.30',
                                                        '0.35',
                                                        '0.40',
                                                        '0.45',
                                                        '0.50',
                                                        '0.55',
                                                        '0.60',
                                                        '0.65',
                                                        '0.70',
                                                        '0.75',
                                                        '0.80',
                                                        '0.85',
                                                        '0.90',
                                                        '0.95',
                                                        '1.00' ];

// ABZ reader
RB.Config.ABZReader                                 = {};
RB.Config.ABZReader.availablePlaybackSpeeds         = [ '0.5',
                                                        '0.6',
                                                        '0.7',
                                                        '0.8',
                                                        '0.85',
                                                        '0.9',
                                                        '0.95',
                                                        '1.0',
                                                        '1.1',
                                                        '1.2',
                                                        '1.35',
                                                        '1.5',
                                                        '1.75',
                                                        '2.0' ];
RB.Config.ABZReader.availablePlaybackVolumes        = [ '0.00',
                                                        '0.05',
                                                        '0.10',
                                                        '0.15',
                                                        '0.20',
                                                        '0.25',
                                                        '0.30',
                                                        '0.35',
                                                        '0.40',
                                                        '0.45',
                                                        '0.50',
                                                        '0.55',
                                                        '0.60',
                                                        '0.65',
                                                        '0.70',
                                                        '0.75',
                                                        '0.80',
                                                        '0.85',
                                                        '0.90',
                                                        '0.95',
                                                        '1.00' ];

// CBZ reader
RB.Config.CBZReader                                 = {};
RB.Config.CBZReader.availableZoomModes              = [ 'original',
                                                        'fitifbigger',
                                                        'fit',
                                                        'fitother' ];
RB.Config.CBZReader.availableMenuDurationValues     = [ '1s',
                                                        '2s',
                                                        '3s',
                                                        '4s',
                                                        '5s',
                                                        '10s' ];
RB.Config.CBZReader.availableBorderValues           = [ '0%',
                                                        '1%',
                                                        '2%',
                                                        '5%',
                                                        '10%',
                                                        '15%',
                                                        '20%',
                                                        '25%' ];
RB.Config.CBZReader.availableSlideshowTimerValues   = [ '1s',
                                                        '2s',
                                                        '5s',
                                                        '10s',
                                                        '20s',
                                                        '30s',
                                                        '60s' ];
RB.Config.CBZReader.availableZoneActions            = [ 'showinfo',
                                                        'resetzoom',
                                                        'orientation',
                                                        'showmenu',
                                                        'previousimage',
                                                        'nextimage',
                                                        'slideshow',
                                                        'none' ];

// app defaults
RB.Config.defaultValues                                                         = {};
RB.Config.defaultValues[RB.Storage.Keys.SCAN_DIR]                               = 'single';
RB.Config.defaultValues[RB.Storage.Keys.MEDIAPLAYER_MODE]                       = '1';
RB.Config.defaultValues[RB.Storage.Keys.MEDIAPLAYER_ENABLE_PLAYBACK_SPEED]      = false;
RB.Config.defaultValues[RB.Storage.Keys.UI_LANGUAGE]                            = 'en';
RB.Config.defaultValues[RB.Storage.Keys.UI_NIGHT_MODE]                          = false;
RB.Config.defaultValues[RB.Storage.Keys.UI_FONT]                                = 'Roboto';
RB.Config.defaultValues[RB.Storage.Keys.UI_ORIENTATION]                         = 'auto';
RB.Config.defaultValues[RB.Storage.Keys.UI_ANIMATED_MENU]                       = true;
RB.Config.defaultValues[RB.Storage.Keys.UI_ENABLE_BRIGHTNESS]                   = false;
RB.Config.defaultValues[RB.Storage.Keys.UI_BRIGHTNESS]                          = '0.50';
RB.Config.defaultValues[RB.Storage.Keys.OPEN_URLS_IN_SYSTEM_BROWSER]            = false;

RB.Config.defaultValues[RB.Storage.Keys.LIBRARY_BOOKS]                          = JSON.stringify({});
RB.Config.defaultValues[RB.Storage.Keys.LIBRARY_SHOW_HIDDEN_BOOKS]              = false;
RB.Config.defaultValues[RB.Storage.Keys.LIBRARY_OPEN_NEW_BOOK]                  = true;
RB.Config.defaultValues[RB.Storage.Keys.LIBRARY_SORT]                           = 'title';
RB.Config.defaultValues[RB.Storage.Keys.LIBRARY_INVERT_SORT]                    = false;
RB.Config.defaultValues[RB.Storage.Keys.LIBRARY_HIDE_BOOKS_ON_SORT]             = false;
RB.Config.defaultValues[RB.Storage.Keys.LIBRARY_CACHE_METADATA]                 = true;

RB.Config.defaultValues[RB.Storage.Keys.EPUB_UNZIP_ALL]                         = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SHOW_HEADER]                       = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SHOW_NAVBAR]                       = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SHOW_SLIDER]                       = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SHOW_QUICKBAR]                     = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_FONT_FAMILY]                       = "'gentium'"; // see font.css, note the single quote chars
RB.Config.defaultValues[RB.Storage.Keys.EPUB_FONT_SIZE]                         = '20px';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_LINE_SPACING_FACTOR]               = '1.7';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_LEFT_MARGIN_SIZE]                  = '4%';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_RIGHT_MARGIN_SIZE]                 = '4%';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_CONTENT_BACKGROUND_COLOR]          = '#ffffff';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_CONTENT_FONT_COLOR]                = '#000000';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_TEXT_TRANSFORM]                    = 'none';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_TEXT_ALIGN]                        = 'none';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_AUTO_SCROLL]                       = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_TAP_TO_PLAY]                       = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_PAGINATE_REFLOWABLE]               = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_APPLY_TYPO]                        = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_APPLY_HIGHLIGHT]                   = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_HIGHLIGHT_STYLE]                   = '0';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_BACKGROUND_AUDIO]                  = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SMART_PLAY]                        = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_PRELOAD_PREV_NEXT]                 = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SHOW_WARNING_ON_NOT_AUDIOEBOOK]    = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SHOW_FIRST_TIME_POPUP]             = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_CONFIRM_QUIT]                      = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_OPEN_FIRST_CHAPTER_WITH_AUDIO]     = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_WAIT_BEFORE_TURNING_CHAPTER]       = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ENABLE_TRANSLATION_LINKS]          = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ENABLE_FOOTNOTE_LINKS]             = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_PAUSE_ON_EXTRA]                    = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ADD_LINK_EXTRA]                    = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_NOTE_LINK_DETECTION]               = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_HIGHLIGHT_NOTE_LINK_TARGET]        = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_PLAYBACK_SPEED]                    = '1.0';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_PLAYBACK_VOLUME]                   = '1.00';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SKIP_NON_LINEAR]                   = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_TREAT_NON_LINEAR_AS_CUL_DE_SAC]    = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ENABLE_READBEYOND_HACKS]           = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_RUN_JAVASCRIPT]                    = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_STRIP_CSS]                         = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_INJECT_CUSTOM_CSS]                 = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_CLOSE_TOC_IMMEDIATELY]             = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_CLOSE_PLAYLIST_IMMEDIATELY]        = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_INVERT_SWIPE]                      = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SCROLL_TO_TOP_ON_PREVIOUS_CHAPTER] = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SWIPE_GESTURE]                     = 'chapter';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_BORDER_GESTURE]                    = 'none';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_DOUBLE_TAP_GESTURE]                = 'settings';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_TWO_FINGERS_TAP_GESTURE]           = 'toc';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ALLOW_FXL]                         = false;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONES_ENABLED]              = true;
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONE_0]                     = 'toc';            // TODO refactor from here...
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONE_1]                     = 'footer';         //
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONE_2]                     = 'preferences';    //
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONE_3]                     = 'prevpage';       //
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONE_4]                     = 'preferences';    //
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONE_5]                     = 'nextpage';       //
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONE_6]                     = 'toc';            //
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONE_7]                     = 'footer';         //
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ACTION_ZONE_8]                     = 'preferences';    // TODO refactor ... to here
RB.Config.defaultValues[RB.Storage.Keys.EPUB_SCROLL_AMOUNT]                     = '0.95';
RB.Config.defaultValues[RB.Storage.Keys.EPUB_ANIMATED_SCROLL]                   = true;

RB.Config.defaultValues[RB.Storage.Keys.ABZ_WRAP_AROUND]                        = false;
RB.Config.defaultValues[RB.Storage.Keys.ABZ_AUTO_START_AUDIO]                   = true;
RB.Config.defaultValues[RB.Storage.Keys.ABZ_USE_PLAYLIST]                       = true;
RB.Config.defaultValues[RB.Storage.Keys.ABZ_BACKGROUND_AUDIO]                   = true;
RB.Config.defaultValues[RB.Storage.Keys.ABZ_SHOW_LARGE_COVER]                   = false;
RB.Config.defaultValues[RB.Storage.Keys.ABZ_SHOW_TRACK_NUMBER]                  = true;
RB.Config.defaultValues[RB.Storage.Keys.ABZ_PRELOAD_PREV_NEXT]                  = true;
RB.Config.defaultValues[RB.Storage.Keys.ABZ_UNZIP_ALL]                          = false;
RB.Config.defaultValues[RB.Storage.Keys.ABZ_PLAYBACK_SPEED]                     = '1.0';
RB.Config.defaultValues[RB.Storage.Keys.ABZ_PLAYBACK_VOLUME]                    = '1.00';

RB.Config.defaultValues[RB.Storage.Keys.CBZ_EXTRACT_COVER]                      = true;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_BACKGROUND_COLOR]                   = '#000000';
RB.Config.defaultValues[RB.Storage.Keys.CBZ_INFO_COLOR]                         = '#ffffff';
RB.Config.defaultValues[RB.Storage.Keys.CBZ_AUTOHIDE_MENU]                      = true;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_AUTOHIDE_MENU_DURATION]             = '3s';
RB.Config.defaultValues[RB.Storage.Keys.CBZ_DEFAULT_ZOOM_MODE]                  = 'fitifbigger';
RB.Config.defaultValues[RB.Storage.Keys.CBZ_WRAP_AROUND]                        = true;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_BORDER]                             = '0%';
RB.Config.defaultValues[RB.Storage.Keys.CBZ_SLIDESHOW_TIMER]                    = '5s';
RB.Config.defaultValues[RB.Storage.Keys.CBZ_RESET_SCALE_ON_IMAGE_CHANGE]        = true;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_LOCK_SCROLL_ON_FIT_OTHER]           = true;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_SNAP_TO_BORDER]                     = false;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_SHOW_INFO]                          = false;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_PERSISTENT_INFO]                    = true;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_COMICS_MODE]                        = true;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_INVERT_SWIPE]                       = false;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_PRELOAD_PREV_NEXT]                  = true;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_UNZIP_ALL]                          = false;
RB.Config.defaultValues[RB.Storage.Keys.CBZ_ACTION_ZONE_0]                      = 'showinfo';       // TODO refactor from here...
RB.Config.defaultValues[RB.Storage.Keys.CBZ_ACTION_ZONE_1]                      = 'resetzoom';      //
RB.Config.defaultValues[RB.Storage.Keys.CBZ_ACTION_ZONE_2]                      = 'orientation';    //
RB.Config.defaultValues[RB.Storage.Keys.CBZ_ACTION_ZONE_3]                      = 'previousimage';  //
RB.Config.defaultValues[RB.Storage.Keys.CBZ_ACTION_ZONE_4]                      = 'showmenu';       //
RB.Config.defaultValues[RB.Storage.Keys.CBZ_ACTION_ZONE_5]                      = 'nextimage';      //
RB.Config.defaultValues[RB.Storage.Keys.CBZ_ACTION_ZONE_6]                      = 'previousimage';  //
RB.Config.defaultValues[RB.Storage.Keys.CBZ_ACTION_ZONE_7]                      = 'showmenu';       //
RB.Config.defaultValues[RB.Storage.Keys.CBZ_ACTION_ZONE_8]                      = 'nextimage';      // TODO refactor ... to here

RB.Config.defaultValues[RB.Storage.Keys.PLUGINS_LOADED]                         = JSON.stringify({ 'epub': true });
RB.Config.defaultValues[RB.Storage.Keys.PLUGINS_LOADED_CHANGED]                 = false;

RB.Config.defaultValues[RB.Storage.Keys.SCAN_DIRECTORIES]                       = JSON.stringify([]);
RB.Config.defaultValues[RB.Storage.Keys.SCAN_DIRECTORIES_CHANGED]               = false;

if (RB.Config.isSpinoff) {
   
    // BEGIN mySpinoff spinoff
    if (RB.Config.Spinoff.name === 'mySpinoff') {
        // app name
        RB.Config.Minstrel.publicName   = 'Minstrel Special Edition';
       
        // description of the spinoff in the help
        RB.Config.Spinoff.Help.title    = 'Minstrel Special Edition';
        RB.Config.Spinoff.Help.p1       = 'Minstrel Special Edition demonstrates how you can easily generate Minstrel spinoffs.';
        RB.Config.Spinoff.Help.p2       = 'This is another paragraph, where you can explain how awesome your customization is.';
        RB.Config.Spinoff.Help.p3       = 'Yet another paragraph.';
        RB.Config.Spinoff.Help.web      = 'albertopettarin.it';
        RB.Config.Spinoff.Help.webURL   = 'http://www.albertopettarin.it/';
        RB.Config.Spinoff.Help.mail     = 'spam@albertopettarin.it';

        // set default UI language to Italian
        RB.Config.defaultValues[RB.Storage.Keys.UI_LANGUAGE]                       = 'it';
       
        // set default UI orientation to portrait
        RB.Config.defaultValues[RB.Storage.Keys.UI_ORIENTATION]                    = 'portrait';

        // set default reader font size to 24px
        RB.Config.defaultValues[RB.Storage.Keys.EPUB_FONT_SIZE]                    = '24px';
        
        // set default reader background color to light gray
        RB.Config.defaultValues[RB.Storage.Keys.EPUB_CONTENT_BACKGROUND_COLOR]     = '#f0f0f0';
       
        // set default reader text transform to uppercase
        RB.Config.defaultValues[RB.Storage.Keys.EPUB_TEXT_TRANSFORM]               = 'uppercase';

        // set enable changing audio playback rate
        RB.Config.defaultValues[RB.Storage.Keys.MEDIAPLAYER_ENABLE_PLAYBACK_SPEED] = true;
    }
    // END mySpinoff spinoff

}



/*
//
// MOVED to RB.App
//
// this function is executed every time the app is started
// but the default values are stored only if the corresponding key
// is not present in the local storage already
//
for (var key in RB.Config.defaultValues) {
    if (RB.Storage.get(key) === null) {
        // apply defaults the first time the app is run
        RB.Storage.set(key, RB.Config.defaultValues[key]);
    }
}
*/


