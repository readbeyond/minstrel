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

/** @namespace RB.App */
RB.App = RB.App || {};

/* constants */

// path of the stock image for items without cover
RB.App.emptyThumbnail = 'img/empty.png';

/**
    Allowed parameters for the `openPage` function.
    @todo Use Object.freeze to freeze the enum. (Currently not in place, due to a JSDoc bug.)
    @readonly
    @enum {string}
*/
RB.App.PagesEnum = {    
    /** help */
    HELP: 'help.html',
    
    /** file chooser */
    FILECHOOSER: 'filechooser.html',

    /** index (library) */
    INDEX: 'index.html',
    
    /** library */
    LIBRARY: 'index.html',

    /** settings */
    SETTINGS: 'settings.html',
};

RB.App.AppStatusBeforeBackground = {
    /** playing */
    PLAYING: 'backgrounded_while_playing',
    
    /** paused */
    PAUSED:  'backgrounded_while_paused',

    /** stopped */
    STOPPED: 'backgrounded_while_stopped',

    /** other */
    OTHER:   'backgrounded_while_other'
};

RB.App.MessageSeverityEnum = {
    DEBUG:      0,
    INFO:     100,
    ERROR:    200,
    CRITICAL: 300
};

/* variables */

// current platform: determined at runtime
RB.App.platform                  = null;
RB.App.fileSeparator             = null;
RB.App.externalStorage           = null;
RB.App.iOSDocumentsDirectory     = null;
RB.App.iOSCacheDirectory         = null;
RB.App.storageRoots              = null;
if (RB.Storage) {
    RB.App.platform              = RB.Storage.get(RB.Storage.Keys.PLATFORM);
    RB.App.fileSeparator         = RB.Storage.get(RB.Storage.Keys.FILE_SEPARATOR);
    RB.App.externalStorage       = RB.Storage.get(RB.Storage.Keys.EXTERNAL_STORAGE);
    RB.App.iOSDocumentsDirectory = RB.Storage.get(RB.Storage.Keys.IOS_DOCUMENTS_DIRECTORY);
    RB.App.iOSCacheDirectory     = RB.Storage.get(RB.Storage.Keys.IOS_CACHE_DIRECTORY);
    RB.App.storageRoots          = RB.Storage.get(RB.Storage.Keys.STORAGE_ROOTS);
}



/* functions */

// show message
RB.App.message = function(msg, severity) {
    // TODO filter by severity

    // TODO create (native?) dialog instead
    alert(msg);
};

// this function is executed every time the index.html is loaded
// but the default values are stored only if the corresponding key
// is not present in the local storage already
RB.App.setDefaultValues = function() {
    for (var key in RB.Config.defaultValues) {
        if (RB.Storage.get(key) === null) {
            // apply defaults the first time the app is run
            RB.Storage.set(key, RB.Config.defaultValues[key]);
        }
    }
};

// go to specified html file
RB.App.openPage = function(url) {
    window.location.href = url;
};

// call function after a delay (in ms)
RB.App.delay = function(callback, delay) {
    window.setTimeout(function() {
        if (callback) {
            callback();
        };
    }, delay);
};

// get path of the thumbnail directory
// if absolute is true, get the absolute path
RB.App.getThumbnailsDirectory = function(absolute) {
    if (RB.App.fileSeparator) {
        var relative = RB.App.joinPaths([RB.Config.Library.mainDirectory, RB.Config.Library.thumbnailsDirectory]);
        if (absolute) {
            return RB.App.relativeToAbsolutePath(relative, 'cache');
        } else {
            return relative;
        }
    }
    return null;
};

// get path of the temporary directory
// if absolute is true, get the absolute path
RB.App.getTmpDirectory = function(absolute) {
    if (RB.App.fileSeparator) {
        var relative = RB.App.joinPaths([RB.Config.Library.mainDirectory, RB.Config.tmpDirectory]);
        if (absolute) {
            return RB.App.relativeToAbsolutePath(relative, 'cache');
        } else {
            return relative;
        }
    }
    return null;
};

// join paths using the system separator
RB.App.joinPaths = function(arr) {
    if ((RB.App.fileSeparator) && (arr.length > 0)) {
        var path = arr[0];
        for (var i = 1; i < arr.length; i++) {
            if (path.slice(-1) !== RB.App.fileSeparator) {
                path += RB.App.fileSeparator;
            }
            //path += RB.App.fileSeparator + arr[i];
            path += arr[i];
        }
        return path;
    }
    return null;
};

// get the absolute path from relative path
// iOSDirectory can be 'cache' or 'documents'
RB.App.relativeToAbsolutePath = function(relative, iOSDirectory) {
    if (RB.App.fileSeparator) {
        if (RB.App.isAndroid()) {
            return RB.App.joinPaths([RB.App.externalStorage, relative]);
        }
        if (RB.App.isIOS()) {
            if (iOSDirectory === 'cache') {
                return RB.App.joinPaths([RB.App.iOSCacheDirectory, relative]);
            }
            if (iOSDirectory === 'documents') {
                return RB.App.joinPaths([RB.App.iOSDocumentsDirectory, relative]);
            }
        }
        return relative;
    }
    return null;
};

// get the absolute path of the main directory
// i.e., the directory where the user is supposed to place her documents
// and other files like custom.css or fonts
RB.App.getAbsolutePathMainDirectory = function() {
    if (RB.App.fileSeparator) {
        if (RB.App.isAndroid()) {
            return RB.App.joinPaths([RB.App.externalStorage, RB.Config.Library.mainDirectory]);
        }
        if (RB.App.isIOS()) {
            return RB.App.iOSDocumentsDirectory;
        }
    }
    return '/';
};

// remove prefix from path
RB.App.removePathPrefix = function(path, prefix) {
    if (RB.App.fileSeparator) {
        if ((path.length >= prefix.length) && (path.substring(0, prefix.length) === prefix)) {
            var p = path.substring(prefix.length);
            if ((p.length > 0) && (p.substring(0, 1) === RB.App.fileSeparator)) {
                p = p.substring(1);
            }
            return p;
        }
    }
    return null;
};

// reset all app settings to their default value
RB.App.resetAppSettings = function() {
    RB.Storage.clear();
    for (var key in RB.Config.defaultValues) {
        RB.Storage.set(key, RB.Config.defaultValues[key]);
    }
};
// is the first time this version is running?
// (i.e., detects new app or app update)
RB.App.isFirstTimeForThisVersion = function() {
    var stored = RB.Storage.get(RB.Storage.Keys.MINSTREL_VERSION);
    if ((RB.Storage.isJSONStringNull(stored)) || (stored !== RB.Config.Minstrel.version)) {
        RB.Storage.set(RB.Storage.Keys.MINSTREL_VERSION, RB.Config.Minstrel.version);
        return true;
    }
    return false;
};

// open preview/viewer
// path must be unescaped!
RB.App.openItem = function(id, path, format, preview) {
    // set item path and id
    RB.Storage.set(RB.Storage.Keys.OPEN_ITEM_FILE_PATH, path);
    RB.Storage.set(RB.Storage.Keys.OPEN_ITEM_ID,        id);
    
    // if we are opening, set isNew to false and save current date/time
    if (!preview) {
        RB.App.saveItemData(id, ['library', 'isNew'], false);
        RB.App.saveItemData(id, ['library', 'lastTimeOpened'], RB.Utilities.getCurrentDateTime());
    }
    
    // open viewer chooser
    RB.App.loadFormatViewer(format, preview);
};

// open the previewer/viewer for the given format
// note that the item id and path must be set before this call!
RB.App.loadFormatViewer = function(format, preview) {
    var page;
    var formatSettings = RB.Plugins[format];
    if (preview) {
        page = formatSettings['previewerFilePath'];
    } else {
        var enabledViewers = formatSettings['enabledViewerFilePaths'];
        page = formatSettings['defaultViewerFilePath'];
        
        if (enabledViewers.length === 1) {
            page = enabledViewers[0];
        }
        if (enabledViewers.length > 1) {
            // TODO style it! 
            var divDialog = document.createElement("div");
            $(divDialog).attr('data-role', 'dialog');
            //$(divDialog).attr('data-role', 'popup');
            //$(divDialog).attr('data-shadow', 'false');
            //$(divDialog).attr('data-tolerance', '0');
            $(divDialog).attr('id', 'viewerSelector');
            $(divDialog).attr('data-close-btn', 'right');
            $(divDialog).attr('data-theme', 'b');
            
            var divHeader = document.createElement("div");
            $(divHeader).attr('data-role', 'header');
            $(divHeader).attr('data-theme', 'b');
            
            var h1Header = document.createElement("h1");
            $(h1Header).text(RB.UI.i18n('txtMultipleViewersAvailable'));
            $(h1Header).attr('onclick', 'RB.UI.onBackButton();');
            
            var divContent = document.createElement("div");
            $(divContent).attr('data-role', 'content');
            $(divContent).attr('data-theme', 'b');
            
            var ulFormats = document.createElement("ul");
            $(ulFormats).attr('data-role', 'listview');
            
            for (var i = 0; i < enabledViewers.length; i++) {
                
                var enabledIndex = formatSettings['availableViewerFilePaths'].indexOf(enabledViewers[i]);
                
                var li = document.createElement("li");
                $(li).attr('id', 'viewer' + i);
                
                var a = document.createElement("a");
                $(a).attr('onclick', 'RB.App.openPage("' + formatSettings['availableViewerFilePaths'][enabledIndex] + '");');
            
                var h4 = document.createElement("h4");
                $(h4).text(formatSettings['availableViewerDescriptions'][enabledIndex]);
                
                a.appendChild(h4);
                li.appendChild(a);
                ulFormats.appendChild(li);
            }

            divHeader.appendChild(h1Header);
            divContent.appendChild(ulFormats);
            divDialog.appendChild(divHeader);
            divDialog.appendChild(divContent);
            $(divDialog).appendTo($.mobile.pageContainer);
            
            RB.UI.mobileChangePage('viewerSelector', 'dialog'); //dialog
            
            return;
            
        }
    }
    if (page) {
        RB.App.openPage(page);
    } else {
        // TODO
        RB.App.message('No enabled viewers to open ' + format + ' files!', RB.App.MessageSeverityEnum.INFO);
    }
};

// clean RB.Config.tmpDirectory and exit app
RB.App.cleanExitApp = function() {
    var callback = function(message) {        
        if (RB.App.isAndroid()) {
            navigator.app.exitApp();
        }
    };
    var command    = 'deleteRelative';
    var parameters = JSON.stringify({ 'path': RB.App.getTmpDirectory() });
    if (RB.App.isAndroid()) {
        Commander.createEvent(command, parameters, callback, callback);
    }
    if (RB.App.isIOS()) {
        Commander.createEvent(command, parameters, callback, callback);
        //cordova.exec(callback, callback, 'Commander', 'commander', [command, parameters]);
    }
};

// determine the current platform
RB.App.setPlatform = function() {
    // running in debug mode?
    if (RB.Config.debug) {
        RB.App.platform = 'debug';
    } else {
        // default: Android
        RB.App.platform = 'android';

        // iOS emulator?
        if ((navigator) && (navigator.userAgent) && (navigator.userAgent.match(/iP[ha][od].*Mac OS X/))) {
            RB.App.platform = 'ios';
        }
        
        // real iOS device?
        if ((window.device) && (window.device.platform) && (window.device.platform.toLowerCase() === 'ios')) {
            RB.App.platform = 'ios';
        }
    }
    // set platform
    if (RB.Storage) {
        RB.Storage.set(RB.Storage.Keys.PLATFORM, RB.App.platform);
    }
    return RB.App.platform;
};

// running Android?
RB.App.isAndroid = function() {
    return (RB.App.platform === 'android');
};

// running iOS?
RB.App.isIOS = function() {
    return (RB.App.platform === 'ios');
};

// debugging?
RB.App.isDebug = function() {
    return RB.Config.debug;
};

// open external URL
RB.App.openExternalURL = function(url) {
    if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.OPEN_URLS_IN_SYSTEM_BROWSER)) {
        var command    = 'openExternalURL';
        var parameters = JSON.stringify({ 'url': url });
        if (RB.App.isAndroid()) {
            Commander.createEvent(command, parameters, null, null);
        }
        if (RB.App.isIOS()) {
            Commander.createEvent(command, parameters, null, null);
            //cordova.exec(null, null, 'Commander', 'commander', [command, parameters]);
        }
    } else {
        RB.App.message(RB.UI.i18n('txtOpeningURLsInSystemBrowserNotAllowed'), RB.App.MessageSeverityEnum.INFO);
    }
};

// a custom timeout with start/pause/stop
// get/return durations (duration, pause()) in s
// internally use milliseconds (_start, _remaining)
RB.App.Timeout = function(duration, callback, startImmediately) {
    var _timer;
    var _start;
    var _remaining = duration * 1000;
    var _callback  = callback;
    var _isTicking = false;

    this.isTicking = function() {
        return _isTicking;
    };

    this.pause = function() {
        if (_isTicking) {
            window.clearTimeout(_timer);
            var elapsed = new Date() - _start;
            _isTicking = false;
            _remaining -= elapsed;
            return elapsed / 1000;
        }
        return 0;
    };

    this.start = function() {
        _start     = new Date();
        _isTicking = true;
        _timer     = window.setTimeout(_callback, _remaining);
    };

    this.stop = function() {
        window.clearTimeout(_timer);
        _isTicking = false;
    };
    
    this.clear = function() {
        this.stop();
        _timer = null;
    };

    if (startImmediately) {
        this.start();
    }
};

// NEW WAY
// a custom wall clock
// get/return positions in seconds
RB.App.WallClock = function(position, speed, callback, interval, startImmediately) {
    var _timer;
    var _position  = position;
    var _speed     = speed;
    var _callback  = callback;
    var _interval  = interval;
    var _remaining = interval;
    var _this      = this;
    
    this.updatePosition = function() {
        _timer.clear();
        _position += (_remaining * _speed);
        _remaining = _interval;
        _timer = new RB.App.Timeout(_interval, _this.updatePosition, true);
        if (_callback) {
            _callback(_position);
        }
    };
    
    this.setPosition = function(position, startImmediately) {
        if (_timer) {
            _timer.clear();
        }
        _position = position;
        _timer = new RB.App.Timeout(_interval, this.updatePosition, startImmediately);
    };
    
    this.getPosition = function() {
        return _position;
    };
    
    this.setPlaybackSpeed = function(speed, startImmediately) {
        if (_timer) {
            this.pause();
            _timer.clear();
        }
        _speed = speed;
        _timer = new RB.App.Timeout(_interval, this.updatePosition, startImmediately);
    };
    
    this.initialize = function() {
        _remaining = _interval;
        _timer = new RB.App.Timeout(_interval, this.updatePosition, false);
    };
    
    this.start = function() {
        _timer.start();
    };
    
    this.pause = function() {
        var elapsed = _timer.pause();
        _remaining -= (elapsed * _speed);
    };
    
    this.stop = function() {
        if (_timer) {
            _timer.stop();
        }
    };
    
    this.clear = function() {
        this.stop();
        if (_timer) {
            _timer = null;
        }
    };
    
    this.initialize();
    if (startImmediately) {
        this.start();
    }
};

// escape/unescape single and double quote characters
RB.App.escapeQuotes = function(s) {
    if (s) {
        s = s.replace(/\"/g, '%22');
        s = s.replace(/\'/g, '%27');
    }
    return s;
};
RB.App.unescapeQuotes = function(s) {
    if (s) {
        s = s.replace(/%22/g, '"');
        s = s.replace(/%27/g, "'");
    }
    return s;
};

// build the correct path to file
RB.App.getLibraryItemPath = function(item) {
    // on Android, use absolute path
    var path = item['absolutePath'];

    // on iOS, use path relative to the app bundle
    if (RB.App.isIOS()) {
        path = RB.App.relativeToAbsolutePath(item['relativePath'], 'documents');
    }
    
    return path;
};

// build the correct path to cover
RB.App.getLibraryItemCoverPath = function(item) {
    // on Android, use absolute path
    var path = item['absolutePathThumbnail'];
    
    // on iOS, use path relative to the app bundle
    if (RB.App.isIOS()) {
        path = item['relativePathThumbnail'];
        if (path) {
            path = RB.App.joinPaths([RB.App.getThumbnailsDirectory(true), path]);
        }
    }
    
    // this covers both Android and iOS
    if (!path) {
        path = RB.Plugins[item['mainFormat'].toLowerCase()].stockThumbnail;
    }
    
    return path;
};

// get the number of keys stored in the given dictionary
RB.App.getDictionarySize = function(dictionary) {
    if (dictionary) {
        return Object.keys(dictionary).length;
    }
    return 0;
};

// get a dictionary containing the loaded formats as keys,
// and an array containing the associated extensions as values
RB.App.getLoadedFormatsWithExtensions = function() {
    var loaded_formats = RB.Storage.getDictionary(RB.Storage.Keys.PLUGINS_LOADED);
    var formatNames = Object.keys(loaded_formats);
    var ret = {};
    for (var i = 0; i < formatNames.length; i++) {
        var formatName = formatNames[i];
        ret[formatName] = RB.Plugins[formatName].settingsFileExtensions;
    }
    return ret;
};

RB.App.getFormatFromFilePath = function(path) {
    var lowercasedPath = path.toLowerCase();
    var formats = RB.Plugins.Format.availablePlugins;
    for (var i = 0; i < formats.length; i++) {
        var format = formats[i];
        var extensions = RB.Plugins[format].settingsFileExtensions;
        for (var j = 0; j < extensions.length; j++) {
            var extension = extensions[j];
            if (lowercasedPath.substring(path.length - extension.length) === extension) {
                return format;
            }
        }
    }
    return null;
};

// read/save item metadata
RB.App.hasItemData = function(itemID) {
    var storageKey = RB.Storage.LIBRARY_ITEM_DATA_PREFIX + itemID;
    var item_data  = RB.Storage.get(storageKey);
    if (item_data) {
        return true;
    } else {
        return false;
    }
};

RB.App.deleteItemData = function(itemID, key) {
    if (itemID) {
        var storageKey = RB.Storage.LIBRARY_ITEM_DATA_PREFIX + itemID;
        if (key) {
            var item_data = RB.Storage.getDictionary(storageKey);
            if (item_data) {
                try {
                    for (var i = 0; i < key.length - 1; i++) {
                        item_data = item_data[key[i]];
                    }
                    if (item_data) {
                        delete item_data[key[key.length - 1]];
                    }
                    RB.Storage.setDictionary(storageKey, item_data);
                } catch (e) {
                    // nop
                }
            }
        } else {
            RB.Storage.deleteKey(storageKey);
        }
    }
};
RB.App.readItemData = function(itemID, key) {
    if (itemID) {
        var storageKey = RB.Storage.LIBRARY_ITEM_DATA_PREFIX + itemID;
        var item_data  = RB.Storage.getDictionary(storageKey);
        if (item_data) {
            if (key) {
                try {
                    for (var i = 0; i < key.length; i++) {
                        item_data = item_data[key[i]];
                    }
                } catch (e) {
                    return null;
                }
            }
            return item_data;
        }
    }
    return null;
};
RB.App.saveItemData = function(itemID, key, value) {
    if (itemID) {
        var storageKey = RB.Storage.LIBRARY_ITEM_DATA_PREFIX + itemID;
        if (key) {
            try {
                // TODO refactor this shit
                var saveme = RB.App.readItemData(itemID);
                if (!saveme) {
                    saveme = {};
                }
                if (key.length === 1) {
                    var k0 = key[0];
                    saveme[k0] = value;
                } else if (key.length === 2) {
                    var k0 = key[0];
                    var k1 = key[1];
                    if ((!(k0 in saveme)) || (saveme[k0] === null)) {
                        saveme[k0] = {};
                    }
                    saveme[k0][k1] = value;
                } else if (key.length === 3) {
                    var k0 = key[0];
                    var k1 = key[1];
                    var k2 = key[2];
                    if ((!(k0 in saveme)) || (saveme[k0] === null)) {
                        saveme[k0] = {};
                    }
                    if ((!(k1 in saveme[k0])) || (saveme[k0][k1] === null)) {
                        saveme[k0][k1] = {};
                    }
                    saveme[k0][k1][k2] = value;
                } else {
                    var k0 = key[0];
                    var k1 = key[1];
                    var k2 = key[2];
                    var k3 = key[3];
                    if ((!(k0 in saveme)) || (saveme[k0] === null)) {
                        saveme[k0] = {};
                    }
                    if ((!(k1 in saveme[k0])) || (saveme[k0][k1] === null)) {
                        saveme[k0][k1] = {};
                    }
                    if ((!(k2 in saveme[k0][k1])) || (saveme[k0][k1][k2] === null)) {
                        saveme[k0][k1][k2] = {};
                    }
                    saveme[k0][k1][k2][k3] = value;
                }
                RB.Storage.setDictionary(storageKey, saveme);
                return saveme;
            } catch (e) {
                return null;
            }
        } else {
            RB.Storage.setDictionary(storageKey, value);
            return value;
        }
    }
    return null;
};

// ensures the given value is defined, not null, and min <= value <= max
// if not, return the defaultValue
RB.App.ensureValueInRange = function(value, min, max, defaultValue) {
    if ((value === undefined) || (value === null)) {
        return defaultValue;
    } else {
        if ((min !== null) && (value < min)) {
            return defaultValue;
        }
        if ((max !== null) && (value > max)) {
            return defaultValue;
        }
    }
    return value;
};



// ASSET MANAGER
//
// file is the absolute path, without 'file://' prefix, e.g. '/sdcard0/minstrel/foo.epub' or '/sdcard/my/dir/bar.cbz'
// relative path of the temporary directory, without trailing '/',     e.g. 'minstrel/tmp/itemID'
// if enableSingle, allow calling single file unzip/delete
RB.App.zipAssetsManager = function(file, tmp, enableSingle) {
    var _file                         = file;
    var _tmp                          = tmp;
    var _enableSingle                 = enableSingle;
    var _defaultTTL                   = 2;
    
    var _destroyed                    = false;
    
    var _filesBeingExtracted          = {};
    var _filesExtracted               = {};
   
    var _tmp_absolute                 = RB.App.relativeToAbsolutePath(_tmp, 'cache');

    this.getAbsolutePathTmpDirectory = function() {
        if (_destroyed) {
            onError();
            return;
        }
        //return RB.App.relativeToAbsolutePath(_tmp, 'cache');
        return _tmp_absolute;
    };
    
    this.cleanExtractedAssetsCache = function() {
        if (_destroyed) {
            return;
        }
        var fe = Object.keys(_filesExtracted);
        for (var i = 0; i < fe.length; i++) {
            var path = fe[i];
            var ttl = _filesExtracted[path]['ttl'] - 1;
            if (ttl < 1) {
                //alert("TTL expired for " + path);
                this.deleteSingle(path, null, null);
            } else {
                //alert("New TTL for " + path + " : " + ttl);
                _filesExtracted[path]['ttl'] = ttl;
            }
        }
    };
    
    this.getCurrentExtractedAssets = function() {
        if (_destroyed) {
            return [];
        }
        return Object.keys(_filesExtracted);
    };
    
    this.unzipSingle = function(pathInsideZIP, onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        if (_enableSingle) {
        
            if (pathInsideZIP in _filesExtracted) {
                
                // extracted already => reset its TTL
                _filesExtracted[pathInsideZIP]['ttl'] = _defaultTTL;
                if (onSuccess) {
                    onSuccess();
                }
                //alert("file " + pathInsideZIP + " already extracted");
                return;
                
            } else if (pathInsideZIP in _filesBeingExtracted) {
            
                // being extracted already => push callbacks
                _filesBeingExtracted[pathInsideZIP]['onSuccessCallbacks'].push(onSuccess);
                _filesBeingExtracted[pathInsideZIP]['onErrorCallbacks'].push(onError);
                //alert("file " + pathInsideZIP + " already being extracted");
                return;
                
            } else {
            
                // not extracted nor being extracted => request extraction
                _filesBeingExtracted[pathInsideZIP] = {};
                _filesBeingExtracted[pathInsideZIP]['onSuccessCallbacks'] = [ onSuccess ];
                _filesBeingExtracted[pathInsideZIP]['onErrorCallbacks']   = [ onError ];
                var onSucc = function() {
                    _filesExtracted[pathInsideZIP] = { 'ttl': _defaultTTL };
                    var callbacks = _filesBeingExtracted[pathInsideZIP]['onSuccessCallbacks'];
                    for (var i = 0; i < callbacks.length; i++) {
                        if (callbacks[i]) {
                            callbacks[i]();
                        }
                    }
                    delete _filesBeingExtracted[pathInsideZIP];
                };
                var onErr = function() {
                    var callbacks = _filesBeingExtracted[pathInsideZIP]['onErrorCallbacks'];
                    for (var i = 0; i < callbacks.length; i++) {
                        if (callbacks[i]) {
                            callbacks[i]();
                        }
                    }
                    delete _filesBeingExtracted[pathInsideZIP];
                };
                var args = JSON.stringify({ 'entries': [ pathInsideZIP ] });
                if (RB.App.isAndroid()) {
                    Unzipper.createEvent('selected', _file, _tmp_absolute, args, onSucc, onErr);
                }
                if (RB.App.isIOS()) {
                    Unzipper.createEvent('selected', _file, _tmp_absolute, args, onSucc, onErr);
                    //cordova.exec(onSucc, onErr, 'Unzipper', 'unzip', ['selected', _file, _tmp_absolute, args]);
                }
            
            }
        } else {
            // unzipped all => always succeed
            if (onSuccess) {
                onSuccess();
            }
        }
    };
    
    this.deleteSingle = function(pathInsideZIP, onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        if (_enableSingle) {
            // delete a single file, but only if
            // a) it is not being extracted AND
            // b) it was extracted
            if ((!(pathInsideZIP in _filesBeingExtracted)) && (pathInsideZIP in _filesExtracted)) {
                var onSucc = function() {
                    //alert("DELETED! " + pathInsideZIP);
                    delete _filesExtracted[pathInsideZIP];
                    if (onSuccess) {
                        onSuccess();
                    };
                };
                var onErr = function() {
                    delete _filesExtracted[pathInsideZIP];
                    if (onError) {
                        onError();
                    }
                };
                var command    = 'deleteRelative';
                var parameters = JSON.stringify({ 'path': RB.App.joinPaths([_tmp, pathInsideZIP]) });
                if (RB.App.isAndroid()) {
                    Commander.createEvent(command, parameters, onSucc, onErr);
                }
                if (RB.App.isIOS()) {
                    Commander.createEvent(command, parameters, onSucc, onErr);
                    //cordova.exec(onSucc, onErr, 'Commander', 'commander', [command, parameters]);
                }
            }
        }
    };
    
    this.unzipAll = function(onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        var args = JSON.stringify({});
        if (RB.App.isAndroid()) {
            Unzipper.createEvent('all', _file, _tmp_absolute, args, onSuccess, onError);
        }
        if (RB.App.isIOS()) {
            Unzipper.createEvent('all', _file, _tmp_absolute, args, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Unzipper', 'unzip', ['all', _file, _tmp_absolute, args]);
        }
    };
    
    this.unzipStructureOnly = function(onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        var extensions = [
            ".htm",
            ".html",
            ".nav",
            ".ncx",
            ".opf",
            ".smil",
            ".txt",
            ".xhtml",
            ".xml"
        ];
        var args = JSON.stringify({ 'extensions': extensions });
        if (RB.App.isAndroid()) {
            Unzipper.createEvent('allStructure', _file, _tmp_absolute, args, onSuccess, onError);
        }
        if (RB.App.isIOS()) {
            Unzipper.createEvent('allStructure', _file, _tmp_absolute, args, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Unzipper', 'unzip', ['allStructure', _file, _tmp_absolute, args]);
        }
    };
    
    this.unzipAllNonMediaFiles = function(onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        var excludeExtensions = [
            ".aac",
            ".flac",
            ".m4a",
            ".mp3",
            // ".mp4",
            ".oga",
            ".ogg",
            // ".webm",
            ".wav"
        ];
        var args = JSON.stringify({ 'excludeExtensions': excludeExtensions });
        if (RB.App.isAndroid()) {
            Unzipper.createEvent('allNonMedia', _file, _tmp_absolute, args, onSuccess, onError);
        }
        if (RB.App.isIOS()) {
            Unzipper.createEvent('allNonMedia', _file, _tmp_absolute, args, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Unzipper', 'unzip', ['allNonMedia', _file, _tmp_absolute, args]);
        }
    };
    
    this.deleteAbsolute = function(onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        var command    = 'deleteAbsolute';
        var parameters = JSON.stringify({ 'path': _file });
        if (RB.App.isAndroid()) {
            Commander.createEvent(command, parameters, onSuccess, onError);
        }
        if (RB.App.isIOS()) {
            Commander.createEvent(command, parameters, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Commander', 'commander', [command, parameters]);
        }
        _destroyed = true;
    };
        
    this.deleteTmpDirectory = function(onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        // delete the tmp stuff
        var command    = 'deleteRelative';
        var parameters = JSON.stringify({ 'path': _tmp });
        if (RB.App.isAndroid()) {
            Commander.createEvent(command, parameters, onSuccess, onError);
        }
        if (RB.App.isIOS()) {
            Commander.createEvent(command, parameters, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Commander', 'commander', [command, parameters]);
        }
    };
    
    this.copyFile = function(source, destination, onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        // copy file source into destination
        var command    = 'copy';
        var parameters = JSON.stringify({ 'source': source, 'destination': destination });
        if (RB.App.isAndroid()) {
            Commander.createEvent(command, parameters, onSuccess, onError);
        }
        if (RB.App.isIOS()) {
            Commander.createEvent(command, parameters, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Commander', 'commander', [command, parameters]);
        }
    };
    
    this.writeToFile = function(destination, string, onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        // write string to file
        var command    = 'writeToFile';
        var parameters = JSON.stringify({ 'destination': destination, 'string': string });
        if (RB.App.isAndroid()) {
            Commander.createEvent(command, parameters, onSuccess, onError);
        }
        if (RB.App.isIOS()) {            
            Commander.createEvent(command, parameters, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Commander', 'commander', [command, parameters]);
        }
    };
    
    // TODO not used anymore?
    this.listFiles = function(onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        var args = JSON.stringify({});
        // list files in the archive
        if (RB.App.isAndroid()) {
            Unzipper.createEvent('list', _file, '', args, onSuccess, onError);
        }
        if (RB.App.isIOS()) {
            Unzipper.createEvent('list', _file, '', args, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Unzipper', 'unzip', ['list', _file, '', args]);
        }
    };

    this.getSortedListOfAssets = function(args, onSuccess, onError) {
        if (_destroyed) {
            onError();
            return;
        }
        args['command'] = 'getSortedListOfAssets';
        args = JSON.stringify(args);
        if (RB.App.isAndroid()) {
            Librarian.createEvent('custom', _file, args, onSuccess, onError);
        }
        if (RB.App.isIOS()) {
            Librarian.createEvent('custom', _file, args, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Librarian', 'librarian', ['custom', _file, args]);
        }
    };

};



// AUDIO PLAYER
//
// assetManager is an instance of RB.App.zipAssetsManager
// tracks is an array of dictionaries, each having at least the 'href' property
// options is a dictionary containing optional parameters and callbacks
RB.App.audioPlayer = function(assetManager, tracks, options) {
    var _this                       = this;
    var _assetManager               = assetManager;
    var _tracks                     = tracks;
    
    var _trackPreparedCallback      = null;
    var _trackTimerCallback         = null;
    var _trackStartingCallback      = null;
    var _trackCompletedCallback     = null;
    var _playlistCompletedCallback  = null;
    var _trackPlayPauseCallback     = null;
    var _errorCallback              = null;
    
    var _volume                     = 1.0;
    var _playbackSpeed              = 1.0;
    
    var _currentTrack               = null;
    var _currentTrackIndex          = null;
    var _currentTrackPosition       = null;
    var _currentTrackDuration       = null;
    
    var _enablePlaybackSpeed        = true;
    var _mode                       = '1';
    var _wrapAround                 = true;
    var _autoStart                  = true;
    var _showSpinner                = true;
    var _preload                    = false;
    
    if (options) {
        if ('mode' in options) {
            _mode = options['mode'];
        }
        if ('enablePlaybackSpeed' in options) {
            _enablePlaybackSpeed = options['enablePlaybackSpeed'];
        }
        if ('wrapAround' in options) {
            _wrapAround = options['wrapAround'];
        }
        if ('autoStart' in options) {
            _autoStart = options['autoStart'];
        }
        if ('showSpinner' in options) {
            _showSpinner = options['showSpinner'];
        }
        if ('trackPreparedCallback' in options) {
            _trackPreparedCallback = options['trackPreparedCallback'];
        }
        if ('trackTimerCallback' in options) {
            _trackTimerCallback = options['trackTimerCallback'];
        }
        if ('trackStartingCallback' in options) {
            _trackStartingCallback = options['trackStartingCallback'];
        }
        if ('trackCompletedCallback' in options) {
            _trackCompletedCallback = options['trackCompletedCallback'];
        }
        if ('playlistCompletedCallback' in options) {
            _playlistCompletedCallback = options['playlistCompletedCallback'];
        }
        if ('trackPlayPauseCallback' in options) {
            _trackPlayPauseCallback = options['trackPlayPauseCallback'];
        }
        if ('errorCallback' in options) {
            _errorCallback = options['errorCallback'];
        }
        if ('preload' in options) {
            _preload = options['preload'];
        }
    }
    
    this.getCurrentTrackIndex = function() {
        return _currentTrackIndex;
    };
    
    this.getCurrentTrackPosition = function() {
        return _currentTrackPosition;
    };
    
    this.getCurrentTrackDuration = function() {
        return _currentTrackDuration;
    };
    
    this.getState = function() {
        if (_currentTrack) {
            return _currentTrack.getState();
        }
        return 'created';
    };
    
    this.onTrackTimer = function(value) {
        _currentTrackPosition = value;
        if (_trackTimerCallback) {
            var invertedValue = _currentTrackDuration - value;
            if (invertedValue < 0) {
                invertedValue = 0;
            }
            _trackTimerCallback(value, invertedValue);
        }
    };
    
    this.stop = function() {
        if (_currentTrack) {
            _currentTrack.stop();
            _currentTrack.destroy();
            _currentTrack           = null;
            _currentTrackIndex      = null;
            _currentTrackPosition   = null;
            _currentTrackDuration   = null;
        }
    };
    
    this.playPause = function () {
        _autoStart = true;
        if (_currentTrack) {
            _currentTrack.playPause();
            if (_trackPlayPauseCallback) {
                _trackPlayPauseCallback(_currentTrack.getState());
            }
        } else if (_tracks) {
            this.playTrack(0, 0);
        }
    };
    
    this.playTrack = function(index, position) {
        if (_currentTrack) {
            
            // if initializing, ignore this request
            if (_currentTrack.getState() === 'initializing') {
                return;
            }
            
            // if receiving a request for the same track, play/pause it
            if (_currentTrackIndex === index) {
                this.playPause();
                return;
            }
            
            // else, stop the current track, and proceed to start the requested one
            this.stop();
        }
        
        // set new track index
        _currentTrackIndex  = index;
        
        // reset position
        this.onTrackTimer(0);
        
        // callbacks
        var onInit = function() {
            // get duration
            _currentTrackDuration = parseInt(_currentTrack.getDuration());
            
            // set volume and playback speed
            _currentTrack.setVolume(_volume);
            _currentTrack.setPlaybackSpeed(_playbackSpeed);
            
            // seek to requested position
            _currentTrack.seekTo(position);
            
            // callback
            if (_trackPreparedCallback) {
                _trackPreparedCallback(_currentTrackIndex, _currentTrackDuration);
            }

            // remove spinner
            if (_showSpinner) {
                RB.UI.showSpinner(false);
            }

            // play!
            if (_autoStart) {
                _currentTrack.play();
                if (_trackPlayPauseCallback) {
                    _trackPlayPauseCallback(_currentTrack.getState());
                }
            }
        };
        
        var onCompleted = function() {
            if (_trackCompletedCallback) {
                _trackCompletedCallback(_currentTrackIndex);
            }
            _this.playTrackRelative(1);
        };
        
        if (_trackStartingCallback) {
            _trackStartingCallback(_currentTrackIndex);
        }
        
        if (_showSpinner) {
            RB.UI.showSpinner(true);
        }
        
        var track_options                       = {};
        track_options['mode']                   = _mode;
        track_options['enablePlaybackSpeed']    = _enablePlaybackSpeed;
        track_options['initCallback']           = onInit;
        track_options['completionCallback']     = onCompleted;
        track_options['errorCallback']          = _errorCallback;
        track_options['timerCallback']          = this.onTrackTimer;
        _currentTrack                           = new RB.App.singleTrack(_assetManager, track_options);
        _currentTrack.setAudio(_tracks[_currentTrackIndex].href);
        
        // preload next file, if requested
        if (_preload) {
            var _nextIndex = RB.Utilities.modulo(_currentTrackIndex + 1, _tracks.length);
            _assetManager.unzipSingle(_tracks[_nextIndex].href, null, null);
            
            var _prevIndex = RB.Utilities.modulo(_currentTrackIndex - 1, _tracks.length);
            _assetManager.unzipSingle(_tracks[_prevIndex].href, null, null);
            
        }
                
        // clean cache of extracted assets, if needed
        _assetManager.cleanExtractedAssetsCache();
    };
    
    this.playTrackRelative = function(increment) {
        if (_currentTrackIndex !== null) {
            // if we do not wrap around...
            if (! _wrapAround) {
                // check that we do not go before the first track or after the last one
                if ((_currentTrackIndex + increment < 0) || (_currentTrackIndex + increment >= _tracks.length)) {
                    if (_playlistCompletedCallback) {
                        _playlistCompletedCallback();
                    }
                    return;
                }
            }
            // otherwise, just go to the selected track
            var index = RB.Utilities.modulo(_currentTrackIndex + increment, _tracks.length);
            this.playTrack(index, 0);
        } else {
            this.playTrack(0, 0);
        }
    };
    
    this.seekTrack = function(position) {
        if (_currentTrack) {
            _currentTrack.seekTo(position);
            this.onTrackTimer(position);
        }
    };
    
    this.seekTrackRelative = function(position) {
        if (_currentTrack) {
            var newPosition = position + _currentTrackPosition;
            if (newPosition > _currentTrackDuration) {
                _this.playTrackRelative(1);
            } else {
                if (newPosition < 0) {
                    newPosition = 0;
                }
                this.seekTrack(newPosition);
                this.onTrackTimer(newPosition);
            }
        }
    };

    this.setVolume = function(value) {
        _volume = value;
        if (_currentTrack) {
            _currentTrack.setVolume(_volume);
        }
    };
    
    this.setPlaybackSpeed = function(value) {
        _playbackSpeed = value;
        if (_currentTrack) {
            _currentTrack.setPlaybackSpeed(_playbackSpeed);
        }
    };
};

RB.App.singleTrack = function(assetManager, options) {
    var _assetManager = assetManager;

    var _enablePlaybackSpeed    = true;
    var _mode                   = '1';
    var _timerCallback          = null;
    var _initCallback           = null;
    var _completionCallback     = null;
    var _errorCallback          = null;
    
    if (options) {
        if ('mode' in options) {
            _mode = options['mode'];
        }
        if ('enablePlaybackSpeed' in options) {
            _enablePlaybackSpeed = options['enablePlaybackSpeed'];
        }
        if ('timerCallback' in options) {
            _timerCallback = options['timerCallback'];
        }
        if ('initCallback' in options) {
           _initCallback = options['initCallback'];
        }
        if ('completionCallback' in options) {
           _completionCallback = options['completionCallback'];
        }
        if ('errorCallback' in options) {
           _errorCallback = options['errorCallback'];
        }
    }
    
    var _state = 'created'; // created => initializing => initialized => playing/paused/stopped => destroyed
    var _file;
    var _fileAbsolute;
    var _media;
    var _timer;
    
    this.getState = function() {
        return _state;
    };
    
    this.getDuration = function() {
        if (_media) {
            return _media.getDuration();
        }
    };
    
    this.setAudio = function(file) {
        _file = file;
        _fileAbsolute = RB.App.joinPaths(['file://', _assetManager.getAbsolutePathTmpDirectory(), _file]);
        _state = 'initializing';
        _assetManager.unzipSingle(_file, this.onFileUnzipped, _errorCallback);
    };
    
    this.onFileUnzipped = function() {
        var onCompleted = function() {
            _state = 'completed';
            if (_completionCallback) {
                _completionCallback();
            }
        };
        if ((RB.App.isAndroid()) && (! _enablePlaybackSpeed)) {
            // Android without _enablePlaybackSpeed => use Media
            _media = new Media(_fileAbsolute, onCompleted, _errorCallback, function(statusCode) {
                if ((_state === 'initializing') && (statusCode === 1)) {
                    _state = 'initialized';
                    if (_initCallback) {
                        _initCallback();
                    }
                }
            });
        } else {
            // iOS or Android with _enablePlaybackSpeed => use MediaRB
            _media = new MediaRB(_fileAbsolute, onCompleted, _errorCallback, function(statusCode) {
                if ((_state === 'initializing') && (statusCode === 1)) {
                    _state = 'initialized';
                    if (_initCallback) {
                        _initCallback();
                    }
                }
            }, 'mode' + _mode);
        }
    };
    
    // note that this call is expensive, use with caution
    this.getCurrentPosition = function(callback) {
        if ((_media) && (callback)) {
            _media.getCurrentPosition(callback);
        }
    };
    
    this.play = function() {
        if ((_media) && (_state !== 'playing')) {
            _state = 'playing';
            _media.play();
            if (_timer) {
                window.clearInterval(_timer);
                _timer = null;
            }
            if (_timerCallback) {
                _timer = window.setInterval(function(){
                    _media.getCurrentPosition(_timerCallback);
                }, 1000);
            }
        }
    };
    
    this.pause = function() {
        if ((_media) && (_state === 'playing')) {
            if (_timer) {
                window.clearInterval(_timer);
            }
            _state = 'paused';
            _media.pause();
        }
    };
    
    this.playPause = function() {
        if (_state === 'playing') {
            this.pause();
        } else {
            this.play();
        }
    };
    
    this.seekTo = function(seekToPositionInSeconds) {
        if (_media) {
            _media.seekTo(seekToPositionInSeconds * 1000);
        }
    };
    
    this.stop = function() {
        if (_timer) {
            window.clearInterval(_timer);
            _timer = null;
        }
        if ((_media) && ((_state === 'playing') || (_state === 'paused'))) {
            _media.stop();
        }
        _state = 'stopped';
    };
    
    this.destroy = function() {
        if (_media) {
            _media.release();
            _media = null;
        }
        if (_file) {
            _file           = null;
            _fileAbsolute   = null;
        }
        _state = 'destroyed';
    };
    
    this.setVolume = function(value) {
        if (_media) {
            _media.setVolume(value);
        }
    };
    
    this.setPlaybackSpeed = function(value) {
        if ((_enablePlaybackSpeed) && (_media)) {
            _media.setPlaybackSpeed(value);
        }
    };
    
};



// IMAGE
//
// assetManager is an instance of RB.App.zipAssetsManager
// images is an array of dictionaries, each having at least the 'href' property
// options is a dictionary containing optional parameters and callbacks
RB.App.imageSlideshow = function(assetManager, images, options) {
    var _this                       = this;
    var _assetManager               = assetManager;
    var _images                     = images;
    
    var _wrapAround                 = true;
    var _showSpinner                = true;
    var _timerInterval              = 0;
    var _imagePreparedCallback      = null;
    var _slideshowStartStopCallback = null;
    var _slideshowCompletedCallback = null;
    var _errorCallback              = null;
    var _preload                    = false;
    
    var _currentImage               = null;
    var _currentImageIndex          = null;
    var _timer                      = null;
    var _slideshowPlaying           = false;
    
    if (options) {
        if ('wrapAround' in options) {
            _wrapAround = options['wrapAround'];
        }
        if ('showSpinner' in options) {
            _showSpinner = options['showSpinner'];
        }
        if ('imagePreparedCallback' in options) {
            _imagePreparedCallback = options['imagePreparedCallback'];
        }
        if ('slideshowStartStopCallback' in options) {
            _slideshowStartStopCallback = options['slideshowStartStopCallback'];
        }
        if ('slideshowCompletedCallback' in options) {
            _slideshowCompletedCallback = options['slideshowCompletedCallback'];
        }
        if ('errorCallback' in options) {
            _errorCallback = options['errorCallback'];
        }
        if ('timerInterval' in options) {
            _timerInterval = options['timerInterval'];
        }
        if ('preload' in options) {
            _preload = options['preload'];
        }
    }
    
    this.getCurrentImageIndex = function() {
        return _currentImageIndex;
    };
    
    this.isSlideshowPlaying = function() {
        return _slideshowPlaying;
    };
    
    this.startStopSlideshow = function() {
        //if (_timerInterval) {
            if (_slideshowPlaying) {
                if (_timer) {
                    window.clearTimeout(_timer);
                }
                _slideshowPlaying = false;
            } else {
                _slideshowPlaying = true;
                this.setSlideshowTimer();
            }
            if (_slideshowStartStopCallback) {
                _slideshowStartStopCallback(_slideshowPlaying);
            }
        //}
    };
    
    this.setSlideshowTimer = function() {
        //if (_timerInterval) {
            if (_timer) {
                window.clearTimeout(_timer);
            }
            var timerInterval = _timerInterval;
            var duration = _images[_currentImageIndex].duration;
            if (duration) {
                timerInterval = parseFloat(duration) * 1000;
            }
            _timer = window.setTimeout(function() {
                _this.showImageRelative(1);
            }, timerInterval);
        //}
    };
    
    this.showImage = function(index) {
        if (_currentImage) {
            // if receiving a request for the same image, ignore it
            if (_currentImageIndex === index) {
                return;
            }
            
            // else, stop the current Image, and proceed to start the requested one
            this.stop();
        }
        
        // callbacks
        var onInit = function() {
            // callback
            if (_imagePreparedCallback) {
                _imagePreparedCallback(index);
            }

            // remove spinner
            if (_showSpinner) {
                RB.UI.showSpinner(false);
            }
            
            // start timer
            if (_slideshowPlaying) {
                _this.setSlideshowTimer();
            }
        };
    
        // set new Image index
        _currentImageIndex  = index;
                  
        if (_showSpinner) {
            RB.UI.showSpinner(true);
        }
        
        var image_options              = {};
        image_options['initCallback']  = onInit;
        image_options['errorCallback'] = _errorCallback;
        _currentImage                  = new RB.App.singleImage(_assetManager, image_options);
        _currentImage.setImage(_images[_currentImageIndex].href);
        
        // preload next file, if requested
        if (_preload) {
            var _nextIndex = RB.Utilities.modulo(_currentImageIndex + 1, _images.length);
            _assetManager.unzipSingle(_images[_nextIndex].href, null, null);
            
            var _prevIndex = RB.Utilities.modulo(_currentImageIndex - 1, _images.length);
            _assetManager.unzipSingle(_images[_prevIndex].href, null, null);
        }
        
        // clean cache of extracted assets, if needed
        _assetManager.cleanExtractedAssetsCache();
        
    };
    
    this.showImageRelative = function(increment) {
        if (_currentImageIndex !== null) {
            // if we do not wrap around...
            if (! _wrapAround) {
                // check that we do not go before the first Image or after the last one
                if ((_currentImageIndex + increment < 0) || (_currentImageIndex + increment >= _images.length)) {
                    if (_slideshowPlaying) {
                        this.startStopSlideshow();
                    }
                    if (_slideshowCompletedCallback) {
                        _slideshowCompletedCallback();
                    }
                    return;
                }
            }
            // otherwise, just go to the selected Image
            var index = RB.Utilities.modulo(_currentImageIndex + increment, _images.length);
            this.showImage(index);
        } else {
            this.showImage(0);
        }
    };
    
    this.stop = function() {
        if (_currentImage) {
            _currentImage.stop();
            _currentImage           = null;
            _currentImageIndex      = null;
        }
    };
};

RB.App.singleImage = function(assetManager, options) {
    var _assetManager = assetManager;

    var _initCallback           = null;
    var _errorCallback          = null;
    
    if (options) {
        if ('initCallback' in options) {
           _initCallback = options['initCallback'];
        }
        if ('errorCallback' in options) {
           _errorCallback = options['errorCallback'];
        }
    }
    
    var _state = 'created'; // created => initializing => initialized => (playing/paused/stopped) => destroyed
    var _file;
    //var _fileAbsolute;
    
    this.setImage = function(file) {
        _file = file;
        //_fileAbsolute = RB.App.joinPaths(['file://', _assetManager.getAbsolutePathTmpDirectory(), _file]);
        _state = 'initializing';
        _assetManager.unzipSingle(_file, this.onFileUnzipped, _errorCallback);
    };
    
    this.onFileUnzipped = function() {
        if (_state === 'initializing') {
            _state = 'initialized';
            if (_initCallback) {
                _initCallback();
            }
        }
    };
    
    this.stop = function() {
        _state = 'stopped';
        if (_file) {
            //_assetManager.deleteSingle(_file, null, null);
            _file           = null;
            //_fileAbsolute   = null;
        }
    };
};



// AUTOHIDE ELEMENT
//
// id: id of the object (currently unused)
// onShow: callback invoked when the element is shown
// onHide: callback invoked when the element is hidden
// options: enable autohide feature and set the timer duration
//
RB.App.autohideElement = function(id, onShow, onHide, options) {
    var _id             = id;
    var _onShowCallback = onShow;
    var _onHideCallback = onHide;
    
    var _autohide       = false;
    var _timerInterval  = 3000;
    var _isVisible      = false;
    var _timer          = null;
    
    var _this           = this;
    
    if (options) {
        if ('autohide' in options) {
            _autohide = options['autohide'];
        }
        if ('timerInterval' in options) {
            _timerInterval = options['timerInterval'];
        }
    }
    
    this.isVisible = function() {
        return _isVisible;
    };
    
    this.hide = function() {
        if (_autohide) {
            this.clearTimer();
        }
        if (_onHideCallback) {
            _onHideCallback();
        }
        _isVisible = false;
    };
    
    this.show = function() {
        if (_onShowCallback) {
            _onShowCallback();
        }
        if (_autohide) {
            this.startTimer();
        }
        _isVisible = true;
    };
    
    this.toggle = function() {
        if (_isVisible) {
            this.hide();
        } else {
            this.show();
        }
    };
    
    this.startTimer = function() {
        if (_timerInterval) {
            this.clearTimer();
            _timer = window.setTimeout(function() {
                _this.clearTimer();
                _this.hide();
            }, _timerInterval);
        }
    };
    
    this.clearTimer = function() {
        if (_timer) {
            window.clearTimeout(_timer);
            _timer = null;
        }
    };
};















// associates keys to i18n arrays of values (see i18n/... files)
// TODO refactor this
RB.App.drsLabels = {
    'EPUB_HIGHLIGHT_STYLE':          'optPreferencesDialogHighlightStyle',
    'EPUB_PLAYBACK_SPEED':           'optPreferencesDialogSpeed',
    'EPUB_PLAYBACK_VOLUME':          'optPreferencesDialogVolume',
    'EPUB_FONT_FAMILY':              'optPreferencesDialogFont',
    'EPUB_FONT_SIZE':                'optPreferencesDialogFontSize',
    'EPUB_TEXT_TRANSFORM':           'optPreferencesDialogTextTransform',
    'EPUB_TEXT_ALIGN':               'optPreferencesDialogTextAlign',
    'EPUB_LINE_SPACING_FACTOR':      'optPreferencesDialogSpacing',
    'EPUB_LEFT_MARGIN_SIZE':         'optPreferencesDialogMarginLeft',
    'EPUB_RIGHT_MARGIN_SIZE':        'optPreferencesDialogMarginRight',
    
    'ABZ_PLAYBACK_SPEED':            'optPreferencesDialogSpeed',
    'ABZ_PLAYBACK_VOLUME':           'optPreferencesDialogVolume',

    'UI_BRIGHTNESS':                 'optPreferencesDialogBrightness',
};

RB.App.drsManager = function(itemId, format, saveImmediately, updateCallback, notificationDuration) {
    var _itemID               = itemId;
    var _format               = format;
    var _saveImmediately      = saveImmediately;
    var _updateCallback       = updateCallback;
    var _notificationDuration = notificationDuration || 1000;
    
    var _initialized          = false;
    var _bs                   = {};
    var _drs                  = {};
    var _registeredSettings   = {};
    var _this                 = this;
    
    this.initialize = function() {
        if (! _initialized) {
            _bs = null;
            if ((_itemID) && (_format)) {
                _bs = RB.App.readItemData(_itemID, ['settings', _format]);
            }
            _initialized = true;
        }
    };
    
    // key is the RB.Storage.Key
    // valueType: boolean, cycle, increase, decrease, palette
    // availableValues: if (valueType === list), draw valueType from this list
    // controls: an array of dictionaries
    this.registerSetting = function(key, valueType, availableValues, controls) {
        // save
        _registeredSettings[key] = { 'key': key, 'valueType': valueType, 'availableValues': availableValues, 'controls': controls };
        
        // load from config default or, if present, from storage
        if (valueType !== 'special') {
            _drs[key] = RB.Storage.get(RB.Storage.Keys[key]);
            if ((_bs) && (key in _bs)) {
                _drs[key] = _bs[key];
            }
        }
        
        // BOOLEAN
        if (valueType === 'boolean') {
            // convert to boolean
            _drs[key] = RB.Storage.isJSONStringTrue(_drs[key]);
        
            // bind controls
            for (var i = 0; i < controls.length; i++) {
                // current control
                var control = controls[i];
                
                // ==================================================================
                // BEGIN CLOSURE
                (function(key, control) {
                    var id           = control['id'];
                    var callback     = control['callback'];
                    var action = function() {
                        // switch value
                        _drs[key] = ! _drs[key];
                 
                        // save value
                        if (_saveImmediately) {
                            _this.save(key);
                        }
                 
                        // update and callback
                        _this.update(key);
                        if (callback) {
                            callback();
                        }
                    };
                 
                    if ((id.length > 3) && (id.substring(0, 3) === 'chk')) {
                        id = 'inp' + id;
                    }
                 
                    RB.UI.bindSimpleButtonEvents(id, { 'tap': action });
                }(key, control));
                // END   CLOSURE
                // ==================================================================
            }
        }
        
        // CYCLE
        if (valueType === 'cycle') {
            // bind controls
            for (var i = 0; i < controls.length; i++) {
                // current control
                var control = controls[i];
                
                // ==================================================================
                // BEGIN CLOSURE
                (function(key, availableValues, control) {
                    var id           = control['id'];
                    var circular     = control['circular'];
                    var hold         = control['hold'];
                    var increase     = control['increase'];
                    var callback     = control['callback'];
                    var notification = control['notification'];
                    var special      = control['special'];
                    var callahead    = control['callahead'];
                 
                    var action = function(increment) {
                        if (special) {
                            // special control: callahead
                            if (callahead) {
                                callahead();
                            }
                        } else {
                            // switch value
                            _drs[key] = RB.Storage.switchParameter(availableValues, _drs[key], increment, circular);
                 
                            // save value
                            if (_saveImmediately) {
                                _this.save(key);
                            }
                        }
                 
                        // show notification if requested
                        if (notification) {
                            var k = RB.App.drsLabels[key];
                            var v = availableValues.indexOf(_drs[key]);
                            RB.UI.showNotification(RB.UI.i18n(k) + ': ' + RB.UI.i18n(k + 'Labels', v), _notificationDuration);
                        }
                 
                        // update and callback
                        _this.update(key);
                        if (callback) {
                            callback(key, increment);
                        }
                    };
                 
                    if (hold) {
                        RB.UI.bindSimpleButtonEvents(id, {
                            'tap':       function() { action(1);  },
                            'doubletap': function() { action(-1); },
                            'press':     function() { action(0);  },
                        });
                    } else if (circular) {
                        RB.UI.bindSimpleButtonEvents(id, {
                            'tap':       function() { action(1);  },
                            'doubletap': function() { action(-1); },
                        });
                    } else {
                        if (increase) {
                            RB.UI.bindSimpleButtonEvents(id, {
                                'tap':       function() { action(1);  },
                            });
                        } else {
                            RB.UI.bindSimpleButtonEvents(id, {
                                'tap':       function() { action(-1); },
                            });
                        }
                    }
                }(key, availableValues, control));
                // END   CLOSURE
                // ==================================================================
            }
        }
        
        // PALETTE
        if (valueType === 'palette') {
            // bind controls
            for (var i = 0; i < controls.length; i++) {
                // current control
                var control = controls[i];
                
                // ==================================================================
                // BEGIN CLOSURE
                (function(key, control) {
                    var id           = control['id'];
                    var callback     = control['callback'];
                 
                    var action = function(color) {
                        // switch value
                        _drs[key] = color.toHexString();
                 
                        // save value
                        if (_saveImmediately) {
                            _this.save(key);
                        }
                 
                        // update and callback
                        _this.update(key);
                        if (callback) {
                            callback();
                        }
                    };

                    RB.UI.attachPalette(id, _drs[key], action);
                }(key, control));
                // END   CLOSURE
                // ==================================================================
            }
        }
        
        // SPECIAL
        if (valueType === 'special') {
            // bind controls
            for (var i = 0; i < controls.length; i++) {
                // current control
                var control = controls[i];
                
                // ==================================================================
                // BEGIN CLOSURE
                (function(key, control) {
                    var id           = control['id'];
                    var callback     = control['callback'];
                    var callahead    = control['callahead'];
                    var notification = control['notification'];
                    var compact      = control['compact'];
                 
                    var action = function() {
                        // callahead
                        if (callahead) {
                            callahead(key);
                        }
                 
                        // update and callback
                        _this.update(key);
                        if (callback) {
                            callback(notification, compact);
                        }
                    };

                    RB.UI.bindSimpleButtonEvents(id, { 'tap': action });
                }(key, control));
                // END   CLOSURE
                // ==================================================================
            }
        }
    };
    
    this.update = function(triggeredByKey) {
        if (_initialized) {
            
            // update controls
            var keys = Object.keys(_registeredSettings);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var registeredSetting = _registeredSettings[key];
                if (registeredSetting) {
                    if (registeredSetting['valueType'] === 'boolean') {
                        var controls = registeredSetting['controls'];
                        for (var j = 0; j < controls.length; j++) {
                            var id = controls[j]['id'];
                            var value = _drs[key];
                            if ((id.length > 3) && (id.substring(0, 3) === 'chk')) {
                                RB.UI.setBooleanCheckbox(id, value);
                            } else {
                                var icon = controls[j]['icon'];
                                if (icon === 'play') {
                                    RB.UI.setBooleanPlayIcon(id, value);
                                } else if (icon === 'lock') {
                                    RB.UI.setBooleanLockIcon(id, value);
                                } else if (icon === 'scroll') {
                                    RB.UI.setBooleanScrollIcon(id, value);
                                } else {
                                    RB.UI.setBooleanIcon(id, value);
                                }
                            }
                        }
                    }
                    if (registeredSetting['valueType'] === 'cycle') {
                        var controls = registeredSetting['controls'];
                        for (var j = 0; j < controls.length; j++) {
                            var control = controls[j];
                            if (control['compact']) {
                                var k = control['id'];
                                var v = registeredSetting['availableValues'].indexOf(_drs[key]);
                                var a = k + 'Labels';
                                if (control['labels']) {
                                    a = control['labels'];
                                }
                                if (control['onlyvalue']) {
                                    RB.UI.setText(k, RB.UI.i18n(a, v), control['setinnertext']);
                                } else {
                                    RB.UI.setText(k, RB.UI.i18n(k) + ': ' + RB.UI.i18n(a, v), control['setinnertext']);
                                }
                            }
                        }
                    }
                    if (registeredSetting['valueType'] === 'palette') {
                        var controls = registeredSetting['controls'];
                        for (var j = 0; j < controls.length; j++) {
                            var control = controls[j];
                            if (control['compact']) {
                                var k  = control['id'];
                                var v  = _drs[key];
                                RB.UI.setText(k, RB.UI.i18n(k) + ': ' + v, control['setinnertext']);
                            }
                            RB.UI.getElement(control['id']).spectrum('set', _drs[key]);
                        }
                    }
                    if (registeredSetting['valueType'] === 'special') {
                        var controls = registeredSetting['controls'];
                        for (var j = 0; j < controls.length; j++) {
                            var control = controls[j];
                            var callupdate = control['callupdate'];
                            if (callupdate) {
                                callupdate(control['notification'], control['compact']);
                            }
                        }
                    }
                }
            }
            
            // callback
            if (_updateCallback) {
                _updateCallback(triggeredByKey);
            }
        }
    };
    
    this.getValue = function(key) {
        if (_initialized) {
            if (_registeredSettings[key]) {
                var valueType = _registeredSettings[key]['valueType'];
                if (valueType === 'boolean') {
                    return RB.Storage.isJSONStringTrue(_drs[key]);
                }
                // TODO
            }
            if (key in _drs) {
                return _drs[key];
            }
        }
        return null;
    };
    
    this.setValue = function(key, value) {
        if (_initialized) {
            if (key in _drs) {
                _drs[key] = value;
                if (_saveImmediately) {
                    this.save(key);
                }
            }
        }
    };
    
    this.changeValue = function(key, increment, circular) {
        if (_initialized) {
            if (key in _drs) {
                var registeredSetting = _registeredSettings[key];
                if (registeredSetting) {
                    if (registeredSetting['valueType'] === 'boolean') {
                        _drs[key] = ! _drs[key];
                    }
                    if (registeredSetting['valueType'] === 'cycle') {
                        _drs[key] = RB.Storage.switchParameter(registeredSetting['availableValues'], _drs[key], increment, circular);
                    }
                    this.update();
                }
            }
        }
    };
    
    this.save = function(onlyKey) {
        if (_itemID) {
            var toBeSaved = {};
            var keys = Object.keys(_registeredSettings);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (_registeredSettings[key]['valueType'] !== 'special') {
                    toBeSaved[key] = _drs[key];
                }
            }
            RB.App.saveItemData(_itemID, ['settings', _format], toBeSaved);
        } else {
            if (onlyKey) {
                if (_registeredSettings[onlyKey]['valueType'] !== 'special') {
                    RB.Storage.set(RB.Storage.Keys[onlyKey], _drs[onlyKey]);
                }
            } else {
                var keys = Object.keys(_registeredSettings);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (_registeredSettings[key]['valueType'] !== 'special') {
                        RB.Storage.set(RB.Storage.Keys[key], _drs[onlyKey]);
                    }
                }
            }
        }
    };
    
    this.initialize();
};



