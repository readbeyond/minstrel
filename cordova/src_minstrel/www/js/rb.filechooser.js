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

/** @namespace RB.FileChooser */
RB.FileChooser = RB.FileChooser || {};

/* constants */
RB.FileChooser.UI                     = {};
RB.FileChooser.UI.lstItems            = 'lstItems';
RB.FileChooser.UI.txtFileChooserTitle = 'txtFileChooserTitle';

/* variables */
RB.FileChooser.createdManagers        = false;
RB.FileChooser.showInternal           = true;
RB.FileChooser.hasInternal            = false;
RB.FileChooser.hasExternal            = false;

// DEBUG
RB.FileChooser.debug                  = false;

/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.FileChooser.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();

    // populate format list
    // NOTE: SCAN_DIRECTORIES is actually an array, but here we get it as a string for comparing on exit
    RB.FileChooser.selectedDirectoriesWhenOpen = RB.Storage.get(RB.Storage.Keys.SCAN_DIRECTORIES);

    // create manager objects
    RB.FileChooser.createManagers();
    
    // DEBUG
    if (RB.FileChooser.debug) {
        RB.FileChooser.refreshDirectoryList();
    }
};

// initialize page
RB.FileChooser.initializePage = function() {
    // bind events
    RB.FileChooser.bindEvents();

    // dim system bar
    RB.UI.dimSystemBar();
    
    // populate directory list
    RB.FileChooser.refreshDirectoryList();
};

// bind events
RB.FileChooser.bindEvents = function() {
    // scroll when collapsible is expanded
    // RB.UI.bindScrollOnCollapsibleExpanded(RB.FileChooser.UI);
};

// handle back button
RB.FileChooser.onBackButton = function() {
        
    // save selected directories
    RB.FileChooser.saveSelectedDirectories();

    // if the list of plugins loaded is
    if (RB.Storage.get(RB.Storage.Keys.SCAN_DIRECTORIES) !== RB.FileChooser.selectedDirectoriesWhenOpen) {
        RB.Storage.set(RB.Storage.Keys.SCAN_DIRECTORIES_CHANGED, true);
    }

    // go back
    RB.UI.onBackButton();
};

// create manager objects
RB.FileChooser.createManagers = function() {
    // if already created, abort
    if (RB.FileChooser.createdManagers) {
        return;
    }

    // register simple buttons
    RB.UI.bindSimpleButtonEvents('btnFCApply',     { 'click': RB.FileChooser.onBackButton }, false);
    RB.UI.bindSimpleButtonEvents('btnFCInternal',  { 'click': RB.FileChooser.setInternal  }, false);
    RB.UI.bindSimpleButtonEvents('btnFCExternal',  { 'click': RB.FileChooser.setExternal  }, false);
    RB.UI.bindSimpleButtonEvents('btnFCNone',      { 'click': RB.FileChooser.selectNone   }, false);
    RB.UI.bindSimpleButtonEvents('btnFCAll',       { 'click': RB.FileChooser.selectAll    }, false);
    
    // reset flag
    RB.FileChooser.createdManagers = true;
};


RB.FileChooser.refreshDirectoryList = function() {
   
    // read selected dictionaries from storage 
    RB.FileChooser.selectedDirectories = RB.Storage.getArray(RB.Storage.Keys.SCAN_DIRECTORIES);
    
    // get the list of directories
    RB.FileChooser.storageDirectories  = {};
    var onSuccess = function(message) {
       
        // DEBUG 
        //alert(message);
       
        RB.FileChooser.storageDirectories     = JSON.parse(message);
        var map                               = [];
        var roots                             = Object.keys(RB.FileChooser.storageDirectories).sort();
        var k                                 = 0;
        for (var i = 0; i < roots.length; i++) {
            var root = roots[i];
            var info = RB.FileChooser.storageDirectories[root];
            if (info) {
                var internal = info['internal'];
                var dirs     = RB.Utilities.sortNoCase(info['subdirectories']);
                if (dirs.length > 0) {
                    if (internal) {
                        RB.FileChooser.hasInternal = true;
                    } else {
                        RB.FileChooser.hasExternal = true;
                    }
                    for (var j = 0; j < dirs.length; j++) {
                        var path     = dirs[j];
                        var selected = (RB.FileChooser.selectedDirectories.indexOf(path) > -1);
                        map.push({ 'root': root, 'internal': internal, 'isFirst': (j === 0), 'path': path, 'selected': selected });
                        k += 1;
                    }
                }
            }
        }
        RB.FileChooser.selectedDirectoriesMap = map;
        RB.FileChooser.populateDirectoryList();
    };
    var onError = function(message) {
        RB.App.message('A fatal error occurred while listing the existing directories.', RB.App.MessageSeverityEnum.CRITICAL);
    };
    
    if (RB.FileChooser.debug) {
        // DEBUG
        var msg = JSON.stringify({
            '/storage/extSdCard':  { 'internal': false, 'subdirectories': ['/storage/extSdCard/Abc', '/storage/extSdCard/ABC', '/storage/extSdCard/abc', '/storage/extSdCard/ebooks', '/storage/extSdCard/minstrel'] },
            '/storage/anotherSD':  { 'internal': false, 'subdirectories': [] },
            '/storage/emulated/0': { 'internal': true,  'subdirectories': ['/storage/emulated/0/Android', '/storage/emulated/0/minstrel', '/storage/emulated/0/airdroid', '/storage/emulated/0/Alarms', '/storage/emulated/0/backups', '/storage/emulated/0/documents', '/storage/emulated/0/Download'] },
        });
        onSuccess(msg);
    } else {
        var command    = 'listSubdirectories';
        var parameters = JSON.stringify({ 'recursive': false, 'ignoreHidden': true });
        if (RB.App.isAndroid()) {
            Commander.createEvent(command, parameters, onSuccess, onError);
        }
    }
};

RB.FileChooser.populateDirectoryList = function() {
    var lv_id = RB.FileChooser.UI.lstItems;
    RB.UI.empty(lv_id);
   
    for (var k = 0; k < RB.FileChooser.selectedDirectoriesMap.length; k++) {
        var obj      = RB.FileChooser.selectedDirectoriesMap[k];
        var root     = obj['root'];
        var internal = obj['internal'];
        var path     = obj['path'];
        var selected = obj['selected'];
        var icon     = 'check-empty';
        if (selected) {
            icon     = 'check';
        }
        var listItem = '<li onclick="RB.FileChooser.toggleDirectory(' + k + ');">';
        listItem    += '<a><h4><strong>' + path.substring(root.length + 1) + '</strong></h4></a>';
        listItem    += '<a id="icon-dir' + k + '" data-icon="' + icon + '"></a>';
        listItem    += '</li>';
       
        if (RB.FileChooser.showInternal === internal) {
            if (obj['isFirst']) { 
                var divider = '<li data-role="list-divider">' + root + '</li>';
                RB.UI.append(lv_id, divider);
            }

            RB.UI.append(lv_id, listItem);
        }
    }
    
    RB.UI.refreshListview(lv_id);
    RB.FileChooser.updateInternalExternalButtons();
};

RB.FileChooser.updateInternalExternalButtons = function() {    

    if (RB.FileChooser.hasInternal) {
        RB.UI.enableButton('btnFCInternal');
    } else {
        RB.UI.disableButton('btnFCInternal');
    }
    
    if (RB.FileChooser.hasExternal) {
        RB.UI.enableButton('btnFCExternal');
    } else {
        RB.UI.disableButton('btnFCExternal');
    }
   
    if ((RB.FileChooser.showInternal) && (!RB.FileChooser.hasInternal)) {
        RB.FileChooser.showInternal = false;
        RB.FileChooser.populateDirectoryList();
        return;
    }

    var add, remove;
    if (RB.FileChooser.showInternal) {
        add    = 'btnFCInternal';
        remove = 'btnFCExternal';
    } else {
        add    = 'btnFCExternal';
        remove = 'btnFCInternal';
    }
    RB.UI.addClass(add,       RB.UI.VISUAL_FEEDBACK_ON_CLICK_CLASS);
    RB.UI.removeClass(remove, RB.UI.VISUAL_FEEDBACK_ON_CLICK_CLASS);
};

RB.FileChooser.toggleDirectory = function(index) {
    try {
        var obj         = RB.FileChooser.selectedDirectoriesMap[index];
        obj['selected'] = !obj['selected'];
        RB.FileChooser.selectedDirectoriesMap[index] = obj;
        RB.FileChooser.populateDirectoryList();
    } catch (e) {
        // nop
    }
};

RB.FileChooser.setInternal = function() {
    if (RB.FileChooser.hasInternal) {
        RB.FileChooser.showInternal = true;
        RB.FileChooser.populateDirectoryList();
    }
};
RB.FileChooser.setExternal = function() {
    if (RB.FileChooser.hasExternal) {
        RB.FileChooser.showInternal = false;
        RB.FileChooser.populateDirectoryList();
    }
};

RB.FileChooser.applyToAll = function(value) {
    for (var k = 0; k < RB.FileChooser.selectedDirectoriesMap.length; k++) {
        var obj         = RB.FileChooser.selectedDirectoriesMap[k];
        obj['selected'] = value;
        RB.FileChooser.selectedDirectoriesMap[k] = obj;
    }
    RB.FileChooser.populateDirectoryList();
};
RB.FileChooser.selectNone = function() {
    RB.FileChooser.applyToAll(false);
};
RB.FileChooser.selectAll = function() {
    RB.FileChooser.applyToAll(true);
};

// store selected directories
RB.FileChooser.saveSelectedDirectories = function() {
    var arr = [];
    for (var k = 0; k < RB.FileChooser.selectedDirectoriesMap.length; k++) {
        var obj = RB.FileChooser.selectedDirectoriesMap[k];
        if (obj['selected']) {
            arr.push(obj['path']);
        }
    }
    RB.Storage.setArray(RB.Storage.Keys.SCAN_DIRECTORIES, arr);
};



