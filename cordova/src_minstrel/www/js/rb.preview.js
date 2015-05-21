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

/** @namespace RB.Preview */
RB.Preview = RB.Preview || {};

/* constants */
// UI
RB.Preview.UI                                   = {};
RB.Preview.UI.divContentContainer               = 'divContentContainer';
RB.Preview.UI.txtPreviewHeader                  = 'txtPreviewHeader';
RB.Preview.UI.txtTitle                          = 'txtPreviewTitle';
RB.Preview.UI.txtSeries                         = 'txtPreviewSeries';
RB.Preview.UI.txtSeriesIndex                    = 'txtPreviewSeriesIndex';
RB.Preview.UI.txtAuthor                         = 'txtPreviewAuthor';
RB.Preview.UI.txtLanguage                       = 'txtPreviewLanguage';
RB.Preview.UI.txtNarrator                       = 'txtPreviewNarrator';
RB.Preview.UI.txtNumberOfAssets                 = 'txtPreviewNumberOfAssets';
RB.Preview.UI.txtDuration                       = 'txtPreviewDuration';
RB.Preview.UI.txtPublisher                      = 'txtPreviewPublisher';
RB.Preview.UI.txtDate                           = 'txtPreviewDate';
RB.Preview.UI.txtSubject                        = 'txtPreviewSubject';
RB.Preview.UI.txtDescription                    = 'txtPreviewDescription';
RB.Preview.UI.txtAppIdentifier                  = 'txtPreviewAppIdentifier';
RB.Preview.UI.txtIdentifier                     = 'txtPreviewIdentifier';
RB.Preview.UI.txtDateModified                   = 'txtPreviewDateModified';
RB.Preview.UI.txtItemSize                       = 'txtPreviewItemSize';
RB.Preview.UI.txtItemPath                       = 'txtPreviewItemPath';
RB.Preview.UI.txtDateLastOpened                 = 'txtPreviewDateLastOpened';
RB.Preview.UI.txtDeleteMetadataBookDone         = 'txtPreviewDeleteMetadataBookDone';
RB.Preview.UI.txtDeleteRecentInfoBookDone       = 'txtPreviewDeleteRecentInfoBookDone';
RB.Preview.UI.txtDeleteReadingPositionBookDone  = 'txtPreviewDeleteReadingPositionBookDone';
RB.Preview.UI.txtDeleteReadingSettingsBookDone  = 'txtPreviewDeleteReadingSettingsBookDone';
RB.Preview.UI.txtDeleteDone                     = 'txtPreviewDeleteDone';
RB.Preview.UI.btnShowBookInLibrary              = 'btnPreviewShowBookInLibrary';
RB.Preview.UI.btnShowStockThumbnailInLibrary    = 'btnPreviewShowStockThumbnailInLibrary';
RB.Preview.UI.imgPreviewCover                   = 'imgPreviewCover';
RB.Preview.UI.colPreviewSettings                = 'colPreviewSettings';
RB.Preview.UI.colPreviewAdvanced                = 'colPreviewAdvanced';
RB.Preview.UI.btnDeleteFromLibraryWrapper       = 'btnDeleteFromLibraryWrapper';

/* variables */
RB.Preview.createdManagers                      = false;
RB.Preview.assetManager                         = null;

RB.Preview.item                                 = null;
RB.Preview.itemPath                             = null;
RB.Preview.itemID                               = null;


/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.Preview.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();
   
    // hide delete from library (only) on iOS
    if (RB.App.isIOS()) {
        RB.UI.hide(RB.Preview.UI.btnDeleteFromLibraryWrapper);
    }

    // set app variables 
    RB.Preview.loadVariables();
    
    // create manager objects
    RB.Preview.createManagers();
    
    // hide contents, to avoid flickering
    // they will be shown after setting all the relevant fields
    RB.UI.hide(RB.Preview.UI.divContentContainer);
};

// initialize page
RB.Preview.initializePage = function() {
    // bind events
    RB.Preview.bindEvents();
    
    // update switches 
    RB.UI.showSpinner(true);
    RB.Preview.loadMetadata();
    
    // dim system bar
    RB.UI.dimSystemBar();
};

// bind events
RB.Preview.bindEvents = function() {
    // scroll when collapsible is expanded
    RB.UI.bindScrollOnCollapsibleExpanded(RB.Preview.UI);
};

// load variables from storage
RB.Preview.loadVariables = function() {
    // current item
    RB.Preview.itemPath     = RB.App.unescapeQuotes(RB.Storage.get(RB.Storage.Keys.OPEN_ITEM_FILE_PATH));
    RB.Preview.itemID       = RB.Storage.get(RB.Storage.Keys.OPEN_ITEM_ID);
    RB.Preview.item         = RB.Storage.getDictionary(RB.Storage.Keys.LIBRARY_BOOKS)[RB.Preview.itemID];
};

// create manager objects
RB.Preview.createManagers = function() {
    // if already created, abort
    if (RB.Preview.createdManagers) {
        return;
    }
    
    // asset manager object
    RB.Preview.assetManager = new RB.App.zipAssetsManager(RB.Preview.itemPath, RB.App.joinPaths([RB.App.getTmpDirectory(), RB.Preview.itemID]), true);
    
    // register simple buttons
    RB.UI.bindSimpleButtonEvents('btnPreviewShowBookInLibrary',          { 'click': RB.Preview.showBookInLibrary                                     }, false);
    //RB.UI.bindSimpleButtonEvents('btnPreviewShowStockThumbnailInLibrary', { 'click': RB.Preview.showStockThumbnailInLibrary                          }, false);
    RB.UI.bindSimpleButtonEvents('imgPreviewCover',                      { 'click': RB.Preview.showStockThumbnailInLibrary                           }, false);
    RB.UI.bindSimpleButtonEvents('btnPreviewOpenBook',                   { 'click': RB.Preview.openItem                                              }, false);
    RB.UI.bindSimpleButtonEvents('btnDeleteMetadataBook',                { 'click': function() { RB.Preview.resetItemData('resetMetadata'); }        }, false);
    RB.UI.bindSimpleButtonEvents('btnDeleteRecentInfoBook',              { 'click': function() { RB.Preview.resetItemData('resetRecentInfo'); }      }, false);
    RB.UI.bindSimpleButtonEvents('btnDeleteReadingPositionBook',         { 'click': function() { RB.Preview.resetItemData('resetReadingPosition'); } }, false);
    RB.UI.bindSimpleButtonEvents('btnDeleteReadingSettingsBook',         { 'click': function() { RB.Preview.resetItemData('resetReadingSettings'); } }, false);
    RB.UI.bindSimpleButtonEvents('btnDeleteFromLibrary',                 { 'click': RB.Preview.deleteFromLibrary                                     }, false);
    RB.UI.bindSimpleButtonEvents('btnDeleteFile',                        { 'click': RB.Preview.deleteFile                                            }, false);
    
    // reset flag
    RB.Preview.createdManagers = true;
};

// populate preview fields
RB.Preview.loadMetadata = function() {
    if (RB.Preview.item) {
        // TODO unify these into RS.App.drsManager
        var showBookInLibrary = true;
        var showStockThumbnailInLibrary = false;
        var saved = RB.App.readItemData(RB.Preview.itemID, ['library']);
        if (saved) {
            showBookInLibrary           = saved['showInLibrary'];
            showStockThumbnailInLibrary = saved['showStockThumbnailInLibrary'];
        }
        RB.UI.setBooleanIcon(RB.Preview.UI.btnShowBookInLibrary,           showBookInLibrary);
        RB.UI.setBooleanIcon(RB.Preview.UI.btnShowStockThumbnailInLibrary, !showStockThumbnailInLibrary); // negated!!! => TODO refactoring
        
        // set title and thumbnail
        RB.UI.setText(RB.Preview.UI.txtTitle + 'Value', RB.Preview.item['title'], true);
        RB.Preview.setThumbnail();
        
        // see if we have meta already
        var saved = RB.App.readItemData(RB.Preview.itemID, ['metadata', RB.Preview.item['mainFormat'], 'parsed']);
        if (saved) {
            // load from storage
            RB.Preview.populateFields(saved);
        } else {
            // unzip structure only
            RB.Preview.assetManager.unzipStructureOnly(RB.Preview.onSuccessUnzip, RB.Preview.onErrorUnzip);
        }
    } else {
        RB.App.message('A fatal error occurred while opening the preview for this file.', RB.App.MessageSeverityEnum.CRITICAL);
        RB.App.openPage(RB.App.PagesEnum.LIBRARY);
    }
};

RB.Preview.setThumbnail = function() {
    var thumb = RB.App.getLibraryItemCoverPath(RB.Preview.item);
    var stock = RB.App.readItemData(RB.Preview.itemID, ['library', 'showStockThumbnailInLibrary']);
    if (stock) {
        thumb = RB.Plugins[RB.Preview.item['mainFormat'].toLowerCase()].stockThumbnail;
    }
    RB.UI.setAttr(RB.Preview.UI.imgPreviewCover, 'src', thumb);
};

RB.Preview.populateFields = function(values) {
    if (values) {
        RB.Preview.setField(values['series'],          RB.Preview.UI.txtSeries);
        RB.Preview.setField(values['seriesIndex'],     RB.Preview.UI.txtSeriesIndex);
        RB.Preview.setField(values['author'],          RB.Preview.UI.txtAuthor);
        RB.Preview.setField(values['language'],        RB.Preview.UI.txtLanguage);
        RB.Preview.setField(values['narrator'],        RB.Preview.UI.txtNarrator);
        RB.Preview.setField(values['numberOfAssets'],  RB.Preview.UI.txtNumberOfAssets);
        RB.Preview.setField(values['duration'],        RB.Preview.UI.txtDuration);
        RB.Preview.setField(values['publisher'],       RB.Preview.UI.txtPublisher);
        RB.Preview.setField(values['date'],            RB.Preview.UI.txtDate);
        RB.Preview.setField(values['subject'],         RB.Preview.UI.txtSubject);
        RB.Preview.setField(values['description'],     RB.Preview.UI.txtDescription);
        RB.Preview.setField(values['id'],              RB.Preview.UI.txtAppIdentifier);
        RB.Preview.setField(values['identifier'],      RB.Preview.UI.txtIdentifier);
        RB.Preview.setField(values['dctermsmodified'], RB.Preview.UI.txtDateModified);
        RB.Preview.setField(values['size'],            RB.Preview.UI.txtItemSize);
        RB.Preview.setField(values['path'],            RB.Preview.UI.txtItemPath);
    }
    
    // last time opened is always available
    RB.Preview.setField(RB.App.readItemData(RB.Preview.itemID, ['library', 'lastTimeOpened']), RB.Preview.UI.txtDateLastOpened);
    
    // hide spinner
    RB.UI.showSpinner(false);
    RB.UI.show(RB.Preview.UI.divContentContainer);
};

RB.Preview.onErrorUnzip = function(message) {
    // on error hide all metadata
    RB.Preview.populateFields({});
};

RB.Preview.onSuccessUnzip = function(message) {
    // on success show all metadata available
    var item_unzipped_directory = RB.App.joinPaths(['file://', RB.Preview.assetManager.getAbsolutePathTmpDirectory(), RB.App.fileSeparator]);
    var mainFormat              = RB.Preview.item['mainFormat'];
    var mainFormatMetadata      = RB.Preview.item.formats[mainFormat].metadata;
    var parsed                  = {};
   
    parsed['id']                = RB.Preview.itemID;
    parsed['path']              = RB.Preview.itemPath;
    parsed['format']            = mainFormat;
    parsed['size']              = RB.Utilities.prettifySizeValue(RB.Preview.item['size']);
    parsed['series']            = mainFormatMetadata.series;
    parsed['seriesIndex']       = mainFormatMetadata.seriesIndex;    
    parsed['author']            = mainFormatMetadata.author;
    parsed['language']          = mainFormatMetadata.language;
    parsed['narrator']          = mainFormatMetadata.narrator;
    parsed['duration']          = RB.Utilities.clockStringToPrettyClockValue(mainFormatMetadata.duration);
    parsed['numberOfAssets']    = mainFormatMetadata.numberOfAssets;
    
    if (mainFormat === RB.Plugins.Format.formatNames.EPUB) {
        try {
            var epub                  = new RB.Format.EPUB.EPUB(item_unzipped_directory, {'full_parsing': false});
            parsed['author']          = epub.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_CREATOR,       false, true);
            parsed['language']        = RB.UI.localizeLanguageNames(epub.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_LANGUAGE, false, false));
            parsed['narrator']        = epub.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.MEDIA_NARRATOR,   false, true);
            parsed['duration']        = epub.getMediaDuration(true, false);
            parsed['publisher']       = epub.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_PUBLISHER,     false, true);
            parsed['date']            = epub.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_DATE,          false, true);
            parsed['subject']         = epub.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_SUBJECT,       false, true);
            parsed['description']     = epub.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_DESCRIPTION,   false, true);
            parsed['identifier']      = epub.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DC_IDENTIFIER,    false, true);
            parsed['dctermsmodified'] = epub.getMetadatumValue(RB.Format.OPF.Metadatum.NameEnum.DCTERMS_MODIFIED, false, true);
        } catch (e) {
            if (e instanceof RB.Exception) {
                RB.App.message('An error occurred while parsing this EPUB file: ' + e, RB.App.MessageSeverityEnum.ERROR);
            } else {
                RB.App.message('A generic error occurred: ' + e.name + ' ' + e.message, RB.App.MessageSeverityEnum.ERROR);
            }
        }
    }

    /*
    if (mainFormat === RB.Plugins.Format.formatNames.ABZ) {
    }
    if (mainFormat === RB.Plugins.Format.formatNames.CBZ) {
    }
    */

    // delete the tmp stuff
    RB.Preview.assetManager.deleteTmpDirectory(null, null);
    
    // save metadata
    if (RB.Storage.isAppParameterTrue(RB.Storage.Keys.LIBRARY_CACHE_METADATA)) {
        RB.App.saveItemData(RB.Preview.itemID, ['metadata', mainFormat, 'parsed'], parsed);
    }
    RB.Preview.populateFields(parsed);
};
RB.Preview.setField = function(value, element) {
    if ((value !== null) && (value !== undefined) && (value !== '')) {
        RB.UI.show(element);
        RB.UI.setText(element + 'Value', value, true);
    } else {
        RB.UI.hide(element);
    }
};

// button actions
RB.Preview.showBookInLibrary = function() {
    var key = ['library', 'showInLibrary'];
    var show = !RB.App.readItemData(RB.Preview.itemID, key);
    RB.App.saveItemData(RB.Preview.itemID, key, show);
    RB.UI.setBooleanIcon(RB.Preview.UI.btnShowBookInLibrary, show);
};
RB.Preview.showStockThumbnailInLibrary = function() {
    var key = ['library', 'showStockThumbnailInLibrary'];
    var show = !RB.App.readItemData(RB.Preview.itemID, key);
    RB.App.saveItemData(RB.Preview.itemID, key, show);
    RB.UI.setBooleanIcon(RB.Preview.UI.btnShowStockThumbnailInLibrary, !show);  // negated!!! => TODO refactoring
    RB.Preview.setThumbnail();
};
RB.Preview.openItem = function() {
    RB.App.openItem(RB.Preview.itemID, RB.Preview.itemPath, RB.Preview.item['mainFormat'], false);
};

// delete properties from item data
RB.Preview.resetItemData = function(mode) {
    if (mode === 'resetRecentInfo') {
        RB.App.saveItemData(RB.Preview.itemID, ['library', 'lastTimeOpened'], null);
        RB.UI.showNotification(RB.UI.i18n(RB.Preview.UI.txtDeleteRecentInfoBookDone));
    }
    if (mode === 'resetReadingPosition') {
        RB.App.saveItemData(RB.Preview.itemID, ['library', 'isNew'], true);
        RB.App.deleteItemData(RB.Preview.itemID, ['position']);
        RB.UI.showNotification(RB.UI.i18n(RB.Preview.UI.txtDeleteReadingPositionBookDone));
    }
    if (mode === 'resetMetadata') {
        RB.App.deleteItemData(RB.Preview.itemID, ['metadata']);
        RB.App.deleteItemData(RB.Preview.itemID, ['structure']);
        RB.UI.showNotification(RB.UI.i18n(RB.Preview.UI.txtDeleteMetadataBookDone));
    }
    if (mode === 'resetReadingSettings') {
        RB.App.deleteItemData(RB.Preview.itemID, ['settings']);
        RB.UI.showNotification(RB.UI.i18n(RB.Preview.UI.txtDeleteReadingSettingsBookDone));
    }
};

// delete item data
RB.Preview.deleteItemData = function() {
    // remove from library items
    var books = RB.Storage.getDictionary(RB.Storage.Keys.LIBRARY_BOOKS);
    if (books) {
        delete books[RB.Preview.itemID];
        RB.Storage.setDictionary(RB.Storage.Keys.LIBRARY_BOOKS, books);
    }

    // remove from storage
    RB.App.deleteItemData(RB.Preview.itemID);
};

// delete from library only
RB.Preview.deleteFromLibrary = function() {
    // delete item data
    RB.Preview.deleteItemData();

    RB.UI.showNotification(RB.UI.i18n(RB.Preview.UI.txtDeleteDone));
    window.setTimeout(function() {
        RB.App.openPage(RB.App.PagesEnum.LIBRARY);
    }, RB.UI.NOTIFICATION_DURATION);
};

// delete from library and delete file
RB.Preview.deleteFile = function() {
    // delete item data 
    RB.Preview.deleteItemData(); 

    // show spinner
    RB.UI.showSpinner(true);
    
    // remove from file system
    var onError = function() {
        RB.UI.showSpinner(false);
        RB.App.message('An error occurred while deleting this file.', RB.App.MessageSeverityEnum.ERROR);
    };
    var onSuccess = function() {
        RB.UI.showSpinner(false);
        RB.UI.showNotification(RB.UI.i18n(RB.Preview.UI.txtDeleteDone));
        window.setTimeout(function() {
            RB.App.openPage(RB.App.PagesEnum.LIBRARY);
        }, RB.UI.NOTIFICATION_DURATION);
    };
    RB.Preview.assetManager.deleteAbsolute(onSuccess, onError);
};



