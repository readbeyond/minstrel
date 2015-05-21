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
RB.Library = RB.Library || {};

/* constants */
RB.Library.newItemSymbol                     = '★';     // UNICODE, not space
RB.Library.hiddenItemSymbol                  = '■';     // UNICODE, not space

// UI
RB.Library.UI                                = {};
RB.Library.UI.txtTitle                       = 'txtLibraryTitle';
RB.Library.UI.divDialogLoading               = 'divDialogLoading';
RB.Library.UI.lstItems                       = 'lstItems';
RB.Library.UI.txtUpdatingLibraryWarning      = 'txtUpdatingLibraryWarning';
RB.Library.UI.txtUpdatingLibraryItemsWarning = 'txtUpdatingLibraryItemsWarning';
RB.Library.UI.txtNoItemsFound                = 'txtNoItemsFound';
RB.Library.UI.btnChangeLanguage              = 'btnChangeLanguage';
RB.Library.UI.btnScanDefaultDirectory        = 'btnScanDefaultDirectory';
RB.Library.UI.btnChooseOtherDirectory        = 'btnChooseOtherDirectory';
RB.Library.UI.divFooter                      = 'divFooter';
RB.Library.UI.divFooterNavbar                = 'divFooterNavbar';
RB.Library.UI.btnRefresh                     = 'btnRefresh';
RB.Library.UI.btnSettings                    = 'btnSettings';
RB.Library.UI.btnSort                        = 'btnSort';
RB.Library.UI.btnHelp                        = 'btnHelp';

/* variables */
RB.Library.createdManagers                   = false;   // flag set to avoid duplicating manager objects
RB.Library.drs                               = false;   // manages buttons
RB.Library.runFirstTime                      = false;   // true if this is the first time we are running this app version
RB.Library.items                             = {};      // library items, indexed by id
RB.Library.sortedItems                       = [];      // library items, sorted according to the user-selected method
RB.Library.isDownloading                     = false;   // is downloading?

/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.Library.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();
    
    // if running on a small screen, reduce bottom bar button text
    RB.UI.reduceOnSmallScreen(RB.Library.UI.divFooterNavbar);
    
    // set correct icon for invert sort
    // NOTE: we should try include this into drs manager
    RB.UI.setIcon(RB.Library.UI.btnSort, RB.Storage.isAppParameterTrue(RB.Storage.Keys.LIBRARY_INVERT_SORT), 'sort-by-alphabet-alt', 'sort-by-alphabet');
    
    // set title
    RB.Library.setTitle(RB.Config.Minstrel.publicName);
    
    // create manager objects
    RB.Library.createManagers();
    RB.Library.drs.update();
};

// initialize library
RB.Library.initializePage = function() {
    // bind events
    RB.Library.bindEvents();

    // finish executing UI initialization
    RB.Library.initializeUIOnCorrectThread();

    // try loading library from storage
    RB.Library.safelyLoadLibraryItemsFromStorage();

    // is this app version run for the first time?
    RB.Library.runFirstTime = RB.App.isFirstTimeForThisVersion();

    // get OS specific stuff (file separator, directory paths, etc.)
    //
    // IMPORTANT: on iOS we need to reload these infos at each execution,
    //            because e.g. the document directory absolute path might change
    //
    // NOTE: on Android we could check if RB.Storage has these infos already,
    //       but for the sake of code uniformity with iOS, let's reload every time
    //
    RB.Library.getFilesystemInfo();
};

// bind events
RB.Library.bindEvents = function() {
    // loading dialog
    RB.UI.getElement(RB.Library.UI.divDialogLoading).on('pagebeforeshow', RB.UI.loadLocalization);
};

// create manager objects
RB.Library.createManagers = function() {
    // if already created, abort
    if (RB.Library.createdManagers) {
        return;
    }

    // preference manager object
    RB.Library.drs = new RB.App.drsManager(null, null, true, RB.Library.onDRSUpdate);
    
    RB.Library.drs.registerSetting('UI_LANGUAGE', 'cycle', RB.Config.UI.availableLanguages, [
        { 'id':           RB.Library.UI.btnChangeLanguage,
          'notification': false,
          'circular':     true,
          'increase':     true,
          'compact':      true,
          'onlyvalue':    true,
          'callback':     RB.Library.onLanguageChanged },
    ]);
    
    RB.Library.drs.registerSetting('LIBRARY_SORT', 'cycle', RB.Config.Library.availableSortMethods, [
        { 'id':           RB.Library.UI.btnSort,
          'notification': false,
          'hold':         true,
          'circular':     true,
          'increase':     true,
          'compact':      true,
          'onlyvalue':    true,
          'callback':     RB.Library.onSortMethodChanged },
    ]);
    
    // register simple buttons
    RB.UI.bindSimpleButtonEvents(RB.Library.UI.btnSettings,             { 'tap':       RB.Library.openSettings,
                                                                          'doubletap': RB.Library.openFormatSettings      }, false);
    RB.UI.bindSimpleButtonEvents(RB.Library.UI.btnHelp,                 { 'click':     RB.Library.openHelp                }, false);
    RB.UI.bindSimpleButtonEvents(RB.Library.UI.btnRefresh,              { 'tap':       RB.Library.refreshLibraryFromUser,
                                                                          'doubletap': RB.Library.chooseOtherDirectory    }, false);
    RB.UI.bindSimpleButtonEvents(RB.Library.UI.btnScanDefaultDirectory, { 'click':     RB.Library.scanUserStorage         }, false);
    RB.UI.bindSimpleButtonEvents(RB.Library.UI.btnChooseOtherDirectory, { 'click':     RB.Library.chooseOtherDirectory    }, false);
    
    // reset flag
    RB.Library.createdManagers = true;
};

// handle back button
RB.Library.onBackButton = function() {
    // dim system bar
    RB.UI.dimSystemBar();
    
    // perform back action
    if (RB.UI.dialogOpen) {
        // close any dialog/page open
        RB.UI.closeDialog();
    } else {
        // exit app
        RB.App.cleanExitApp();
    }
};

// safely load library from storage
RB.Library.safelyLoadLibraryItemsFromStorage = function() {
    try {
        RB.Library.items = RB.Storage.getDictionary(RB.Storage.Keys.LIBRARY_BOOKS);
    } catch (e) {
        // something is really wrong!
        RB.Library.items = {};
    }
};

// check for new file after resume (e.g., import from other app)
RB.Library.checkNewFile = function() {
    var msg;
    var refreshMeFilePath;
    try {
        refreshMeFilePath = RB.App.joinPaths([RB.App.getAbsolutePathMainDirectory(), RB.Config.Library.refreshMeFile]);
        msg = RB.Utilities.loadTextFile(refreshMeFilePath);
    } catch (e) {
        // nop
    }
    if (msg) {
        var lines = msg.split('\n');
        if (lines.length > 0) {
            if (lines[0] === 'open') {
                // this will be called in Android only! 
                RB.Library.isDownloading = false;
                RB.Library.addNewItemToLibrary(lines[1], lines[2]);
            } else if (lines[0] === 'downloaded') {
                if (RB.Library.isDownloading) {
                    RB.UI.showNotification("Download complete!", 1000); // TODO
                }
                RB.Library.isDownloading = false;
                RB.Library.addNewItemToLibrary(lines[1], lines[2]);
            } else if (lines[0] === 'downloading') {
                RB.UI.showNotification("Downloading,<br/>please wait...", 1000); // TODO
                RB.Library.isDownloading = true;
                window.setTimeout(RB.Library.checkNewFile, 1000); // TODO
            }
            
            // delete refresh.me file
            var command    = 'deleteAbsolute';
            var parameters = JSON.stringify({ 'path': refreshMeFilePath });
            if (RB.App.isAndroid()) {
                Commander.createEvent(command, parameters, null, null);
            }
            if (RB.App.isIOS()) {
                Commander.createEvent(command, parameters, null, null);
                //cordova.exec(null, null, 'Commander', 'commander', [command, parameters]);
            }
        } 
    } else {
        if (RB.Library.isDownloading) {
            RB.UI.showNotification("Downloading,<br/>please wait...", 1000); // TODO
            window.setTimeout(RB.Library.checkNewFile, 1000); // TODO
        }
    }
};

// add new item (downloaded or selected from filesystem in Android) to library 
RB.Library.addNewItemToLibrary = function(path, id) {
    if (id in RB.Library.items) {
        
        // already in library => open it
        var item = RB.Library.items[id];
        RB.Library.openItem(id, false);

    } else {
        
        // not already in library => run librarian and then open it
        
        //
        // TODO ask for copy/move
        //

        // invoke librarian in 'single' mode
        var onSuccess = function(message) {
            
            // DEBUG
            //alert(message);
            
            var obj = JSON.parse(message);
            var arr = obj.publications.items;
            if ((arr.length === 1) && (arr[0])) {
                var new_item    = arr[0];
                var new_item_id = new_item['id'];
                if (new_item_id) {
                    // add item 
                    RB.Library.addItemToLibrary(new_item);

                    // save items
                    RB.Storage.setDictionary(RB.Storage.Keys.LIBRARY_BOOKS, RB.Library.items);
                   
                    // open item or populate library 
                    if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.LIBRARY_OPEN_NEW_BOOK)) { 
                        // open new item
                        RB.Library.openItem(new_item_id, false);
                    } else {
                        // refresh library list
                        RB.Library.refreshLibraryList(false);
                    }
                }
            } else {
                RB.App.message('Minstrel cannot open the selected file. (Is its format disabled?)', RB.App.MessageSeverityEnum.INFO);
            }
        };
        var onError = function(message) {
            RB.App.message('An error occurred while opening the selected item: ' + message, RB.App.MessageSeverityEnum.ERROR);
        };
        var mode = 'single';
        var args = JSON.stringify({
            'format':               RB.App.getFormatFromFilePath(path),
            'thumbnailDirectory':   RB.App.getThumbnailsDirectory(true),
            'thumbnailWidth':       RB.Config.librarianThumbnailWidth,
            'thumbnailHeight':      RB.Config.librarianThumbnailHeight,
        });
        if (RB.App.isAndroid()) {
            Librarian.createEvent(mode, path, args, onSuccess, onError);
        }
        if (RB.App.isIOS()) {
            Librarian.createEvent(mode, path, args, onSuccess, onError);
            //cordova.exec(onSuccess, onError, 'Librarian', 'librarian', [mode, path, args]);
        }
    } 
};

// complete UI initialization once running on the page thread
RB.Library.initializeUIOnCorrectThread = function() {
    // apply orientation 
    RB.UI.applyOrientation();

    // dim system bar
    RB.UI.dimSystemBar();
   
    // set brightness
    RB.UI.setBrightness();
};

// show dialog to let the user choose the directory
RB.Library.showScanStorageDialog = function() {
    RB.UI.mobileChangePage(RB.Library.UI.divDialogLoading, 'dialog');
};

// refresh the library list 
RB.Library.refreshLibraryList = function(forceRefresh) {
    if (forceRefresh) {
        // a full refresh has been required or this is the first time
        RB.Library.scanUserStorage();
    } else {
        // just populate library
        RB.Library.populateLibraryList();
    }
};

// add item to library
RB.Library.addItemToLibrary = function(item) {
    if (item) {
        var item_id = item['id'];
        if (item_id) {
            // add item
            RB.Library.items[item_id] = item;

            // add item data
            if (!RB.App.hasItemData(item_id)) {
                // no saved data => this is a new item
                
                // save a static copy of the item
                RB.App.saveItemData(item_id, ['static'], item);
                
                // save library information
                var info                            = {};
                info['isNew']                       = true;
                info['lastTimeOpened']              = null;
                info['showInLibrary']               = true;
                info['showStockThumbnailInLibrary'] = false;
                info['formattedDuration']           = RB.Utilities.clockStringToPrettyClockValue(item.formats[item.mainFormat].metadata.duration || "");
                RB.App.saveItemData(item_id, ['library'], info);
            }
        }
    }
};

// scan user storage
RB.Library.scanUserStorage = function() {
    var onSuccess = function(message) {
        
        // DEBUG
        //alert(message);
       
        // reset items
        RB.Library.items       = {};
        RB.Library.sortedItems = [];

        // parse JSON string into JSON object and save it
        var obj = JSON.parse(message);
        var arr = obj.publications.items;
        
        // add items to library 
        if (arr.length > 0) { 
            // update item data
            for (var i = 0; i < arr.length; i++) {
                RB.Library.addItemToLibrary(arr[i]);
            }
        }
        
        // save items
        RB.Storage.setDictionary(RB.Storage.Keys.LIBRARY_BOOKS, RB.Library.items);

        // populate library
        RB.Library.populateLibraryList();

        // if the dialog is open, close it
        RB.UI.closeDialog();
   
        // TODO 
        // if no book is found, show notification
        // if (arr.length === 0) {
        //    RB.UI.showNotification(RB.UI.i18n(RB.Library.UI.txtNoItemsFound));
        // }
    };
    var onError = function(message) {
        RB.UI.showSpinner(false);
        RB.App.message('A fatal error occurred while importing your ebooks.', RB.App.MessageSeverityEnum.CRITICAL);
    };

    RB.UI.showSpinner(true);

    // invoke librarian in 'full' mode
    var mode = 'full';
    var args = JSON.stringify({
        'entireVolume':         false,
        'paths':                RB.Storage.getArray(RB.Storage.Keys.SCAN_DIRECTORIES), 
        'recursive':            true,
        'ignoreHidden':         true,
        'thumbnailDirectory':   RB.App.getThumbnailsDirectory(true),
        'thumbnailWidth':       RB.Config.librarianThumbnailWidth,
        'thumbnailHeight':      RB.Config.librarianThumbnailHeight,
        'formats':              RB.App.getLoadedFormatsWithExtensions(),
    });
    if (RB.App.isAndroid()) {
        Librarian.createEvent(mode, '', args, onSuccess, onError);
    }
    if (RB.App.isIOS()) {
        Librarian.createEvent(mode, '', args, onSuccess, onError);
        //cordova.exec(onSuccess, onError, 'Librarian', 'librarian', [mode, '', args]);
    }
};

// get filesystem info from native plugins
RB.Library.getFilesystemInfo = function() {
    var onSuccess  = RB.Library.initializationCompleted;
    var onError    = RB.Library.onErrorGettingFilesystem;
    var command    = 'filesystemInfo';
    var parameters = JSON.stringify({});
    if (RB.App.isAndroid()) {
        Commander.createEvent(command, parameters, onSuccess, onError);
    }
    if (RB.App.isIOS()) {
        Commander.createEvent(command, parameters, onSuccess, onError);
        //cordova.exec(onSuccess, onError, 'Commander', 'commander', [command, parameters]);
    }
};
RB.Library.initializationCompleted = function(message) {
    try {
        var jsonObject = JSON.parse(message);
        
        RB.App.externalStorage       = jsonObject['root'];
        RB.App.fileSeparator         = jsonObject['separator'];
        RB.App.iOSDocumentsDirectory = jsonObject['documentsDir'];
        RB.App.iOSCacheDirectory     = jsonObject['cacheDir'];
        RB.App.storageRoots          = jsonObject['storageRoots'];

        RB.Storage.set(RB.Storage.Keys.FILE_SEPARATOR,          RB.App.fileSeparator);
        RB.Storage.set(RB.Storage.Keys.EXTERNAL_STORAGE,        RB.App.externalStorage);
        RB.Storage.set(RB.Storage.Keys.IOS_DOCUMENTS_DIRECTORY, RB.App.iOSDocumentsDirectory);
        RB.Storage.set(RB.Storage.Keys.IOS_CACHE_DIRECTORY,     RB.App.iOSCacheDirectory);
        RB.Storage.set(RB.Storage.Keys.STORAGE_ROOTS,           RB.App.storageRoots);

        // set scan single directory label
        // RB.UI.setText(RB.Library.UI.btnScanDefaultDirectory, RB.App.getAbsolutePathMainDirectory());

        // is this the first time for this version?
        if (RB.Library.runFirstTime) {
            // reset flag
            RB.Library.runFirstTime = false;
            
            // ensure main directory is available
            RB.Library.ensureMainDirectoryIsAvailable();
            
            // TODO
            // copy guide
            //RB.Library.copyAssetsFromAppBundle();
          
            // check 
            var arr = RB.Storage.getArray(RB.Storage.Keys.SCAN_DIRECTORIES);
            if (arr.length < 1) {
                // add main directory to SCAN_DIRECTORIES
                RB.Storage.setArray(RB.Storage.Keys.SCAN_DIRECTORIES, [ RB.App.getAbsolutePathMainDirectory() ]);
                
                if (RB.App.isAndroid()) {
                    // show dialog
                    RB.Library.showScanStorageDialog();
                }
                if (RB.App.isIOS()) {
                    // just refresh
                    RB.UI.showNotification(RB.UI.i18n(RB.Library.UI.txtUpdatingLibraryWarning));
                    RB.Library.refreshLibraryList(true);
                }
            } else {
                // just refresh
                RB.UI.showNotification(RB.UI.i18n(RB.Library.UI.txtUpdatingLibraryWarning));
                RB.Library.refreshLibraryList(true);
            }
        } else if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.SCAN_DIRECTORIES_CHANGED)) {
            // scan directories changed
            RB.Storage.set(RB.Storage.Keys.SCAN_DIRECTORIES_CHANGED, false);
            RB.UI.showNotification(RB.UI.i18n(RB.Library.UI.txtUpdatingLibraryItemsWarning));
            RB.Library.refreshLibraryList(true);
        } else if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.PLUGINS_LOADED_CHANGED)) {
            // plugins loaded changed
            RB.Storage.set(RB.Storage.Keys.PLUGINS_LOADED_CHANGED, false);
            RB.UI.showNotification(RB.UI.i18n(RB.Library.UI.txtUpdatingLibraryItemsWarning));
            RB.Library.refreshLibraryList(true);
        } else {
            RB.Library.refreshLibraryList(false);
        }
    } catch (e) {
        RB.App.message('A fatal error occurred while getting filesystem information. You might need to force close Minstrel and start it again.', RB.App.MessageSeverityEnum.CRITICAL);
    }
};

// create main directory
RB.Library.ensureMainDirectoryIsAvailable = function() {
    var onSuccess = null;
    var onError   = null; 
    var mode      = 'createThumbnailDirectory';
    var args      = JSON.stringify({
        'thumbnailDirectory':   RB.App.getThumbnailsDirectory(true),
    });
    if (RB.App.isAndroid()) {
        Librarian.createEvent(mode, '', args, onSuccess, onError);
    }
    if (RB.App.isIOS()) {
        Librarian.createEvent(mode, '', args, onSuccess, onError);
        //cordova.exec(onSuccess, onError, 'Librarian', 'librarian', [mode, '', args]);
    }
};

// copy guide from assets
RB.Library.copyAssetsFromAppBundle = function() {
    var onSuccess   = null;
    var onError     = null; 
    var command     = 'copyFromAssetsWWW';
    var parameters  = JSON.stringify({ 'source': RB.Config.pathGuideEPUB, 'destination': RB.App.joinPaths([RB.App.getAbsolutePathMainDirectory(), 'guide.epub']) });

    if (RB.App.isAndroid()) {
        Commander.createEvent(command, parameters, onSuccess, onError);
    }
    if (RB.App.isIOS()) {
        Commander.createEvent(command, parameters, onSuccess, onError);
        //cordova.exec(onSuccess, onError, 'Commander', 'commander', [command, parameters]);
    }
};

// something went very wrong here
RB.Library.onErrorGettingFilesystem = function(message) {
    RB.UI.showSpinner(false);
    RB.App.message('A fatal error occurred while reading the filesystem: ' + message, RB.App.MessageSeverityEnum.CRITICAL); 
};

// library list 
RB.Library.populateLibraryList = function() {
    // sort library
    RB.UI.showSpinner(true);
    RB.Library.sortLibraryList();
    RB.UI.showSpinner(false);
    
    // delete everything
    var lv_id = RB.Library.UI.lstItems;
    RB.UI.empty(lv_id);
    
    // this does not seem to work
    // TODO investigate this
    //RB.UI.setAttr(RB.Library.UI.lstItems, 'data-filter-placeholder', RB.UI.i18n('lstDataFilterPlaceholder'));
    
    // append items, according to the order in RB.Library.sortedItems
    // RB.Library.sortedItems is a list of [ key, index ]
    // where index is the index of the book in books
    var sort_method = RB.Storage.get(RB.Storage.Keys.LIBRARY_SORT);
    var small_width = RB.UI.screenHasSmallWidth();
    for (var i = 0; i < RB.Library.sortedItems.length; ++i) {
        var listItem = RB.Library.formatListItem(RB.Library.items[RB.Library.sortedItems[i][2]], sort_method, small_width);
        RB.UI.append(lv_id, listItem);
    }

    // refresh the listview
    RB.UI.refreshListview(lv_id);
   
    // set title "[NUM] Minstrel", where NUM is the number of items
    RB.Library.setTitle("[" + RB.Library.sortedItems.length + "] " + RB.Config.Minstrel.publicName);

    // hide spinner
    RB.UI.showSpinner(false);
};

// format list item
RB.Library.formatListItem = function(item, sort_method, small_width) {

    // if small_width screen, use smaller layout
    var small_class_icon = '';
    var small_class_text = '';
    if (small_width) {
        small_class_icon = 'smaller-icon';
        small_class_text = 'smaller-text';
    }

    var mainFormat            = item['mainFormat'];
    var mainFormatMetadata    = item.formats[mainFormat].metadata;

    var item_id               = item['id'];
    var item_title            = item['title'];
    var item_series           = mainFormatMetadata.series || "";
    var item_series_index     = mainFormatMetadata.seriesIndex || "";
    var item_author           = mainFormatMetadata.author || "";
    var item_path             = RB.App.getLibraryItemPath(item);
    var item_cover_path       = RB.App.getLibraryItemCoverPath(item);
    var item_narrator         = mainFormatMetadata.narrator || "";
    var item_duration         = RB.Utilities.clockStringToPrettyClockValue(mainFormatMetadata.duration);
    var item_format           = mainFormat.toUpperCase();
    var item_language         = (mainFormatMetadata.language || "").toUpperCase();
    var item_number_of_assets = mainFormatMetadata.numberOfAssets || "";
    
    var item_data             = RB.App.readItemData(item_id, ['library']);
    
    // add special character
    var isSpecial = '';
    if (item_data) {
        if (!item_data['showInLibrary']) {
            isSpecial += RB.Library.hiddenItemSymbol;
        }
        if (item_data['isNew']) {
            isSpecial += RB.Library.newItemSymbol;
        }
    }
    
    // shall we use the stock thumbnail?
    if (item_data['showStockThumbnailInLibrary']) {
        item_cover_path = RB.Plugins[item_format.toLowerCase()].stockThumbnail;
    }
    if ((item_format.toLowerCase() === RB.Plugins.Format.formatNames.CBZ) && (!RB.Storage.isAppParameterTrue(RB.Storage.Keys.CBZ_EXTRACT_COVER))) {
        item_cover_path = RB.Plugins.cbz.stockThumbnail;
    }
    
    // series?
    var item_series_with_index = RB.Utilities.joinStrings([item_series, item_series_index], ', ', '');
    
    // metadata to display
    var line1   = [];
    var line2   = [];
    var line3   = [];
    var line3p  = [];

    if ((sort_method === 'title') || (sort_method === 'duration') || (sort_method === 'language') || (sort_method === 'recent')) {
        line1   = [isSpecial, item_title];
        line2   = [item_author, item_series_with_index];
        line3   = [item_narrator];
        line3p  = [item_format, item_language, item_number_of_assets, item_duration];
    }
    if (sort_method === 'author') {
        line1   = [isSpecial, item_author];
        line2   = [item_title, item_series_with_index];
        line3   = [item_narrator];
        line3p  = [item_format, item_language, item_number_of_assets, item_duration];
    }
    if (sort_method === 'narrator') {
        line1   = [isSpecial, item_author];
        line2   = [item_author, item_title, item_series_with_index];
        line3   = [];
        line3p  = [item_format, item_language, item_number_of_assets, item_duration];
    }
    if (sort_method === 'series') {
        line1   = [isSpecial, item_title];
        line2   = [item_series_with_index];
        line3   = [item_author, item_narrator];
        line3p  = [item_format, item_language, item_number_of_assets, item_duration];
    }
    
    var row1    = RB.Utilities.joinStrings(line1, ' ', '&#160;');
    var row2    = RB.Utilities.joinStrings(line2, ', ', '&#160;');
    var row3    = RB.Utilities.joinStrings(line3, ', ', '');
    var row3p   = '(' + RB.Utilities.joinStrings(line3p, ', ', '') + ')';
    row3        = RB.Utilities.joinStrings([row3, row3p], ' ', '&#160;');
        
    // format list item
    var listItem  = '<li id="item_' + item_id + '">';
        listItem += '<a onclick="RB.Library.openItem(\'' + item_id + '\', false);">';
        listItem += '<img src="'+ item_cover_path + '" class="' + small_class_icon + '"/>';
        listItem += '<h4 class="' + small_class_text + '"><strong>' + row1 + '</strong></h4>';
        listItem += '<p class="' + small_class_text + '"><em>' + row2 + '</em></p>';
        listItem += '<p class="' + small_class_text + '">' + row3 + '</p>';
      //listItem += '<p class="initiallyHidden">PUT HERE SEARCHABLE (BUT NOT DISPLAYED) META</p>';
        listItem += '<a onclick="RB.Library.openItem(\'' + item_id + '\', true);"></a>';
        listItem += '</li>';
    
    // return it
    return listItem;
};

// sort library list
RB.Library.sortLibraryList = function() {
    var loaded_formats     = RB.Storage.getDictionary(RB.Storage.Keys.PLUGINS_LOADED);
    var sort_method        = RB.Storage.get(RB.Storage.Keys.LIBRARY_SORT);
    var do_not_show_hidden = !RB.Storage.isAppParameterTrue(RB.Storage.Keys.LIBRARY_SHOW_HIDDEN_BOOKS);
    var add_all_items      = !RB.Storage.isAppParameterTrue(RB.Storage.Keys.LIBRARY_HIDE_BOOKS_ON_SORT);
    var tmp_items          = [];
    
    var arr = Object.keys(RB.Library.items);
    for (var i = 0; i < arr.length; i++) {
        var b                  = RB.Library.items[arr[i]];
        var b_data             = RB.App.readItemData(arr[i], ['library']);
        var mainFormat         = b['mainFormat'];
        var mainFormatMetadata = b.formats[mainFormat].metadata;
        var add                = true;
        if (!(b['mainFormat'] in loaded_formats)) {
            add = false;
        }
        if ((do_not_show_hidden) && (b_data) && (!b_data['showInLibrary'])) {
            add = false;
        }
        if (add) {
            var key = '';
            var sub = '';
            if (sort_method === 'recent') {
                key = b_data['lastTimeOpened'];
                if (!key) {
                    // items not opened before will go to the bottom
                    key = '';
                }
                sub = b['title'].toUpperCase();
            } else if (sort_method === 'title') {
                key = b['title'].toUpperCase();
                sub = (mainFormatMetadata.narrator || "").toUpperCase();
            } else if (sort_method === 'duration') {
                key = b_data['formattedDuration'];
                sub = b['title'].toUpperCase();
            } else if (sort_method === 'series') {
                key = (mainFormatMetadata.series || "").toUpperCase();
                sub = (mainFormatMetadata.seriesIndex || "").toUpperCase();
            } else {
                key = (mainFormatMetadata[sort_method] || "").toUpperCase();
                sub = b['title'].toUpperCase();
            }
            if ((add_all_items) || (key)) {
                // add item if either
                // 1) user did not select hide on sort or
                // 2) key is not null/empty/''
                tmp_items.push([key, sub, arr[i]]);
            }
        }
    }
    
    RB.Library.sortedItems = [];
    var invert = RB.Storage.isAppParameterTrue(RB.Storage.Keys.LIBRARY_INVERT_SORT);
    if (sort_method === 'recent') {
        invert = !invert;
    }
    RB.Library.sortedItems = RB.Utilities.sortByKey(tmp_items, invert);
};

// open previewer/viewer
RB.Library.openItem = function(id, preview) {
    var item = RB.Library.items[id];
    if (item) {
        RB.App.openItem(RB.App.unescapeQuotes(id), RB.App.getLibraryItemPath(item), item['mainFormat'], preview);
    }
};

// button actions
RB.Library.refreshLibraryFromUser = function() {
    RB.Library.refreshLibraryList(true);
};
RB.Library.openSettings = function() {
    RB.App.openPage(RB.App.PagesEnum.SETTINGS);
};
RB.Library.openFormatSettings = function() {
    // TODO generalize this
    RB.App.openPage(RB.Plugins.epub.settingsFilePath);
};
RB.Library.onSortMethodChanged = function(key, increment) {
    if (increment === 0) {
        var invert = RB.Storage.flip(RB.Storage.Keys.LIBRARY_INVERT_SORT);
        RB.UI.setIcon(RB.Library.UI.btnSort, invert, 'sort-by-alphabet-alt', 'sort-by-alphabet');
    }
    RB.Library.refreshLibraryList(false);
};
RB.Library.openHelp = function() {
    RB.App.openPage(RB.App.PagesEnum.HELP);
};
RB.Library.onDRSUpdate = function() {
    // nop
};
RB.Library.onLanguageChanged = function() {
    RB.UI.language = RB.Storage.get(RB.Storage.Keys.UI_LANGUAGE);
    RB.UI.loadLocalization();
};
RB.Library.chooseOtherDirectory = function() {
    if (RB.App.isAndroid()) {
        RB.App.openPage(RB.App.PagesEnum.FILECHOOSER);
    }
};

// set title
RB.Library.setTitle = function(s) {
    RB.UI.setText(RB.Library.UI.txtTitle, s, true);
};



