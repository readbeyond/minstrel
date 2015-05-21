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

/** @namespace RB.CBZReader */
RB.CBZReader = RB.CBZReader || {};

/* constants */
RB.CBZReader.notificationDuration                      = 1000;             // (ms) duration of on screen notifications
RB.CBZReader.DELAY_TO_PREVENT_DOUBLE_EVENTS            = 100;              // (ms) delay to prevent double events

/* variables */
RB.CBZReader.createdManagers                           = false;
RB.CBZReader.assetManager                              = null;
RB.CBZReader.menu                                      = null;

RB.CBZReader.backgroundColor                           = '#000000';
RB.CBZReader.infoColor                                 = '#ffffff';
RB.CBZReader.wrapAround                                = true;
RB.CBZReader.autohideMenu                              = true;
RB.CBZReader.autohideMenuDuration                      = 3000;
RB.CBZReader.resetScaleOnImageChange                   = true;
RB.CBZReader.lockScrollOnFitOther                      = true;
RB.CBZReader.snapToBorder                              = false;
RB.CBZReader.showInfo                                  = false;
RB.CBZReader.persistentInfo                            = false;
RB.CBZReader.invertSwipe                               = false;
RB.CBZReader.comicsMode                                = true;
RB.CBZReader.borderLeft                                = 0;
RB.CBZReader.borderRight                               = 0;
RB.CBZReader.borderTop                                 = 0;
RB.CBZReader.borderBottom                              = 0;
RB.CBZReader.unzipAll                                  = false;
RB.CBZReader.slideshowTimerDuration                    = 1000;
RB.CBZReader.orientation                               = 'auto';

RB.CBZReader.images                                    = [];
RB.CBZReader.currentImageElement                       = null
RB.CBZReader.currentImageElementID                     = 'currentImage';
RB.CBZReader.scaleFactor                               = 1;
RB.CBZReader.maxFactor                                 = 1;
RB.CBZReader.maxDimension                              = '';
RB.CBZReader.otherFactor                               = 1;
RB.CBZReader.preventSnap                               = false;
RB.CBZReader.zoomMode                                  = 'fitifbigger';
RB.CBZReader.actions                                   = [];

RB.CBZReader.persistentInfoElement                     = null;
RB.CBZReader.persistentInfoText                        = '';
RB.CBZReader.persistentInfoTextPrefix                  = '';

RB.CBZReader.preventDoubleTap                          = false;
RB.CBZReader.preventPress                              = false;
RB.CBZReader.preventSwipe                              = false;
RB.CBZReader.sliderIsChanging                          = false;
RB.CBZReader.appStatusBeforeBackgrounded               = null;

// UI
RB.CBZReader.UI                                        = {};
RB.CBZReader.UI.divReader                              = 'divReader';
RB.CBZReader.UI.divHeader                              = 'divHeader';
RB.CBZReader.UI.txtTitle                               = 'txtCBZReaderTitle';
RB.CBZReader.UI.divContentContainer                    = 'divContentContainer';
RB.CBZReader.UI.divPanzoomContainer                    = 'divPanzoomContainer';
//RB.CBZReader.UI.divPanzoomEventFilter                  = 'divPanzoomEventFilter';
RB.CBZReader.UI.divPanzoomInner                        = 'divPanzoomInner';
RB.CBZReader.UI.divFooter                              = 'divFooter';
RB.CBZReader.UI.divFooterSliderContainerInnerFullWidth = 'divFooterSliderContainerInnerFullWidth';
RB.CBZReader.UI.sliderID                               = 'sldImages';




/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.CBZReader.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();
};

// initialize page
RB.CBZReader.initializePage = function() {
    // set app variables 
    RB.CBZReader.loadVariables();
    
    // create manager objects
    RB.CBZReader.createManagers();
    
    // bind events
    RB.CBZReader.bindEvents();
    
    // force dimming system bar
    RB.UI.dimSystemBar(true);
    
    // load images
    RB.UI.showSpinner(true);
    RB.CBZReader.loadImages();
};

// bind events
RB.CBZReader.bindEvents = function() {
    // orientation
    $(window).on('orientationchange', RB.CBZReader.onOrientationChange);
    
    // resume and pause events
    document.addEventListener('pause',  RB.CBZReader.onAppPause);
    document.addEventListener('resume', RB.CBZReader.onAppResume);
    
    // click
    RB.UI.getElement(RB.CBZReader.UI.divContentContainer).on('click', function(e) {
        e.stopImmediatePropagation();
        RB.CBZReader.onClick(e);
    });
    
    // image load
    if (RB.CBZReader.currentImageElement) {
        RB.CBZReader.currentImageElement.onload = RB.CBZReader.onImageLoad;
    }

    // bind swipe and doubletap
    var bindings = {
        'swipeleft':  RB.CBZReader.onSwipeLeft,
        'swiperight': RB.CBZReader.onSwipeRight,
        'doubletap':  RB.CBZReader.onDoubleTap,
        'press':      RB.CBZReader.onPress,
        //'rotate':    RB.CBZReader.onRotate
    };
    RB.UI.bindHammerEvents(RB.CBZReader.UI.divContentContainer, bindings);
    RB.UI.bindHammerEvents(RB.CBZReader.currentImageElementID,  bindings);
    
};

/*
// TODO
RB.CBZReader.onRotate = function(e) {
    // e.rotation in ]-360, +360[, clockwise is >0 , counterclockwise is <0
    //RB.UI.showNotification("rotate\n" + e.rotation);
    
};
*/

// handle back button
RB.CBZReader.onBackButton = function() {
    // delete tmp directory
    RB.CBZReader.assetManager.deleteTmpDirectory();
    
    // save position and metadata
    if (RB.CBZReader.imageSlideshow) {
        RB.App.saveItemData(RB.CBZReader.itemID, ['position', RB.Plugins.Format.formatNames.CBZ], {
            'image': RB.CBZReader.imageSlideshow.getCurrentImageIndex()
        });
    }
    if (RB.CBZReader.images) {
        RB.App.saveItemData(RB.CBZReader.itemID, ['structure', RB.Plugins.Format.formatNames.CBZ, 'images'], RB.CBZReader.images);
    }
    
    // go back
    RB.UI.onBackButton();
};

// update image on orientation change
RB.CBZReader.onOrientationChange = function() {
    window.setTimeout(RB.CBZReader.onImageLoad, RB.UI.ON_ORIENTATION_CHANGE_DELAY);
};

// called when the app is sent to background
RB.CBZReader.onAppPause = function() {
    if (RB.CBZReader.imageSlideshow.isSlideshowPlaying()) {
        RB.CBZReader.startStopSlideshow();
        RB.CBZReader.appStatusBeforeBackgrounded = RB.App.AppStatusBeforeBackground.PLAYING;
    } else {
        RB.CBZReader.appStatusBeforeBackgrounded = RB.App.AppStatusBeforeBackground.STOPPED;
    }
};

// called when the app is resumed from background
RB.CBZReader.onAppResume = function() {
    if (RB.CBZReader.appStatusBeforeBackgrounded === RB.App.AppStatusBeforeBackground.PLAYING) {
        RB.CBZReader.startStopSlideshow();
    }
    RB.CBZReader.appStatusBeforeBackgrounded = null;
};

// double tap
RB.CBZReader.onDoubleTap = function(e) {
    if (!RB.CBZReader.preventDoubleTap) {
        RB.CBZReader.preventDoubleTap = true;
        RB.App.delay(function () {
            RB.CBZReader.preventDoubleTap = false;
        }, RB.CBZReader.DELAY_TO_PREVENT_DOUBLE_EVENTS);
        if (RB.CBZReader.userScaled) {
            RB.CBZReader.setZoomModeToFit();
        } else {
            RB.CBZReader.executeCommand('zoom', 1, null);
        }
    }
};

/*
// single tap
RB.CBZReader.onTap = function() {
    RB.CBZReader.menu.toggle();
};
*/

// manage clicks and taps
RB.CBZReader.onClick = function(e) {
    if (RB.CBZReader.menu.isVisible()) {
        RB.CBZReader.menu.hide();
        return;
    }
    
    // otherwise, trigger the appropriate command
    var clickX = e.clientX || e.pageX;
    var clickY = e.clientY || e.pageY;
    var screenZone = RB.UI.getScreenZoneClicked(clickX, clickY);
    //alert(Object.keys(e));
    //alert(clickX + " " + clickY + " " + screenZone);
    if (RB.CBZReader.actions[screenZone] !== 'none') {
        RB.CBZReader.executeCommand(RB.CBZReader.actions[screenZone], 1, null);
    }
};

// at the end of a panning event, show info (if needed) or stop event propagation
RB.CBZReader.onPanzoomEnd = function(e, panzoom, matrix, changed) {
    if (changed) {
        // pan or zoom
        //
        // show info
        RB.CBZReader.showInfoText();
    } else {
        // tap
        //
        // process click/tap event
        e.stopImmediatePropagation();
        // e seems to return bad X/Y values => do not process clicks/taps (when user-scaled)
        //RB.CBZReader.onClick(e);
    }
};

// when panning, keep the image centered (if requested)
RB.CBZReader.onPanzoomPan = function(e, panzoom, x, y, opts) {
    // if fit-on-other and lock scroll, center image on the other dimension
    if ((RB.CBZReader.lockScrollOnFitOther) && (RB.CBZReader.zoomMode === 'fitother')) {
        if (RB.CBZReader.maxDimension === 'height') {
            // center horizontally
            RB.CBZReader.centerImage(true, false);
        }
        if (RB.CBZReader.maxDimension === 'width') {
            // center vertically
            RB.CBZReader.centerImage(false, true);
        }
    }
};

// on zooming, snap to border and keep the image centered (if requested)
RB.CBZReader.onPanzoomZoom = function(e, panzoom, scale, opts) {
    // snap
    RB.CBZReader.userScaled = true;
    if ((RB.CBZReader.snapToBorder) && (!RB.CBZReader.preventSnap)) {
        var ratio = scale / RB.CBZReader.maxFactor;
        if ((ratio > 0.8) && (ratio < 1.2)) {
            
            // set prevent flag
            RB.CBZReader.preventSnap = true;
            
            // set mode to fit and perform actual scaling
            RB.CBZReader.scaleFactor = RB.CBZReader.maxFactor;
            RB.CBZReader.zoomMode = 'fit';
            RB.CBZReader.userScaled = false;
            RB.CBZReader.scaleImage();
            
            // disable zoom AFTER actual scaling has been done
            // and then set the timeout to remove the prevent flag
            RB.UI.getElement(RB.CBZReader.UI.divPanzoomInner).panzoom('option', { disableZoom: true });
            window.setTimeout(function(){
                RB.UI.getElement(RB.CBZReader.UI.divPanzoomInner).panzoom('option', { disableZoom: false });
                RB.CBZReader.preventSnap = false;
                window.clearTimeout(this);
            }, 1000);
            
            // exit
            return;
        }
    }
    // update scale factor
    RB.CBZReader.scaleFactor = scale;
    RB.UI.getElement(RB.CBZReader.UI.divPanzoomInner).panzoom('option', { disablePan: (scale <= RB.CBZReader.maxFactor) });
    
    // keep the image centered
    if (scale < RB.CBZReader.maxFactor) {
        RB.CBZReader.centerImage(true, true);
    }
};

// manage swipe events
// to avoid double swipes, set a timeout
RB.CBZReader.onSwipeGeneric = function(increment) {
    if ((!RB.CBZReader.preventSwipe) && (!RB.CBZReader.sliderIsChanging)) {
        RB.CBZReader.preventSwipe = true;
        RB.App.delay(function () {
            RB.CBZReader.preventSwipe = false;
        }, RB.CBZReader.DELAY_TO_PREVENT_DOUBLE_EVENTS);
        if (RB.CBZReader.invertSwipe) {
            increment = -increment;
        }
        RB.CBZReader.showImage(increment, false);
    }
};
RB.CBZReader.onSwipeLeft = function() {
    RB.CBZReader.onSwipeGeneric(1);
};
RB.CBZReader.onSwipeRight = function() {
    RB.CBZReader.onSwipeGeneric(-1);
};
RB.CBZReader.onPress = function() {
    if (!RB.CBZReader.preventPress) {
        RB.CBZReader.preventPress = true;
        RB.App.delay(function() {
            RB.CBZReader.preventPress = false;
        }, RB.CBZReader.DELAY_TO_PREVENT_DOUBLE_EVENTS);
        RB.CBZReader.menu.toggle();
    }
};


// show notification toast
// a simple floating div that fades out
// msg = string
// delay_before_fading = timeout in milliseconds
RB.CBZReader.showInfoText = function() {
    if (RB.CBZReader.persistentInfoElement) {
        RB.CBZReader.persistentInfoElement.remove();
    }
    
    if (RB.CBZReader.showInfo) {
        var readableZoom = Math.floor(RB.CBZReader.scaleFactor * 100);
        RB.CBZReader.persistentInfoText = RB.CBZReader.persistentInfoTextPrefix + '<br/>' + readableZoom + '% ' + RB.CBZReader.currentImageElement.width + 'x' + RB.CBZReader.currentImageElement.height;
        // TODO
        var title = RB.CBZReader.images[RB.CBZReader.imageSlideshow.getCurrentImageIndex()].title;
        if (title) {
            RB.CBZReader.persistentInfoText += '<br/>' + title;
        }
        
        var duration = RB.CBZReader.autohideMenuDuration;
        RB.CBZReader.persistentInfoElement = $('<div class="ui-loader ui-overlay-shadow ui-body-e ui-corner-all"><p>' + RB.CBZReader.persistentInfoText + '</p></div>')
            .css({
                'width':        'auto',
                'left':         '0',
                'top':          '0',
                'margin-top':   '-5px',
                'margin-left': '5px',
                'background':   'transparent',
                'font-size':    '14px',
                'text-align':   'left',
                'display':      'block',
                'color':        RB.CBZReader.infoColor,
                'font-family':  'Roboto, robotoembedded, sans-serif'
            }).appendTo($.mobile.pageContainer);
        
        if (RB.CBZReader.menu.isVisible()) {
            RB.UI.applyCSS(RB.CBZReader.persistentInfoElement, 'top', RB.UI.getHeight(RB.CBZReader.UI.divHeader));
        } else {
            RB.UI.applyCSS(RB.CBZReader.persistentInfoElement, 'top', '0');
        }
        
        RB.CBZReader.persistentInfoElement.on('click', function(){
            $(this).remove();
        });
        if (!RB.CBZReader.persistentInfo) {
            RB.CBZReader.persistentInfoElement.delay(duration).fadeOut(duration / 2, function(){
                $(this).remove();
            });
        }
    }
};

// execute commands
RB.CBZReader.executeCommand = function(name, parameter1, parameter2) {
    RB.CBZReader.menu.startTimer();
    if (name === 'showinfo') {
        RB.Storage.flip(RB.Storage.Keys.CBZ_SHOW_INFO);
        RB.CBZReader.showInfo = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_SHOW_INFO);
        RB.CBZReader.showInfoText();
        RB.UI.showNotification(RB.UI.i18n('optbtnCBZReaderShowInfo', (RB.CBZReader.showInfo ? 0 : 1)), RB.CBZReader.notificationDuration);
    }
    if (name === 'resetzoom') {
        RB.Storage.flip(RB.Storage.Keys.CBZ_RESET_SCALE_ON_IMAGE_CHANGE);
        RB.CBZReader.resetScaleOnImageChange = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_RESET_SCALE_ON_IMAGE_CHANGE);
        RB.UI.showNotification(RB.UI.i18n('optbtnCBZReaderResetZoom', (RB.CBZReader.resetScaleOnImageChange ? 0 : 1)), RB.CBZReader.notificationDuration);
    }
    if (name === 'zoom') {
        RB.CBZReader.zoomMode = RB.Storage.switchParameter(RB.Config.CBZReader.availableZoomModes, RB.CBZReader.zoomMode, parameter1, true);
        RB.CBZReader.userScaled = false;
        RB.CBZReader.scaleImage();
        RB.UI.showNotification(RB.UI.i18n('optbtnCBZZoomMode', RB.Config.CBZReader.availableZoomModes.indexOf(RB.CBZReader.zoomMode)), RB.CBZReader.notificationDuration);
    }
    if (name === 'orientation') {
        RB.CBZReader.orientation = RB.Storage.switchParameter(RB.Config.UI.availableOrientations, RB.CBZReader.orientation, parameter1, true);
        RB.UI.applyOrientation(RB.CBZReader.orientation);
        RB.UI.showNotification(RB.UI.i18n('btnSettingsChangeOrientationLabels', RB.Config.UI.availableOrientations.indexOf(RB.CBZReader.orientation)), RB.CBZReader.notificationDuration);
    }
    if (name === 'slideshow') {
        RB.CBZReader.startStopSlideshow();
    }
    if (name === 'showmenu') {
        RB.CBZReader.menu.toggle();
    }
    if (name === 'previousimage') {
        RB.CBZReader.showImage(-1);
    }
    if (name === 'nextimage') {
        RB.CBZReader.showImage(1);
    }
};

// generic error message
RB.CBZReader.onErrorLoadingCBZFile = function() {
    RB.App.message('A fatal error occurred while reading this CBZ file.', RB.App.MessageSeverityEnum.CRITICAL);
};

RB.CBZReader.loadImages = function() {
    var images = RB.App.readItemData(RB.CBZReader.itemID, ['structure', RB.Plugins.Format.formatNames.CBZ, 'images']);
    if (images) {
        // load from storage (from the second time on)
        RB.CBZReader.images = images;
        RB.CBZReader.performUnzipAll();
        return;
    }
   
    // if here, we failed to load from storage
    var onSuccess = function(message) {
       
        // DEBUG 
        //alert(message);
        
        // store image paths (relative to archive root dir)
        RB.CBZReader.images = [];
        var a = (JSON.parse(message)).assets.items;
        for (var i = 0; i < a.length; i++) {
            var image = {};
            image['href']     = a[i].path;
            image['title']    = ''; //RB.Utilities.getLastPathComponent(a[i].path);
            image['duration'] = '';
            if ('metadata' in a[i]) {
                if ('title' in a[i].metadata) {
                    image['title'] = a[i].metadata.title;
                }
                if ('duration' in a[i].metadata) {
                    image['duration'] = a[i].metadata.duration;
                }
            }
            RB.CBZReader.images.push(image);
        }
        RB.CBZReader.performUnzipAll();
    };
    // get metadata
    var args  = {};
    try {
        args['internalPathPlaylist'] = RB.CBZReader.item.formats[RB.Plugins.Format.formatNames.CBZ].metadata.internalPathPlaylist;
    } catch (e) {
        // nop
    }
    args['format'] = RB.Plugins.Format.formatNames.CBZ;
    RB.CBZReader.assetManager.getSortedListOfAssets(args, onSuccess, RB.CBZReader.onErrorLoadingCBZFile);
};

// unzip all or call init completed
RB.CBZReader.performUnzipAll = function() {
    if (RB.CBZReader.unzipAll) {
        RB.CBZReader.assetManager.unzipAll(RB.CBZReader.initializationCompleted, RB.CBZReader.onErrorLoadingCBZFile);
    } else {
        RB.CBZReader.initializationCompleted();
    }
};

// we can start displaying images
RB.CBZReader.initializationCompleted = function() {
    // create callbacks
    var onSlideStart = function() {
        RB.CBZReader.menu.clearTimer();
        RB.CBZReader.sliderIsChanging = true;
    };
    
    var onSlideStop = function() {
        RB.CBZReader.sliderIsChanging = false;
        RB.CBZReader.menu.startTimer();
        RB.CBZReader.showImage(parseInt(RB.UI.getSliderValue(RB.CBZReader.UI.sliderID)), true);
    };
    
    // create slider
    RB.UI.createSlider(RB.CBZReader.UI.sliderID, RB.CBZReader.UI.divFooterSliderContainerInnerFullWidth, 0, RB.CBZReader.images.length - 1, onSlideStart, onSlideStop);
    
    // open at saved position
    // open at saved position
    var saved = RB.App.readItemData(RB.CBZReader.itemID, ['position', RB.Plugins.Format.formatNames.CBZ]);
    var index = 0;
    if (saved) {
        index = RB.App.ensureValueInRange(saved['image'], 0, RB.CBZReader.images.length - 1, 0);
    }
    RB.UI.showSpinner(false);
    
    // set imageSlideshow object up
    var options                             = {};
    options['wrapAround']                   = RB.CBZReader.wrapAround;
    options['showSpinner']                  = false;
    options['imagePreparedCallback']        = RB.CBZReader.onImagePrepared;
    options['slideshowStartStopCallback']   = RB.CBZReader.onStartStopSlideshow;
    options['slideshowCompletedCallback']   = RB.CBZReader.onSlideshowCompleted;
    options['errorCallback']                = RB.CBZReader.onErrorLoadingCBZFile;
    options['timerInterval']                = RB.CBZReader.slideshowTimerDuration;
    options['preload']                      = RB.CBZReader.preloadPrevNext;
    RB.CBZReader.imageSlideshow             = new RB.App.imageSlideshow(RB.CBZReader.assetManager, RB.CBZReader.images, options);
    RB.CBZReader.imageSlideshow.showImage(index);
};

// called when the image has been prepared (unzipped)
RB.CBZReader.onImagePrepared = function(index) {
    RB.UI.setSliderValue(RB.CBZReader.UI.sliderID, index);
    RB.CBZReader.setImageSrc(index);
};

// called when the wrapAround is false and we attempt to go beyond the last image (or before the first one)
RB.CBZReader.onSlideshowCompleted = function(index) {
    RB.UI.showNotification(RB.UI.i18n('optbtnCBZReaderSlideshowStatus', 2), RB.CBZReader.notificationDuration);
};

// show the requested image
RB.CBZReader.showImage = function(value, absolute) {
    if (RB.CBZReader.imageSlideshow) {
        if (absolute) {
            RB.CBZReader.imageSlideshow.showImage(value);
        } else {
            RB.CBZReader.imageSlideshow.showImageRelative(value);
        }
    }
};

// set image src
RB.CBZReader.setImageSrc = function(index) {
    if ((index !== null) && (RB.CBZReader.currentImageElement)) {
        // reset scale factor
        if (RB.CBZReader.resetScaleOnImageChange) {
            RB.CBZReader.zoomMode = RB.CBZReader.defaultZoomMode;
        }
        RB.CBZReader.userScaled = false;
        
        // set title
        var progress                          = '[' + (index + 1) + '/' + RB.CBZReader.images.length + ']';
        var path                              = RB.CBZReader.images[index].href;
        var file                              = RB.Utilities.getLastPathComponent(path);
        RB.CBZReader.persistentInfoTextPrefix = progress + '<br/>' + file;
        RB.CBZReader.setTitle(progress + ' ' + file);
        
        // hide it to prevent flickering
        // it will be shown by the onImageLoad callback
        RB.UI.hide(RB.CBZReader.currentImageElementID);
        
        // set image src
        RB.CBZReader.currentImageElement.src = RB.App.joinPaths([RB.App.getTmpDirectory(true), RB.CBZReader.itemID, path]);
    }
};

// called when the image has been rendered
RB.CBZReader.onImageLoad = function() {
    var id;

    // compute and set container size
    var window_width     = RB.UI.getScreenWidth();
    var window_height    = RB.UI.getScreenHeight();
    var available_width  = window_width  * (1 - (RB.CBZReader.borderLeft + RB.CBZReader.borderRight));
    var available_height = window_height * (1 - (RB.CBZReader.borderTop  + RB.CBZReader.borderBottom));
    id = RB.CBZReader.UI.divPanzoomContainer;
    RB.UI.applyCSS(id, 'left',              window_width  * RB.CBZReader.borderLeft);
    RB.UI.applyCSS(id, 'top',               window_height * RB.CBZReader.borderTop);
    RB.UI.applyCSS(id, 'width',             available_width);
    RB.UI.applyCSS(id, 'height',            available_height);
    
    // get image size
    var image_width  = RB.CBZReader.currentImageElement.width;
    var image_height = RB.CBZReader.currentImageElement.height;
    
    // compute scale
    var ratio_width  = available_width  / image_width;
    var ratio_height = available_height / image_height;
    
    // set max scale factor (to fit image inside the viewport)
    if (ratio_width < ratio_height) {
        RB.CBZReader.maxFactor    = ratio_width;
        RB.CBZReader.maxDimension = 'width';
        RB.CBZReader.otherFactor  = ratio_height;
    } else {
        RB.CBZReader.maxFactor    = ratio_height;
        RB.CBZReader.maxDimension = 'height';
        RB.CBZReader.otherFactor  = ratio_width
    }
    
    // reset prevent snap
    RB.CBZReader.preventSnap = false;
    
    id = RB.CBZReader.UI.divPanzoomInner;
    var el = RB.UI.getElement(id);
    try {
        el.panzoom('destroy');
    } catch (e) {
        // nop
    }
    RB.UI.applyCSS(id, 'left', 0);
    RB.UI.applyCSS(id, 'top',  0);
    el.panzoom({ minScale: 0.1, maxScale: 10 });
    el.panzoom('option', { disablePan: (RB.CBZReader.scaleFactor <= RB.CBZReader.maxFactor) });
    el.on('panzoomend',  RB.CBZReader.onPanzoomEnd);
    el.on('panzoomzoom', RB.CBZReader.onPanzoomZoom);
    el.on('panzoompan',  RB.CBZReader.onPanzoomPan);
    
    // scale
    RB.CBZReader.scaleImage();
};

// scale image
RB.CBZReader.scaleImage = function() {
    // original size
    if (RB.CBZReader.zoomMode === 'original') {
        RB.CBZReader.scaleFactor = 1;
    }
    
    // original size or fit if bigger
    if (RB.CBZReader.zoomMode === 'fitifbigger') {
        RB.CBZReader.scaleFactor = 1;
        if (RB.CBZReader.maxFactor < 1) {
            RB.CBZReader.scaleFactor = RB.CBZReader.maxFactor;
        }
    }
    
    // fit image inside the viewport
    if (RB.CBZReader.zoomMode === 'fit') {
        RB.CBZReader.scaleFactor = RB.CBZReader.maxFactor;
    }
    
    // fit other
    if (RB.CBZReader.zoomMode === 'fitother') {
        RB.CBZReader.scaleFactor = RB.CBZReader.otherFactor;
    }
    
    var id = RB.CBZReader.UI.divPanzoomInner;
    RB.UI.getElement(id).panzoom('zoom', RB.CBZReader.scaleFactor, { silent: true });
    
    if ((RB.CBZReader.zoomMode === 'fitother') && (RB.CBZReader.comicsMode)) {
        RB.CBZReader.centerTopImage();
    } else {
        RB.CBZReader.centerImage(true, true);
    }
    RB.UI.show(RB.CBZReader.currentImageElementID);
    
    // show info
    RB.CBZReader.showInfoText();
};

// center image on the specified axis
RB.CBZReader.centerImage = function(center_x, center_y) {
    var id = RB.CBZReader.UI.divPanzoomInner;
    var el = RB.UI.getElement(id);
    var current_transform       = el.panzoom('getMatrix');
    var transform_x             = current_transform[4];
    var transform_y             = current_transform[5];
    
    // center horizontally
    if (center_x) {
        var available_width     = RB.UI.getScreenWidth() * (1 - (RB.CBZReader.borderLeft + RB.CBZReader.borderRight));
        var image_width         = RB.CBZReader.currentImageElement.width;
        transform_x             = ((available_width - image_width)  / 2) * RB.CBZReader.scaleFactor;
    }
    
    // center vertically
    if (center_y) {
        var available_height    = RB.UI.getScreenHeight() * (1 - (RB.CBZReader.borderTop + RB.CBZReader.borderBottom));
        var image_height        = RB.CBZReader.currentImageElement.height;
        transform_y             = (available_height - image_height) / 2;
    }

    // perform translation
    el.panzoom('option', { disablePan: false });
    el.panzoom('pan', transform_x, transform_y, { silent: true });
    el.panzoom('option', { disablePan: (RB.CBZReader.scaleFactor <= RB.CBZReader.maxFactor) });
};

// in comics mode and fitother zoom mode,
// center image along the fitted dimension, and scroll to top (or left) on the other
RB.CBZReader.centerTopImage = function() {
    var id = RB.CBZReader.UI.divPanzoomInner;
    var el = RB.UI.getElement(id);
    var current_transform = el.panzoom('getMatrix');
    var transform_x       = current_transform[4];
    var transform_y       = current_transform[5];
    var available_width   = RB.UI.getScreenWidth() * (1 - (RB.CBZReader.borderLeft + RB.CBZReader.borderRight));
    var available_height  = RB.UI.getScreenHeight() * (1 - (RB.CBZReader.borderTop + RB.CBZReader.borderBottom));
    var image_width       = RB.CBZReader.currentImageElement.width;
    var image_height      = RB.CBZReader.currentImageElement.height;
    
    // center horizontally
    if (RB.CBZReader.maxDimension === 'height') {
        transform_x       = ((available_width - image_width)  / 2) * RB.CBZReader.scaleFactor;
        transform_y       = ((RB.CBZReader.scaleFactor - 1) * image_height) / 2;
    }
    
    // center vertically
    if (RB.CBZReader.maxDimension === 'width') {
        transform_y       = (available_height - image_height) / 2;
        transform_x       = ((RB.CBZReader.scaleFactor - 1) * available_width) / 2;
    }

    // perform translation
    el.panzoom('option', { disablePan: false });
    el.panzoom('pan',    transform_x, transform_y, { silent: true });
    el.panzoom('option', { disablePan: (RB.CBZReader.scaleFactor <= RB.CBZReader.maxFactor) });
};

// set zoom mode to fit image into the screen
RB.CBZReader.setZoomModeToFit = function() {
    RB.CBZReader.zoomMode = 'fit';
    RB.CBZReader.userScaled = false;
    RB.CBZReader.scaleImage();
    RB.UI.showNotification(RB.UI.i18n('optbtnCBZZoomMode', RB.Config.CBZReader.availableZoomModes.indexOf(RB.CBZReader.zoomMode)), RB.CBZReader.notificationDuration);
};

// start/stop slideshow
RB.CBZReader.startStopSlideshow = function() {
    RB.CBZReader.imageSlideshow.startStopSlideshow();
};

RB.CBZReader.onStartStopSlideshow = function(playing) {
    RB.UI.setBooleanPlayIcon2('icoSlideshow', playing);
    RB.UI.showNotification(RB.UI.i18n('optbtnCBZReaderSlideshowStatus', (playing ? 0 : 1)), RB.CBZReader.notificationDuration);
};

// show menu
RB.CBZReader.showMenu = function() {
    RB.UI.show(RB.CBZReader.UI.divHeader);
    RB.UI.show(RB.CBZReader.UI.divFooter);
    if (RB.UI.isVisible(RB.CBZReader.persistentInfoElement)) {
        RB.UI.applyCSS(RB.CBZReader.persistentInfoElement, 'top', RB.UI.getHeight(RB.CBZReader.UI.divHeader));
    } else {
        RB.UI.applyCSS(RB.CBZReader.persistentInfoElement, 'top', '0');
    }
    //RB.UI.undimSystemBar();
};

// hide menu
RB.CBZReader.hideMenu = function() {
    RB.UI.hide(RB.CBZReader.UI.divHeader);
    RB.UI.hide(RB.CBZReader.UI.divFooter);
    RB.UI.applyCSS(RB.CBZReader.persistentInfoElement, 'top', '0');
    //RB.UI.dimSystemBar(true);
};

// load variables from storage
RB.CBZReader.loadVariables = function() {    
    // current item
    RB.CBZReader.itemPath                = RB.App.unescapeQuotes(RB.Storage.get(RB.Storage.Keys.OPEN_ITEM_FILE_PATH));
    RB.CBZReader.itemID                  = RB.Storage.get(RB.Storage.Keys.OPEN_ITEM_ID);
    RB.CBZReader.item                    = RB.Storage.getDictionary(RB.Storage.Keys.LIBRARY_BOOKS)[RB.CBZReader.itemID];
    
    // load settings
    RB.CBZReader.backgroundColor         = RB.Storage.get(RB.Storage.Keys.CBZ_BACKGROUND_COLOR);
    RB.CBZReader.infoColor               = RB.Storage.get(RB.Storage.Keys.CBZ_INFO_COLOR);
    RB.CBZReader.wrapAround              = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_WRAP_AROUND);
    RB.CBZReader.autohideMenu            = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_AUTOHIDE_MENU);
    RB.CBZReader.resetScaleOnImageChange = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_RESET_SCALE_ON_IMAGE_CHANGE);
    RB.CBZReader.defaultZoomMode         = RB.Storage.get(RB.Storage.Keys.CBZ_DEFAULT_ZOOM_MODE);
    RB.CBZReader.lockScrollOnFitOther    = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_LOCK_SCROLL_ON_FIT_OTHER);
    RB.CBZReader.snapToBorder            = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_SNAP_TO_BORDER);
    RB.CBZReader.showInfo                = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_SHOW_INFO);
    RB.CBZReader.persistentInfo          = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_PERSISTENT_INFO);
    RB.CBZReader.invertSwipe             = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_INVERT_SWIPE);
    RB.CBZReader.comicsMode              = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_COMICS_MODE);
    RB.CBZReader.orientation             = RB.Storage.get(RB.Storage.Keys.UI_ORIENTATION);
    RB.CBZReader.preloadPrevNext         = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_PRELOAD_PREV_NEXT);
    RB.CBZReader.unzipAll                = RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_UNZIP_ALL);
    var border                           = parseInt(RB.Storage.get(RB.Storage.Keys.CBZ_BORDER).replace('%', '')) / 100;
    RB.CBZReader.borderLeft              = border;
    RB.CBZReader.borderRight             = border;
    RB.CBZReader.borderTop               = border;
    RB.CBZReader.borderBottom            = border;
    RB.CBZReader.slideshowTimerDuration  = parseInt(RB.Storage.get(RB.Storage.Keys.CBZ_SLIDESHOW_TIMER).replace('s', '')) * 1000;
    RB.CBZReader.autohideMenuDuration    = parseInt(RB.Storage.get(RB.Storage.Keys.CBZ_AUTOHIDE_MENU_DURATION).replace('s', '')) * 1000;
    for (var i = 0; i < 9; i++) {
        RB.CBZReader.actions[i] = RB.Storage.get(RB.Storage.Keys[('CBZ_ACTION_ZONE_' + i)]);
    }
};

// create manager objects
RB.CBZReader.createManagers = function() {
    // if already created, abort
    if (RB.CBZReader.createdManagers) {
        return;
    }
    
    // asset manager object
    RB.CBZReader.assetManager            = new RB.App.zipAssetsManager(RB.CBZReader.itemPath, RB.App.joinPaths([RB.App.getTmpDirectory(), RB.CBZReader.itemID]), !RB.CBZReader.unzipAll);
    
    // create a menu object, with auto-hide capability
    RB.CBZReader.menu = new RB.App.autohideElement('menu', RB.CBZReader.showMenu, RB.CBZReader.hideMenu, {'autohide': RB.CBZReader.autohideMenu, 'timerInterval': RB.CBZReader.autohideMenuDuration});
    
    // hide header
    RB.CBZReader.menu.hide();
    
    // set container CSS
    var id;
    id = RB.CBZReader.UI.divReader;
    RB.UI.applyCSS(id, 'background-color',      RB.CBZReader.backgroundColor);
    RB.UI.applyCSS(id, 'overflow',              'hidden');
    
    id = RB.CBZReader.UI.divContentContainer;
    RB.UI.applyCSS(id, 'border',                '0');
    RB.UI.applyCSS(id, 'margin',                '0');
    RB.UI.applyCSS(id, 'padding',               '0');
    RB.UI.applyCSS(id, 'background-color',      'transparent'); //'red'
    RB.UI.applyCSS(id, 'position',              'absolute');
    RB.UI.applyCSS(id, 'top',                   '0');
    RB.UI.applyCSS(id, 'left',                  '0');
    RB.UI.applyCSS(id, 'width',                 '100%');
    RB.UI.applyCSS(id, 'height',                '100%');
    
    id = RB.CBZReader.UI.divPanzoomContainer;
    RB.UI.applyCSS(id, 'border',                '0');
    RB.UI.applyCSS(id, 'margin',                '0');
    RB.UI.applyCSS(id, 'padding',               '0');
    RB.UI.applyCSS(id, 'background-color',      'transparent'); //'blue'
    RB.UI.applyCSS(id, 'position',              'absolute');
    
    /*
    id = RB.CBZReader.UI.divPanzoomEventFilter;
    RB.UI.applyCSS(id, 'border',                '0');
    RB.UI.applyCSS(id, 'margin',                '0');
    RB.UI.applyCSS(id, 'padding',               '0');
    RB.UI.applyCSS(id, 'background-color',      'transparent'); //'green'
    RB.UI.applyCSS(id, 'position',              'absolute');
    RB.UI.applyCSS(id, 'top',                   '0');
    RB.UI.applyCSS(id, 'left',                  '0');
    RB.UI.applyCSS(id, 'width',                 '100%');
    RB.UI.applyCSS(id, 'height',                '100%');
    */
    
    id = RB.CBZReader.UI.divPanzoomInner;
    RB.UI.applyCSS(id, 'border',                '0');
    RB.UI.applyCSS(id, 'margin',                '0');
    RB.UI.applyCSS(id, 'padding',               '0');
    RB.UI.applyCSS(id, 'background-color',      'transparent');
    RB.UI.applyCSS(id, 'transform',             'none');
    RB.UI.applyCSS(id, 'backface-visibility',   'hidden');
    RB.UI.applyCSS(id, 'transform-origin',      '50% 50%');
    RB.UI.applyCSS(id, 'cursor',                'move');
    
    // create image
    RB.CBZReader.currentImageElement = document.createElement('img');
    RB.CBZReader.currentImageElement.id = RB.CBZReader.currentImageElementID;
    document.getElementById(RB.CBZReader.UI.divPanzoomInner).appendChild(RB.CBZReader.currentImageElement);
    
    // reset flag
    RB.CBZReader.createdManagers = true;
};

// set title
RB.CBZReader.setTitle = function(s) {
    RB.UI.setText(RB.CBZReader.UI.txtTitle, s, true);
};


