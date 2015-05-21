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

/** @namespace RB.UI */
RB.UI = RB.UI || {};

/* constants */

RB.UI.NATIVE_DROID_DIRECTORY                = 'css/nd/';                    // directory where nativeDroid theme CSS files are located
RB.UI.CUSTOM_SPINNER_PATH                   = 'img/customspinner.gif';      // path to custom spinner (48x48 px)
RB.UI.NAVBAR_BUTTON_CLASS_PREFIX            = 'custom-navbar-button';       // CSS class prefix for custom navbar button
RB.UI.TIMER_TEXT_CLASS_PREFIX               = 'custom-timer';               // CSS class prefix for custom timer text
RB.UI.MIN_SCREEN_WIDTH                      = 600;                          // below this number of px, the screen is considered to have small width
RB.UI.MIN_SCREEN_HEIGHT                     = 600;                          // below this number of px, the screen is considered to have small height
RB.UI.VISUAL_FEEDBACK_ON_CLICK_CLASS        = 'footerSliderButtonDown';     // CSS class visual feedback on click
RB.UI.VISUAL_FEEDBACK_ON_CLICK_DURATION     = 200;                          // (ms) duration of visual feedback on click
RB.UI.NOTIFICATION_DURATION                 = 3000;                         // (ms) duration of on screen notifications
RB.UI.ON_ORIENTATION_CHANGE_DELAY           = 500;                          // (ms) delay before firing orientationchange callback (mainly a workaround for Android)
RB.UI.JUMP_TARGET_HIGHLIGHTED_CLASS         = 'jump-target-highlighted';    // CSS class name for highlighting on jump
RB.UI.VISUAL_FEEDBACK_ON_EXPAND_DURATION    = 250;                          // (ms) duration of visual feedback on collapsible expand

/* variables */

// gui language
RB.UI.language                              = null;
RB.UI.localeManager                         = null;
RB.UI.i18n                                  = null;
RB.UI.dialogOpen                            = null;
RB.UI.paletteOpen                           = null;

// visible popups
RB.UI.visiblePopups                         = {};

/* functions */

// set jQuery Mobile defaults
RB.UI.initializeJQM = function() {
    $.mobile.buttonMarkup.hoverDelay        = 0;
    $.mobile.defaultDialogTransition        = 'none';
    $.mobile.defaultPageTransition          = 'none';
    $.mobile.loader.prototype.options.html  = '<img src="' + RB.UI.CUSTOM_SPINNER_PATH + '"></img>';
    $.mobile.loader.prototype.options.theme = 'b';
};

RB.UI.storeScreenDimensions = function() {
    RB.UI.windowWidth   = RB.UI.getWidth(window);
    RB.UI.windowHeight  = RB.UI.getHeight(window);
    RB.UI.windowLonger  = RB.Utilities.max([RB.UI.windowWidth, RB.UI.windowHeight]);
    RB.UI.windowSmaller = RB.Utilities.min([RB.UI.windowWidth, RB.UI.windowHeight]);
};

RB.UI.getScreenWidth = function() {
    var window_width  = RB.UI.getWidth(window);
    if ((RB.UI.windowLonger) && (RB.UI.windowSmaller)) {
        var window_height = RB.UI.getHeight(window);
        if (window_width > window_height) {
            window_width  = RB.UI.windowLonger;
            window_height = RB.UI.windowSmaller;
        } else {
            window_width  = RB.UI.windowSmaller;
            window_height = RB.UI.windowLonger;
        }
    }
    return window_width;
};
RB.UI.getScreenHeight = function() {
    var window_height = RB.UI.getHeight(window);
    if ((RB.UI.windowLonger) && (RB.UI.windowSmaller)) {
        var window_width  = RB.UI.getWidth(window);
        if (window_width > window_height) {
            window_width  = RB.UI.windowLonger;
            window_height = RB.UI.windowSmaller;
        } else {
            window_width  = RB.UI.windowSmaller;
            window_height = RB.UI.windowLonger;
        }
    }
    return window_height;
};

// is night mode applied?
RB.UI.isNightModeApplied = function() {
    return RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_NIGHT_MODE);
};

// apply night mode
RB.UI.applyNightMode = function() {
    // do not modify this name, it is from nativeDroid and HTML source
    var link_id = 'jQMnDTheme';
    
    // default: light CSS; if night mode, use dark CSS
    var theme = 'light';
    if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_NIGHT_MODE)) {
        theme = 'dark';
    }
    var link_href = RB.UI.NATIVE_DROID_DIRECTORY + 'jquerymobile.nativedroid.' + theme + '.css';

    // add CSS element to head
    RB.UI.addCSSElementToHead(link_id, link_href);

    // show or dim system bar (Android only)
    //
    // DISABLED DUE TO A (THREAD?) PROBLEM
    //
    /*
    if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_NIGHT_MODE)) {
        RB.UI.dimSystemBar();
    } else {
        RB.UI.undimSystemBar();
    }
    */
};

// apply UI font
RB.UI.applyUIFont = function() {
    // do not modify this name, it is from HTML source
    var link_id = 'rbUIFont';
    
    // select the correct UI font
    var ui_font = RB.Storage.get(RB.Storage.Keys.UI_FONT).toLowerCase();
    var link_href = RB.UI.NATIVE_DROID_DIRECTORY + 'jquerymobile.nativedroid.' + ui_font + '.css';

    // add CSS element to head
    RB.UI.addCSSElementToHead(link_id, link_href);
};

// private
// append link to CSS
RB.UI.addCSSElementToHead = function(link_id, link_href) {
    // if already existing, remove element
    var el = document.getElementById(link_id);
    if (el) {
        el.parentNode.removeChild(el);
    }
    
    // append
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = link_id;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = link_href;
    if (head.firstChild) {
        head.insertBefore(link, head.firstChild);
    } else {
        head.appendChild(link);
    }
};

// determine whether the app is running on a screen with small height
RB.UI.screenHasSmallHeight = function() {
    return (RB.UI.getScreenHeight() < RB.UI.MIN_SCREEN_HEIGHT);
};

// determine whether the app is running on a screen with small width
RB.UI.screenHasSmallWidth = function() {
    return (RB.UI.getScreenWidth() < RB.UI.MIN_SCREEN_WIDTH);
};

// apply a custom CSS large (prefix-large) or small (prefix-small) class
RB.UI.reduceOnSmallScreen = function(apply_to) {
    var toBeAdded   = '-large';
    var toBeRemoved = '-small';
    if (RB.UI.screenHasSmallWidth()) {
        toBeAdded   = '-small';
        toBeRemoved = '-large';
    }
    
    var role = RB.UI.getElement(apply_to).attr('data-role');
    if (role === 'navbar') {
        // TODO: set mini?
        var lis = RB.UI.getElement(apply_to).children()[0].getElementsByTagNameNS('*', 'li');
        for (var i = 0; i < lis.length; i++) {
            RB.UI.removeClass(lis[i], RB.UI.NAVBAR_BUTTON_CLASS_PREFIX + toBeRemoved);
            RB.UI.addClass(   lis[i], RB.UI.NAVBAR_BUTTON_CLASS_PREFIX + toBeAdded);
        }
    } else if (!role) {
        RB.UI.removeClass(apply_to, RB.UI.TIMER_TEXT_CLASS_PREFIX + toBeRemoved);
        RB.UI.addClass(   apply_to, RB.UI.TIMER_TEXT_CLASS_PREFIX + toBeAdded);
    }
};

// show loading spinner
RB.UI.showSpinner = function(show) {
    //if (! RB.App.isDebug()) {
    if (show) {
        $.mobile.loading('show');
    } else {
        $.mobile.loading('hide');
    }
    //}
};

// dim/undim system bar using commander plugin (Android only)
RB.UI.dimSystemBar = function(force) {
    if (RB.App.isAndroid()) {
        if ((RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_NIGHT_MODE)) || (force)) {
            var command    = 'dim';
            var parameters = JSON.stringify({ 'dim': true });
            Commander.createEvent(command, parameters, null, null);
        }
    }
};
RB.UI.undimSystemBar = function() {
    if (RB.App.isAndroid()) {
        var command    = 'dim';
        var parameters = JSON.stringify({ 'dim': false });
        Commander.createEvent(command, parameters, null, null);
    }
};

// scroll when collapsible is expanded
RB.UI.bindScrollOnCollapsibleExpanded = function(ui) {
    if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_ANIMATED_MENU)) {
        var ids = Object.keys(ui);
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            if (id.substring(0, 3) === 'col') {
                (function(id) {
                    RB.UI.getElement(id).on('expand', function() {
                        RB.UI.scrollTo(null, id, 0, RB.UI.VISUAL_FEEDBACK_ON_EXPAND_DURATION);
                    });
                }(id));
            }
        }
    }
};

// return [left, top, width, height] in px
// of the current visible area (excludes header and footer, if visible)
RB.UI.computeVisibleArea = function(header_id, footer_id) {
    var window_width  = RB.UI.getScreenWidth();
    var window_height = RB.UI.getScreenHeight();
    var header_height = 0;
    var footer_height = 0;
    if (RB.UI.isVisible(header_id)) {
        header_height = RB.UI.getHeight(header_id) + 1; // 1px border // TODO 1px or 2px ?
    }
    if (RB.UI.isVisible(footer_id)) {
        footer_height = RB.UI.getHeight(footer_id) + 1; // 1px border // TODO 1px or 2px ?
    }
    window_height = window_height - header_height - footer_height;
    return [ 0, header_height, window_width, window_height ];
};

// show notification toast
// a simple floating div that fades out
// msg = string
// delay_before_fading = timeout in milliseconds
RB.UI.showNotification = function(msg, duration) {
    var duration = duration || RB.UI.NOTIFICATION_DURATION;
    
    //
    // TODO refactor
    //
    $('<div class="ui-loader ui-overlay-shadow ui-body-e ui-corner-all notificationPopup"><h1 class="notificationText">' + msg + '</h1></div>')
        .css({
            width: (RB.UI.getScreenWidth() * 0.4),
            left:  (RB.UI.getScreenWidth() * 0.3),
            top:   (RB.UI.getScreenHeight() * 0.2)
        })
        .appendTo( $.mobile.pageContainer )
        .delay(duration)
        .fadeOut(duration/2, function(){
            $(this).remove();
        });
};

RB.UI.openImageFullScreen = function(id, src, mode) {
    var popup_id = 'minstrelFSI-' + id;
    
    // close function
    var closeMe = function() {
        RB.UI.getElement(popup_id).remove();
        delete RB.UI.visiblePopups[popup_id];
    };
    
    // create popup
    $('<div id="' + popup_id + '"><div id="' + popup_id + 'Container"><img id="' + popup_id + 'Image" src="' + src + '"/></div></div>').css({
            'z-index': '999999'
        }).appendTo( $.mobile.pageContainer );
    
    // add popup
    RB.UI.visiblePopups[popup_id] = { 'src': src, 'mode': mode };
    
    // attach events function
    var bindings = {};
    if (mode === 'detach') {
        
        bindings['doubletap'] = function() {
            closeMe();
        };
        
        bindings['panstart'] = function(e) {
            var targetID = e.target.id.replace('Image', '').replace('Container', '');
            RB.UI.panstartX = RB.UI.getOffsetLeft(targetID);
            RB.UI.panstartY = RB.UI.getOffsetTop(targetID);
        };
        
        bindings['panmove'] = function(e) {
            var targetID = e.target.id.replace('Image', '').replace('Container', '');
            RB.UI.applyCSS(targetID, 'left', RB.UI.panstartX + e.deltaX);
            RB.UI.applyCSS(targetID, 'top',  RB.UI.panstartY + e.deltaY);
        };
        
    } else {
    
        bindings['tap'] = closeMe;
    
        bindings['doubletap'] = function() {
            closeMe();
            RB.UI.openImageFullScreen(id, src, 'detach');
        };
        
        var el = RB.UI.getElement(popup_id + 'Container');
        try {
            el.panzoom('destroy');
        } catch (e) {
            // nop
        }
        el.panzoom({ minScale: 0.1, maxScale: 10 });
        el.panzoom('option', { disablePan: false });
        /*
        el.on('panzoomend', function(e, panzoom, matrix, changed) {
            if (!changed) {
                closeMe();
            }
        });
        */
    }

    RB.UI.bindHammerEvents(popup_id,               bindings);
    RB.UI.bindHammerEvents(popup_id + 'Container', bindings);
    //RB.UI.getElement(popup_id).on('click', closeMe);
    
    // resize
    RB.UI.resizePopup(popup_id, mode);
};
RB.UI.scaleDownPopup = function(e) {
    var targetID = e.target.id.replace('Image', '').replace('Container', '');
    RB.UI.scalePopup(targetID, 0.9);
};
RB.UI.scaleUpPopup = function(e) {
    var targetID = e.target.id.replace('Image', '').replace('Container', '');
    RB.UI.scalePopup(targetID, 1.1);
};
RB.UI.scalePopup = function(targetID, scale) {
    var w = RB.UI.getWidth(targetID) * scale;
    var h = RB.UI.getHeight(targetID) * scale;
    RB.UI.applyCSS(targetID, 'width', w);
    RB.UI.applyCSS(targetID, 'height',  h);
};
RB.UI.resizeDetachedImages = function() {
    var arr = Object.keys(RB.UI.visiblePopups);
    for (var i = 0; i < arr.length; i++) {
        RB.UI.resizePopup(arr[i], RB.UI.visiblePopups[arr[i]]['mode']);
    }
};
RB.UI.resizePopup = function(id, mode) {

    var image_id         = id + 'Image';
    var container_id     = id + 'Container';

    var screen_width     = RB.UI.getScreenWidth();
    var screen_height    = RB.UI.getScreenHeight();
    var margin_width     = 0;
    var margin_height    = 0;
    var available_width  = screen_width - 2 * margin_width;
    var available_height = screen_height - 2 * margin_height;
    
    var image_width      = RB.UI.getWidth(image_id);
    var image_height     = RB.UI.getHeight(image_id);
    var actual_width     = image_width;
    var actual_height    = image_height;
    if ((actual_width > available_width) || (actual_height > available_height)) {
        var ratio_width  = available_width / image_width;
        var ratio_height = available_height / image_height;
        if (ratio_width < ratio_height) {
            actual_width  = available_width;
            actual_height = image_height * ratio_width;
        } else {
            actual_width  = image_width * ratio_height;
            actual_height = available_height;
        }
    }
    var margin_image_width  = (available_width - actual_width) / 2;
    var margin_image_heigth = (available_height - actual_height) / 2;
    
    // resize
    if (mode === 'detach') {
        RB.UI.getElement(id).css({
            width:    (actual_width),
            height:   (actual_height),
            left:     (margin_image_width),
            top:      (margin_image_heigth),
            border:   '0',
            margin:   '0',
            padding:  '0',
            position: 'absolute',
            overflow: 'hidden',
            'background-color': 'transparent'
        });
        
        RB.UI.getElement(container_id).css({
            position: 'relative',
            border:   '0',
            margin:   '0',
            padding:  '0',
            overflow: 'hidden',
            'background-color': 'transparent'
        });
        
        RB.UI.getElement(image_id).css({
            width:    (actual_width),
            height:   (actual_height),
            border:   '0',
            margin:   '0',
            padding:  '0',
            position: 'relative',
            overflow: 'hidden'
        });
        
    } else {
        RB.UI.getElement(id).css({
            width:    (available_width),
            height:   (available_height),
            left:     (margin_width),
            top:      (margin_height),
            position: 'absolute',
            border:   '0',
            margin:   '0',
            padding:  '0',
            overflow: 'hidden',
            'background-color': 'black'
        });
        
        RB.UI.getElement(container_id).css({
            width:    '100%',
            height:   '100%',
            left:     '0',
            top:      '0',
            position: 'relative',
            border:   '0',
            margin:   '0',
            padding:  '0',
            overflow: 'hidden',
            'background-color': 'transparent'
        });
        
        RB.UI.getElement(image_id).css({
            width:    (actual_width),
            height:   (actual_height),
            left:     (margin_image_width),
            top:      (margin_image_heigth),
            border:   '0',
            margin:   '0',
            padding:  '0',
            position: 'absolute',
            overflow: 'hidden'
        });
    }
    
};

// visual feedback for 'click': a simple background color 'set and auto-remove'
RB.UI.showClick = function(target) {
    $('#' + target).addClass(RB.UI.VISUAL_FEEDBACK_ON_CLICK_CLASS);
    window.setTimeout(function() {
        $('#' + target).removeClass(RB.UI.VISUAL_FEEDBACK_ON_CLICK_CLASS);
    }, RB.UI.VISUAL_FEEDBACK_ON_CLICK_DURATION);
};

// collapse
RB.UI.collapse = function(id) {
    RB.UI.getElement(id).trigger('collapse');
};

// collapse
RB.UI.expand = function(id) {
    RB.UI.getElement(id).trigger('expand');
};

// set button text
RB.UI.setText = function(id, str, no_class) {
    var inner_class = ' .ui-btn-text';
    if (no_class) {
        inner_class = '';
    }
    $('#' + id + inner_class).text(str);
};

// set boolean (check/delete) icon
RB.UI.setBooleanIcon = function(id, value) {
    RB.UI.setIcon(id, value, 'check', 'delete');
};

// set boolean (lock/unlock) icon
RB.UI.setBooleanLockIcon = function(id, value) {
    RB.UI.setIcon(id, value, 'lock', 'unlock');
};

// set boolean (scroll/do not scroll) icon
RB.UI.setBooleanScrollIcon = function(id, value) {
    RB.UI.setIcon(id, value, 'unlock', 'lock'); // 'heart', 'heart-empty' 'star', 'star-empty' TODO find a better icon pair
};

// NOTE these icons are inverted!
// set boolean (pause/play) icon
RB.UI.setBooleanPlayIcon = function(id, value) {
    RB.UI.setIcon(id, value, 'pause', 'play');
};
RB.UI.setBooleanPlayIcon2 = function(id, value) {
    if (value) {
        RB.UI.removeClass(id, 'icon-play');
        RB.UI.addClass(id, 'icon-pause');
    } else {
        RB.UI.removeClass(id, 'icon-pause');
        RB.UI.addClass(id, 'icon-play');
    }
};

// set button icon (generic)
RB.UI.setIcon = function(id, value, trueIcon, falseIcon) {
    var myIcon = falseIcon;
    if (value) {
        myIcon = trueIcon;
    }
    $('#' + id).buttonMarkup({ icon: myIcon });
};

// set boolean checkbox
RB.UI.setBooleanCheckbox = function(id, value) {
    try {
        var for_id = $('#' + id).attr('for');
        $('#' + for_id).prop('checked', value).checkboxradio('refresh');
    } catch (e) {
        // nop 
    }
};

// attach palette
RB.UI.attachPalette = function(element, initialColor, onChange) {
    var spectrum_options = {
        showInitial: true,
        showAlpha: false,
        showPalette: true,
        showPaletteOnly: true,
        togglePaletteOnly: false,
        showSelectionPalette: false,
        hideAfterPaletteSelect: false,
        clickoutFiresChange: true,
        showButtons: true,
        preferredFormat: 'hex',
        maxSelectionSize: 8,
        palette: [
            ['#000000','#444444','#666666','#999999','#cccccc','#f0f0f0','#f6f6f6','#ffffff'],
            ['#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#0000ff','#9900ff','#ff00ff'],
            ['#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#cfe2f3','#d9d2e9','#ead1dc'],
            ['#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#9fc5e8','#b4a7d6','#d5a6bd'],
            ['#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6fa8dc','#8e7cc3','#c27ba0'],
            ['#cc0000','#e69138','#f1c232','#6aa84f','#45818e','#3d85c6','#674ea7','#a64d79'],
            ['#990000','#b45f06','#bf9000','#38761d','#134f5c','#0b5394','#351c75','#741b47'],
            ['#660000','#783f04','#7f6000','#274e13','#0c343d','#073763','#20124d','#4c1130']
        ],
        selectionPalette: []
    };
    spectrum_options.color = initialColor;
    spectrum_options.change = onChange;
    spectrum_options.beforeShow = function() {
        RB.UI.paletteOpen = element;
    };
    if (RB.App.isAndroid()) {
        // in Android, we need to stop immediate propagation
        // to avoid a nasty show/hide effect
        //
        // TODO investigate this
        // 
        RB.UI.getElement(element).on('click', function(ev) {
            ev.stopImmediatePropagation();
            return false;
        });
    }
    RB.UI.getElement(element).spectrum(spectrum_options);
};

RB.UI.closePalette = function() {
    if (RB.UI.paletteOpen) {
        try {
            RB.UI.getElement(RB.UI.paletteOpen).spectrum('hide');
            RB.UI.paletteOpen = null;
        } catch (e) {
            // nop
        }
    }
};

RB.UI.loadLocalization = function() {
    RB.UI.language = RB.Storage.get(RB.Storage.Keys.UI_LANGUAGE);
    RB.UI.localeManager = new RB.Localization.LocaleManager(RB.UI.language);
     
    RB.UI.i18n = function(key, index) {
        if (index < 0) {
            index = 0;
        }
        if (RB.UI.localeManager) {
            return RB.UI.localeManager.getLocalizedObject(key, index);
        }
        return null;
    };
    
    var keys = RB.UI.localeManager.getKeys();
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var s = RB.UI.i18n(k);
        var e = $('#' + k);
        if ((e) && (e.length)) {
            if ((k.substring(0, 3) === 'btn') || (k.substring(0, 3) === 'chk') || (k.substring(0, 3) === 'opt')) {
                /*
                if (e.is('label')) {
                    // <label> check box
                } else {
                    // <a> button
                }
                */
                RB.UI.setText(k, s);
            } else if (k.substring(0, 3) === 'col') {
                $('#' + k + ' .ui-collapsible-heading .ui-btn .ui-btn-inner .ui-btn-text').text(s);
            } else {
                e.text(s);
            }
        }
    }
};

// return a string made by the concatenation of language names
// corresponding to the codes passed as an array of strings
// e.g. if the current language is English:
// RB.UI.localizeLanguageNames(['it']) = 'Italian (it)'
// RB.UI.localizeLanguageNames(['en-US']) = 'English (en-US)'
// RB.UI.localizeLanguageNames(['it', 'en']) = 'Italian (it); English (en)'
RB.UI.localizeLanguageNames = function(arr) {
    var localized = '';
    for (var i = 0; i < arr.length; ++i) {
        var l = arr[i].trim();
        if (l) {
            var original = l;
            var variant_index = l.indexOf('-');
            if (variant_index >= 2) {
                // TODO: now, it just strips the country: en-US => en
                l = l.substring(0, variant_index);
            }
            var languageName = RB.UI.i18n('globalLanguageNames', l);
            if (languageName) {
                localized += languageName + ' (' + original + ')';
            } else {
                localized += original;
            }
            if (i < arr.length - 1) {
                localized += '; ';
            }
        }
    }
    return localized;
};

// handle back button
RB.UI.onBackButton = function() {
    // dim system bar
    RB.UI.dimSystemBar();

    // back to library   
    window.history.back();
};

// set orientation mode
RB.UI.applyOrientation = function(value) {
    var v = value;
    if (!v) {
        v = RB.Storage.get(RB.Storage.Keys.UI_ORIENTATION);
    }
    var command    = 'orient';
    var parameters = JSON.stringify({ 'value': v });
    if (RB.App.isAndroid()) {
        Commander.createEvent(command, parameters, null, null);
    }
    if (RB.App.isIOS()) {
        Commander.createEvent(command, parameters, null, null);
        //cordova.exec(null, null, 'Commander', 'commander', [command, parameters]);
    }
};

// set screen brightness
RB.UI.setBrightness = function(value) {
    var v = value;
    if (!v) {
        v = RB.Storage.get(RB.Storage.Keys.UI_BRIGHTNESS);
    }
    if ((RB.Storage.isAppParameterTrue(RB.Storage.Keys.UI_ENABLE_BRIGHTNESS)) || (v === -1.0)) {
        var command    = 'setbrightness';
        var parameters = JSON.stringify({ 'value': v });
        if (RB.App.isAndroid()) {
            Commander.createEvent(command, parameters, null, null);
        }
        if (RB.App.isIOS()) {
            if (v === -1.0) {
                return;
            }
            Commander.createEvent(command, parameters, null, null);
            //cordova.exec(null, null, 'Commander', 'commander', [command, parameters]);
        }
    }
};

// attach arbitrary hammer events to id
// bindings is a dictionary like { eventname1: callback1, ... }
RB.UI.bindHammerEvents = function(id, bindings) {
    // allow text selection
    delete Hammer.defaults.cssProps.userSelect;
    
    var el = document.getElementById(id);
    var hammer = new Hammer(el);
    hammer.get('swipe').set( { threshold: 25, velocity: 0.1 });
    if (('pan' in bindings) || ('panend' in bindings)) {
        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 50 });
    }
    if (('pinchin' in bindings) || ('pinchout' in bindings)) {
        hammer.get('pinch').set({ enable: true });
    }
    if ('rotate' in bindings) {
        hammer.get('rotate').set({ enable: true, threshold: 60  });
    }
    
    // remove default tap/doubletap
    hammer.remove('doubletap');
    hammer.remove('tap');
    
    // add two and doubletwo
    if ('two' in bindings) {
        var two = new Hammer.Tap({ event: 'two', pointers: 2, taps: 1, threshold: 10, posThreshold: 50 });
        hammer.add(two);
    }
    if ('doubletwo' in bindings) {
        var doubletwo = new Hammer.Tap({ event: 'doubletwo', pointers: 2, taps: 2, threshold: 10, posThreshold: 50 });
        hammer.add(doubletwo);
    }
    
    // insert new tap and doubletap, mutually exclusive
    var doubleTap  = new Hammer.Tap({ event: 'doubletap', taps: 2, threshold: 10, posThreshold: 50 });
    var singleTap  = new Hammer.Tap({ event: 'tap',       taps: 1, threshold: 10  });
    hammer.add([doubleTap, singleTap]);
    doubleTap.recognizeWith(singleTap);
    singleTap.requireFailure(doubleTap);
    
    // bind events
    var events = Object.keys(bindings);
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        hammer.on(event, bindings[event]);
    }
};

// bind (tap, double tap, press) events to button
RB.UI.bindSimpleButtonEvents = function(id, bindings, visualFeedback) {
    // allow text selection
    delete Hammer.defaults.cssProps.userSelect;
    
    var JQelement  = RB.UI.getElement(id);
    var DOMelement = document.getElementById(id);
    
    if ('click' in bindings) {
    
        //
        // TODO remove this!
        // super ugly trick to avoid the ghost click
        //
        JQelement.on('click', bindings['click']);
        
    } else {
    
        var hammer     = new Hammer.Manager(DOMelement, {});
        var press      = new Hammer.Press({ event: 'press'              });
        var doubleTap  = new Hammer.Tap(  { event: 'doubletap', taps: 2, threshold: 10, posThreshold: 50 });
        var singleTap  = new Hammer.Tap(  { event: 'tap',       taps: 1, threshold: 10  });

        if ('press' in bindings) {
            hammer.add(press);
            var action = bindings['press'];
            if (visualFeedback) {
                action = function() {
                    RB.UI.showClick(id);
                    bindings['press']();
                }
            }
            hammer.on('press', action);
        }
        
        if ('doubletap' in bindings) {
            hammer.add(doubleTap);
            doubleTap.recognizeWith(singleTap);
            singleTap.requireFailure(doubleTap);
            var action = bindings['doubletap'];
            if (visualFeedback) {
                action = function() {
                    RB.UI.showClick(id);
                    bindings['doubletap']();
                }
            }
            hammer.on('doubletap', action);
        }
        
        if ('tap' in bindings) {
            hammer.add(singleTap);
            var action = bindings['tap'];
            if (visualFeedback) {
                action = function() {
                    RB.UI.showClick(id);
                    bindings['tap']();
                }
            }
            
            // also this one is ugly (see above)
            if ('press' in bindings) {
                hammer.on('tap', action);
            } else {
                JQelement.on('click', action);
            }
        }
        
    }
};

RB.UI.resizeSidePopup = function(callback) {
    if (RB.UI.dialogOpen) {
        var id = RB.UI.dialogOpen;
        RB.UI.closeDialog();
        RB.App.delay(function() {
            RB.UI.openSidePopup(id, RB.UI.currentWindowHeader, RB.UI.currentWindowFooter, RB.UI.currentPopupWidthFactor);
            if (callback) {
                callback();
            }
        }, RB.UI.ON_ORIENTATION_CHANGE_DELAY);
    }
};
RB.UI.openSidePopup = function(popup_id, header_id, footer_id, popup_width_factor) {
    // TODO refactor this
    RB.UI.currentWindowHeader     = header_id;
    RB.UI.currentWindowFooter     = footer_id;
    RB.UI.currentPopupWidthFactor = popup_width_factor;
    
    // compute translate etc.
    var window_width  = RB.UI.getScreenWidth();
    var window_height = RB.UI.getScreenHeight();
    var header_height = 0;
    var footer_height = 0;
    if (RB.UI.isVisible(RB.UI.currentWindowHeader)) {
        header_height = RB.UI.getHeight(RB.UI.currentWindowHeader);
    }
    if (RB.UI.isVisible(RB.UI.currentWindowFooter)) {
        footer_height = RB.UI.getHeight(RB.UI.currentWindowFooter);
    }
    var popup_top     = (header_height - footer_height) / 2 + 1;                  // 2 px top border    // TODO
    var popup_height  = window_height - header_height - footer_height - 4 - 2;    // 2 px top border    // TODO
    var popup_width   = RB.Utilities.max([240, window_width * RB.UI.currentPopupWidthFactor]);          // TODO
    
    RB.UI.applyCSS(popup_id + '-popup',  '-webkit-transform', 'translate(0px, ' + popup_top + 'px)');
    RB.UI.applyCSS(popup_id,             'height',            popup_height + 'px');
    RB.UI.applyCSS(popup_id,             'width',             popup_width + 'px');
    
    RB.UI.getElement(popup_id).on('click', function(e) {
        if (e.target.id === popup_id) {
            RB.UI.closeDialog();
        }
    });
    
    // open popup
    RB.UI.mobileChangePage(popup_id, 'popup');
    
    // TODO: try avoiding scrolling of popup_id-popup's parent, which should be named popup_id-screen
    /*
    var id = popup_id + 'Inner';
    var el = document.getElementById(id);
    while ((el) && (id)) {
        alert(id + " " + RB.UI.getElement(id).css('overflow'));
        el = el.parentNode;
        id = el.id;
    }
    */
};

RB.UI.openPopup = function(id) {
    RB.UI.mobileChangePage(id, 'popup');
};

RB.UI.closeDialog = function() {
    if (RB.UI.dialogOpen) {
        try {
            RB.UI.getElement(RB.UI.dialogOpen).dialog('close');
        } catch (e) {
            // nop
        }
        try {
            RB.UI.getElement(RB.UI.dialogOpen).popup('close');
        } catch (e) {
            // nop
        }
        RB.UI.dialogOpen = null;
    }
};

RB.UI.mobileChangePage = function(id, role) {
    if (RB.UI.dialogOpen) {
        RB.UI.closeDialog();
    }
    if (role === 'popup') {
        RB.UI.getElement(id).on('popupafterclose', function() {
            RB.UI.dialogOpen = null;
        });
        RB.UI.getElement(id).popup('open', {});
    }
    if (role === 'dialog') {
        RB.UI.getElement(id).on('pagehide', function() {
            RB.UI.dialogOpen = null;
        });
        $.mobile.changePage('#' + id, { role: 'dialog', transition: 'none' });
    }
    if (role === 'page') {
        RB.UI.getElement(id).on('pagehide', function() {
            RB.UI.dialogOpen = null;
        });
        $.mobile.changePage('#' + id, { role: 'page', transition: 'none' });
    }
    RB.UI.dialogOpen = id;
};

RB.UI.changePage = function(id) {
    $.mobile.changePage('#' + id, { transition: 'none' });
};

// getters
RB.UI.getElement = function(id) {
    if (typeof id === 'string') {
        return $('#' + id);
    }
    return $(id); 
};
RB.UI.isVisible = function(id) {
    return RB.UI.getElement(id).is(':visible');
};
RB.UI.isImage = function(e) {
    return ((e) && (e.target) && (e.target.nodeName) && (e.target.nodeName.toLowerCase() === 'img'));
};
RB.UI.getHeight = function(id) {
    return RB.UI.getElement(id).height();
};
RB.UI.getWidth = function(id) {
    return RB.UI.getElement(id).width();
};
RB.UI.getOffsetTop = function(id) {
    return RB.UI.getElement(id).offset().top;
};
RB.UI.getOffsetLeft = function(id) {
    return RB.UI.getElement(id).offset().left;
};
RB.UI.getOffsetRight = function(id) {
    return RB.UI.getElement(id).offset().right;
};


// silent scroll
RB.UI.silentScroll = function(value) {
    $.mobile.silentScroll(value);
};

// scroll element
RB.UI.scrollElement = function(id, value) {
    RB.UI.getElement(id).scrollTo(value);
};
RB.UI.scrollVerticalElement = function(id, value, duration) {
    RB.UI.getElement(id).scrollTo(value, {axis: 'y', duration: duration});
};

// scroll to element
RB.UI.scrollTo = function(parent, target, offset, duration) {
    if (parent === null) {
        parent = $('body');
        offset = -RB.UI.getHeight('divHeader'); // TODO
    } else {
        parent = RB.UI.getElement(parent);
    }
    if (target.slice(-2) !== 'px') {
        target = '#' + target;
    }
    parent.scrollTo(target, {offset: offset, duration: duration, axis: 'y'});
};

// apply CSS rule
RB.UI.applyCSS = function(id, rule, value) {
    RB.UI.getElement(id).css(rule, value);
};

// set .attr
RB.UI.setAttr = function(id, name, value) {
    RB.UI.getElement(id).attr(name, value);
};

// remove/add class
RB.UI.removeClass = function(id, name) {
    if (name) {
        RB.UI.getElement(id).removeClass(name);
    } else {
        RB.UI.getElement(id).removeClass();
    }
};
RB.UI.addClass = function(id, name) {
    RB.UI.getElement(id).addClass(name);
};

// enable/disable button
RB.UI.enableButton = function(id) {
    RB.UI.getElement(id).prop('disabled', false).removeClass('ui-disabled');
};
RB.UI.disableButton = function(id) {
    RB.UI.getElement(id).prop('disabled', false).addClass('ui-disabled');
};
RB.UI.enableDisableButton = function(id, status) {
    if (status) {
        RB.UI.enableButton(id);
    } else {
        RB.UI.disableButton(id);
    }
};

// show/hide
RB.UI.show = function(id) {
    RB.UI.getElement(id).show();
};
RB.UI.hide = function(id) {
    RB.UI.getElement(id).hide();
};
RB.UI.showHide = function(id, show) {
    if (show) {
        RB.UI.show(id);
    } else {
        RB.UI.hide(id);
    }
};

// empty element
RB.UI.empty = function(id) {
    RB.UI.getElement(id).empty();
};
RB.UI.append = function(id, s) {
    RB.UI.getElement(id).append(s);
};

// LISTVIEW
RB.UI.refreshListview = function(id) {
    // try to refresh the listview
    try {
        RB.UI.getElement(id).listview().listview('refresh');
    } catch (e) {
        // TODO investigate this
        // sometimes it throws an exception?
        // looks like a jQM bug
    }
};

// SLIDER
RB.UI.createSlider = function(id, appendToElement, min, max, onSlideStart, onSlideStop, onSlideChanging) {
    $('<input>').appendTo('#' + appendToElement).attr({
        'name': 'slider',
        'id': id,
        'data-highlight': 'true',
        'min': min,
        'max': max,
        'value': min,
        'type': 'range'
        }).slider({
        create: function(event, ui) {
            $(this).parent().find('input').hide();
            $(this).parent().find('.ui-slider-track').css('margin','9px 30px 0 30px');
            $(this).parent().find('.ui-slider-track .ui-btn').css('margin-left', '-16px');
            $(this).parent().find('.ui-slider-track .ui-btn-inner').hide();
            //$(this).parent().find('.ui-slider-handle').hide();
        }
    }).slider('refresh');
    
    if (onSlideStart) {
        $('#' + id).on('slidestart', onSlideStart);
    }
    if (onSlideStop) {
        $('#' + id).on('slidestop',  onSlideStop);
    }
    if (onSlideChanging) {
        $('#' + id).on('slidedrag', onSlideChanging);
    }
};
RB.UI.setSliderValue = function(id, value) {
    RB.UI.getElement(id).val(value).slider('refresh');
};
RB.UI.getSliderValue = function(id) {
    return RB.UI.getElement(id).val();
};

// return an 0<= index <= 8 corresponding
// to the screen zone where the click originated
RB.UI.getScreenZoneClicked = function(clickX, clickY) {
    /*
        +---+---+---+
        | 0 | 1 | 2 |
        +---+---+---+
        |   |   |   |
        | 3 | 4 | 5 |
        |   |   |   |
        +---+---+---+
        | 6 | 7 | 8 |
        +---+---+---+
    */
    
    var windowW = RB.UI.getScreenWidth();
    var windowH = RB.UI.getScreenHeight();
    var left    = 0.40 * windowW;
    var right   = 0.60 * windowW;
    var top     = 0.15 * windowH;
    var bottom  = 0.85 * windowH;
    
    var row = 1;
    if (clickY < top) {
        row = 0;
    } else if (clickY > bottom) {
        row = 2;
    }
    
    var col = 1;
    if (clickX < left) {
        col = 0;
    } else if (clickX > right) {
        col = 2;
    }
    return col + row * 3;
};

RB.UI.temporaryHighlight = function(id, duration) {
    var callback = null;
    if (id) {
        callback = function() {
            RB.UI.addClass(id, RB.UI.JUMP_TARGET_HIGHLIGHTED_CLASS);
            RB.App.delay(function() {
                RB.UI.removeClass(id, RB.UI.JUMP_TARGET_HIGHLIGHTED_CLASS);
            }, duration);
        };
    }
    return callback;
};


