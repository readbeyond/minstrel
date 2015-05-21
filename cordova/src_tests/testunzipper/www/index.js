var onDeviceReady = function() {
    log("deviceready...");
    document.getElementById('btnList').addEventListener('click', onClickList, false);
    document.getElementById('btnAll').addEventListener('click', onClickAll, false);
    document.getElementById('btnAllNMF').addEventListener('click', onClickAllNMF, false);
    document.getElementById('btnAllSmall').addEventListener('click', onClickAllSmall, false);
    document.getElementById('btnStruct').addEventListener('click', onClickStruct, false);
    document.getElementById('btnSingle').addEventListener('click', onClickSingle, false);
    document.getElementById('btnClear').addEventListener('click', onClickClear, false);
    log("deviceready... OK");
};

var onUnzipperError = function(msg) {
    log("Unzipper error! " + msg);
    alert("Unzipper error! " + msg);
};

var execute = function(mode, args, onSuccess) {
    log("Invoking unzipper with mode " + mode + " ...");
    var srcPath = document.getElementById('inpSrc').value;
    log(srcPath);
    var dstPath = document.getElementById('inpDst').value;
    log(dstPath);
    Unzipper.createEvent(mode, srcPath, dstPath, args, onSuccess, onUnzipperError);
    log("Invoking unzipper with mode " + mode + " ... done");
};

var onClickList = function() {
    var onSuccess = function(msg) {
        log("Success listing ZIP entries");
        var jsonObject = JSON.parse(msg);
        var items = jsonObject.files.items;
        for (var i = 0; i < items.length; ++i) {
            log(items[i]);
        }
    };
    var mode = 'list';
    var args = JSON.stringify({});
    execute(mode, args, onSuccess);
};

var onClickAll = function() {
    var onSuccess = function(msg) {
        log("Success unzipping all entries");
        var jsonObject = JSON.parse(msg);
        var items = jsonObject.files.items;
        for (var i = 0; i < items.length; ++i) {
            log(items[i]);
        }
    };
    var mode = 'all';
    var args = JSON.stringify({});
    execute(mode, args, onSuccess);
};

var onClickAllNMF = function() {
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
    var onSuccess = function(msg) {
        log("Success unzipping all non media entries");
        var jsonObject = JSON.parse(msg);
        var items = jsonObject.files.items;
        for (var i = 0; i < items.length; ++i) {
            log(items[i]);
        }
    };
    var mode = 'allNonMedia';
    var args = JSON.stringify({ 'excludeExtensions': excludeExtensions });
    execute(mode, args, onSuccess);
};

var onClickAllSmall = function() {
    var maximumFileSize = 16384; // dummy to test: 16 KB
    log("Maximum file size: " + maximumFileSize);
    var onSuccess = function(msg) {
        log("Success unzipping all small entries");
        var jsonObject = JSON.parse(msg);
        var items = jsonObject.files.items;
        for (var i = 0; i < items.length; ++i) {
            log(items[i]);
        }
    };
    var mode = 'allSmall';
    var args = JSON.stringify({ 'maximumFileSize': maximumFileSize  });
    execute(mode, args, onSuccess);
};

var onClickStruct = function() {
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
    var onSuccess = function(msg) {
        log("Success unzipping all structure entries");
        var jsonObject = JSON.parse(msg);
        var items = jsonObject.files.items;
        for (var i = 0; i < items.length; ++i) {
            log(items[i]);
        }
    };
    var mode = 'allStructure';
    var args = JSON.stringify({ 'extensions': extensions });
    execute(mode, args, onSuccess);
};

var onClickSingle = function() {
    var entry = document.getElementById('inpEntry').value;
    log(entry);
    var onSuccess = function(msg) {
        log("Success unzipping single entry");
        var jsonObject = JSON.parse(msg);
        var items = jsonObject.files.items;
        for (var i = 0; i < items.length; ++i) {
            log(items[i]);
        }
    };
    var mode = 'selected';
    var args = JSON.stringify({ 'entries': [ entry ] });
    execute(mode, args, onSuccess);
};

var onClickClear = function() {
    document.getElementById('txtInfo').innerHTML = "";
};

var log = function(msg) {
    document.getElementById('txtInfo').innerHTML = msg + "<br/>" + document.getElementById('txtInfo').innerHTML;
};

document.addEventListener('deviceready', onDeviceReady, false);
//onDeviceReady();
