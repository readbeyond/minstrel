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

/** @namespace RB.EPUBReader */
RB.EPUBReader = RB.EPUBReader || {};

/* constants */
RB.EPUBReader.DELAY_BEFORE_REMOVING_NOTIFICATION           = 1000;             // (ms) delay before removing notification
RB.EPUBReader.MARGIN_TOP                                   = 5;                // (px)
RB.EPUBReader.MARGIN_BOTTOM                                = 5;                // (px)
RB.EPUBReader.DELAY_BEFORE_NEXT_CHAPTER                    = 2000;             // (ms) delay before MO turning chapter
RB.EPUBReader.CURRENT_ASSET_HAS_AUDIO_SYMBOL               = '★';

// UI
RB.EPUBReader.UI                                           = {};
RB.EPUBReader.UI.DELAY_BEFORE_REENABLING_GESTURE           = 100;              // (ms) delay before re-enabling gesture
RB.EPUBReader.UI.DELAY_BEFORE_REMOVING_HIGHLIGHTING        = 5000;             // (ms) dalay before removing highlighting on note/link
RB.EPUBReader.UI.FOOTER_EXTRA_MAX_HEIGHT_FACTOR            = 0.35;             // footer extra cannot be taller than screen height times this factor
RB.EPUBReader.UI.HIGHLIGHT_TRANSITION_DURATION             = 150;              // (ms) duration of MO highlight transition (scroll)
RB.EPUBReader.UI.PAGE_SCROLL_DURATION                      = 1000;             // (ms) duration of page scroll (DEFAULT, will be copied into animatedScrollDuration if requested)

RB.EPUBReader.UI.animatedScrollDuration                    = 0;                // (ms) duration of page scroll

RB.EPUBReader.UI.divReader                                 = 'divReader';
RB.EPUBReader.UI.divHeader                                 = 'divHeader';
RB.EPUBReader.UI.txtTitle                                  = 'txtEPUBReaderTitle';
RB.EPUBReader.UI.divContentContainer                       = 'divContentContainer';
RB.EPUBReader.UI.divContent                                = 'divContent';
RB.EPUBReader.UI.divContentInner                           = 'divContentInner';
RB.EPUBReader.UI.divContentColumn                          = 'divContentColumn';
RB.EPUBReader.UI.divContentColumnMask                      = 'divContentColumnMask';
RB.EPUBReader.UI.divContent2                               = 'divContent2';
RB.EPUBReader.UI.divContentInner2                          = 'divContentInner2';
RB.EPUBReader.UI.divContentColumn2                         = 'divContentColumn2';
RB.EPUBReader.UI.divContentColumnMask2                     = 'divContentColumnMask2';

RB.EPUBReader.UI.divFooterAll                              = 'divFooterAll';
RB.EPUBReader.UI.divFooterExtra                            = 'divFooterExtra';
RB.EPUBReader.UI.divFooterSliderLeft                       = 'divFooterSliderLeft';
RB.EPUBReader.UI.divFooterPlayer                           = 'divFooterPlayer';
RB.EPUBReader.UI.divFooterNavBar                           = 'divFooterNavBar';
RB.EPUBReader.UI.sliderID                                  = 'sldAudio';
RB.EPUBReader.UI.divFooterSliderContainerInner             = 'divFooterSliderContainerInner';

RB.EPUBReader.UI.divPreferencesPopupSpeed                  = 'divPreferencesPopupSpeed';
RB.EPUBReader.UI.colPreferencesPopupBrightness             = 'colPreferencesPopupBrightness';
//RB.EPUBReader.UI.divPreferencesDialogAudio                 = 'divPreferencesDialogAudio';
RB.EPUBReader.UI.colPreferencesPopupAudio                  = 'colPreferencesPopupAudio';
RB.EPUBReader.UI.colPreferencesPopupTypo                   = 'colPreferencesPopupTypo';

RB.EPUBReader.UI.divSourceContainer                        = 'divSourceContainer'; // XHTML source will be wrapped inside <div id="divSourceContainer"></div>

// Dialogs
RB.EPUBReader.UI.Dialogs                                   = {};
RB.EPUBReader.UI.Dialogs.popupPreferences                  = 'divPopupPreferences';
RB.EPUBReader.UI.Dialogs.popupTOC                          = 'divPopupTOC';
RB.EPUBReader.UI.Dialogs.popupPlaylist                     = 'divPopupPlaylist';
RB.EPUBReader.UI.Dialogs.popupFTP                          = 'divPopupFirstTime';
RB.EPUBReader.UI.Dialogs.popupNotice                       = 'divPopupNotice';
RB.EPUBReader.UI.Dialogs.popupQuit                         = 'divPopupQuit';
//RB.EPUBReader.UI.Dialogs.dialogPreferences                 = 'divDialogPreferences';
//RB.EPUBReader.UI.Dialogs.toc                               = 'toc';
//RB.EPUBReader.UI.Dialogs.playlist                          = 'playlist';
//RB.EPUBReader.UI.Dialogs.ftp                               = 'ftp';
//RB.EPUBReader.UI.Dialogs.quit                              = 'quit';



/* variables */
// managers
RB.EPUBReader.createdManagers                              = false;
RB.EPUBReader.assetManager                                 = null;
RB.EPUBReader.footer                                       = null;
RB.EPUBReader.drs                                          = null;

// settings
RB.EPUBReader.unzipAll                                     = false;
RB.EPUBReader.showSlider                                   = true;
RB.EPUBReader.showBottomBar                                = false;
RB.EPUBReader.customCSSFileName                            = RB.Config.EPUBReader.customCSSFileNameLight;

RB.EPUBReader.appStatusBeforeBackgrounded                  = null;
RB.EPUBReader.invertedTimer                                = false;
RB.EPUBReader.actionZonesEnabled                           = true;
RB.EPUBReader.patchedAElements                             = {};

RB.EPUBReader.parallelLinkClass                            = null;

// UI events
RB.EPUBReader.preventSwipe                                 = false;
RB.EPUBReader.preventPinch                                 = false;
RB.EPUBReader.sliderIsChanging                             = false;
RB.EPUBReader.preventAudio                                 = false;
RB.EPUBReader.isPausedOnExtra                              = false;
RB.EPUBReader.actions                                      = [];

/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.EPUBReader.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();
   
    // since we might end up changing the viewport, store the screen size
    RB.UI.storeScreenDimensions();
   
    // if running on a small screen, reduce bottom bar button text
    RB.UI.reduceOnSmallScreen(RB.EPUBReader.UI.divFooterSliderLeft);
    RB.UI.reduceOnSmallScreen(RB.EPUBReader.UI.divFooterPlayer);
    RB.UI.reduceOnSmallScreen(RB.EPUBReader.UI.divFooterNavBar);
   
    // if playback speed is not enabled, hide controls
    RB.UI.showHide(RB.EPUBReader.UI.divPreferencesPopupSpeed, RB.Storage.isAppParameterTrue(RB.Storage.Keys.MEDIAPLAYER_ENABLE_PLAYBACK_SPEED));

    // if brightness is not enabled, hide controls
    RB.UI.showHide(RB.EPUBReader.UI.colPreferencesPopupBrightness, RB.EPUBReader.enableBrightness);

    // set app variables
    RB.EPUBReader.loadVariables();
    
    // create manager objects
    RB.EPUBReader.createManagers();
    RB.EPUBReader.drs.update();
    
    // reset timer and slider
    RB.EPUBReader.onMOTimer(0);
    
    // call screen-size dependant adjustments
    RB.EPUBReader.onScreenSizeChanged();
    
    // register available zone actions
    RB.EPUBReader.availableZoneActions = {
        'preferences':  RB.EPUBReader.openPreferences,
        'toc':          RB.EPUBReader.openTOC,
        'footer':       RB.EPUBReader.toggleFooter,
        'prevchapter':  RB.EPUBReader.goToPreviousChapter,
        'nextchapter':  RB.EPUBReader.goToNextChapter,
        'prevpage':     RB.EPUBReader.goToPreviousPage,
        'nextpage':     RB.EPUBReader.goToNextPage,
        'playpause':    RB.EPUBReader.playPause,
        'touch':        RB.EPUBReader.toggleTouch
    };
};

// initialize page
RB.EPUBReader.initializePage = function() {
    // bind events
    RB.EPUBReader.bindEvents();
    
    // dim system bar
    RB.UI.dimSystemBar();
    
    // create slider
    var onSlideStart = function() {
        RB.EPUBReader.sliderIsChanging = true;
    };
    var onSlideStop = function() {
        RB.EPUBReader.sliderIsChanging = false;
        if ((!RB.EPUBReader.preventAudio) && (RB.EPUBReader.epubPlayer)) {
            // time position set through the slider
            var value = parseInt(RB.UI.getSliderValue(RB.EPUBReader.UI.sliderID));
            
            // set timer text ahead
            var begin = RB.EPUBReader.epubPlayer.getMOAtSecondStart(value);
            RB.EPUBReader.setTimerText(begin);
            
            // perform seek
            RB.EPUBReader.epubPlayer.goToMOAtSecond(value);
        }
    };
    var onSlideChanging = function(p) {
        // time position set through the slider
        var value = parseInt(RB.UI.getSliderValue(RB.EPUBReader.UI.sliderID));
        RB.EPUBReader.setTimerText(value);
    };
    RB.UI.createSlider(RB.EPUBReader.UI.sliderID, RB.EPUBReader.UI.divFooterSliderContainerInner, 0, 100, onSlideStart, onSlideStop, onSlideChanging);
    
    // resize content containers
    RB.EPUBReader.resizeContentContainers();
    
    // associate the callback to footer manager
    RB.EPUBReader.footer.setVisibilityCallback(RB.EPUBReader.resizeContentContainers);
    RB.EPUBReader.footer.setExtraCallback(function(visible) {
        if (RB.EPUBReader.pauseOnExtra) {
            if (visible) {
                if (!RB.EPUBReader.isPausedOnExtra) {
                    RB.EPUBReader.isPausedOnExtra = true;
                    RB.EPUBReader.pause();
                }
            } else {
                if (RB.EPUBReader.isPausedOnExtra) {
                    RB.EPUBReader.isPausedOnExtra = false;
                    RB.EPUBReader.play();
                }
            }
        }
    });
    
    // expose epubReadingSystem
    if (RB.EPUBReader.runJavascript) {
        RB.EPUBReader.exposeEPUBReadingSystem();
    }
    
    // start loading EPUB
    RB.EPUBReader.loadContents();
};

// called when the screen size changed, e.g. after an orientationChange
RB.EPUBReader.onScreenSizeChanged = function() {
    try {
        RB.EPUBReader.resizeContentContainers();
        RB.EPUBReader.ensureCurrentMOIsVisible();
        RB.UI.resizeDetachedImages();
        RB.UI.resizeSidePopup(function(){
            if ((RB.UI.dialogOpen === RB.EPUBReader.UI.Dialogs.popupTOC) && (RB.EPUBReader.tocItemHighlighted)) {
                var h = RB.UI.getHeight(RB.EPUBReader.UI.Dialogs.popupTOC);
                RB.UI.scrollTo(RB.EPUBReader.UI.Dialogs.popupTOC, RB.EPUBReader.tocItemHighlighted, -h/3, 0);
            }
            if ((RB.UI.dialogOpen === RB.EPUBReader.UI.Dialogs.popupPlaylist) && (RB.EPUBReader.playlistItemHighlighted)) {
                var h = RB.UI.getHeight(RB.EPUBReader.UI.Dialogs.popupPlaylist);
                RB.UI.scrollTo(RB.EPUBReader.UI.Dialogs.popupPlaylist, RB.EPUBReader.playlistItemHighlighted, -h/3, 0);
            }
        });
    } catch (e) {
        // nop
    }
    
    // apply new max-height to extra panel
    RB.UI.applyCSS(RB.EPUBReader.UI.divFooterExtra, 'max-height', (RB.UI.getHeight(window) * RB.EPUBReader.UI.FOOTER_EXTRA_MAX_HEIGHT_FACTOR) + 'px');
};

// bind events
RB.EPUBReader.bindEvents = function() {
    // orientation
    $(window).on('orientationchange', RB.EPUBReader.onOrientationChange);
    
    // resume and pause events
    document.addEventListener('pause',  RB.EPUBReader.onAppPause);
    document.addEventListener('resume', RB.EPUBReader.onAppResume);
    
    // preferences dialog
    /*
    RB.UI.getElement(RB.EPUBReader.UI.Dialogs.dialogPreferences).on('pagebeforeshow', function() {
        RB.UI.loadLocalization();
        RB.EPUBReader.drs.update();
    });
    */
  
    // workaround to close the palette 
    RB.UI.getElement(RB.EPUBReader.UI.Dialogs.popupPreferences).on('popupafterclose', function() {
        RB.UI.closePalette();
    });

    // click/tap
    RB.UI.getElement(RB.EPUBReader.UI.divContentContainer).on('click', function(e) {
        e.stopImmediatePropagation();
        RB.EPUBReader.onClick(e);
    });
    
    // click on extra
    RB.UI.getElement(RB.EPUBReader.UI.divFooterExtra).on('click', RB.EPUBReader.onClickOnExtra);
    
    // bind gestures
    var bindings = {
        'doubletap':  RB.EPUBReader.onDoubleTap,
        'tap':        RB.EPUBReader.onTap,
        'swipeleft':  RB.EPUBReader.onSwipeLeft,
        'swiperight': RB.EPUBReader.onSwipeRight,
        'two':        RB.EPUBReader.onTwoFingersTap,
      //'pinchin':    RB.EPUBReader.onPinchIn,          // NOTE removed since it blocks vertical scrolling
      //'pinchout':   RB.EPUBReader.onPinchOut,         // NOTE removed since it blocks vertical scrolling
    };
    RB.UI.bindHammerEvents(RB.EPUBReader.UI.divContentContainer, bindings);
};

// process click on extra panel
RB.EPUBReader.onClickOnExtra = function(e) {
    // click on anchor?
    var link = RB.EPUBReader.detectTouchEventOnLink(e);
    if (link) {
        /*
        // TODO shall we handle these two cases separately?
        if (link['kind'] === 'noteref') {
            RB.EPUBReader.openNote(link['url'], link['from']);
        }
        if (link['kind'] === 'parallel') {
            RB.EPUBReader.openParallel(link['url'], link['from']);
        }
        */
        if (link['kind'] === 'external') {
            RB.EPUBReader.openExternalURL(link['url'], link['from']);
        }
        if (link['kind'] === 'internal') {
            var s = RB.Utilities.splitHref(link['url']);
            if ((s[0]) && (s[1]) && (s[0] === RB.EPUBReader.epubPlayer.getCurrentAssetHref())) {
                if (s[1] === RB.EPUBReader.footer.getNoteOriginID()) {
                    // link to the note origin => close note and highlight point
                    RB.EPUBReader.footer.hideExtra();
                    if (RB.EPUBReader.highlightNoteLinkTarget) {
                        var tmpH = RB.UI.temporaryHighlight(s[1]);
                        tmpH();
                    }
                } else {
                    // into the same XHTML file => interpret it as a note
                    RB.EPUBReader.openNote(link['url'], link['from']);
                }
            } else {
                // not into the same XHTML file => interpret it as a navigation link
                RB.EPUBReader.openInternalLink(link['url'], link['from']);
            }
        }
        return;
    }
    
    // otherwise, close the extra panel
    RB.EPUBReader.footer.hideExtra();
};

// process click
RB.EPUBReader.onClick = function(e) {
    
    // click on anchor?
    var link = RB.EPUBReader.detectTouchEventOnLink(e);
    if (link) {
    
        if (link['kind'] === 'noteref') {
            RB.EPUBReader.openNote(link['url'], link['from']);
        }
        if (link['kind'] === 'parallel') {
            RB.EPUBReader.openParallel(link['url'], link['from']);
        }
        if (link['kind'] === 'external') {
            RB.EPUBReader.openExternalURL(link['url'], link['from']);
        }
        if (link['kind'] === 'internal') {
            var s = RB.Utilities.splitHref(link['url']);
            if ((RB.EPUBReader.noteLinkDetection) && (s[0]) && (s[1]) && (s[0] === RB.EPUBReader.epubPlayer.getCurrentAssetHref())) {
                // into the same XHTML file => interpret it as a note
                RB.EPUBReader.openNote(link['url'], link['from']);
            } else {
                // not into the same XHTML file => interpret it as a navigation link
                RB.EPUBReader.openInternalLink(link['url'], link['from']);
            }
        }
        return;
    }
    
    // click on MO?
    var mo = RB.EPUBReader.detectTouchEventOnMO(e);
    if ((mo) && (!RB.EPUBReader.preventAudio)) {
        RB.EPUBReader.epubPlayer.playFromMOFragment(mo['from'], true);
        return;
    }
    
    // click on <audio> or <video> ?
    var av = RB.EPUBReader.detectTouchEventOnElement(e, ['audio', 'video']);
    if (av) {
        // nop
        // TODO ensure that all the necessary assets (e.g., those in src) are unzipped
        return;
    }
    
    // click on <input> ?
    var input = RB.EPUBReader.detectTouchEventOnElement(e, ['button', 'input', 'canvas', 'iframe', 'select', 'optgroup', 'datalist', 'textarea', 'progress', 'meter', 'form', 'label']);
    if (input) {
        // nop
        return;
    }
   
    // disabled touch? 
    if (!RB.EPUBReader.actionZonesEnabled) {
        return;
    }

    // reached here => trigger the appropriate command based on screen zone
    var clickX = e.clientX || e.pageX;
    var clickY = e.clientY || e.pageY;
    var screenZone = RB.UI.getScreenZoneClicked(clickX, clickY);
    var action = RB.EPUBReader.availableZoneActions[RB.EPUBReader.actions[screenZone]];
    if (action) {
        action();
    }
};
RB.EPUBReader.onTap = function(e) {
    // do not put anything here
    // a click event has been dispatched already
    // see the above onClick
};
RB.EPUBReader.onDoubleTap = function(e) {
    // double tap on image => open it full screen
    if ((RB.UI.isImage(e)) && (e.target.id)) {
        RB.UI.openImageFullScreen(e.target.id, e.target.src, 'fullscreen');
        return;
    }
    
    // click on anchor?
    var link = RB.EPUBReader.detectTouchEventOnLink(e);
    if (link) {
        if (link['kind'] === 'noteref') {
            RB.EPUBReader.openInternalLink(link['url'], link['from']);
        }
        if (link['kind'] === 'parallel') {
            RB.EPUBReader.openInternalLink(link['url'], link['from']);
        }
        if (link['kind'] === 'external') {
            RB.EPUBReader.openExternalURL(link['url'], link['from']);
        }
        if (link['kind'] === 'internal') {
            var s = RB.Utilities.splitHref(link['url']);
            if ((RB.EPUBReader.noteLinkDetection) && (s[0]) && (s[1]) && (s[0] === RB.EPUBReader.epubPlayer.getCurrentAssetHref())) {
                // into the same XHTML file => interpret it as a note
                // reverse the regular click behavior
                RB.EPUBReader.openInternalLink(link['url'], link['from']);
            } else {
                // not into the same XHTML file => interpret it as a navigation link
                // reverse the regular click behavior
                RB.EPUBReader.openNote(link['url'], link['from']);
            }
        }
        return;
    }
    
    // otherwise, use default action
    if (RB.EPUBReader.doubleTapGesture === 'preferences') {
        RB.EPUBReader.openPreferences();
    } else if (RB.EPUBReader.doubleTapGesture === 'toc') {
        RB.EPUBReader.openPlaylistOrTOC();
    } else if (RB.EPUBReader.doubleTapGesture === 'touch') {
        RB.EPUBReader.toggleTouch();
    }
};
RB.EPUBReader.onTwoFingersTap = function(e) {
    // double two on image => detach it
    if ((RB.UI.isImage(e)) && (e.target.id)) {
        RB.UI.openImageFullScreen(e.target.id, e.target.src, 'detach');
        return;
    }
    
    // otherwise, use default action
    if (RB.EPUBReader.twoFingersTapGesture === 'preferences') {
        RB.EPUBReader.openPreferences();
    } else if (RB.EPUBReader.twoFingersTapGesture === 'toc') {
        RB.EPUBReader.openPlaylistOrTOC();
    } else if (RB.EPUBReader.twoFingersTapGesture === 'touch') {
        RB.EPUBReader.toggleTouch();
    }
};
RB.EPUBReader.openPlaylistOrTOC = function() {
    if (RB.EPUBReader.epubPlayer) {
        if (RB.EPUBReader.epubPlayer.hasMediaOverlays()) {
            RB.EPUBReader.openPlaylist();
        } else {
            RB.EPUBReader.openTOC();
        }
    }
};
RB.EPUBReader.toggleTouch = function() {
    RB.EPUBReader.actionZonesEnabled = !RB.EPUBReader.actionZonesEnabled;
    var msg = 'txtEPUBTouchEnabled';
    if (!RB.EPUBReader.actionZonesEnabled) {
        msg = 'txtEPUBTouchDisabled';
    }
    RB.UI.showNotification(RB.UI.i18n(msg));
};

// detect touch events
RB.EPUBReader.detectTouchEventOnMO = function(e) {
    if ((RB.EPUBReader.epubPlayer) && (RB.EPUBReader.epubPlayer.hasMediaOverlays()) && (RB.EPUBReader.drs.getValue('EPUB_TAP_TO_PLAY'))) {
        // see if the clicked element is a MO fragment
        var element = e.target;
        while (element) {
            var element_id = element.id;
            
            // MO fragment
            if (RB.EPUBReader.epubPlayer.isMOID(element_id)) {
                return { 'kind': 'mo', 'from': element_id };
            }
            
            // check parent
            element = element.parentNode;
        }
    }
    return null;
};
RB.EPUBReader.detectTouchEventOnElement = function(e, arr) {
    // see if the clicked element is a <name ...>, with name in arr
    var element = e.target;
    while (element) {
        if (arr.indexOf(element.nodeName.toLowerCase()) > -1) {
            // got it
            return element;
        }
        // check parent
        element = element.parentNode;
    }
    return null;
};
RB.EPUBReader.detectTouchEventOnLink = function(e) {
    // see if the clicked element is a link
    var element = e.target;
    while (element) {
        var element_id = element.id;
        
        // if <a> element
        if (element_id in RB.EPUBReader.patchedAElements) {
            var href      = RB.EPUBReader.patchedAElements[element_id];
            var outer     = element.outerHTML;
            var tmp       = 'file://' + RB.EPUBReader.assetManager.getAbsolutePathTmpDirectory();
            var relative  = RB.App.removePathPrefix(href, tmp);
        
            // epub note?
            // TODO implement correct parsing
            if ((outer.indexOf('epub:type') > -1) && (outer.indexOf('noteref') > -1) && (relative)) {
                return { 'kind': 'noteref', 'url': relative, 'from': element_id };
            }
            
            // parallel text?
            // TODO implement correct parsing
            // TODO plink is legacy
            if ((RB.EPUBReader.parallelLinkClass) && ((outer.indexOf(RB.EPUBReader.parallelLinkClass) > -1) || (outer.indexOf('plink') > -1)) && (relative)) {
                return { 'kind': 'parallel', 'url': relative, 'from': element_id };
            }
        
            // absolute?
            if ((href.length > 4) && (href.substring(0, 4) === 'http')) {
                return { 'kind': 'external', 'url': href, 'from': element_id };
            }
            if ((href.length > 3) && (href.substring(0, 3) === 'www')) {
                return { 'kind': 'external', 'url': 'http://' + href, 'from': element_id };
            }
        
            // relative?
            if (relative) {
                return { 'kind': 'internal', 'url': relative, 'from': element_id };
            }
        
            // unknown
            return { 'kind': 'unknown', 'from': element_id };
        }
        
        // check parent
        element = element.parentNode;
    }
    return null;
};

// handle back button
RB.EPUBReader.onBackButton = function() {
    // perform back action
    if (RB.UI.dialogOpen) {
        RB.UI.closePalette();
        RB.UI.closeDialog();
    } else {
        RB.EPUBReader.exit();
    }
};

// exit
RB.EPUBReader.exit = function() {
    if (RB.EPUBReader.confirmQuit) {
        RB.UI.openPopup(RB.EPUBReader.UI.Dialogs.popupQuit);
    } else {
        RB.EPUBReader.doExit();
    }
};
RB.EPUBReader.doExit = function() {
    // save reading position
    RB.EPUBReader.saveReadingPosition();
    
    // save reading settings
    RB.EPUBReader.drs.save();
    
    // delete tmp directory
    RB.EPUBReader.assetManager.deleteTmpDirectory();
    
    // dim system bar
    RB.UI.dimSystemBar();

    // go back
    RB.App.openPage(RB.App.PagesEnum.LIBRARY);
};

// called when the app is sent to background
RB.EPUBReader.onAppPause = function() {
    if (!RB.EPUBReader.backgroundAudio) {
        var state = RB.EPUBReader.epubPlayer.getMOState();
        if (state === 'playing') {
            RB.EPUBReader.playPause();
            RB.EPUBReader.appStatusBeforeBackgrounded = RB.App.AppStatusBeforeBackground.PLAYING;
        } else if (state === 'paused') {
            RB.EPUBReader.appStatusBeforeBackgrounded = RB.App.AppStatusBeforeBackground.PAUSED;
        } else {
            RB.EPUBReader.appStatusBeforeBackgrounded = RB.App.AppStatusBeforeBackground.STOPPED;
        }
    }
};

// called when the app is resumed from background
RB.EPUBReader.onAppResume = function() {
    if (RB.EPUBReader.appStatusBeforeBackgrounded === RB.App.AppStatusBeforeBackground.PLAYING) {
        RB.EPUBReader.playPause();
    }
    RB.EPUBReader.appStatusBeforeBackgrounded = null;
};

// on orientation change
RB.EPUBReader.onOrientationChange = function() {
    // trigger an onScreenSizeChanged event
    RB.App.delay(RB.EPUBReader.onScreenSizeChanged, RB.UI.ON_ORIENTATION_CHANGE_DELAY);
    
    // update epubReadingSystem
    if (RB.EPUBReader.runJavascript) {
        RB.EPUBReader.updateEPUBReadingSystem('orientation', true);
    }
};

// show/hide menu
RB.EPUBReader.onShowMenu = function() {
    RB.UI.show(RB.EPUBReader.UI.divHeader);
    RB.EPUBReader.resizeContentContainers();
};
RB.EPUBReader.onHideMenu = function() {
    RB.UI.hide(RB.EPUBReader.UI.divHeader);
    RB.EPUBReader.resizeContentContainers();
};

// perform the navigation action assigned by the user
// action = none, chapter, page
// parameter = -1 (prev) or 1 (next)
RB.EPUBReader.performNavigationAction = function(action, parameter) {
    if (action !== 'none') {
        var big = (action === 'chapter');
        if (parameter === -1) {
            RB.EPUBReader.goToPrevious(big);
        } else {
            RB.EPUBReader.goToNext(big);
        }
    }
};

// on swipe left/right
RB.EPUBReader.onSwipeGeneric = function(ev, parameter) {
    if (! RB.EPUBReader.preventSwipe) {
        RB.EPUBReader.preventPinch = true;
        RB.EPUBReader.preventSwipe = true;
        RB.App.delay(function() {
            RB.EPUBReader.preventPinch = false;
            RB.EPUBReader.preventSwipe = false;
        }, RB.EPUBReader.UI.DELAY_BEFORE_REENABLING_GESTURE);
        if (RB.EPUBReader.invertSwipe) {
            parameter = -parameter;
        }
        RB.EPUBReader.performNavigationAction(RB.EPUBReader.swipeGesture, parameter);
    }
};
RB.EPUBReader.onSwipeLeft = function(ev) {
    RB.EPUBReader.onSwipeGeneric(ev, 1);
};
RB.EPUBReader.onSwipeRight = function(ev) {
    RB.EPUBReader.onSwipeGeneric(ev, -1);
};

/*
// on pinch in/out
RB.EPUBReader.onPinchGeneric = function(parameter) {
    // increase/decrease
    if (! RB.EPUBReader.preventPinch) {
        RB.EPUBReader.preventPinch = true;
        RB.EPUBReader.preventSwipe = true;
        RB.EPUBReader.drs.changeValue('EPUB_FONT_SIZE', parameter, false);
        RB.App.delay(function() {
            RB.EPUBReader.preventPinch = false;
            RB.EPUBReader.preventSwipe = false;
        }, RB.EPUBReader.UI.DELAY_BEFORE_REENABLING_GESTURE);
    }
};
RB.EPUBReader.onPinchIn = function(ev) {
    RB.EPUBReader.onPinchGeneric(-1);
};
RB.EPUBReader.onPinchOut = function(ev) {
    RB.EPUBReader.onPinchGeneric(1);
};
*/

// open internal link
RB.EPUBReader.openInternalLink = function(url, from) {
    RB.EPUBReader.epubPlayer.goToRODItemByHref(url, { 'kind': 'highlight', 'url': url, 'from': from });
};

// open note in bottom panel
RB.EPUBReader.openNote = function(url, from) {
    if (RB.EPUBReader.openNoteLinksInBottomPanel) {
        RB.EPUBReader.putinExtraFromURL(url, from);
    } else {
        RB.EPUBReader.openInternalLink(url, from);
    }
};

// open parallel text in bottom panel
RB.EPUBReader.openParallel = function(url, from) {
    if (RB.EPUBReader.openParallelLinksInBottomPanel) {
        RB.EPUBReader.putinExtraFromURL(url, from);
    } else {
        RB.EPUBReader.openInternalLink(url, from);
    }
};

// common to note/parallel (for now)
RB.EPUBReader.putinExtraFromURL = function(url, from) {
    if (RB.EPUBReader.footer.getNoteID() === url) {
        RB.EPUBReader.footer.hideExtra();
    } else {
        // add <p><a>Link...</a></p> ?
        var linkP = null;
        if (RB.EPUBReader.addLinkExtra) {
            var linkA = document.createElement('a');
            linkA.onclick = function(ev) {
                RB.EPUBReader.footer.hideExtra();
                RB.EPUBReader.epubPlayer.goToRODItemByHref(url, { 'kind': 'highlight', 'url': url, 'from': from });
                ev.stopPropagation();
            }
            linkA.textContent = RB.UI.i18n('linkExtraOpenMore');
            
            linkP = document.createElement('p');
            // TODO add a CSS class instead of this
            linkP.style.textAlign  = 'right';
            linkP.style.fontWeight = 'bold';
            
            linkP.appendChild(linkA);
        }
        
        var s = RB.Utilities.splitHref(url);
        if ((s[0]) && (s[1])) {
            var element = null;
            if (s[0] === RB.EPUBReader.epubPlayer.getCurrentAssetHref()) {
                element = document.getElementById(s[1]);
            } else {
                var file_path = RB.App.joinPaths(['file://' + RB.EPUBReader.assetManager.getAbsolutePathTmpDirectory(), s[0]]);
                var xml       = RB.Utilities.loadXMLFile(file_path);
                if (xml) {
                    element   = xml.getElementById(s[1]);
                }
            }
            if (element) {
                RB.EPUBReader.footer.putInExtra(url, from, linkP, element);
                RB.EPUBReader.footer.showExtra();
            }
        }
    }
};

// open external URL
RB.EPUBReader.openExternalURL = function(url, from) {
    RB.App.openExternalURL(url);
};

// populate and open ToC popup
RB.EPUBReader.openTOC = function() {
    RB.EPUBReader.tocItemHighlighted = null;
    var toc = RB.EPUBReader.epubPlayer.getTOC();
    var s   = '';
    
    // append TOC title item
    s += '<li data-icon="delete"><a href="#" onclick="RB.UI.closeDialog();"><b>' + RB.UI.i18n('txtTOC') + '</b></a></li>';
    
    // append ToC
    //
    // TODO collapsible inside ToC does not look right => for now, we do not use them
    //
    /*
    var s   = '<li><a href="#" onclick="alert(\'hi!\');">Item A</a></li>';
        s  += '<li><a href="#" onclick="alert(\'hi!\');">Item B</a></li>';
        s  += '<li>';
        s  += '<div data-role="collapsible" data-collapsed-icon="chevron-right" data-expanded-icon="chevron-down" data-theme="b">';
        s  += '  <h3><a href="#" onclick="alert(\'hi!\');">Item C</a></h3>';
        s  += '  <ul data-role="listview">';
        s  += '   <li><a href="#">Nested 1</a></li>';
        s  += '   <li><a href="#">Nested 2</a></li>';
        s  += '   <li><a href="#">Nested 3</a></li>';
        s  += '  </ul>';
        s  += '</div>';
        s  += '</li>';
    */
    s += RB.EPUBReader.appendTOC(toc, 'tocitem-', 0);
    
    // add close item
    s += '<li data-icon="chevron-right"><a href="#" onclick="RB.UI.closeDialog();">' + RB.UI.i18n('txtTOCClose') + '</a></li>';
    
    // populate listview
    RB.UI.empty('lstTOC');
    RB.UI.append('lstTOC', s);
    RB.UI.refreshListview('lstTOC');
    
    var id = RB.EPUBReader.UI.Dialogs.popupTOC;
    if (RB.EPUBReader.tocItemHighlighted) {
        RB.App.delay(function() {
            RB.UI.addClass(RB.EPUBReader.tocItemHighlighted, 'toc-item-highlighted');
            var h = RB.UI.getHeight(id);
            RB.UI.scrollTo(id, RB.EPUBReader.tocItemHighlighted, -h/3, 0);
        }, 100);
    }
    RB.UI.openSidePopup(id, RB.EPUBReader.UI.divHeader, RB.EPUBReader.UI.divFooterAll, 0.8);
};
RB.EPUBReader.appendTOC = function(arr, toc_item_id_prefix, depth) {
    //var previous_was_collapsible = false;
    var s                        = '';
    var spacer                   = 'padding-left:' + (2 * depth) + 'em;';
    var rod                      = RB.EPUBReader.epubPlayer.getROD();
    var currentAsset             = RB.EPUBReader.epubPlayer.getCurrentAssetHref();
    var currentAnchor            = RB.EPUBReader.epubPlayer.getCurrentAssetAnchor();
    if (currentAnchor) {
        currentAsset += '#' + currentAnchor;
    }
    
    for (var i = 0; i < arr.length; i++) {
        var item      = arr[i];
        var rod_index = rod.getRODIndexByHref(item.href);
        var label     = item.label;
        var children  = item.children;
        
        var item_href = item.href;
        if (item.anchor) {
            item_href += '#' + item.anchor;
        }
        var current_toc_item_id = toc_item_id_prefix + i;
        
        // TODO a better way of handling this?
        var callClose  = '';
        if (RB.EPUBReader.closeTOCImmediately) {
            callClose  = ' RB.UI.closeDialog(); ';
        } else {
            callClose  = ' RB.UI.removeClass(RB.EPUBReader.tocItemHighlighted, \'toc-item-highlighted\'); ';
            callClose += ' RB.EPUBReader.tocItemHighlighted = \'' + current_toc_item_id + '\'; ';
            callClose += ' RB.UI.addClass(RB.EPUBReader.tocItemHighlighted, \'toc-item-highlighted\'); ';
        }
        
        if ((!RB.EPUBReader.tocItemHighlighted) && (currentAsset === item_href)) {
            RB.EPUBReader.tocItemHighlighted = current_toc_item_id;
        }

        // prepend star to elements with audio
        var audioSymbol = '';
        if ((rod_index) && (rod.rod[rod_index]) && (rod.rod[rod_index]['valid_mo'])) {
            audioSymbol = RB.EPUBReader.CURRENT_ASSET_HAS_AUDIO_SYMBOL;
        }
        
        // TODO refactoring needed!
        
        // if nested, append children
        if ((children !== null) && (children.length > 0)) {
            
            /*
            // open collapsible
            s += '<li>';
            //s += '<a>';
            s += '<div data-role="collapsible" data-collapsed="true" data-iconpos="right">';
            s += '<h4>' + item.label + '</h4>';
            s += '<ul data-role="listview">';
            
            if (rod_index !== null) {
                s += '<li id="' + current_toc_item_id + '" data-icon="chevron-right">';
                s += '<a href="#" onclick="RB.EPUBReader.epubPlayer.goToRODItemByHref(\'' + item_href + '\'); ' + callClose + '">';
                s += item.label;
                s += '<span class="ui-li-count">' + audioSymbol + '</span>';
                s += '</a>';
                s += '</li>';
            }
            
            s += RB.EPUBReader.appendTOC(children, current_toc_item_id + '-');
            
            s += '</ul>';
            s += '</div>';
            //s += '</a>';
            s += '</li>';
            */
            
            // open collapsible
            if (rod_index !== null) {
                s += '<li id="' + current_toc_item_id + '" data-icon="chevron-right" style="' + spacer + '">';
                s += '<a href="#" onclick="RB.EPUBReader.epubPlayer.goToRODItemByHref(\'' + item_href + '\'); ' + callClose + '">';
                s += label;
                s += '<span class="ui-li-count">' + audioSymbol + '</span>';
                s += '</a></li>';
            } else {
                s += '<li id="' + current_toc_item_id + '" style="' + spacer + '">';
                s += '<a href="#">';
                s += label;
                s += '</a></li>';
            }
            
            s += RB.EPUBReader.appendTOC(children, current_toc_item_id + '-', depth + 1);
            
            //previous_was_collapsible = true;
            
        } else {
            /*
            if (previous_was_collapsible) {
                // TODO tweak class?
            }
            // set flag
            previous_was_collapsible = false;
            */
            
            if (rod_index !== null) {
                s += '<li id="' + current_toc_item_id + '" data-icon="chevron-right" style="' + spacer + '">';
                s += '<a href="#" onclick="RB.EPUBReader.epubPlayer.goToRODItemByHref(\'' + item_href + '\'); ' + callClose + '">';
                s += label;
                s += '<span class="ui-li-count">' + audioSymbol + '</span>';
                s += '</a></li>';
            } else {
                s += '<li id="' + current_toc_item_id + '" style="' + spacer + '">';
                s += '<a href="#">';
                s += label;
                s += '</a></li>';
            }
        }
    }
    return s;
};

// populate and open playlist popup
RB.EPUBReader.openPlaylist = function() {
    RB.EPUBReader.playlistItemHighlighted = null;
    var playlist = RB.EPUBReader.epubPlayer.getPlaylist();
    var numberOfDigits = (playlist.length + '').length;
    var trackMask = '%0' + numberOfDigits + 'd';
    var padding = '';
    for (var i = 0; i < numberOfDigits + 1; i++) {
        padding += '&#160;';
    }
    
    // append playlist title item
    var s = '';
    s += '<li data-icon="delete"><a href="#" onclick="RB.UI.closeDialog();">';
    s += '<span class="playlistNumber">' + padding + '</span>';
    s += '<b>' + RB.UI.i18n('txtPlaylist') + '</b></a></li>';
    
    for (var i = 0; i < playlist.length; i++) {
        var item      = playlist[i];
        var label     = item.label;
        var duration  = item.duration;
        var item_href = item.href;
        
        var current_playlist_item_id = 'playlist-item-' + i;
        
        // TODO a better way of handling this?
        var callClose  = '';
        if (RB.EPUBReader.closePlaylistImmediately) {
            callClose  = ' RB.UI.closeDialog(); ';
        } else {
            callClose  = ' RB.UI.removeClass(RB.EPUBReader.playlistItemHighlighted, \'playlist-item-highlighted\'); ';
            callClose += ' RB.EPUBReader.playlistItemHighlighted = \'' + current_playlist_item_id + '\'; ';
            callClose += ' RB.UI.addClass(RB.EPUBReader.playlistItemHighlighted, \'playlist-item-highlighted\'); ';
        }
        
        // if no label was found, use a generic label
        if ((label === null) || (label === '')) {
            label = RB.UI.i18n('txtNoLabelTrack');
        }
        
        if (item_href === RB.EPUBReader.epubPlayer.getCurrentAssetHref()) {
            RB.EPUBReader.playlistItemHighlighted = current_playlist_item_id;
        }
        
        s += '<li id="' + current_playlist_item_id + '" data-icon="chevron-right"><a href="#" onclick="RB.EPUBReader.epubPlayer.goToRODItemByHref(\'' + item_href + '\'); ' + callClose + '">';
        s += '<span class="playlistNumber">' + sprintf(trackMask, i+1) + ' </span>';
        s += label;
        s += ' <span class="ui-li-count">' + duration + '</span>';
        s += '</a></li>';
    }
    
    // add close item
    s += '<li data-icon="chevron-right"><a href="#" onclick="RB.UI.closeDialog();">';
    s += '<span class="playlistNumber">' + padding + '</span>';
    s += RB.UI.i18n('txtPlaylistClose');
    s += ' <span class="ui-li-count">' + RB.EPUBReader.epubPlayer.getMediaDuration() + '</span>';
    s += '</a></li>';
    
    // populate listview
    RB.UI.empty('lstPlaylist');
    RB.UI.append('lstPlaylist', s);
    RB.UI.refreshListview('lstPlaylist');
    
    var id = RB.EPUBReader.UI.Dialogs.popupPlaylist;
    if (RB.EPUBReader.playlistItemHighlighted) {
        RB.App.delay(function() {
            // TODO better collapse/hightling
            RB.UI.addClass(RB.EPUBReader.playlistItemHighlighted, 'playlist-item-highlighted');
            var h = RB.UI.getHeight(id);
            RB.UI.scrollTo(id, RB.EPUBReader.playlistItemHighlighted, -h/3, 0);
        }, 100);
    }
    RB.UI.openSidePopup(id, RB.EPUBReader.UI.divHeader, RB.EPUBReader.UI.divFooterAll, 0.8);
};

// save reading position
RB.EPUBReader.saveReadingPosition = function() {
    var saveme = RB.EPUBReader.epubPlayer.getPosition();
    saveme['pagination']    = RB.EPUBReader.panels.getPagination();
    saveme['currentpage']   = RB.EPUBReader.panels.getCurrentPage();
    saveme['currentscroll'] = RB.EPUBReader.panels.getCurrentScroll();
    RB.App.saveItemData(RB.EPUBReader.itemID, ['position', RB.Plugins.Format.formatNames.EPUB], saveme);
};

// stop MO audio
RB.EPUBReader.stop = function() {
    RB.EPUBReader.epubPlayer.stop();
    RB.EPUBReader.onMOTimer(0);
};
// play/pause MO audio
RB.EPUBReader.playPause = function() {
    if (!RB.EPUBReader.preventAudio) {
        RB.EPUBReader.epubPlayer.playPause();
        RB.EPUBReader.ensureCurrentMOIsVisible();
    }
};
RB.EPUBReader.pause = function() {
    if (!RB.EPUBReader.preventAudio) {
        RB.EPUBReader.epubPlayer.pause();
    }
};
RB.EPUBReader.play = function() {
    if (!RB.EPUBReader.preventAudio) {
        RB.EPUBReader.epubPlayer.play();
    }
};


// perform visual positioning
// (e.g., scroll to top, or ensure current MO fragment is visible)
// after the asset has been loaded
// or some other event that might have changed the viewport and/or its contents took place
RB.EPUBReader.performVisualPositioning = function(action, parameter, avoidResetPanels) {
    var pagination = RB.EPUBReader.panels.getPagination();
    if (pagination === 'reflowable-scroll') {
        if (action === 'first') {
            RB.EPUBReader.panels.goToFirstPage();
        }
        if (action === 'last') {
            RB.EPUBReader.panels.goToLastPage();
        }
        if (action === 'element') {
            RB.EPUBReader.panels.ensureElementIsVisible(parameter);
        }
        if (action === 'scroll') {
            RB.EPUBReader.panels.scroll(parameter);
        }
    }
    if (pagination === 'reflowable-paginate') {
        // define action
        var onReady = function() {
            if (action === 'first') {
                RB.EPUBReader.panels.goToFirstPage();
            }
            if (action === 'last') {
                RB.EPUBReader.panels.goToLastPage();
            }
            if (action === 'element') {
                RB.EPUBReader.panels.ensureElementIsVisible(parameter);
            }
            if (action === 'page') {
                RB.EPUBReader.panels.goToPage(parameter);
            }
        };
        if (avoidResetPanels) {
            // ugly delay to allow settling CSS pagination
            RB.App.delay(onReady, 100);
        } else {
            // call onReady AFTER the panels have been reset
            RB.EPUBReader.panels.resetPanels(onReady);
        }
    }
};

RB.EPUBReader.goToPreviousMO = function() {
    if (!RB.EPUBReader.preventAudio) {
        RB.EPUBReader.epubPlayer.goToPreviousMO();
    }
};
RB.EPUBReader.ensureCurrentMOIsVisible = function() {
    if (RB.EPUBReader.epubPlayer) {
        var moID = RB.EPUBReader.epubPlayer.getCurrentMOID();
        if (moID) {
            RB.EPUBReader.performVisualPositioning('element', moID, false);
        }
    }
};
RB.EPUBReader.goToNextMO = function() {
    if (!RB.EPUBReader.preventAudio) {
        RB.EPUBReader.epubPlayer.goToNextMO();
    }
};

RB.EPUBReader.goToPreviousChapter = function() {
    RB.EPUBReader.goToPrevious(true);
};
RB.EPUBReader.goToPreviousPage = function() {
    RB.EPUBReader.goToPrevious(false);
};
RB.EPUBReader.goToPrevious = function(big) {
    var pagination = RB.EPUBReader.panels.getPagination();
    if ((big) || (pagination === 'pre-paginated') || (RB.EPUBReader.panels.isFirstPage())) {
        // go to prev chapter
        var arg = 'last';
        if (RB.EPUBReader.scrollToTopOnPreviousChapter) {
            arg = 'first';
        }
        RB.EPUBReader.epubPlayer.goToPreviousRODItem({'kind': arg});
    } else {
        // go to prev page
        RB.EPUBReader.panels.goToPreviousPage();
    }
};

RB.EPUBReader.goToNextChapter = function() {
    RB.EPUBReader.goToNext(true);
};
RB.EPUBReader.goToNextPage = function() {
    RB.EPUBReader.goToNext(false);
};
RB.EPUBReader.goToNext = function(big) {
    var pagination = RB.EPUBReader.panels.getPagination();
    if ((big) || (pagination === 'pre-paginated') || (RB.EPUBReader.panels.isLastPage())) {
        // go to next chapter
        RB.EPUBReader.epubPlayer.goToNextRODItem({'kind': 'first'});
    } else {
        // go to next page
        RB.EPUBReader.panels.goToNextPage();
    }
};








// generic error message
RB.EPUBReader.onErrorLoadingEPUBFile = function() {
    RB.UI.showSpinner(false);
    RB.App.message('A fatal error occurred while reading this EPUB file.', RB.App.MessageSeverityEnum.CRITICAL);
    RB.App.openPage(RB.App.PagesEnum.LIBRARY);
};

// load contents
RB.EPUBReader.loadContents = function() {
    // more local setup (e.g., from storage) here, if necessary
    
    // load
    RB.EPUBReader.performUnzipAll();
};

// unzip all or call init completed
RB.EPUBReader.performUnzipAll = function() {
    if (RB.EPUBReader.unzipAll) {
        RB.EPUBReader.assetManager.unzipAll(RB.EPUBReader.unzipCompleted, RB.EPUBReader.onErrorLoadingEPUBFile);
    } else {
        RB.EPUBReader.unzipCompleted();
    }
};

// create epubPlayer
RB.EPUBReader.unzipCompleted = function() {
    var options                                = {};
    options['mode']                            = RB.Storage.get(RB.Storage.Keys.MEDIAPLAYER_MODE);
    options['enablePlaybackSpeed']             = RB.Storage.isAppParameterTrue(RB.Storage.Keys.MEDIAPLAYER_ENABLE_PLAYBACK_SPEED);
    options['sourceWrapperID']                 = RB.EPUBReader.UI.divSourceContainer;
    
    options['autoStart']                       = RB.EPUBReader.autoStartAudio;
    options['showSpinner']                     = true;
    options['preload']                         = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_PRELOAD_PREV_NEXT);
    options['enableReadBeyondHacks']           = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_ENABLE_READBEYOND_HACKS);
    options['runJavascript']                   = RB.EPUBReader.runJavascript;
    options['stripCSS']                        = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_STRIP_CSS);
    options['injectCustomCSS']                 = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_INJECT_CUSTOM_CSS);
    options['errorCallback']                   = RB.EPUBReader.onErrorLoadingEPUBFile;
    options['initializedCallback']             = RB.EPUBReader.initializationCompleted;
    options['renderedCallback']                = RB.EPUBReader.onAssetRendered;
    options['renderToElementID']               = RB.EPUBReader.UI.divContentColumn;
    options['customCSSFileName']               = RB.EPUBReader.customCSSFileName;
    options['skipNonLinear']                   = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_SKIP_NON_LINEAR);
    options['treatNonLinearAsCulDeSac']        = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_TREAT_NON_LINEAR_AS_CUL_DE_SAC);
    
    // MO related
    options['moCompletedCallback']             = RB.EPUBReader.onMOCompleted;
    options['moStateChangedCallback']          = RB.EPUBReader.onMOStateChanged;
    options['moActiveFragmentChangedCallback'] = RB.EPUBReader.onMOActiveFragmentChanged;
    options['moTimerCallback']                 = RB.EPUBReader.onMOTimer;
    
    RB.EPUBReader.epubPlayer                   = new RB.EPUBReader.EPUBRenderer(RB.EPUBReader.assetManager, options);
};

// epubPlayer created
RB.EPUBReader.initializationCompleted = function() {
    var epub = RB.EPUBReader.epubPlayer;
    
    // set title
    RB.EPUBReader.setTitle(epub.getTitle());
    
    // FXL?
    var isFXL = RB.EPUBReader.epubPlayer.hasPrePaginated();
    if ((isFXL) && (!(RB.EPUBReader.allowFXL))) {
        RB.App.message(RB.UI.i18n('txtFXLNotAllowed'), RB.App.MessageSeverityEnum.INFO);
        RB.App.openPage(RB.App.PagesEnum.LIBRARY);
        return;
    }
    
    // has Media Overlays?
    var hasMO = RB.EPUBReader.epubPlayer.hasMediaOverlays();
    
    // isAudioeBook?
    var isAudioeBook = (hasMO) && (! isFXL);

    // is from ReadBeyond/Smuuks?
    var isOK = true;
    if (RB.EPUBReader.enableReadBeyondHacks) {
        var a = RB.EPUBReader.epubPlayer.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_CREATOR,     false, true);
        var c = RB.EPUBReader.epubPlayer.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_CONTRIBUTOR, false, true);
        var p = RB.EPUBReader.epubPlayer.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_PUBLISHER,   false, true);
        var acp = (a + ' ' + c + ' ' + p).toLowerCase();
        isOK = ((isAudioeBook) || (acp.indexOf('readbeyond') > -1) || (acp.indexOf('smuuks') > -1) || (acp.indexOf('pettarin') > -1));
    }
   
    // do we have a parallel:link-class meta in OPF?
    RB.EPUBReader.parallelLinkClass = RB.EPUBReader.epubPlayer.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.PARALLEL_LINK_CLASS, true, true);

    // set footer
    RB.EPUBReader.footer.initialize(hasMO, RB.EPUBReader.showSlider, RB.EPUBReader.showBottomBar, RB.EPUBReader.showQuickBar);
    
    // set playback volume and speed
    if (hasMO) {
        RB.EPUBReader.epubPlayer.setVolume(        RB.EPUBReader.drs.getValue('EPUB_PLAYBACK_VOLUME'));
        RB.EPUBReader.epubPlayer.setPlaybackSpeed( RB.EPUBReader.drs.getValue('EPUB_PLAYBACK_SPEED') );
        RB.EPUBReader.epubPlayer.setApplyHighlight(RB.EPUBReader.drs.getValue('EPUB_APPLY_HIGHLIGHT'));
        RB.EPUBReader.epubPlayer.setHighlightStyle(RB.EPUBReader.drs.getValue('EPUB_HIGHLIGHT_STYLE'));
    }

    // open at saved position
    var saved       = RB.App.readItemData(RB.EPUBReader.itemID, ['position', RB.Plugins.Format.formatNames.EPUB]);
    var assetHref   = null;
    var assetAnchor = null;
    var assetMOID   = null;
    if (saved) {
        assetHref   = saved['assetHref'];
        assetAnchor = saved['assetAnchor'];
        assetMOID   = saved['assetMOID'];
    }
    if (assetHref) {
        var goToTriggeredByUser = null;
        var pagination = RB.EPUBReader.panels.getPagination();
        if ((pagination === 'reflowable-paginate') && (saved['currentpage'] !== null)) {
            goToTriggeredByUser = { 'kind': 'page', 'value': saved['currentpage'] };
        }
        if ((pagination === 'reflowable-scroll') && (saved['currentscroll'] !== null)) {
            goToTriggeredByUser = { 'kind': 'scroll', 'value': saved['currentscroll'] };
        }
        RB.EPUBReader.epubPlayer.setPosition(assetHref, assetAnchor, assetMOID, goToTriggeredByUser);
    } else {
        // not previously opened
        
        // go to the first asset according to user preferences
        RB.EPUBReader.epubPlayer.setPositionToFirstItem(RB.EPUBReader.openFirstChapterWithAudio);
    }
    
    // show first time/notice popup?
    var showFirstTimePopup = ((assetHref === null) && (RB.EPUBReader.showFirstTimePopup));
    var showNoticePopup = ((RB.EPUBReader.showWarningOnNotAudioeBook) && (!isOK));
    if (showNoticePopup) {
        // if we display the notice popup, we should not display the first time popup
        // TODO allow displaying both, or remove this popup notice
        showFirstTimePopup = false;
        RB.UI.openPopup(RB.EPUBReader.UI.Dialogs.popupNotice);
    }
    if (showFirstTimePopup) {
        RB.UI.openPopup(RB.EPUBReader.UI.Dialogs.popupFTP);
    }
};

RB.EPUBReader.onAssetRendered = function(parameter) {
    // get rendition layout
    var renditionLayout = RB.EPUBReader.epubPlayer.getCurrentAssetRenditionLayout();
    
    // has audio?
    var hasMO = RB.EPUBReader.epubPlayer.currentAssetHasAudio();
    
    // inform footer and panels about the current rendition layout
    RB.EPUBReader.footer.assetLayout(renditionLayout);
    
    // show/hide controls
    RB.UI.showHide('colPreferencesPopupTypo',    (renditionLayout === 'reflowable'));
    RB.UI.showHide('colPreferencesPopupMargins', (renditionLayout === 'reflowable'));
    RB.UI.showHide(RB.EPUBReader.UI.colPreferencesPopupAudio,  hasMO);
    //RB.UI.showHide(RB.EPUBReader.UI.divPreferencesDialogAudio, hasMO);
    if (hasMO) {
        // expand audio
        RB.UI.expand(RB.EPUBReader.UI.colPreferencesPopupAudio);
    } else {
        // expand text
        RB.UI.expand(RB.EPUBReader.UI.colPreferencesPopupTypo);
    }
    
    // reflowable
    if (renditionLayout === 'reflowable') {
        
        var title = RB.EPUBReader.epubPlayer.getTitle();
        var assetTitle = RB.EPUBReader.epubPlayer.getAssetTitle();
        if (assetTitle) {
            title = assetTitle + ' — ' + title; // em-dash
        }
        
        if (hasMO) {
            RB.EPUBReader.footer.assetHasAudio(true);
            var assetPlaylistIndex = RB.EPUBReader.epubPlayer.getAssetPlaylistIndex();
            var playlistLength = RB.EPUBReader.epubPlayer.getPlaylistLength();
            if ((assetPlaylistIndex !== null) && (playlistLength !== null)) {
                title = '[' + assetPlaylistIndex + '/' + playlistLength + '] ' + title;
            }
        } else {
            RB.EPUBReader.footer.assetHasAudio(false);
        }
        RB.EPUBReader.setTitle(title);
        RB.EPUBReader.currentMODuration = null;
        
        // do we have an afterRendered action to perform?
        var afterRendered = null;
        if (parameter) {
            afterRendered = parameter['kind'];
        }
        
        // highlightnote ?
        if ((afterRendered === 'highlightnote') && (parameter['anchor']) && (renditionLayout !== 'pre-paginated')) {
            var anchor = parameter['anchor'];
            RB.EPUBReader.performVisualPositioning('element', anchor);
            if (RB.EPUBReader.highlightNoteLinkTarget) {
                var tmpH = RB.UI.temporaryHighlight(anchor, RB.EPUBReader.UI.DELAY_BEFORE_REMOVING_HIGHLIGHTING);
                tmpH();
            }
            return;
        }

        // mo?
        if (hasMO) {
            // set slider
            RB.EPUBReader.currentMODuration = RB.EPUBReader.epubPlayer.getLinearizedMODuration();
            RB.UI.setAttr(RB.EPUBReader.UI.sliderID, 'max', RB.EPUBReader.currentMODuration);
        
            // play if autoStartAudio is true
            if (RB.EPUBReader.autoStartAudio) {
                RB.EPUBReader.play();
            }
        
            // ensure current MO is visible
            RB.App.delay(RB.EPUBReader.ensureCurrentMOIsVisible, 100);
            
            return;
        }
        
        // anchor?
        var anchor = RB.EPUBReader.epubPlayer.getCurrentAssetAnchor();
        if (anchor) {
            RB.EPUBReader.performVisualPositioning('element', anchor);
            if ((afterRendered === 'highlight') && (parameter['url']) && (renditionLayout !== 'pre-paginated')) {
                var anchor = RB.Utilities.splitHref(parameter['url'])[1];
                if (RB.EPUBReader.highlightNoteLinkTarget) {
                    var tmpH = RB.UI.temporaryHighlight(anchor, RB.EPUBReader.UI.DELAY_BEFORE_REMOVING_HIGHLIGHTING);
                    tmpH();
                }
            }
            return;
        }
        
        // process
        if ((afterRendered === 'first') || (afterRendered === 'last') || (afterRendered === 'page') || (afterRendered === 'scroll')) {
            RB.EPUBReader.performVisualPositioning(afterRendered, parameter['value'], true);
            return;
        }
        
        // default: go to first
        RB.EPUBReader.performVisualPositioning('first', null, true);
    }
    
    // pre-paginated (Fixed Layout)
    if (renditionLayout === 'pre-paginated') {
    
        var vp = RB.EPUBReader.epubPlayer.getCurrentAssetViewport();
        if (!vp) {
            // fatal error
            RB.App.message('The XHTML file associated with this chapter is malformed (no valid <meta name="viewport"...> has been found).', RB.App.MessageSeverityEnum.INFO);
            RB.App.openPage(RB.App.PagesEnum.LIBRARY);
            return;
        }
        RB.EPUBReader.panels.setPagination('pre-paginated', vp);
        RB.EPUBReader.footer.assetHasAudio(hasMO);
        var title = RB.EPUBReader.epubPlayer.getTitle();
        RB.EPUBReader.setTitle(title);
        RB.EPUBReader.currentMODuration = null;
        
        // === === === === === === === ===
        // reset
        var id = RB.EPUBReader.UI.divReader;
        RB.UI.applyCSS(id, 'background', '');
        
        var ids = [ RB.EPUBReader.UI.divContent, RB.EPUBReader.UI.divContent2 ];
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            RB.UI.applyCSS(id, 'font-family',       '');
            RB.UI.applyCSS(id, 'font-size',         '');
            RB.UI.applyCSS(id, 'text-transform',    '');
            RB.UI.applyCSS(id, 'text-align',        '');
            RB.UI.applyCSS(id, 'line-height',       '');
            RB.UI.applyCSS(id, 'color',             '');
        }
        // === === === === === === === ===
        
        
        // mo?
        if (hasMO) {
            // set slider
            RB.EPUBReader.currentMODuration = RB.EPUBReader.epubPlayer.getLinearizedMODuration();
            RB.UI.setAttr(RB.EPUBReader.UI.sliderID, 'max', RB.EPUBReader.currentMODuration);
        
            // play if autoStartAudio is true
            if (RB.EPUBReader.autoStartAudio) {
                RB.EPUBReader.playPause();
            }
        
            // ensure current MO is visible
            RB.App.delay(RB.EPUBReader.ensureCurrentMOIsVisible, 100);
            
            return;
        }
    }
};

RB.EPUBReader.onMOCompleted = function() {
    // stop
    RB.EPUBReader.stop();
    
    // prevent audio events
    RB.EPUBReader.preventAudio = true;
    
    //  turn chapter
    if (RB.EPUBReader.waitBeforeTurningChapter) {
        RB.App.delay(function() {
            RB.EPUBReader.preventAudio = false;
            RB.EPUBReader.goToNext(true);
        }, RB.EPUBReader.DELAY_BEFORE_NEXT_CHAPTER);
    } else {
        RB.EPUBReader.preventAudio = false;
        RB.EPUBReader.goToNext(true);
    }
};

RB.EPUBReader.onMOStateChanged = function(state) {
    if (state === 'playing') {
        RB.UI.setText('btnAudioPlayPause', RB.UI.i18n('btnAudioPlayPauseTextPause'));
    } else {
        RB.UI.setText('btnAudioPlayPause', RB.UI.i18n('btnAudioPlayPauseTextPlay'));
    }
    RB.UI.setBooleanPlayIcon('btnAudioPlayPause',        (state === 'playing'));
    RB.UI.setBooleanPlayIcon2('txtSliderAudioStateIcon', (state === 'playing'));
};

RB.EPUBReader.onMOActiveFragmentChanged = function(elementID, fromPrevious) {
    if (RB.EPUBReader.drs.getValue('EPUB_AUTO_SCROLL') || (!fromPrevious)) {
        RB.EPUBReader.performVisualPositioning('element', elementID, true);
    }
};

RB.EPUBReader.onMOTimer = function(value) {
    // set slider
    if (! RB.EPUBReader.sliderIsChanging) {
        RB.UI.setSliderValue(RB.EPUBReader.UI.sliderID, value);
    }
    // set timer
    RB.EPUBReader.setTimerText(value);
};

RB.EPUBReader.setTimerText = function(value) {
    if ((RB.EPUBReader.invertedTimer) && (RB.EPUBReader.currentMODuration != null)) {
        value = '-' + RB.Utilities.prettifyClockValue(RB.EPUBReader.currentMODuration - value, true);
    } else {
        value = RB.Utilities.prettifyClockValue(value, true);
    }
    RB.UI.setText('txtSliderAudioPosition', value, true);
    RB.UI.setText('txtAudioPosition',       value, false);
};



















// open preferences popup
RB.EPUBReader.openPreferences = function(forceDialog) {
    if (RB.UI.dialogOpen) {
        RB.UI.closeDialog();
    } else {
        /*
        if ((forceDialog) || (RB.UI.screenHasSmallHeight())) {
            RB.UI.mobileChangePage(RB.EPUBReader.UI.Dialogs.dialogPreferences, 'dialog');
        } else {
            RB.UI.openSidePopup(RB.EPUBReader.UI.Dialogs.popupPreferences, RB.EPUBReader.UI.divHeader, RB.EPUBReader.UI.divFooterAll, 0.25);
        }
        */
        RB.UI.openSidePopup(RB.EPUBReader.UI.Dialogs.popupPreferences, RB.EPUBReader.UI.divHeader, RB.EPUBReader.UI.divFooterAll, 0.25);
    }
};

// load variables from storage
RB.EPUBReader.loadVariables = function() {
    // current item
    RB.EPUBReader.itemPath                       = RB.App.unescapeQuotes(RB.Storage.get(RB.Storage.Keys.OPEN_ITEM_FILE_PATH));
    RB.EPUBReader.itemID                         = RB.Storage.get(RB.Storage.Keys.OPEN_ITEM_ID);
    RB.EPUBReader.item                           = RB.Storage.getDictionary(RB.Storage.Keys.LIBRARY_BOOKS)[RB.EPUBReader.itemID];
    
    // load settings
    RB.EPUBReader.unzipAll                       = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_UNZIP_ALL);
    RB.EPUBReader.showHeader                     = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_SHOW_HEADER);
    RB.EPUBReader.showSlider                     = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_SHOW_SLIDER);
    RB.EPUBReader.showQuickBar                   = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_SHOW_QUICKBAR);
    RB.EPUBReader.showBottomBar                  = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_SHOW_NAVBAR);
    RB.EPUBReader.openFirstChapterWithAudio      = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_OPEN_FIRST_CHAPTER_WITH_AUDIO);
    RB.EPUBReader.invertSwipe                    = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_INVERT_SWIPE);
    RB.EPUBReader.scrollToTopOnPreviousChapter   = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_SCROLL_TO_TOP_ON_PREVIOUS_CHAPTER);
    RB.EPUBReader.swipeGesture                   = RB.Storage.get(RB.Storage.Keys.EPUB_SWIPE_GESTURE);
    //RB.EPUBReader.borderGesture                  = RB.Storage.get(RB.Storage.Keys.EPUB_BORDER_GESTURE);
    RB.EPUBReader.doubleTapGesture               = RB.Storage.get(RB.Storage.Keys.EPUB_DOUBLE_TAP_GESTURE);
    RB.EPUBReader.twoFingersTapGesture           = RB.Storage.get(RB.Storage.Keys.EPUB_TWO_FINGERS_TAP_GESTURE);
    RB.EPUBReader.backgroundAudio                = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_BACKGROUND_AUDIO);
    RB.EPUBReader.waitBeforeTurningChapter       = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_WAIT_BEFORE_TURNING_CHAPTER);
    RB.EPUBReader.closeTOCImmediately            = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_CLOSE_TOC_IMMEDIATELY);
    RB.EPUBReader.closePlaylistImmediately       = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_CLOSE_PLAYLIST_IMMEDIATELY);
    RB.EPUBReader.enableReadBeyondHacks          = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_ENABLE_READBEYOND_HACKS);
    RB.EPUBReader.showFirstTimePopup             = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_SHOW_FIRST_TIME_POPUP);
    RB.EPUBReader.autoStartAudio                 = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_SMART_PLAY);
    RB.EPUBReader.addLinkExtra                   = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_ADD_LINK_EXTRA);
    RB.EPUBReader.openNoteLinksInBottomPanel     = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_ENABLE_FOOTNOTE_LINKS);
    RB.EPUBReader.openParallelLinksInBottomPanel = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_ENABLE_TRANSLATION_LINKS);
    RB.EPUBReader.pauseOnExtra                   = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_PAUSE_ON_EXTRA);
    RB.EPUBReader.noteLinkDetection              = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_NOTE_LINK_DETECTION);
    RB.EPUBReader.highlightNoteLinkTarget        = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_HIGHLIGHT_NOTE_LINK_TARGET);
    RB.EPUBReader.allowFXL                       = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_ALLOW_FXL);
    RB.EPUBReader.scrollAmount                   = parseFloat(RB.Storage.get(RB.Storage.Keys.EPUB_SCROLL_AMOUNT));
    RB.EPUBReader.animatedScroll                 = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_ANIMATED_SCROLL);
    RB.EPUBReader.enableBrightness               = RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_ENABLE_BRIGHTNESS);
    RB.EPUBReader.showWarningOnNotAudioeBook     = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_SHOW_WARNING_ON_NOT_AUDIOEBOOK);
    RB.EPUBReader.confirmQuit                    = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_CONFIRM_QUIT);
    RB.EPUBReader.runJavascript                  = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_RUN_JAVASCRIPT);
    RB.EPUBReader.actionZonesEnabled             = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_ACTION_ZONES_ENABLED);

    // read actions
    for (var i = 0; i < 9; i++) {
        RB.EPUBReader.actions[i] = RB.Storage.get(RB.Storage.Keys[('EPUB_ACTION_ZONE_' + i)]);
    }
    
    // TODO implement this
    RB.EPUBReader.autohideMenu                   = false;
    RB.EPUBReader.autohideMenuDuration           = 5000;
    
    if (RB.UI.isNightModeApplied()) {
        RB.EPUBReader.customCSSFileName = RB.Config.EPUBReader.customCSSFileNameDark;
    } else {
        RB.EPUBReader.customCSSFileName = RB.Config.EPUBReader.customCSSFileNameLight;
    }
    
    // set page scroll duration
    RB.EPUBReader.UI.animatedScrollDuration = 0;
    if (RB.EPUBReader.animatedScroll) {
        RB.EPUBReader.UI.animatedScrollDuration = RB.EPUBReader.UI.PAGE_SCROLL_DURATION;
    }
};



// create manager objects
RB.EPUBReader.createManagers = function() {
    // if already created, abort
    if (RB.EPUBReader.createdManagers) {
        return;
    }
    
    // asset manager object
    RB.EPUBReader.assetManager  = new RB.App.zipAssetsManager(RB.EPUBReader.itemPath, RB.App.joinPaths([RB.App.getTmpDirectory(), RB.EPUBReader.itemID]), !RB.EPUBReader.unzipAll);

    // create a menu object, with auto-hide capability
    RB.EPUBReader.menu = new RB.App.autohideElement('menu', RB.EPUBReader.onShowMenu, RB.EPUBReader.onHideMenu, {'autohide': RB.EPUBReader.autohideMenu, 'timerInterval': RB.EPUBReader.autohideMenuDuration});
    if (RB.EPUBReader.showHeader) {
        RB.EPUBReader.menu.show();
    } else {
        RB.EPUBReader.menu.hide();
    }
    RB.UI.showHide('divPreferencesPopupOnNoHeader', !RB.EPUBReader.showHeader);
    
    // create the footer manager
    RB.EPUBReader.footer = new RB.EPUBReader.footerManager();
    
    // preference manager object
    RB.EPUBReader.drs = new RB.App.drsManager(RB.EPUBReader.itemID, RB.Plugins.Format.formatNames.EPUB, false, RB.EPUBReader.onDRSUpdate, RB.EPUBReader.DELAY_BEFORE_REMOVING_NOTIFICATION);
    
    // audio
    RB.EPUBReader.drs.registerSetting('EPUB_AUTO_SCROLL', 'boolean', null, [
        { 'id': 'btnPreferencesPopupScroll'  },
        //{ 'id': 'optPreferencesDialogScroll' },
        { 'id': 'btnScroll' },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_TAP_TO_PLAY', 'boolean', null, [
        { 'id': 'btnPreferencesPopupTapToPlay'  },
        //{ 'id': 'optPreferencesDialogTapToPlay' },
        { 'id': 'btnQuickBar1', 'icon': 'scroll' },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_APPLY_HIGHLIGHT', 'boolean', null, [
        { 'id': 'btnPreferencesPopupHighlight'  },
        //{ 'id': 'optPreferencesDialogHighlight' },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_HIGHLIGHT_STYLE', 'cycle', RB.Config.EPUBReader.availableHighLightStyles, [
        { 'id': 'btnPreferencesPopupHighlightStyle',    'notification': true,  'circular': true,  'increase': true,  'compact': false },
        //{ 'id': 'optPreferencesDialogHighlightStyle',   'notification': false, 'circular': true,  'increase': true,  'compact': true  },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_PLAYBACK_VOLUME', 'cycle', RB.Config.EPUBReader.availablePlaybackVolumes, [
        { 'id': 'btnPreferencesPopupVolumeIncrease',    'notification': true,  'circular': false, 'increase': true,  'compact': false },
        { 'id': 'btnPreferencesPopupVolumeDecrease',    'notification': true,  'circular': false, 'increase': false, 'compact': false },
        //{ 'id': 'optPreferencesDialogVolume',           'notification': false, 'circular': true,  'increase': true,  'compact': true  },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_PLAYBACK_SPEED', 'cycle', RB.Config.EPUBReader.availablePlaybackSpeeds, [
        { 'id': 'btnPreferencesPopupSpeedReset',        'notification': true , 'special':  true,  'callahead': RB.EPUBReader.resetPlaybackSpeed },
        { 'id': 'btnPreferencesPopupSpeedFaster',       'notification': true,  'circular': false, 'increase': true,  'compact': false },
        { 'id': 'btnPreferencesPopupSpeedSlower',       'notification': true,  'circular': false, 'increase': false, 'compact': false },
        //{ 'id': 'optPreferencesDialogSpeed',            'notification': false, 'circular': true,  'increase': true,  'compact': true  },
    ]);
   
    // text
    RB.EPUBReader.drs.registerSetting('EPUB_APPLY_TYPO', 'boolean', null, [
        { 'id': 'btnPreferencesPopupApplyTypo'  },
        //{ 'id': 'optPreferencesDialogApplyTypo' },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_PAGINATE_REFLOWABLE', 'boolean', null, [
        { 'id': 'btnPreferencesPopupPaginateReflowable',  'callback': RB.EPUBReader.changePagination },
        //{ 'id': 'optPreferencesDialogPaginateReflowable', 'callback': RB.EPUBReader.changePagination },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_FONT_FAMILY', 'cycle', RB.Config.EPUBReader.availableFontFamilies, [
        { 'id': 'btnPreferencesPopupFont',              'notification': true,  'circular': true,  'increase': true,  'compact': false },
        //{ 'id': 'optPreferencesDialogFont',             'notification': false, 'circular': true,  'increase': true,  'compact': true  },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_FONT_SIZE', 'cycle', RB.Config.EPUBReader.availableFontSizes, [
        { 'id': 'btnPreferencesPopupFontSizeBigger',    'notification': true,  'circular': false, 'increase': true,  'compact': false },
        { 'id': 'btnPreferencesPopupFontSizeSmaller',   'notification': true,  'circular': false, 'increase': false, 'compact': false },
        //{ 'id': 'optPreferencesDialogFontSize',         'notification': false, 'circular': true,  'increase': true,  'compact': true  },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_TEXT_ALIGN', 'cycle', RB.Config.EPUBReader.availableTextAligns, [
        { 'id': 'btnPreferencesPopupTextAlign',         'notification': true,  'circular': true,  'increase': true,  'compact': false },
        //{ 'id': 'optPreferencesDialogTextAlign',        'notification': false, 'circular': true,  'increase': true,  'compact': true  },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_TEXT_TRANSFORM', 'cycle', RB.Config.EPUBReader.availableTextTransforms, [
        { 'id': 'btnPreferencesPopupTextTransform',     'notification': true,  'circular': true,  'increase': true,  'compact': false },
        //{ 'id': 'optPreferencesDialogTextTransform',    'notification': false, 'circular': true,  'increase': true,  'compact': true  },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_LINE_SPACING_FACTOR', 'cycle', RB.Config.EPUBReader.availableLineSpacingFactors, [
        { 'id': 'btnPreferencesPopupSpacingBigger',     'notification': true,  'circular': false, 'increase': true,  'compact': false },
        { 'id': 'btnPreferencesPopupSpacingSmaller',    'notification': true,  'circular': false, 'increase': false, 'compact': false },
        //{ 'id': 'optPreferencesDialogSpacing',          'notification': false, 'circular': true,  'increase': true,  'compact': true  },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_CONTENT_BACKGROUND_COLOR', 'palette', null, [
        { 'id': 'btnPreferencesPopupBackColor'  },
        //{ 'id': 'optPreferencesDialogBackColor', 'compact': true },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_CONTENT_FONT_COLOR', 'palette', null, [
        { 'id': 'btnPreferencesPopupFontColor'  },
        //{ 'id': 'optPreferencesDialogFontColor', 'compact': true },
    ]);
    
    // margins
    RB.EPUBReader.drs.registerSetting('EPUB_LEFT_MARGIN_SIZE', 'cycle', RB.Config.EPUBReader.availableLeftMarginSizes, [
        { 'id': 'btnPreferencesPopupMarginLeftBigger',  'circular': false, 'increase': true,  'notification': true,  'compact': false },
        { 'id': 'btnPreferencesPopupMarginLeftSmaller', 'circular': false, 'increase': false, 'notification': true,  'compact': false },
    ]);
    RB.EPUBReader.drs.registerSetting('EPUB_RIGHT_MARGIN_SIZE', 'cycle', RB.Config.EPUBReader.availableRightMarginSizes, [
        { 'id': 'btnPreferencesPopupMarginRightBigger',  'circular': false, 'increase': true,  'notification': true,  'compact': false },
        { 'id': 'btnPreferencesPopupMarginRightSmaller', 'circular': false, 'increase': false, 'notification': true,  'compact': false },
    ]);

    // brightness
    RB.EPUBReader.drs.registerSetting('UI_BRIGHTNESS', 'cycle', RB.Config.UI.availableBrightnessValues, [
        { 'id': 'btnPreferencesPopupBrightnessIncrease','notification': true,  'circular': false, 'increase': true,  'compact': false, }, // 'callback': RB.EPUBReader.setBrightness },
        { 'id': 'btnPreferencesPopupBrightnessDecrease','notification': true,  'circular': false, 'increase': false, 'compact': false, }, // 'callback': RB.EPUBReader.setBrightness },
    ]);
    
    // register simple buttons
    RB.UI.bindSimpleButtonEvents('btnQuitOK',                  { 'tap': RB.EPUBReader.doExit              }, false);
    RB.UI.bindSimpleButtonEvents('btnPreferencesPopupExit',    { 'tap': RB.EPUBReader.doExit              }, false);
    RB.UI.bindSimpleButtonEvents('btnPreferencesPopupMargins', {
        'tap':          function() { RB.EPUBReader.changeBothMargins(1);  },
        'doubletap':    function() { RB.EPUBReader.changeBothMargins(-1); },
    }, false);
    RB.UI.bindSimpleButtonEvents('divFooterSliderLeft',  {
        'tap':          RB.EPUBReader.playPause,
        'doubletap':    RB.EPUBReader.invertTimer,
        'press':        RB.EPUBReader.toggleQuickBar,
    }, true);
    RB.UI.bindSimpleButtonEvents(RB.EPUBReader.UI.txtTitle,   {
        'tap':          RB.EPUBReader.toggleFooter,
        'doubletap':    RB.EPUBReader.openPlaylistOrTOC,
    }, true);
    RB.UI.bindSimpleButtonEvents('btnHeaderMenu',        { 'tap': RB.EPUBReader.openPreferences     }, true);
    RB.UI.bindSimpleButtonEvents('btnAudioStop',         { 'tap': RB.EPUBReader.stop                }, false);
    RB.UI.bindSimpleButtonEvents('txtAudioPosition',     { 'tap': RB.EPUBReader.toggleNavBar        }, false);
    RB.UI.bindSimpleButtonEvents('btnPlaylist',          {
        'tap':          RB.EPUBReader.openPlaylist,
        'doubletap':    RB.EPUBReader.openTOC
    }, false);
    RB.UI.bindSimpleButtonEvents('btnAudioPlayPause',    { 'tap': RB.EPUBReader.playPause           }, false);
    RB.UI.bindSimpleButtonEvents('btnPrevious',          {
        'tap':          RB.EPUBReader.goToPreviousPage,
        'doubletap':    RB.EPUBReader.goToPreviousChapter
    }, false);
    RB.UI.bindSimpleButtonEvents('btnDialogPreferences', { 'tap': RB.EPUBReader.openPreferences     }, false);
    RB.UI.bindSimpleButtonEvents('btnPlayer',            { 'tap': RB.EPUBReader.toggleNavBar        }, false);
    RB.UI.bindSimpleButtonEvents('btnContents',          { 'tap': RB.EPUBReader.openTOC             }, false);
    RB.UI.bindSimpleButtonEvents('btnNext',              {
        'tap':          RB.EPUBReader.goToNextPage,
        'doubletap':    RB.EPUBReader.goToNextChapter
    }, false);
    RB.UI.bindSimpleButtonEvents('btnQuickBar2',         {
        'tap':          RB.EPUBReader.goToPreviousMO,
        'press':        RB.EPUBReader.goToPreviousChapter,
    }, false);
    RB.UI.bindSimpleButtonEvents('btnQuickBar3',         {
        'tap':          RB.EPUBReader.openPlaylist,
        'press':        RB.EPUBReader.openTOC
    }, false);
    RB.UI.bindSimpleButtonEvents('btnQuickBar4',         {
        'tap':          RB.EPUBReader.goToNextMO,
        'press':        RB.EPUBReader.goToNextChapter,
    }, false);
    RB.UI.bindSimpleButtonEvents('btnQuickBar5',         { 'tap': RB.EPUBReader.openPreferences     }, false);
    
    // content panels
    RB.EPUBReader.panels = new RB.EPUBReader.panelManager({
        'reader':           RB.EPUBReader.UI.divReader,
        'container':        RB.EPUBReader.UI.divContentContainer,
        'panel1':           RB.EPUBReader.UI.divContent,
        'innerpanel1':      RB.EPUBReader.UI.divContentInner,
        'columnpanel1':     RB.EPUBReader.UI.divContentColumn,
        'maskcolumnpanel1': RB.EPUBReader.UI.divContentColumnMask,
        'panel2':           RB.EPUBReader.UI.divContent2,
        'innerpanel2':      RB.EPUBReader.UI.divContentInner2,
        'columnpanel2':     RB.EPUBReader.UI.divContentColumn2,
        'maskcolumnpanel2': RB.EPUBReader.UI.divContentColumnMask2,
    });
    RB.EPUBReader.panels.setSplits(1);
    RB.EPUBReader.panels.setSplitDirection('vertical');
    RB.EPUBReader.changePagination();
    
    // reset flag
    RB.EPUBReader.createdManagers = true;
};

// invert audio timer
RB.EPUBReader.invertTimer = function() {
    RB.EPUBReader.invertedTimer = !RB.EPUBReader.invertedTimer;
    try {
        var value = parseInt(RB.UI.getSliderValue(RB.EPUBReader.UI.sliderID));
        RB.EPUBReader.setTimerText(value);
    } catch (e) {
        // nop
    }
};

// cycle footer elements
RB.EPUBReader.toggleFooter = function() {
    if (RB.EPUBReader.footer) {
        RB.EPUBReader.footer.cycleTopBottom();
    }
};
RB.EPUBReader.toggleNavBar = function() {
    if (RB.EPUBReader.footer) {
        RB.EPUBReader.footer.cycleBottom();
    }
};
RB.EPUBReader.toggleQuickBar = function() {
    if (RB.EPUBReader.footer) {
        RB.EPUBReader.footer.cycleQuickBar();
    }
};

// set brightness
/*
RB.EPUBReader.setBrightness = function() {
    var value = RB.EPUBReader.drs.getValue('UI_BRIGHTNESS');
    RB.UI.setBrightness(value);
};
*/

// change pagination (-paginate or -scroll) for reflowable
RB.EPUBReader.changePagination = function() {
    if (RB.EPUBReader.panels) {
        var paginate = RB.EPUBReader.drs.getValue('EPUB_PAGINATE_REFLOWABLE');
        if (paginate) {
            RB.EPUBReader.panels.setPagination('reflowable-paginate');
        } else {
            RB.EPUBReader.panels.setPagination('reflowable-scroll');
        }
    }
};

// resize content containers
RB.EPUBReader.resizeContentContainers = function() {
    if (RB.EPUBReader.panels) {
        // res = [ left, top, width, height ]
        var res = RB.UI.computeVisibleArea(RB.EPUBReader.UI.divHeader, RB.EPUBReader.UI.divFooterAll);
        RB.EPUBReader.panels.resize(res);
    }
};

// change both margins simultaneously
RB.EPUBReader.changeBothMargins = function(parameter) {
    // min_value holds the minimum of the two current values
    var left_value  = RB.EPUBReader.drs.getValue('EPUB_LEFT_MARGIN_SIZE');
    var right_value = RB.EPUBReader.drs.getValue('EPUB_RIGHT_MARGIN_SIZE');
    var left_index  = RB.Config.EPUBReader.availableLeftMarginSizes.indexOf(left_value);
    var right_index = RB.Config.EPUBReader.availableRightMarginSizes.indexOf(right_value);
    var min_value   = right_value;
    if (left_index < right_index) {
        min_value = left_value;
    }
    var new_value = RB.Storage.switchParameter(RB.Config.EPUBReader.availableLeftMarginSizes, min_value, parameter, true);
    RB.EPUBReader.drs.setValue('EPUB_LEFT_MARGIN_SIZE',  new_value);
    RB.EPUBReader.drs.setValue('EPUB_RIGHT_MARGIN_SIZE', new_value);
    
    // notification
    var k = 'optPreferencesDialogMargins';
    var v  = RB.Config.EPUBReader.availableLeftMarginSizes.indexOf(new_value);
    var t  = RB.UI.i18n(k) + ': ' + RB.UI.i18n(k + 'Labels', v);
    RB.UI.showNotification(t, RB.EPUBReader.DELAY_BEFORE_REMOVING_NOTIFICATION);
    
    // update panels
    RB.EPUBReader.panels.resetPanels();
};

// reset playback speed to 1.0
RB.EPUBReader.resetPlaybackSpeed = function() {
    RB.EPUBReader.drs.setValue('EPUB_PLAYBACK_SPEED', '1.0');
};




// set title
RB.EPUBReader.setTitle = function(s) {
    if ((s) && (RB.EPUBReader.enableReadBeyondHacks)) {
        // replace normal dash with em-dash
        s = s.replace(' - ', ' — ');
    }
    RB.UI.setText(RB.EPUBReader.UI.txtTitle, s, true);
};

// called after DRS have been changed
RB.EPUBReader.onDRSUpdate = function(triggeredByKey) {
    var id, ids;
    
    // reflowable
    var apply = RB.EPUBReader.drs.getValue('EPUB_APPLY_TYPO');
    if (apply) {
        // if none, align should be removed
        var al  = RB.EPUBReader.drs.getValue('EPUB_TEXT_ALIGN');
        if (RB.EPUBReader.drs.getValue('EPUB_TEXT_ALIGN') === 'none') {
            al = '';
        }
        // compute line height
        var raw = RB.EPUBReader.drs.getValue('EPUB_FONT_SIZE').replace('px', '');
        var lh  = Math.floor(RB.EPUBReader.drs.getValue('EPUB_LINE_SPACING_FACTOR') * raw) + 'px';
        
        // apply
        id = RB.EPUBReader.UI.divReader;
        RB.UI.applyCSS(id, 'background',            RB.EPUBReader.drs.getValue('EPUB_CONTENT_BACKGROUND_COLOR'));

        ids = [ RB.EPUBReader.UI.divContent, RB.EPUBReader.UI.divContent2 ];
        for (var i = 0; i < ids.length; i++) {
            id = ids[i];
            RB.UI.applyCSS(id, 'font-family',       RB.EPUBReader.drs.getValue('EPUB_FONT_FAMILY'));
            RB.UI.applyCSS(id, 'font-size',         RB.EPUBReader.drs.getValue('EPUB_FONT_SIZE'));
            RB.UI.applyCSS(id, 'text-transform',    RB.EPUBReader.drs.getValue('EPUB_TEXT_TRANSFORM'));
            RB.UI.applyCSS(id, 'text-align',        al);
            RB.UI.applyCSS(id, 'line-height',       lh);
            RB.UI.applyCSS(id, 'color',             RB.EPUBReader.drs.getValue('EPUB_CONTENT_FONT_COLOR'));
        }
        
        // apply the same settings to extra (footnote) panel
        // TODO refactor
        id = RB.EPUBReader.UI.divFooterExtra;
        RB.UI.applyCSS(id, 'background',        RB.EPUBReader.drs.getValue('EPUB_CONTENT_BACKGROUND_COLOR'));
        RB.UI.applyCSS(id, 'font-family',       RB.EPUBReader.drs.getValue('EPUB_FONT_FAMILY'));
        RB.UI.applyCSS(id, 'font-size',         RB.EPUBReader.drs.getValue('EPUB_FONT_SIZE'));
        RB.UI.applyCSS(id, 'text-transform',    RB.EPUBReader.drs.getValue('EPUB_TEXT_TRANSFORM'));
        RB.UI.applyCSS(id, 'text-align',        al);
        RB.UI.applyCSS(id, 'line-height',       lh);
        RB.UI.applyCSS(id, 'color',             RB.EPUBReader.drs.getValue('EPUB_CONTENT_FONT_COLOR'));
        
    } else {
        // reset
        id = RB.EPUBReader.UI.divReader;
        RB.UI.applyCSS(id, 'background',        '');
        
        ids = [ RB.EPUBReader.UI.divContent, RB.EPUBReader.UI.divContent2 ];
        for (var i = 0; i < ids.length; i++) {
            id = ids[i];
            RB.UI.applyCSS(id, 'font-family',       '');
            RB.UI.applyCSS(id, 'font-size',         '');
            RB.UI.applyCSS(id, 'text-transform',    '');
            RB.UI.applyCSS(id, 'text-align',        '');
            RB.UI.applyCSS(id, 'line-height',       '');
            RB.UI.applyCSS(id, 'color',             '');
        }
        
        // apply the same settings to extra (footnote) panel
        // TODO refactor
        id = RB.EPUBReader.UI.divFooterExtra;
        RB.UI.applyCSS(id, 'background',        '');
        RB.UI.applyCSS(id, 'font-family',       '');
        RB.UI.applyCSS(id, 'font-size',         '');
        RB.UI.applyCSS(id, 'text-transform',    '');
        RB.UI.applyCSS(id, 'text-align',        '');
        RB.UI.applyCSS(id, 'line-height',       '');
        RB.UI.applyCSS(id, 'color',             '');
    }
    RB.UI.showHide('divPreferencesPopupTypoInner', apply);

    // set brightness
    if (RB.EPUBReader.enableBrightness) {
        try {
            RB.UI.setBrightness(RB.EPUBReader.drs.getValue('UI_BRIGHTNESS'));
        } catch (e) {
            // this might fail because cordova is undefined until the page loads
            // nop
        }
    }

    // change volume
    if (triggeredByKey === 'EPUB_PLAYBACK_VOLUME') {
        RB.EPUBReader.epubPlayer.setVolume(RB.EPUBReader.drs.getValue('EPUB_PLAYBACK_VOLUME'));
    };
    
    // change playback speed
    if (triggeredByKey === 'EPUB_PLAYBACK_SPEED') {
        RB.EPUBReader.epubPlayer.setPlaybackSpeed(RB.EPUBReader.drs.getValue('EPUB_PLAYBACK_SPEED'));
    };
    
    // change apply highlight
    if (triggeredByKey === 'EPUB_APPLY_HIGHLIGHT') {
        RB.EPUBReader.epubPlayer.setApplyHighlight(RB.EPUBReader.drs.getValue('EPUB_APPLY_HIGHLIGHT'));
    };
    
    // change highlight style
    if (triggeredByKey === 'EPUB_HIGHLIGHT_STYLE') {
        RB.EPUBReader.epubPlayer.setHighlightStyle(RB.EPUBReader.drs.getValue('EPUB_HIGHLIGHT_STYLE'));
    }

    // update panels
    RB.EPUBReader.panels.setBackgroundColor(RB.EPUBReader.drs.getValue('EPUB_CONTENT_BACKGROUND_COLOR'));
    
    if ((RB.EPUBReader.epubPlayer) && (RB.EPUBReader.epubPlayer.currentAssetHasAudio())) {
        // ensure current MO fragment is visible
        RB.EPUBReader.ensureCurrentMOIsVisible();
    } else {
        var mightAlterPagination = [
            'EPUB_APPLY_TYPO',
            'EPUB_TEXT_ALIGN',
            'EPUB_FONT_SIZE',
            'EPUB_LINE_SPACING_FACTOR',
            'EPUB_FONT_FAMILY',
            'EPUB_FONT_SIZE',
            'EPUB_TEXT_TRANSFORM',
            'EPUB_LEFT_MARGIN_SIZE',
            'EPUB_RIGHT_MARGIN_SIZE',
            'EPUB_PAGINATE_REFLOWABLE',
            'EPUB_APPLY_HIGHLIGHT',
            'EPUB_HIGHLIGHT_STYLE'
        ];
        // reset panels
        if (mightAlterPagination.indexOf(triggeredByKey) > -1) {
            // reset panels and ensure current MO fragment is visible
            RB.EPUBReader.panels.resetPanels(RB.EPUBReader.ensureCurrentMOIsVisible);
        } else {
            // ensure current MO fragment is visible
            RB.EPUBReader.ensureCurrentMOIsVisible();
        }
    }
    
    if ((RB.EPUBReader.runJavascript) && (triggeredByKey)) {
        RB.EPUBReader.updateEPUBReadingSystem(triggeredByKey, true);
    }
};









// PANEL MANAGER
//
// manages resizing of the EPUB rendering divs
//
RB.EPUBReader.panelManager = function(elements) {
    var _visible_area     = null; // _visible_area = [ left, top, width, height ]
    var _elements         = elements;
    var _background_color = 'white';
    
    var _splits           = 1;
    var _splitDirection   = 'vertical';
    var _pagination       = 'reflowable-scroll';
    var _viewport         = null;
    
    var _paginationWidth  = null;
    var _currentPage      = null;
    var _totalPages       = null;
    
    var _textPosition     = null;
    
    this.setBackgroundColor = function(value) {
        _background_color = value;
    };
    
    this.getSplits = function() {
        return _splits;
    };
    this.setSplits = function(splits) {
        _splits = splits;
        this.resetPanels();
    };
    
    this.getSplitDirection = function() {
        return _splitDirection;
    };
    this.setSplitDirection = function(splitDirection) {
        _splitDirection = splitDirection;
        this.resetPanels();
    };
    
    this.getPagination = function() {
        return _pagination;
    };
    this.setPagination = function(pagination, viewport) {
        _pagination = pagination;
        _viewport   = viewport;
        this.resetPanels();
    };
    
    this.scroll = function(value) {
        if (_pagination === 'reflowable-scroll') {
            RB.UI.scrollElement(_elements['panel1'], value);
        }
    };
    
    this.ensureElementIsVisible = function(id) {
        if (_pagination === 'reflowable-paginate') {
            var offset = RB.UI.getOffsetLeft(id);
            var index  = Math.floor(offset / _paginationWidth);
            this.goToPageRelative(index);
        }
        if (_pagination === 'reflowable-scroll') {
            RB.UI.scrollTo(_elements['panel1'], id, 0, RB.EPUBReader.UI.HIGHLIGHT_TRANSITION_DURATION);
        }
    };
    
    this.setDefaults = function() {
        var id;
        
        // reader
        id = _elements['reader'];
        RB.UI.applyCSS(id, 'background-color',      'white'); // set later according to user preferences
        RB.UI.applyCSS(id, 'overflow',              'hidden');
        
        // container
        id = _elements['container'];
        RB.UI.applyCSS(id, 'border',                '0');
        RB.UI.applyCSS(id, 'margin',                '0');
        RB.UI.applyCSS(id, 'padding',               '0');
        RB.UI.applyCSS(id, 'background-color',      'transparent');
        RB.UI.applyCSS(id, 'position',              'absolute');
        RB.UI.applyCSS(id, 'overflow',              'hidden');
        
        // panel 1
        id = _elements['panel1'];
        RB.UI.applyCSS(id, 'border',                '0');
        RB.UI.applyCSS(id, 'margin',                '0');
        RB.UI.applyCSS(id, 'padding',               '0');
        RB.UI.applyCSS(id, 'background-color',      'transparent');
        RB.UI.applyCSS(id, 'position',              'absolute');
        RB.UI.applyCSS(id, 'overflow-x',            'hidden');
        RB.UI.applyCSS(id, 'overflow-y',            'auto');
        
        // panel 1 inner
        id = _elements['innerpanel1'];
        RB.UI.applyCSS(id, 'border',                '0');
        RB.UI.applyCSS(id, 'margin',                '0');           // set later, subtracting left and right margins specified by user
        RB.UI.applyCSS(id, 'padding',               '0');
        RB.UI.applyCSS(id, 'background-color',      'transparent');
        RB.UI.applyCSS(id, 'position',              'absolute');
        RB.UI.applyCSS(id, 'overflow',              'hidden');
        RB.UI.applyCSS(id, 'width',                 'auto');
        RB.UI.applyCSS(id, 'height',                'auto');
        
        // panel 1 column
        id = _elements['columnpanel1'];
        RB.UI.applyCSS(id, 'border',                '0');
        RB.UI.applyCSS(id, 'margin',                '0');
        RB.UI.applyCSS(id, 'padding',               '0');
        RB.UI.applyCSS(id, 'background-color',      'transparent');
        RB.UI.applyCSS(id, 'position',              'relative');
        RB.UI.applyCSS(id, 'overflow',              'hidden');
        RB.UI.applyCSS(id, 'width',                 '100%');
        RB.UI.applyCSS(id, 'height',                '100%');
        
        // panel 1 mask
        id = _elements['maskcolumnpanel1'];
        RB.UI.applyCSS(id, 'border',                '0');
        RB.UI.applyCSS(id, 'margin',                '0');
        RB.UI.applyCSS(id, 'padding',               '0');
        RB.UI.applyCSS(id, 'background-color',      _background_color);
        RB.UI.applyCSS(id, 'position',              'absolute');
        RB.UI.applyCSS(id, 'overflow',              'auto');
        
        // panel 2
        id = _elements['panel2'];
        RB.UI.applyCSS(id, 'border',                '0');
        RB.UI.applyCSS(id, 'margin',                '0');
        RB.UI.applyCSS(id, 'padding',               '0');
        RB.UI.applyCSS(id, 'background-color',      'transparent');
        RB.UI.applyCSS(id, 'position',              'absolute');
        RB.UI.applyCSS(id, 'overflow-x',            'hidden');
        RB.UI.applyCSS(id, 'overflow-y',            'auto');
        
        // panel 2 inner
        id = _elements['innerpanel2'];
        RB.UI.applyCSS(id, 'border',                '0');
        RB.UI.applyCSS(id, 'margin',                '0');           // set later, subtracting left and right margins specified by user
        RB.UI.applyCSS(id, 'padding',               '0');
        RB.UI.applyCSS(id, 'background-color',      'transparent');
        RB.UI.applyCSS(id, 'position',              'absolute');
        RB.UI.applyCSS(id, 'overflow',              'hidden');
        RB.UI.applyCSS(id, 'width',                 'auto');
        RB.UI.applyCSS(id, 'height',                'auto');
        
        // panel 2 column
        id = _elements['columnpanel2'];
        RB.UI.applyCSS(id, 'border',                '0');
        RB.UI.applyCSS(id, 'margin',                '0');
        RB.UI.applyCSS(id, 'padding',               '0');
        RB.UI.applyCSS(id, 'background-color',      'transparent');
        RB.UI.applyCSS(id, 'position',              'relative');
        RB.UI.applyCSS(id, 'overflow',              'hidden');
        RB.UI.applyCSS(id, 'width',                 '100%');
        RB.UI.applyCSS(id, 'height',                '100%');
        
        // panel 2 mask
        id = _elements['maskcolumnpanel2'];
        RB.UI.applyCSS(id, 'border',                '0');
        RB.UI.applyCSS(id, 'margin',                '0');
        RB.UI.applyCSS(id, 'padding',               '0');
        RB.UI.applyCSS(id, 'background-color',      _background_color);
        RB.UI.applyCSS(id, 'position',              'absolute');
        RB.UI.applyCSS(id, 'overflow',              'auto');
        
    };
    
    this.resize = function(visible_area) {
        if (visible_area) {
            _visible_area = visible_area;
        }
        this.resetPanels();
    };
    
    this.modifyDivSize = function(id, sizes) {
        RB.UI.applyCSS(id, 'left',   sizes['left']   + 'px');
        RB.UI.applyCSS(id, 'top',    sizes['top']    + 'px');
        RB.UI.applyCSS(id, 'width',  sizes['width']  + 'px');
        RB.UI.applyCSS(id, 'height', sizes['height'] + 'px');
    };
    
    this.resetPanels = function(callback) {
        if (!_visible_area) {
            return;
        }
                
        var id;
        var c             = {};
        var p1            = {};
        var p2            = {};
        var page_left     = _visible_area[0];
        var page_top      = _visible_area[1];
        var page_width    = _visible_area[2];
        var page_height   = _visible_area[3];
        var column_width  = page_width;
        var column_height = page_height;
        
        //alert("pageW " + page_width + " pageH " + page_height);
        
        if (_pagination !== 'pre-paginated') {
            page_top    += RB.EPUBReader.MARGIN_TOP;
            page_height -= (RB.EPUBReader.MARGIN_TOP + RB.EPUBReader.MARGIN_BOTTOM);
        }
        
        id = _elements['container'];
        c = { 'left': page_left, 'top': page_top, 'width': page_width, 'height': page_height };
        this.modifyDivSize(id, c);
        
        // panel 1 is always visible (for now)
        id = _elements['panel1'];
        if (_splits === 1) {
            column_width  = page_width;
            column_height = page_height;
            p1 = { 'left': 0, 'top': 0, 'width': column_width, 'height': column_height };
            p2 = {};
            
            // TODO refactor this
            /*
            if (_pagination === 'pre-paginated') {
                p1['width']  = _viewport['width'];
                p1['height'] = _viewport['height'];
            }
            */
        } else {
            if (_splitDirection === 'vertical') {
                column_width  = page_width / 2;
                column_height = page_height;
                p1 = { 'left': 0, 'top': 0, 'width': column_width, 'height': column_height };
                p2 = { 'left': column_width, 'top': 0, 'width': column_width, 'height': column_height };
                
                // TODO refactor this
                /*
                if (_pagination === 'pre-paginated') {
                    p1['width']  = _viewport['width'] / 2;
                    p1['height'] = _viewport['height'];
                    p2['width']  = _viewport['width'] / 2;
                    p2['height'] = _viewport['height'];
                }
                */
                
            } else {
                column_width  = page_width;
                column_height = page_height / 2;
                p1 = { 'left': 0, 'top': 0, 'width': column_width, 'height': column_height };
                p2 = { 'left': 0, 'top': column_height, 'width': column_width, 'height': column_height };
                
                // TODO refactor this
                /*
                if (_pagination === 'pre-paginated') {
                    p1['width']  = _viewport['width'];
                    p1['height'] = _viewport['height'] / 2;
                    p2['width']  = _viewport['width'];
                    p2['height'] = _viewport['height'] / 2;
                }
                */

            }
        }
        this.modifyDivSize(id, p1);
        RB.UI.show(id);
        
        // show mask 1
        id = _elements['maskcolumnpanel1'];
        RB.UI.applyCSS(id, 'background-color', _background_color);
        this.modifyDivSize(id, p1);
        RB.UI.show(id);
                              
        // panel 2 is visible?
        id = _elements['panel2'];
        RB.UI.hide(id);
        if (_splits === 2) {
            this.modifyDivSize(id, p2);
            RB.UI.show(id);
            
            // show mask 2
            id = _elements['maskcolumnpanel2'];
            RB.UI.applyCSS(id, 'background-color', _background_color);
            this.modifyDivSize(id, p2);
            RB.UI.show(id);
        }
        
        // set margins on inner1 and inner2
        // TODO decouple this!
        var left_margin  = 0;
        var right_margin = 0;
        if (_pagination !== 'pre-paginated') {
            left_margin  = Math.floor(column_width * parseInt(RB.EPUBReader.drs.getValue('EPUB_LEFT_MARGIN_SIZE').replace('%', ''))  / 100);
            right_margin = Math.floor(column_width * parseInt(RB.EPUBReader.drs.getValue('EPUB_RIGHT_MARGIN_SIZE').replace('%', '')) / 100); // TODO add 6px for scrollbar ?
        }
        var net_width    = column_width - left_margin - right_margin;
        
        var i1 = { 'left': left_margin, 'top': 0, 'width': net_width, 'height': column_height };
        id = _elements['innerpanel1'];
        this.modifyDivSize(id, i1);
        
        var i2 = { 'left': left_margin, 'top': 0, 'width': net_width, 'height': column_height };
        id = _elements['innerpanel2'];
        this.modifyDivSize(id, i1);
        
        // set pagination
        if (_pagination === 'reflowable-scroll') {
            id = _elements['panel1'];
            RB.UI.applyCSS(id, 'overflow-y',           'auto');
            
            id = _elements['innerpanel1'];
            RB.UI.applyCSS(id, 'height',               'auto');
            
            id = _elements['columnpanel1'];
            RB.UI.applyCSS(id, 'overflow',             'hidden');
            RB.UI.applyCSS(id, 'width',                '100%');
            RB.UI.applyCSS(id, 'column-width',         '');
            RB.UI.applyCSS(id, 'column-gap',           '');
            RB.UI.applyCSS(id, '-moz-column-width',    '');
            RB.UI.applyCSS(id, '-moz-column-gap',      '');
            RB.UI.applyCSS(id, '-webkit-column-width', '');
            RB.UI.applyCSS(id, '-webkit-column-gap',   '');
            RB.UI.applyCSS(id, 'right',                '0');
            
            _currentPage = null;
            _totalPages  = null;

            // remove masks
            RB.UI.hide(_elements['maskcolumnpanel1']);
            RB.UI.hide(_elements['maskcolumnpanel2']);
            if (callback) {
                callback();
            }
        } // end if reflowable-scroll
        
        if (_pagination === 'reflowable-paginate') {
            _paginationWidth = net_width;
            
            id = _elements['panel1'];
            RB.UI.applyCSS(id, 'overflow-y',          'hidden');
            
            id = _elements['innerpanel1'];
            RB.UI.applyCSS(id, 'height',               column_height + 'px');
            
            id = _elements['columnpanel1'];
            RB.UI.applyCSS(id, 'overflow',             'visible');
            RB.UI.applyCSS(id, 'width',                _paginationWidth  + 'px');
            RB.UI.applyCSS(id, 'column-width',         _paginationWidth  + 'px');
            RB.UI.applyCSS(id, '-moz-column-width',    _paginationWidth  + 'px');
            RB.UI.applyCSS(id, '-webkit-column-width', _paginationWidth  + 'px');
            RB.UI.applyCSS(id, 'column-gap',           '0');
            RB.UI.applyCSS(id, '-moz-column-gap',      '0');
            RB.UI.applyCSS(id, '-webkit-column-gap',   '0');
            RB.UI.applyCSS(id, 'right',                '0');
                        
            // this is an ugly workaround to force redrawing the columns
            var el = RB.UI.getElement(id);
            el.hide();
            el.get(0).offsetHeight; // iOS hack, confirmed working
            el.width();             // android hack, but not working?
            el.show();
            
            // super ugly workaround to set the correct number of pages
            RB.App.delay(function() {
                _currentPage = 0;
                _totalPages  = RB.UI.getElement(id)[0].scrollWidth / _paginationWidth;
                //alert(_totalPages);
                
                // remove masks
                RB.UI.hide(_elements['maskcolumnpanel1']);
                RB.UI.hide(_elements['maskcolumnpanel2']);
                if (callback) {
                    callback();
                }
            }, 100);
        } // end if reflowable-paginate
        
        if (_pagination === 'pre-paginated') {
            var max_width  = net_width;
            var max_height = column_height;
            
            //alert("MAX W " + max_width + " MAX H " + max_height);
            
            var vp_width   = _viewport['width'];
            var vp_height  = _viewport['height'];
            
            //alert(vp_width + " " + vp_height);
            
            var page_border     = 0;
            var adjusted_width  = vp_width  + 2 * page_border;
            var adjusted_height = vp_height + 2 * page_border;
            
            //alert("ADJ W " + adjusted_width + " ADJ H " + adjusted_height);
            
            var scale = 1.0;
            if ((adjusted_width > max_width) || (adjusted_height > max_height)) {
                var factor_width  = max_width  / adjusted_width;
                var factor_height = max_height / adjusted_height;
                var scale = factor_width;
                if (factor_height < scale) {
                    scale = factor_height;
                }
            }
            
            var scaled_width  = adjusted_width  * scale;
            var scaled_height = adjusted_height * scale;
            
            //alert("SCALE " + scale + " SCALED W " + scaled_width + " SCALED H " + scaled_height);
            
            id = _elements['panel1'];
            RB.UI.applyCSS(id, 'overflow-y', 'hidden');
            
            id = _elements['innerpanel1'];
            RB.UI.applyCSS(id, 'position',          'relative');                                // TODO reset elsewhere
            RB.UI.applyCSS(id, 'width',             vp_width  + 'px');                          // TODO reset elsewhere
            RB.UI.applyCSS(id, 'height',            vp_height + 'px');
            RB.UI.applyCSS(id, 'left',              ((max_width  - scaled_width)  / 2) + 'px'); // TODO reset elsewhere
            RB.UI.applyCSS(id, 'top',               ((max_height - scaled_height) / 2) + 'px'); // TODO reset elsewhere
            RB.UI.applyCSS(id, 'transform',         'scale(' + scale + ',' + scale + ')');      // TODO reset elsewhere
            RB.UI.applyCSS(id, 'transform-origin',  '0 0');                                     // TODO reset elsewhere
            RB.UI.applyCSS(id, 'border',            page_border + 'px black solid');            // TODO reset elsewhere
            
            id = _elements['columnpanel1'];
            RB.UI.applyCSS(id, 'overflow',          'hidden');
            RB.UI.applyCSS(id, 'width',             '100%');
            RB.UI.applyCSS(id, 'right',             '0');
            
            // remove masks
            RB.App.delay(function(){
                RB.UI.hide(_elements['maskcolumnpanel1']);
                RB.UI.hide(_elements['maskcolumnpanel2']);
                if (callback) {
                    callback();
                }
            }, 100);
        } // end if pre-paginated
    };
    
    this.getCurrentPage = function() {
        if (_pagination === 'reflowable-paginate') {
            return _currentPage;
        }
        return null;
    };
    
    this.getCurrentScroll = function() {
        if (_pagination === 'reflowable-scroll') {
            return RB.UI.getElement(_elements['panel1']).scrollTop();
        }
        return null;
    };
    
    this.goToPageRelative = function(increment) {
        if (_currentPage) {
            this.goToPage(_currentPage + increment);
        } else {
            this.goToPage(increment);
        }
    };
    
    this.goToPage = function(index) {
        if (_pagination === 'reflowable-paginate') {
            if ((index >= 0) && (index < _totalPages) && (index !== _currentPage)) {
                _currentPage = index;
                RB.UI.applyCSS(_elements['columnpanel1'], 'right', index * _paginationWidth + 'px');
            }
        }
    };
    
    this.goToNextPage = function() {
        if (_pagination === 'reflowable-paginate') {
            if (_currentPage + 1 < _totalPages) {
                this.goToPage(_currentPage + 1);
            }
        }
        if (_pagination === 'reflowable-scroll') {
            //RB.UI.getElement(_elements['panel1']).scrollTo('+=' + (RB.UI.getHeight(_elements['panel1']) * RB.EPUBReader.scrollAmount) + 'px', {axis: 'y', duration: 250});
            RB.UI.scrollVerticalElement(_elements['panel1'], '+=' + (RB.UI.getHeight(_elements['panel1']) * RB.EPUBReader.scrollAmount) + 'px', RB.EPUBReader.UI.animatedScrollDuration);
        }
    };
    
    this.goToPreviousPage = function() {
        if (_pagination === 'reflowable-paginate') {
            if (_currentPage - 1 >= 0) {
                this.goToPage(_currentPage - 1);
            }
        }
        if (_pagination === 'reflowable-scroll') {
            //RB.UI.getElement(_elements['panel1']).scrollTo('-=' + (RB.UI.getHeight(_elements['panel1']) * RB.EPUBReader.scrollAmount) + 'px', {axis: 'y', duration: 250});
            RB.UI.scrollVerticalElement(_elements['panel1'], '-=' + (RB.UI.getHeight(_elements['panel1']) * RB.EPUBReader.scrollAmount) + 'px', RB.EPUBReader.UI.animatedScrollDuration);
        }
    };
    
    this.goToFirstPage = function() {
        if (_pagination === 'reflowable-paginate') {
            this.goToPage(0);
        }
        if (_pagination === 'reflowable-scroll') {
            RB.UI.getElement(_elements['panel1']).scrollTo(0); // TODO
        }
    };
    
    this.goToLastPage = function() {
        if (_pagination === 'reflowable-paginate') {
            this.goToPage(_totalPages - 1);
        }
        if (_pagination === 'reflowable-scroll') {
            RB.UI.getElement(_elements['panel1']).scrollTo(999999999); // TODO
        }
    };
    
    this.isFirstPage = function() {
        if (_pagination === 'reflowable-paginate') {
            return (_currentPage === 0);
        }
        if (_pagination === 'reflowable-scroll') {
            return (RB.UI.getOffsetTop(_elements['innerpanel1']) === RB.UI.getOffsetTop(_elements['container']));
        }
        return false;
    };
    
    this.isLastPage = function() {
        if (_pagination === 'reflowable-paginate') {
            return (_currentPage === (_totalPages - 1));
        }
        if (_pagination === 'reflowable-scroll') {
            var a = RB.UI.getOffsetTop(_elements['innerpanel1']) + RB.UI.getHeight(_elements['innerpanel1']);
            var b = RB.UI.getOffsetTop(_elements['panel1'])      + RB.UI.getHeight(_elements['panel1']);
            return (a <= b);
        }
        return false;
    };

    // when creating, set defaults
    this.setDefaults();
};





// (crazily complex) FOOTER MANAGER
//
// callback: called after updating visibility (e.g., after showing/hiding)
//
RB.EPUBReader.footerManager = function() {
    
    //
    // FOOTER_ROOT
    //    FOOTER_EXTRA
    //    FOOTER_TOP
    //        FOOTER_TOP_SLIDER
    //        FOOTER_TOP_QUICKBAR
    //    FOOTER_BOTTOM
    //        FOOTER_BOTTOM_AUDIO | FOOTER_BOTTOM_NOAUDIO
    //
    
    var _divIDs = {
        FOOTER_ROOT           : 'divFooterAll',
        FOOTER_EXTRA          : 'divFooterExtra',
        FOOTER_TOP            : 'divFooterTop',
        FOOTER_TOP_SLIDER     : 'divFooterSliderTop',
        FOOTER_TOP_QUICKBAR   : 'divFooterSliderBottom',
        FOOTER_BOTTOM         : 'divFooterBottom',
        FOOTER_BOTTOM_AUDIO   : 'divFooterPlayer',
        FOOTER_BOTTOM_NOAUDIO : 'divFooterNavBar',
    };
    
    var _buttonIDs = {
        BUTTON_STOP           : 'btnAudioStop',
        BUTTON_PLAYPAUSE      : 'btnAudioPlayPause',
    };

    var _visibilityCallback   = null;
    var _extraCallback        = null;
    var _initialized          = false;
    
    var _currentlyEnabled     = {};
    var _requestedVisible     = {};

    var _hasAudio             = false;
    var _assetHasAudio        = false;
    var _assetLayout          = 'reflowable';
    
    var _extraNoteOriginID    = null;
    var _extraNoteID          = null;
    
    this.enableAll = function() {
        var keys = Object.keys(_divIDs);
        for (var i = 0; i < keys.length; i++) {
            var id = keys[i];
            _currentlyEnabled[id] = true;
        }
    };

    this.hideAll = function() {
        var keys = Object.keys(_divIDs);
        for (var i = 0; i < keys.length; i++) {
            var id = keys[i];
            _requestedVisible[id] = false;
        }
        this.updateVisibility();
    };
    
    this.updateVisibility = function(silent) {
        // show footer if and only if at least one of extra, top, or bottom are visible
        _requestedVisible['FOOTER_ROOT'] = (_requestedVisible['FOOTER_EXTRA']) || (_requestedVisible['FOOTER_TOP'] && (_currentlyEnabled['FOOTER_TOP'])) || (_requestedVisible['FOOTER_BOTTOM']);
        
        // to be visible, each element must be currentlyEnabled AND _requestedVisible
        var keys = Object.keys(_divIDs);
        for (var i = 0; i < keys.length; i++) {
            var id = keys[i];
            var show = ((_currentlyEnabled[id]) && (_requestedVisible[id]));
            RB.UI.showHide(_divIDs[id], show);
        }
        
        // callback
        if ((_initialized) && (_visibilityCallback) && (!silent)) {
            _visibilityCallback();
        }
    };
    
    this.setVisibilityCallback = function(callback) {
        _visibilityCallback = callback;
    };
    
    this.setExtraCallback = function(callback) {
        _extraCallback = callback;
    };
    
    this.initialize = function(hasAudio, showSlider, showBottom, showQuickBar) {
        _hasAudio = hasAudio;
        _requestedVisible['FOOTER_TOP_SLIDER']   = showSlider;
        _requestedVisible['FOOTER_TOP_QUICKBAR'] = showQuickBar;
        _requestedVisible['FOOTER_TOP']          = showSlider || showQuickBar;
        _requestedVisible['FOOTER_BOTTOM']       = showBottom;
        
        if (_hasAudio) {
            _requestedVisible['FOOTER_BOTTOM_AUDIO']   = true;
            _requestedVisible['FOOTER_BOTTOM_NOAUDIO'] = false;
        } else {
            _currentlyEnabled['FOOTER_TOP']            = false;
            _currentlyEnabled['FOOTER_TOP_SLIDER']     = false;
            _currentlyEnabled['FOOTER_TOP_QUICKBAR']   = false;
            _requestedVisible['FOOTER_TOP']            = false;
            _requestedVisible['FOOTER_TOP_SLIDER']     = false;
            _requestedVisible['FOOTER_TOP_QUICKBAR']   = false;
            
            _currentlyEnabled['FOOTER_BOTTOM_AUDIO']   = false;
            _requestedVisible['FOOTER_BOTTOM_AUDIO']   = false;
            
            _requestedVisible['FOOTER_BOTTOM_NOAUDIO'] = true;
        }
        _initialized = true;
    };
    
    this.assetLayout = function(layout) {
        if (_initialized) {
            _assetLayout = layout;
            // TODO shall we limit the available options?
        }
    };
    
    this.assetHasAudio = function(assetHasAudio) {
        if (_initialized) {
            // update enabled elements
            if (_hasAudio) {
                _assetHasAudio = assetHasAudio;
                _currentlyEnabled['FOOTER_TOP']                         = _assetHasAudio;
                _currentlyEnabled['FOOTER_TOP_SLIDER']                  = _assetHasAudio;
                _currentlyEnabled['FOOTER_TOP_QUICKBAR']                = _assetHasAudio;
                RB.UI.enableDisableButton(_buttonIDs['BUTTON_STOP'],      _assetHasAudio);
                RB.UI.enableDisableButton(_buttonIDs['BUTTON_PLAYPAUSE'], _assetHasAudio);
            }
            
            // always hide extra on chapter change
            this.hideExtra();
            
            // update
            this.updateVisibility();
        }
    };
    
    this.cycleTopBottom = function() {
    
        // if initially not shown, we must force the request to show slider
        if (!_requestedVisible['FOOTER_TOP_SLIDER']) {
            _requestedVisible['FOOTER_TOP_SLIDER'] = true;
        }
    
        if (_currentlyEnabled['FOOTER_TOP']) {
            // top + bottom => bottom => none => top =>
            if (_requestedVisible['FOOTER_TOP']) {
                if (_requestedVisible['FOOTER_BOTTOM']) {
                    _requestedVisible['FOOTER_TOP']    = false;
                    //_requestedVisible['FOOTER_BOTTOM'] = true;
                } else {
                    //_requestedVisible['FOOTER_TOP']    = true;
                    _requestedVisible['FOOTER_BOTTOM'] = true;
                }
            } else {
                if (_requestedVisible['FOOTER_BOTTOM']) {
                    //_requestedVisible['FOOTER_TOP']    = false;
                    _requestedVisible['FOOTER_BOTTOM'] = false;
                } else {
                    _requestedVisible['FOOTER_TOP']    = true;
                    //_requestedVisible['FOOTER_BOTTOM'] = false;
                }
            }
        } else {
            //_requestedVisible['FOOTER_BOTTOM_AUDIO'] = false;
            _requestedVisible['FOOTER_BOTTOM'] = ! _requestedVisible['FOOTER_BOTTOM'];
        }
        this.updateVisibility();
    };
    
    this.cycleQuickBar = function() {
        if (_currentlyEnabled['FOOTER_TOP_QUICKBAR']) {
            _requestedVisible['FOOTER_TOP_QUICKBAR'] = !_requestedVisible['FOOTER_TOP_QUICKBAR'];
            this.updateVisibility();
        }
    };
    
    this.cycleBottom = function() {
        if (_currentlyEnabled['FOOTER_BOTTOM_AUDIO']) {
            _requestedVisible['FOOTER_BOTTOM_AUDIO']   = !_requestedVisible['FOOTER_BOTTOM_AUDIO'];
            _requestedVisible['FOOTER_BOTTOM_NOAUDIO'] = !_requestedVisible['FOOTER_BOTTOM_NOAUDIO'];
            this.updateVisibility();
        }
    };
    
    this.emptyExtra = function() {
        _extraNoteID       = null;
        _extraNoteOriginID = null;
        RB.UI.empty(_divIDs['FOOTER_EXTRA']);
    };
    
    this.getNoteID = function() {
        return _extraNoteID;
    };
    
    this.getNoteOriginID = function() {
        return _extraNoteOriginID;
    };
    
    this.putInExtra = function(noteID, originID, link, contents) {
        this.emptyExtra();
        _extraNoteID       = noteID;
        _extraNoteOriginID = originID;
        if (link) {
            RB.UI.append(_divIDs['FOOTER_EXTRA'], link);
        }
        //
        // NOTE cannot append contents directly,
        // otherwise it will be "consumed"
        // that is, it will be removed from the document DOM
        //
        // TODO find a better way of cloning contents
        //
        var clone = contents.outerHTML;
        RB.UI.append(_divIDs['FOOTER_EXTRA'], clone);
    };
    
    this.showExtra = function() {
        RB.UI.scrollElement(_divIDs['FOOTER_EXTRA'], 0);
        _requestedVisible['FOOTER_EXTRA'] = true;
        this.updateVisibility(true);
        if (_extraCallback) {
            _extraCallback(true);
        }
    };
    
    this.hideExtra = function() {
        this.emptyExtra();
        _requestedVisible['FOOTER_EXTRA'] = false;
        this.updateVisibility(true);
        if (_extraCallback) {
            _extraCallback(false);
        }
    };
    
    // enable and hide all
    this.enableAll();
    this.hideAll();
};






// EPUB MEDIA OVERLAYS RENDERER
//
// assetManager is an instance of RB.App.zipAssetsManager
// audio_src is an array of strings, each representing the path within the EPUB container (ZIP) of an audio asset
// data is an array of dictionaries, each containing the information for a SMIL fragment
// ids is an array of strings, each representing the ID of a SMIL fragment
// options is a dictionary containing optional parameters and callbacks:
//    - mode
//    - enablePlaybackSpeed
//    - moErrorCallback
//    - moInitCallback
//    - moTimerCallback
//    - moCompletedCallback
//
RB.EPUBReader.MediaOverlaysRenderer = function(assetManager, audio_src, data, ids, options) {
    var _assetManager = assetManager;
    var _audio_src    = audio_src;
    var _data         = data;
    var _ids          = ids;
    var _options      = options;
    
    var _this         = this;
    var _state        = 'created'; // created => initializing => initialized => playing/paused/stopped/completed => destroyed
    
    var _media                  = null;
    var _mediaDuration          = null;
    var _currentMediaActive     = null;
    var _currentMOID            = null;
    var _currentMOIndex         = -1;
    var _totalMO                = 0;
    var _mediaBeingInitialized  = 0;
    var _wallClock              = null;
    var _moTimer                = null;
    
    var _moLinearSequence       = [];
    var _moMap                  = {};
    var _moTotalTime            = 0;
    
    var _applyHighlight         = true;
    var _playbackSpeed          = 1.00;
    var _playbackVolume         = 1.00;
    
    var _sourceWrapperID        = null;
    var _activeClass            = null; // = '-epub-media-overlay-active';
    var _pausedClass            = null; // = '-epub-media-overlay-paused';
    var _playbackActiveClass    = null; // = '-epub-media-overlay-playback-active';
    
    // these are time-critical, so we store the callbacks in private variables
    var _moTimerCallback;
    if ('moTimerCallback' in _options) {
        _moTimerCallback = _options['moTimerCallback'];
    }
    if ('sourceWrapperID' in _options) {
        _sourceWrapperID = _options['sourceWrapperID'];
    }

    this.initialize = function() {
        _state = 'initializing';
        _totalMO               = _ids.length;
        _media                 = {};
        _mediaDuration         = {};
        _mediaBeingInitialized = 0;
        for (var i = 0; i < _audio_src.length; i++) {
            _mediaBeingInitialized++;
            (function(i) {
                var audio_src_i = _audio_src[i];
             
                var onInit = function() {
                    //alert("initialized " + i + "-th audio " + audio_src_i + " has duration: " + _media[audio_src_i].getDuration());
                    _mediaBeingInitialized--;
                    _mediaDuration[audio_src_i] = _media[audio_src_i].getDuration();
                    _media[audio_src_i].setPlaybackSpeed(_playbackSpeed);
                    _this.onInitialized();
                };
                var onCompleted = function() {
                    //alert("completed " + i + "-th audio " + audio_src_i);
                    _this.onCompletedMedia();
                };
             
                var trackOptions                    = {};
                trackOptions['mode']                = _options['mode'];
                trackOptions['enablePlaybackSpeed'] = _options['enablePlaybackSpeed'];
                trackOptions['initCallback']        = onInit;
                trackOptions['completionCallback']  = onCompleted;
                trackOptions['errorCallback']       = _this.onError;
                _media[audio_src_i] = new RB.App.singleTrack(_assetManager, trackOptions);
                _media[audio_src_i].setAudio(audio_src_i);
            
            }(i));
        }
        this.onInitialized();
    };
    
    this.onError = function() {
        _state === 'error';
        //this.stop();
        if (_options['moErrorCallback']) {
            _options['moErrorCallback']();
        }
    };
    
    this.onInitialized = function() {
        if ((_state === 'initializing') && (_mediaBeingInitialized <= 0)) {
            
            // here we can use duration etc.
            
            //
            // linearize MO schedule and compute the map:
            //
            // integer in [0, floor(_moTotalTime)] -> integer (_moIndex)
            // time (in second) ->  MO index
            //
            // this map is used by e.g. the slider
            //
            _moLinearSequence = [];
            _moMap            = {};
            _moTotalTime      = 0;
            var j             = 0;
            for (var i = 0; i < _data.length; i++) {
                var f_data = this.getMOData(i);
                var b = _moTotalTime;
                var e = _moTotalTime + f_data.clipDuration;
                var id = _ids[i];
                var l = {
                    original_index:         i,
                    original_id:            id,
                    original_audio_src:     f_data.audio_src,
                    original_clipBegin:     f_data.clipBegin,
                    original_clipEnd:       f_data.clipEnd,
                    original_clipDuration:  f_data.clipDuration,
                    linearized_clipBegin:   b,
                    linearized_clipEnd:     e
                };
                _moLinearSequence.push(l);
                _moTotalTime = e;
                for (; j < e; j++) {
                    _moMap[j] = i;
                }
            }
            
            // create wall clock
            _wallClock = new RB.App.WallClock(0, _playbackSpeed, _moTimerCallback, 1, false);
            
            _state = 'initialized';
            if (_options['moInitCallback']) {
                _options['moInitCallback']();
            }
        }
    };
    
    this.onCompletedMedia = function() {
        if ((_currentMOIndex) && (_currentMOIndex < _totalMO - 1)) {
            this.goToNextMO();
        } else {
            this.onCompletedMO();
        }
    };
    
    this.onCompletedMO = function() {
        if ((_state !== 'completed') && (_state !== 'error')) {
            _state = 'completed';
            this.stop();
            if (_options['moCompletedCallback']) {
                _options['moCompletedCallback']();
            }
        }
    };
    
    this.getState = function() {
        return _state;
    };
    
    this.currentStateIsNotReady = function() {
        return (_state === 'created') || (_state === 'initializing') || (_state === 'destroyed') || (_state === 'error');
    };
    
    this.stop = function() {
        _state = 'stopped';
        if (_moTimer) {
            _moTimer.stop();
            _moTimer = null;
        }
        if (_wallClock) {
            _wallClock.clear();
        }
        if (_media) {
            //for (var i = 0; i < _audio_src.length; i++) {
            //    _media[_audio_src[i]].stop();
            //}
            if (_currentMediaActive) {
                _media[_currentMediaActive].stop();
            }
        }
        this.removeCurrentMO();
        _currentMOID        = null;
        _currentMOIndex     = null;
        _currentMediaActive = null;
        if (_options['moStateChangedCallback']) {
            _options['moStateChangedCallback'](_state);
        }
    };
    
    this.play = function() {
        if (this.currentStateIsNotReady()) {
            return;
        }
        if ((_media) && (_currentMediaActive) && (_state !== 'playing')) {
            _state = 'playing';
            _media[_currentMediaActive].play();
            if (_moTimer) {
                _moTimer.start();
                this.updateCurrentMO();
            }
            if (_wallClock) {
                _wallClock.start();
                // _media[_currentMediaActive].getCurrentPosition(onPosition);
            }
            if (_options['moStateChangedCallback']) {
                _options['moStateChangedCallback'](_state);
            }
        }
    };
    
    this.pause = function() {
        if ((_media) && (_currentMediaActive) && (_state === 'playing')) {
            _state = 'paused';
            _media[_currentMediaActive].pause();
            if (_moTimer) {
                _moTimer.pause();
                this.updateCurrentMO();
            }
            if (_wallClock) {
                _wallClock.pause();
            }
            if (_options['moStateChangedCallback']) {
                _options['moStateChangedCallback'](_state);
            }
        }
    };
    
    this.playPause = function() {
        if ((_state === 'stopped') && (_currentMOID === null)) {
            this.playFromMOFragment(null, true);
        } else if (_state === 'playing') {
            this.pause();
        } else {
            this.play();
        }
    };
    
    this.getMOMap = function() {
        if (this.currentStateIsNotReady()) {
            return null;
        }
        return _moMap;
    };
    
    this.getLinearizedMODuration = function() {
        if (this.currentStateIsNotReady()) {
            return null;
        }
        return _moLinearSequence[_moLinearSequence.length - 1].linearized_clipEnd;
    };
    
    this.isMOID = function(s) {
        if (this.currentStateIsNotReady()) {
            return;
        }
        return (_ids.indexOf(s) > -1);
    };
    
    this.goToPreviousMO = function() {
        if (_currentMOID === null) {
            this.playFromMOFragment(null, true);
        } else {
            var index = _currentMOIndex - 1;
            if (index < 0) {
                index = 0;
            }
            this.playFromMOFragment(_ids[index], true);
        }
    };
    
    this.goToNextMO = function() {
        if (_currentMOID === null) {
            this.playFromMOFragment(null, true);
        } else {
            var index = _currentMOIndex + 1;
            if (index >= _totalMO) {
                this.onCompletedMO();
                return;
            }
            this.playFromMOFragment(_ids[index], true);
        }
    };
    
    this.getMOAtSecondStart = function(second) {
        if ((_moMap) && (_moLinearSequence) && (second !== null)) {
            var index = _moMap[second];
            if (index !== null) {
                var clip_data = _moLinearSequence[index];
                if (clip_data) {
                    return Math.floor(clip_data.linearized_clipBegin);
                }
            }
        }
        return null;
    };
    
    this.goToMOAtSecond = function(second) {
        if ((_moMap) && (_moLinearSequence) && (second !== null)) {
            var index = _moMap[second];
            if ((index !== null) && (index !== _currentMOIndex)) {
                this.playFromMOFragment(_ids[index], true);
            }
        }
    };
    
    this.playFromMOFragment = function(moID, playImmediately, fromPrevious) {
        if (this.currentStateIsNotReady()) {
            return;
        }
        if (_media) {
        
            if (moID === null) {
                moID = _ids[0];
                fromPrevious = false;
            }
            
            if (_currentMOID === moID) {
                
                // the requested ID is the current MO ID already => play/pause it
                this.playPause();
                
            } else {
            
                // we need to seek to the given moID
                var index = _ids.indexOf(moID);
                if (index > -1) {
                
                    // get data for the requested MO index
                    var f_data = _moLinearSequence[index];
                    if (f_data) {
                        
                        // playing the same media, continuing from the previous fragment?
                        // note that (false && undefined) evaluates to undefined, so we check (fromPrevious === true) explicitly
                        var continuingOnSameMedia = ((f_data.original_audio_src === _currentMediaActive) && (fromPrevious === true));
                        if ((continuingOnSameMedia) && (index > 0)) {
                            // check that the previous fragment clipEnd is
                            if (_moLinearSequence[index - 1].original_clipEnd !== f_data.original_clipBegin) {
                                continuingOnSameMedia = false;
                            }
                        }
                        
                        // if different media or user seeked, stop current media
                        if (! continuingOnSameMedia) {
                            this.stop();
                        }
                        
                        // remove current MO
                        this.removeCurrentMO();
                        
                        // update current MO
                        _currentMOID        = moID;
                        _currentMOIndex     = index;
                        _currentMediaActive = f_data.original_audio_src;
                        
                        // if not the same media or not from previous fragment,
                        // set the correct media, and seek to the correct position
                        if (! continuingOnSameMedia) {
                            // set media and seek to the fragment begin
                            _media[_currentMediaActive].seekTo(f_data.original_clipBegin);
                            _wallClock.setPosition(f_data.linearized_clipBegin, false);
                        }
                        
                        // adjust duration
                        var f_adjusted_duration = f_data.original_clipDuration / _playbackSpeed;
                        
                        // set moTimer
                        var callback;
                        if (index === _totalMO - 1) {
                            // we are at last fragment
                            callback = this.onCompletedMO;
                        } else {
                            // we have at least another fragment to go
                            var nextMOID = _ids[_currentMOIndex + 1];
                            callback = function() {
                                _this.playFromMOFragment(nextMOID, true, true);
                            };
                        }
                        _moTimer = new RB.App.Timeout(f_adjusted_duration, callback, continuingOnSameMedia);
                        
                        if (continuingOnSameMedia) {
                            // update current MO
                            this.updateCurrentMO();
                            
                            // start wall clock
                            _wallClock.start();
                        } else {
                            // play immediately if required
                            if (playImmediately) {
                                this.play();
                            }
                        }
                        
                        if (_options['moActiveFragmentChangedCallback']) {
                            _options['moActiveFragmentChangedCallback'](_currentMOID, fromPrevious);
                        }
                        
                    } else {
                        // no f_data => error?
                    }
                }
            }
        }
    };
    
    this.getMOData = function(index) {
        var f_data = _data[index];
        if (f_data) {
            var f_audio_src = f_data.audio_src;
            var f_clipBegin = f_data.audio_clipBegin;
            var f_clipEnd   = f_data.audio_clipEnd;
            var m_duration  = _mediaDuration[f_audio_src];
            if ((f_clipEnd === -1) || (f_clipEnd > m_duration)) {
                // mo-audio-020 (clipEnd not specified)
                // mo-audio-030 (clipEnd exceeding duration of physical media)
                //              => set clipEnd to duration of physical media
                f_clipEnd = m_duration;
            }
            var f_duration = f_clipEnd - f_clipBegin;
            return { 'audio_src': f_audio_src, 'clipBegin': f_clipBegin, 'clipEnd': f_clipEnd, 'clipDuration': f_duration };
        }
        return null;
    };
    
    this.getCurrentMOID = function() {
        return _currentMOID;
    };
    
    this.removeCurrentMO = function() {
        if (_currentMOID) {
            RB.UI.removeClass(_currentMOID, _pausedClass);
            RB.UI.removeClass(_currentMOID, _activeClass);
        }
    };
    
    this.updateCurrentMO = function() {
        if (_currentMOID) {
            this.removeCurrentMO();
            if (_applyHighlight) {
                if (_state === 'playing') {
                    RB.UI.addClass(_currentMOID, _activeClass);
                }
                if (_state === 'paused') {
                    RB.UI.addClass(_currentMOID, _pausedClass);
                }
            }
        }
        if ((_playbackActiveClass) && (_sourceWrapperID)) {
            if ((_applyHighlight) && (_state === 'playing')) {
                RB.UI.addClass(_sourceWrapperID, _playbackActiveClass);
            }
            if (_state === 'paused') {
                RB.UI.removeClass(_sourceWrapperID, _playbackActiveClass);
            }
        }
    };
    
    this.destroy = function() {
        this.stop();
        if (_media) {
            for (var i = 0; i < _audio_src.length; i++) {
                try {
                    // stop and release
                    _media[_audio_src[i]].destroy();
                } catch (e) {
                    // nop
                }
            }
            _media = null;
        }
        _state = 'destroyed';
    };
    
    this.setApplyHighlight = function(value) {
        this.removeCurrentMO();
        _applyHighlight = value;
        this.updateCurrentMO();
    };
    
    this.setHighlightClasses = function(values) {
        this.removeCurrentMO();
        _activeClass         = values['activeClass'];
        _pausedClass         = values['pausedClass'];
        _playbackActiveClass = values['playbackActiveClass'];
        this.updateCurrentMO();
    };
    
    this.setVolume = function(value) {
        _playbackVolume = value;
        if (_media) {
            for (var i = 0; i < _audio_src.length; i++) {
                try {
                    // set volume
                    _media[_audio_src[i]].setVolume(value);
                } catch (e) {
                    // nop
                }
            }
        }
    };
    
    this.setPlaybackSpeed = function(value) {
        if ((_options['enablePlaybackSpeed']) && (_media)) {
            var previousState = _state;
            var previousMOID  = _currentMOID;
            this.stop();
            for (var i = 0; i < _audio_src.length; i++) {
                try {
                    _media[_audio_src[i]].setPlaybackSpeed(value);
                } catch (e) {
                    // nop
                }
            }
            if (_wallClock) {
                _wallClock.setPlaybackSpeed(value, false);
            }
            _playbackSpeed = value;

            if (previousState === 'playing') {
                this.playFromMOFragment(previousMOID, true);
            }
            if (previousState === 'paused') {
                this.playFromMOFragment(previousMOID, false);
            }
        }
    };
    
    this.initialize();
};

// EPUB RENDERER
//
// assetManager is an instance of RB.App.zipAssetsManager
// panelManager is an instance of
// options is a dictionary containing optional parameters and callbacks:
//    - mode
//    - enablePlaybackSpeed
//    - autoStart
//    - showSpinner
//    - preload
//    - errorCallback
//    - initializedCallback
//    - renderedCallback
//    - renderToElementID
//    - enableReadBeyondHacks
//    - sourceWrapperID
//
RB.EPUBReader.EPUBRenderer = function(assetManager, options) {
    var _this                           = this;
    var _assetManager                   = assetManager;
    var _options                        = options || {};
    
    var _epubData                       = null;
    var _epubDirectory                  = null;
    var _totalRODItems                  = null;
    
    var _MORender                       = null;
    var _volume                         = 1.00;
    var _playbackSpeed                  = 1.00;
    var _applyHighlight                 = true;
    var _highlightingClasses            = {};
    
    var _currentROD                     = null;
    var _currentRODHref                 = null;
    var _currentRODIndex                = null;
    
    var _assetAnchor                    = null;
    var _assetMOID                      = null;
    
    var _assetViewport                  = null;

    var _currentRODMOPrepared           = false;
    var _currentRODMOValid              = false;
    
    var _goToTriggeredByUser            = null;
    
    var _renderWhenAllCSSArePatched     = false;
    var _renderSource                   = '';
    var _customCSSPath                  = null;
    var _beingPatchedCSS                = 0;
    var _patchedCSS                     = [];
    var _onload                         = false;
    
    if (!('mode' in _options)) {
        _options['mode'] = '1';
    }
    if (!('enablePlaybackSpeed' in _options)) {
        _options['enablePlaybackSpeed'] = true;
    }
    if (!('autoStart' in _options)) {
        _options['autoStart'] = true;
    }
    if (!('showSpinner' in _options)) {
        _options['showSpinner'] = true;
    }
    if (!('preload' in _options)) {
        _options['preload'] = true;
    }
    if (!('runJavascript' in _options)) {
        _options['runJavascript'] = false;
    }
    if (!('enableReadBeyondHacks' in _options)) {
        _options['enableReadBeyondHacks'] = false;
    }
    if (!('skipNonLinear' in _options)) {
        _options['skipNonLinear'] = false;
    }
    if (!('treatNonLinearAsCulDeSac' in _options)) {
        _options['treatNonLinearAsCulDeSac'] = false;
    }
    
    this.initialize = function() {
        var onUnzipped = function() {
            // parse EPUB data
            _epubDirectory = RB.App.joinPaths(['file://', _assetManager.getAbsolutePathTmpDirectory()]);
            _epubData = new RB.Format.EPUB.EPUB(_epubDirectory + RB.App.fileSeparator, {'full_parsing': true}); // note that here we need '/' at the end of the path; TODO change this
            _totalRODItems = _epubData.getROD().rod.length;
           
            // nonlinear:crossable is false?
            if (_epubData.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.NONLINEAR_CROSSABLE, true, true) === 'false') {
                _options['skipNonLinear'] = true;
                _options['treatNonLinearAsCulDeSac'] = true;
            }

            // hide spinner
            if (_options['showSpinner']) {
                RB.UI.showSpinner(false);
            }
            
            if (_options['initializedCallback']) {
                _options['initializedCallback']();
            }
        };
        
        // show spinner
        if (_options['showSpinner']) {
            RB.UI.showSpinner(true);
        }
        
        // copy custom.css
        var source = RB.App.joinPaths([RB.App.getAbsolutePathMainDirectory(), _options['customCSSFileName']]);
        _customCSSPath = RB.App.joinPaths([_assetManager.getAbsolutePathTmpDirectory(), _options['customCSSFileName']]);
        _assetManager.copyFile(source, _customCSSPath, null, null);
        
        // unzip
        _assetManager.unzipAllNonMediaFiles(onUnzipped, _options['errorCallback']);
    };
    
    this.getTitle = function() {
        return _epubData.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_TITLE, true, true);
    };
    
    this.getMetadatumValue = function(name, only_first, as_string) {
        return _epubData.getMetadatumValue(name, only_first, as_string);
    };
    
    this.getAssetTitle = function() {
        if (_currentRODHref) {
            var tocItem = _epubData.getTOC().getTOCItemByHref(_currentRODHref);
            if (tocItem) {
                return tocItem.label;
            }
        }
        return null;
    };
    this.getAssetPlaylistIndex = function() {
        if ((_epubData.hasMediaOverlays()) && (_currentRODHref)) {
            return _epubData.getPlaylist().getPlaylistItemIndexByHref(_currentRODHref) + 1;
        }
        return null;
    };
    this.getPlaylistLength = function() {
        if (_epubData.hasMediaOverlays()) {
            return _epubData.getPlaylist().playlist.length;
        }
        return null;
    }
    
    this.getROD = function() {
        return _epubData.getROD();
    };
    
    this.getTOC = function() {
        return _epubData.getTOC().toc;
    };
    
    this.hasMediaOverlays = function() {
        return _epubData.hasMediaOverlays();
    };
    
    this.hasPrePaginated = function() {
        // TODO we should scan all the spine items and see if at least one is pre-paginated
        return (_epubData.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.RENDITION_LAYOUT, true, true) === 'pre-paginated');
    };
    
    this.currentAssetHasAudio = function() {
        if (_currentROD) {
            return _currentROD['valid_mo'];
        }
        return false;
    };
    
    this.getMediaDuration = function() {
        if (_epubData.hasMediaOverlays()) {
            return _epubData.getMediaDuration(true, true);
        }
        return null;
    };
    
    this.getMOMap = function() {
        if (_MORender) {
            return _MORender.getMOMap();
        }
        return null;
    };
    
    this.getLinearizedMODuration = function() {
        if (_MORender) {
            return _MORender.getLinearizedMODuration();
        }
        return null;
    };
    
    this.getPlaylist = function() {
        if (_epubData.hasMediaOverlays()) {
            return _epubData.getPlaylist().playlist;
        }
        return null;
    };
    
    this.goToNextRODItem = function(goToTriggeredByUser) {
        if ((_options['treatNonLinearAsCulDeSac']) && (!_currentROD.linear)) {
            return;
        }
        var attempted_index = _currentRODIndex + 1;
        while (attempted_index < _totalRODItems) {
            var attempted_rod = _epubData.getROD().rod[attempted_index];
            if ((attempted_rod.linear) || (!_options['skipNonLinear'])) {
                this.goToRODItemByIndex(attempted_index, goToTriggeredByUser);
                break;
            } else {
                attempted_index++;
            }
        }
    };
    
    this.goToPreviousRODItem = function(goToTriggeredByUser) {
        if ((_options['treatNonLinearAsCulDeSac']) && (!_currentROD.linear)) {
            return;
        }
        var attempted_index = _currentRODIndex - 1;
        while (attempted_index >= 0) {
            var attempted_rod = _epubData.getROD().rod[attempted_index];
            if ((attempted_rod.linear) || (!_options['skipNonLinear'])) {
                this.goToRODItemByIndex(attempted_index, goToTriggeredByUser);
                break;
            } else {
                attempted_index--;
            }
        }
    };
    
    this.goToRODItemByIndex = function(index, goToTriggeredByUser) {
        var rodItem = _epubData.getROD().rod[index];
        if (rodItem) {
            this.setPosition(rodItem.text_src, null, null, goToTriggeredByUser);
        }
    };
    
    this.goToRODItemByHref = function(href, goToTriggeredByUser) {
        var h = RB.Utilities.splitHref(href);
        var rodItem = _epubData.getROD().getRODItemByHref(h[0]);
        if (rodItem) {
            this.setPosition(rodItem.text_src, h[1], null, goToTriggeredByUser);
        }
    };
    
    this.getCurrentAssetViewport = function() {
        return _assetViewport;
    };
    
    this.getCurrentAssetRenditionLayout = function() {
        return _currentROD['rendition']['rendition:layout'];
    };
    
    this.getCurrentAssetHref = function() {
        return _currentRODHref;
    };
    
    this.getCurrentAssetAnchor = function() {
        return _assetAnchor;
    };
    
    this.getCurrentMOID = function() {
        if (_MORender) {
            return _MORender.getCurrentMOID();
        }
        return null;
    };
    this.goToPreviousMO = function() {
        if (_MORender) {
            _MORender.goToPreviousMO();
        }
    };
    this.goToNextMO = function() {
        if (_MORender) {
            _MORender.goToNextMO();
        }
    };
    this.goToMOAtSecond = function(second) {
        if (_MORender) {
            _MORender.goToMOAtSecond(second);
        }
    };
    this.getMOAtSecondStart = function(second) {
        if (_MORender) {
            return _MORender.getMOAtSecondStart(second);
        }
        return null;
    };
    this.getMOState = function() {
        if (_MORender) {
            return _MORender.getState();
        }
        return null;
    };
    
    this.getPosition = function() {
        // if MO, get the current MO ID
        _assetMOID = this.getCurrentMOID();
    
        // return the current position
        return {
            'assetHref':    _currentRODHref,
            'assetAnchor':  _assetAnchor,
            'assetMOID':    _assetMOID
        };
    };
    
    this.isMOID = function(s) {
        if (_MORender) {
            return _MORender.isMOID(s);
        }
        return false;
    };
    
    this.playFromMOFragment = function(element_id, playImmediately) {
        if (_MORender) {
            _MORender.playFromMOFragment(element_id, playImmediately);
        }
    };
    
    this.stop = function() {
        if (_MORender) {
            _MORender.stop();
        }
    };
    
    this.playPause = function() {
        if (_MORender) {
            _MORender.playPause();
        }
    };
    
    this.pause = function() {
        if (_MORender) {
            _MORender.pause();
        }
    };
    
    this.play = function() {
        if (_MORender) {
            _MORender.play();
        }
    };
    
    this.setVolume = function(value) {
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        _volume = value;
        if (_MORender) {
            _MORender.setVolume(_volume);
        }
    };
    
    this.setPlaybackSpeed = function(value) {
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        _playbackSpeed = value;
        if (_MORender) {
            _MORender.setPlaybackSpeed(_playbackSpeed);
        }
    };
    
    this.setApplyHighlight = function(value) {
        _applyHighlight = value;
        if (_MORender) {
            _MORender.setApplyHighlight(_applyHighlight);
        }
    };
    
    this.setHighlightStyle = function(value) {
        var ac, pc, pac;
        if (value === '-1') {
            ac  = _epubData.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.MEDIA_ACTIVE_CLASS, true, true);
            pc  = _epubData.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.MEDIA_PAUSED_CLASS, true, true);
            if (pc === null) {
                pc = ac;
            }
            pac = _epubData.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.MEDIA_PLAYBACK_ACTIVE_CLASS, true, true);
        } else {
            ac  = 'rbActive' + value;
            pc  = 'rbPaused' + value;
            pac = 'rbPlaybackActive' + value;
        }
        _highlightingClasses = { 'activeClass': ac, 'pausedClass': pc, 'playbackActiveClass': pac };
        if (_MORender) {
            _MORender.setHighlightClasses(_highlightingClasses);
        }
    };
    
    this.setPosition = function(assetHref, assetAnchor, assetMOID, goToTriggeredByUser) {
        
        // already playing MO?
        if (_MORender) {
        
            if (assetHref === _currentRODHref) {
                
                if (assetAnchor) {
                    // if we have _assetAnchor, we should look for the first MO after assetAnchor
                    var nextMOID = null;
                    try {
                        var element  = document.getElementById(assetAnchor);
                        nextMOID = this.findNextMOFragment(element);
                    } catch (e) {
                        // nop
                    }
                    if (nextMOID) {
                        // found one MO ID => start from there
                        assetMOID = nextMOID;
                    } else {
                        // not found => save assetAnchor and call renderedCallback
                        _assetAnchor = assetAnchor;
                        if (_options['renderedCallback']) {
                            _options['renderedCallback']({ 'kind': 'highlightnote', 'anchor': assetAnchor });
                        }
                        return;
                    }
                }
                
                // play from the specified assetMOID
                // note that if assetMOID === null, start from first fragment
                _MORender.playFromMOFragment(assetMOID, true);
                if (_options['renderedCallback']) {
                    _options['renderedCallback'](goToTriggeredByUser);
                }
                return;
                
            } else {
                // different ROD => stop current MO...
                
                _MORender.stop();
                _MORender = null;
                
                // and proceed loading the new ROD (see below)
            }
        }

        // load new ROD
        
        // show spinner
        if (_options['showSpinner']) {
            RB.UI.showSpinner(true);
        }
        
        if (goToTriggeredByUser) {
            _goToTriggeredByUser = goToTriggeredByUser;
        }
        
        // set flags
        _renderWhenAllCSSArePatched = false;
        _currentRODMOPrepared       = false;
        _currentRODMOValid          = false;
        
        // set current position
        var index = _epubData.getROD().getRODIndexByHref(assetHref);
        if (index !== null) {
            _currentRODHref  = assetHref;
            _currentRODIndex = index;
            _assetAnchor     = assetAnchor;
            _assetMOID       = assetMOID;
            _currentROD      = _epubData.getROD().rod[_currentRODIndex];
            if (_currentROD.valid_mo === false) {
                RB.App.message('The SMIL file associated with this chapter is malformed or it has an unsupported structure (e.g., no <audio> element).', RB.App.MessageSeverityEnum.INFO);
            }
            
            // prepare MO if needed
            if (_currentROD.valid_mo === true) {
                _options['moInitCallback'] = function() {
                    _currentRODMOPrepared = true;
                    _currentRODMOValid    = true;
                    _this.render();
                };
                _options['moErrorCallback'] = function() {
                    if (_MORender) {
                        _MORender.destroy();
                        _MORender = null;
                    }
                    _currentRODMOPrepared = true;
                    _currentRODMOValid    = false;
                    RB.App.message('A fatal error occurred when trying to play the audio file associated with the current chapter, for example the audio file could not be extracted. Check that you have enough free space on your device.', RB.App.MessageSeverityEnum.INFO);
                    _this.render();
                };
                
                _MORender = new RB.EPUBReader.MediaOverlaysRenderer(_assetManager, _currentROD.audio_src, _currentROD.smil_data, _currentROD.smil_ids, _options);
            } else {
                if (_MORender) {
                    _MORender.destroy();
                    _MORender = null;
                }
                _currentRODMOPrepared = true;
                _currentRODMOValid    = false;
            }
            
            // preload previous and next
            if (_options['preload']) {
                try {
                    this.preloadAssetsForRODIndex(_currentRODIndex - 1);
                    this.preloadAssetsForRODIndex(_currentRODIndex + 1);
                } catch (e) {
                    // nop
                }
            }
            
            // clean cache of extracted assets, if needed
            _assetManager.cleanExtractedAssetsCache();
            
            // read asset and render it
            var assetFullPath  = RB.App.joinPaths([_epubDirectory, _currentRODHref]);
            var assetXMLObject = RB.Utilities.loadXMLFile(assetFullPath);
            this.renderAsset(assetFullPath, assetXMLObject);
        } else {
            // index not found => throw "404" error?
        }
    };
    
    this.preloadAssetsForRODIndex = function(rodIndex) {
        if ((rodIndex >= 0) && (rodIndex < _totalRODItems)) {
            var attempted_rod = _epubData.getROD().rod[rodIndex];
            if ((attempted_rod) && (attempted_rod.audio_src)) {
                var requiredAssets = attempted_rod.audio_src;
                for (var i = 0; i < requiredAssets.length; i++) {
                    // no callbacks when preloading!
                    _assetManager.unzipSingle(requiredAssets[i], null, null);
                }
            }
        }
    };
    
    this.renderAsset = function(assetFullPath, assetXMLObject) {

        // reset flags
        _beingPatchedCSS = 0;

        // if we have ReadBeyond customization on, deal with special assets
        if ((_options['enableReadBeyondHacks']) && (this.getCurrentAssetRenditionLayout() !== 'pre-paginated')) {
            var fileName = RB.Utilities.getLastPathComponent(assetFullPath).toLowerCase();
            
            // cover
            if ((fileName === 'copertina.xhtml') || (fileName === 'cover.xhtml') || (fileName.indexOf('cover') > -1)) {
                var cover   = _epubData.getCover();
                var isCover = false;
                isCover = isCover || (fileName === 'copertina.xhtml');
                isCover = isCover || (fileName === 'cover.xhtml');
                if ((!isCover) && (cover)) {
                    var coverFileName = RB.Utilities.getLastPathComponent(cover);
                    var source = assetXMLObject.documentElement.innerHTML;
                    if (source.indexOf(coverFileName) > -1) {
                        isCover = true;
                    }
                }
                if (isCover) {
                    var coverFullPath = RB.App.joinPaths([_epubDirectory, _epubData.getCover()]);
                    _renderSource = '<div class="coverContainer"><img id="synthetic-img-cover-0" class="cover" src="' + coverFullPath + '"/></div>';
                    _renderWhenAllCSSArePatched = true;
                    this.render();
                    return;
                }
            }
            
            // playlist
            if (fileName === 'playlist.xhtml') {
                _renderSource = RB.UI.i18n('txtCustomPlaylistSource');
                RB.App.delay(RB.EPUBReader.openPlaylist, 1000);
                _renderWhenAllCSSArePatched = true;
                this.render();
                return;
            }
        }
        
        // patch and render
        _assetViewport = null;
        _renderSource = this.patchXHTML(assetFullPath, assetXMLObject);
        _renderWhenAllCSSArePatched = true;
        this.render();
    };
    
    this.patchXHTML = function(assetFullPath, assetXMLObject) {        
        var parentDirectory = RB.Utilities.getParentDirectory(assetFullPath);
        
        // define filter for <style> elements
        var isStyle = function(element) {
            return ((element.type) && (element.type.toLowerCase() === 'text/css'));
        };
        
        // define filter for linked CSS
        var isCSS = function(element) {
            return ((element.type) && (element.type.toLowerCase() === 'text/css'))
                   || ((element.rel)  && (element.rel.toLowerCase() === 'stylesheet'))
                   || ((element.href) && (element.href.toLowerCase().slice(-3) === 'css'));
        };

        // remove script elements
        if (! _options['runJavascript']) {
            assetXMLObject = RB.Utilities.removeFromDOM(assetXMLObject, 'script');
        }
        
        // remove <style> elements and linked CSS
        if (_options['stripCSS']) {
            // remove <style> elements
            assetXMLObject = RB.Utilities.removeFromDOM(assetXMLObject, 'style', isStyle);
            
            // remove linked CSS
            assetXMLObject = RB.Utilities.removeFromDOM(assetXMLObject, 'link', isCSS);
        }
        
        // inject custom CSS
        if (_options['injectCustomCSS']) {
                try {
                var head  = assetXMLObject.getElementsByTagName('head');
                if ((!head) || (head.length < 1)) {
                    head  = document.createElement('head');
                    assetXMLObject.getElementsByTagName('html')[0].appendChild(head);
                } else {
                    head  = head[0];
                }
                var link  = document.createElement('link');
                link.type = 'text/css';
                link.rel  = 'stylesheet';
                link.href = _customCSSPath;
                head.appendChild(link);
            } catch (e) {
                // nop
            }
        }
        
        // patch surviving <style> elements
        // NOTE switching to iframe will make this unnecessary
        var elements = RB.Utilities.filterElementsFromDOM(assetXMLObject, 'style', isStyle);
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            element.innerHTML = this.patchCSS(element.innerHTML);
        }
        
        // patch surviving linked CSS
        // NOTE switching to iframe will make this unnecessary
        var elements = RB.Utilities.filterElementsFromDOM(assetXMLObject, 'link', isCSS);
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            (function() {
                var sourcePath = '' + element.href;
                if (_patchedCSS.indexOf(sourcePath) === -1) {
                    _beingPatchedCSS++;
                    var source = RB.Utilities.loadTextFile(sourcePath);
                    if (source) {
                        var patched = _this.patchCSS(source);
                        var onSuccess = function() {
                            _beingPatchedCSS--;
                            _patchedCSS.push(sourcePath);
                            _this.render();
                        };
                        var onError = function() {
                            _beingPatchedCSS--;
                            _this.render();
                        };
                        _assetManager.writeToFile(sourcePath, patched, onSuccess, onError);
                    }
                }
            }(element));
        }
        
        // patch href and src
        // NOTE switching to iframe will make this unnecessary
        var elements = assetXMLObject.getElementsByTagName('*');
        for (var j = 0; j < elements.length; j++) {
            var el = elements[j];
            if (el.href) {
                el.href = '' + el.href;
                //el.href = this.patchReference(el.href, parentDirectory);
            }
            if (el.src) {
                el.src = '' + el.src;
                //el.src = this.patchReference(el.src, parentDirectory);
            }
        }
        
        // patch links
        // NOTE switching to iframe will make this unnecessary
        var elements = RB.Utilities.filterElementsFromDOM(assetXMLObject, 'a');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            (function() {
                if (!element.id) {
                    element.id = 'synthetic-a-' + i;
                }
                RB.EPUBReader.patchedAElements[element.id] = '' + element.href;
                element.href = '#';
            }(element));
        }
        
        // add synthetic id attributes to img
        // note that we need id's to open image popups
        // TODO devise a better strategy
        var elements = RB.Utilities.filterElementsFromDOM(assetXMLObject, 'img');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            (function() {
                if (!element.id) {
                    element.id = 'synthetic-img-' + i;
                }
            }(element));
        }
        
        /*
        // add synthetic id attributes to p
        var elements = RB.Utilities.filterElementsFromDOM(assetXMLObject, 'p');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            (function() {
                if (!element.id) {
                    element.id = 'synthetic-p-' + i;
                }
            }(element));
        }
        */
        
        // scan and remove viewport
        // NOTE injecting the viewport meta is harmful, hence we remove that meta
        var elements = RB.Utilities.filterElementsFromDOM(assetXMLObject, 'meta');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if ((element.name) && (element.name === 'viewport') && (element.content)) {
                var vp = RB.Utilities.parseViewportString(element.content);
                if (vp) {
                    _assetViewport = vp;
                }
                // remove from DOM
                element.parentNode.removeChild(element);
            }
        }
        
        // look for body onload
        _onload = null;
        if (_options['runJavascript']) {
            var elements = RB.Utilities.filterElementsFromDOM(assetXMLObject, 'body');
            if (elements.length > 0) {
                var body = elements[0];
                if (body) {
                    _onload = body.getAttribute('onload');
                }
            }
        }
        
        // we need to return the HTML string
        var html = assetXMLObject.documentElement.innerHTML;
        
        // normalize end spaces in tags:
        // from <hr id="audio" class="sepBar" />
        // to <hr id="audio" class="sepBar"/>
        html = html.replace(/" \/>/g, '"/>');
        
        // normalize hrefs, to patch them later:
        // from href = "url" or href= "url" or href ="url"
        // to href="url"
        html = html.replace(/href[ ]*=[ ]*"/g, 'href="');
                    
        if (_options['enableReadBeyondHacks']) {
            // hide audioBar/navBar
            var sep_bar_begin_list = ['<hr id="audio" class="sepBar"/>'];
            var sep_bar_end_list   = ['<hr class="sepBar"/>'];
            for (var i = 0; i < sep_bar_begin_list.length; i++) {
                // remove header navigation links and <audio>, if present
                var sep_bar_begin   = sep_bar_begin_list[i];
                var sep_bar_end     = sep_bar_end_list[i];
                var audio_div_begin = html.indexOf(sep_bar_begin);
                var audio_div_end   = html.indexOf(sep_bar_end, audio_div_begin + 1);
                if ((audio_div_begin > -1) && (audio_div_end > -1)) {
                    html = html.substring(0, audio_div_begin) + html.substring(audio_div_end + sep_bar_end.length);
                }
                // remove bottom navigation links
                audio_div_end       = html.lastIndexOf(sep_bar_end);
                audio_div_begin     = html.lastIndexOf(sep_bar_end, audio_div_end - 1);
                if ((audio_div_begin > -1) && (audio_div_end > -1)) {
                    html = html.substring(0, audio_div_begin) + html.substring(audio_div_end + sep_bar_end.length);
                }
            }
        }
        
        //alert(html.substring(0, 1000));
        
        html = '<div id="' + RB.EPUBReader.UI.divSourceContainer + '">' + html + '</div>';
        
        return html;
    };
    
    this.patchCSS = function(string) {
        var options = {};
        options.openbrace = 'separate-line';
        options.autosemicolon = true;
        options.indent = '    ';
        var result = string;
        result = result.replace(/\n/g, ' ');
        result = result.replace(/\/\*.*?\*\//g, ' ');
        result = cssbeautify(result, options);
        var lines = result.split('\n');
        var s = '';
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            if (l == '') {
                continue;
            }
            var ch0 = l.substring(0, 1);
            if (' {}@'.indexOf(ch0) > -1) {
                s += l + '\n';
            } else {
                var names = l.split(',');
                var tmp = '';
                for (var j = 0; j < names.length; j++) {
                    tmp += ', ' + '#' + _options['renderToElementID'] + ' ' + names[j]
                }
                s += tmp.substring(2) + '\n';
            }
        }
        return s;
    };
    
    this.findNextMOFragment = function(element) {
        if (element) {
            if ((element.id) && (this.isMOID(element.id))) {
                return element.id;
            }
            var children = element.children;
            for (var i = 0; i < children.length; i++) {
                var found_id = this.findNextMOFragment(children[i]);
                if (found_id !== null) {
                    return found_id;
                }
            }
            // TODO should we continue exploring to the element siblings?
        }
        return null;
    };
    
    this.render = function() {
        if ((_currentRODMOPrepared) && (_renderWhenAllCSSArePatched) && (_beingPatchedCSS === 0)) {
            // hide spinner
            if (_options['showSpinner']) {
                RB.UI.showSpinner(false);
            }
            
            var id = _options['renderToElementID'];
            if (id) {
                RB.UI.getElement(id).html(_renderSource);
                _renderSource = '';
                _renderWhenAllCSSArePatched = false;

                // prepare MO but do not start it
                if ((_currentRODMOValid) && (_MORender)) {
                    _MORender.setVolume(_volume);
                    _MORender.setPlaybackSpeed(_playbackSpeed);
                    _MORender.setApplyHighlight(_applyHighlight);
                    _MORender.setHighlightClasses(_highlightingClasses);
                    
                    // if we have _assetAnchor, we should look for the first MO after _assetAnchor
                    if (_assetAnchor) {
                        var element  = document.getElementById(_assetAnchor);
                        var nextMOID = this.findNextMOFragment(element);
                        if (nextMOID) {
                            // found one MO ID => start from there
                            _assetMOID = nextMOID;
                        }
                    }

                    // do false => do not start it
                    // the "auto start" feature is done
                    // by calling playPause() in renderedCallback (i.e., onAssetRendered)
                    if ((_assetMOID === null) || (_assetMOID === undefined)) {
                        _MORender.playFromMOFragment(null, false); // null will play from first
                    } else {
                        _MORender.playFromMOFragment(_assetMOID, false);
                    }
                }
                if (_options['renderedCallback']) {
                    _options['renderedCallback'](_goToTriggeredByUser);
                    _goToTriggeredByUser = null;
                }
                
                if ((_options['runJavascript']) && (_onload)) {
                    // TODO maybe we want a safer way to do this
                    // NOTE switching to iframe will make this unnecessary
                    eval(_onload);
                    _onload = null;
                }
            }
        }
    };
    
    this.setPositionToFirstItem = function(firstItemWithAudio) {
        var index = 0;
        if (firstItemWithAudio) {
            // try getting the first ROD element with MO
            index = _epubData.getOpenBookAtRODItemIndex(RB.Format.EPUB.OpenBookAtEnum.EPUB3_ROD_MO);
        } else {
            // try getting the element with "text" in OPF guide
            index = _epubData.getOpenBookAtRODItemIndex(RB.Format.EPUB.OpenBookAtEnum.EPUB2_GUIDE_TEXT);
        }
        // if still not set, set it to the first spine item with linear="yes" in the spine
        if (index === null) {
            index = _epubData.getOpenBookAtRODItemIndex(RB.Format.EPUB.OpenBookAtEnum.EPUB_SPINE_LINEAR);
        }
        // if still not set, set it to the first ROD item
        if (index === null) {
            index = 0;
        }
        this.setPosition(_epubData.getROD().rod[index].text_src, null, null, 'first');
    };
        
    this.initialize();
};








// expose epubReadingSystem object
RB.EPUBReader.exposeEPUBReadingSystem = function() {
    
    // IDPF EPUB 3 specs stuff --- immutable
    var epubRS     = {};
    epubRS.name    = RB.Config.Minstrel.epubRSName;
    epubRS.version = RB.Config.Minstrel.epubRSVersion;
    
    var supported_features = {
        'dom-manipulation': true,
        'layout-changes':   true,
        'touch-events':     true,
        'mouse-events':     false,  // TODO
        'keyboard-events':  false,  // TODO
        'spine-scripting':  true,
    };
    epubRS.hasFeature = function(feature, version) {
        if (feature in supported_features) {
            return supported_features[feature];
        } else {
            return false;
        }
    };
    
    // IDPF EPUB 3 specs stuff --- mutable
    epubRS.layoutStyle                              = null;
    
    // specific (proprietary) stuff --- mutable
    epubRS.events                                   = {};
    epubRS.events.onOrientationChange               = null;
    epubRS.settings                                 = {};
    epubRS.settings.stripPublisherCSS               = null;
    epubRS.settings.injectUserCSS                   = null;

    RB.EPUBReader.epubRSMap = {
        'EPUB_FONT_FAMILY':                 { 'name': 'fontFamily',                  'event': 'onFontFamilyChange'                  },
        'EPUB_FONT_SIZE':                   { 'name': 'fontSize',                    'event': 'onFontSizeChange'                    },
        'EPUB_TEXT_TRANSFORM':              { 'name': 'textTransform',               'event': 'onTextTransformChange'               },
        'EPUB_TEXT_ALIGN':                  { 'name': 'textAlign',                   'event': 'onTextAlignChange'                   },
        'EPUB_LINE_SPACING_FACTOR':         { 'name': 'lineSpacing',                 'event': 'onLineSpacingChange'                 },
        'EPUB_LEFT_MARGIN_SIZE':            { 'name': 'leftMargin',                  'event': 'onMarginSizeChange'                  },
        'EPUB_RIGHT_MARGIN_SIZE':           { 'name': 'rightMargin',                 'event': 'onMarginSizeChange'                  },
        'EPUB_CONTENT_BACKGROUND_COLOR':    { 'name': 'backgroundColor',             'event': 'onBackgroundColorChange'             },
        'EPUB_CONTENT_FONT_COLOR':          { 'name': 'fontColor',                   'event': 'onFontColorChange'                   },
        'EPUB_PLAYBACK_SPEED':              { 'name': 'playbackSpeed',               'event': 'onPlaybackSpeedChange'               },
        'EPUB_PLAYBACK_VOLUME':             { 'name': 'playbackVolume',              'event': 'onPlaybackVolumeChange'              },
        'EPUB_APPLY_HIGHLIGHT':             { 'name': 'applyHighlightStyle',         'event': 'onApplyHighlightStyleChange'         },
        'EPUB_HIGHLIGHT_STYLE':             { 'name': 'highlightStyle',              'event': 'onHighlightStyleChange'              },
        'EPUB_APPLY_TYPO':                  { 'name': 'applyTypographicSettings',    'event': 'onApplyTypographicSettingsChange'    },
        'EPUB_TAP_TO_PLAY':                 { 'name': 'tapToPlay',                   'event': 'onTapToPlayChange'                   },
        'EPUB_AUTO_SCROLL':                 { 'name': 'autoScroll',                  'event': 'onAutoScrollChange'                  },
    };

    var keys = Object.keys(RB.EPUBReader.epubRSMap);
    for (var i = 0; i < keys.length; i++) {
        var v = RB.EPUBReader.epubRSMap[keys[i]];
        epubRS.settings[v['name']] = null;
        epubRS.events[v['event']]  = null;
    };

    epubRS.ui                                       = {};
    epubRS.ui.theme                                 = null;
    epubRS.ui.orientation                           = null;
    epubRS.ui.orientationLock                       = null;
    epubRS.ui.language                              = null;
    epubRS.ui.brightness                            = null;
    
    // scrolling or paginated
    epubRS.layoutStyle                              = 'scrolling';
    epubRS.settings.stripPublisherCSS               = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_STRIP_CSS);
    epubRS.settings.injectUserCSS                   = RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_INJECT_CUSTOM_CSS);

    // ui stuff
    if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_NIGHT_MODE)) {
        epubRS.ui.theme = 'dark';
    } else {
        epubRS.ui.theme = 'light';
    }
    epubRS.ui.language = RB.Storage.get(RB.Storage.Keys.UI_LANGUAGE);
    
    // expose
    navigator.epubReadingSystem = epubRS;
    
    // update
    RB.EPUBReader.updateEPUBReadingSystem('all', false);
};

// update epubReadingSystem object
RB.EPUBReader.updateEPUBReadingSystem = function(param, fire) {
   
    // abort if reader_run_javascript is disabled 
    if (! RB.Storage.isAppParameterTrue(RB.Storage.Keys.EPUB_RUN_JAVASCRIPT)) {
        return;
    }
    
    try {
    
        if (navigator.epubReadingSystem) {
            
            // orientation
            if ((param === 'all') || (param === 'orientation')) {
                // set device orientation
                var or = '';
                var or_lock = RB.Storage.get(RB.Storage.Keys.UI_ORIENTATION);
                switch (window.orientation) {
                    case 0:
                        // portrait (home bottom)
                        or = 'portrait';
                        break;
                    case 90:
                        // landscape (home left)
                        or = 'landscape';
                        break;
                    case 180:
                        // reverse portrait (home top)
                        or = 'reverse portrait';
                        break;
                    case -90:
                        // reverse landscape (home right)
                        or = 'reverse landscape';
                        break;
                }
                navigator.epubReadingSystem.ui.orientation = or;
                navigator.epubReadingSystem.ui.orientationLock = or_lock;
                if (fire && navigator.epubReadingSystem.events.onOrientationChange) {
                    navigator.epubReadingSystem.events.onOrientationChange(or, or_lock);
                }
            }
            
            // paginate affects layoutStyle
            // TODO deal with the FXL case
            if ((param === 'all') || (param === 'EPUB_PAGINATE_REFLOWABLE')) {
                if (RB.EPUBReader.drs.getValue(param)) {
                    navigator.epubReadingSystem.layoutStyle = 'paginated';
                } else {
                    navigator.epubReadingSystem.layoutStyle = 'scrolling';
                }
                if (fire && navigator.epubReadingSystem.events.onLayoutStyleChange) {
                    navigator.epubReadingSystem.events.onLayoutStyleChange(navigator.epubReadingSystem.layoutStyle);
                }
            }
            
            if (param === 'all') {
                var keys = Object.keys(RB.EPUBReader.epubRSMap);
                for (var i = 0; i < keys.length; i++) {
                    var v = RB.EPUBReader.epubRSMap[keys[i]];
                    var w = RB.EPUBReader.drs.getValue(keys[i]);
                    var c = navigator.epubReadingSystem.events[v['event']];
                    navigator.epubReadingSystem.settings[v['name']] = w;
                    if (fire && c) {
                        c(w);
                    }
                };
            }
            
            if (param in RB.EPUBReader.epubRSMap) {
                var v = RB.EPUBReader.epubRSMap[param];
                var w = RB.EPUBReader.drs.getValue(param);
                var c = navigator.epubReadingSystem.events[v['event']];
                navigator.epubReadingSystem.settings[v['name']] = w;
                if (fire && c) {
                    c(w);
                }
            }
            
        } // end if navigator.epubReadingSystem
    } catch (e) {
        // nop
    }
};
