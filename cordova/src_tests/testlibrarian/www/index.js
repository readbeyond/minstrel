var onDeviceReady = function() {
    log("deviceready...");
    document.getElementById('btnCreateT').addEventListener('click', onClickCreateT, false); 
    document.getElementById('btnEmptyT').addEventListener('click', onClickEmptyT, false); 
    document.getElementById('btnScanS').addEventListener('click', onClickScanS, false); 
    document.getElementById('btnScanF').addEventListener('click', onClickScanF, false); 
    document.getElementById('btnClear').addEventListener('click', onClickClear, false);
    log("deviceready... OK");
};

var onLibrarianError = function(msg) {
    log("Librarian error! " + msg);
    alert("Librarian error! " + msg);
};

var execute = function(mode, path, args, onSuccess) {
    log("Invoking librarian with mode " + mode + " ...");
    Librarian.createEvent(mode, path, args, onSuccess, onLibrarianError);
    log("Invoking librarian with mode " + mode + " ... done");
};

var printItem = function(item) {
    var s = "";
    s += "== == == ==<br/>"
    s += "id: " + item["id"] + "<br/>";
    s += "absolutePath: " + item["absolutePath"] + "<br/>"; 
    s += "relativePath: " + item["relativePath"] + "<br/>"; 
    s += "absolutePathThumbnail: " + item["absolutePathThumbnail"] + "<br/>"; 
    s += "relativePathThumbnail: " + item["relativePathThumbnail"] + "<br/>"; 
    s += "mainFormat: " + item["mainFormat"] + "<br/>"; 
    
    s += "+ format name: " + item["formats"]["epub"]["name"] + "<br/>";
    s += "+ format version: " + item["formats"]["epub"]["version"] + "<br/>";
    s += "+ format metadata: " + "<br/>";
    s += "+ + internalPathCover: " + item["formats"]["epub"]["metadata"]["internalPathCover"] + "<br/>";
    s += "+ + relativePathThumbnail: " + item["formats"]["epub"]["metadata"]["relativePathThumbnail"] + "<br/>";
    s += "+ + author: " + item["formats"]["epub"]["metadata"]["author"] + "<br/>";
    s += "+ + title: " + item["formats"]["epub"]["metadata"]["title"] + "<br/>";
    s += "+ + language: " + item["formats"]["epub"]["metadata"]["language"] + "<br/>";
    s += "+ + duration: " + item["formats"]["epub"]["metadata"]["duration"] + "<br/>";
    s += "+ + narrator: " + item["formats"]["epub"]["metadata"]["narrator"] + "<br/>";
    
    s += "title: " + item["title"] + "<br/>"; 
    s += "size: " + item["size"] + "<br/>"; 
    s += "isSingleFile: " + item["isSingleFile"] + "<br/>"; 
    s += "isValid: " + item["isValid"] + "<br/>"; 
    s += "== == == ==<br/><br/><br/>"
    log(s);
};

var onClickCreateT = function() {
    var path = document.getElementById('inpPath').value;
    log(path);
    var th_path = path + ".thumbnails/";
    log(th_path);
    var onSuccess = function(msg) { log("Success: " + msg); };
    var mode = 'createThumbnailDirectory';
    var args = JSON.stringify({
        'thumbnailDirectory':   th_path,
    });
    execute(mode, '', args, onSuccess);
};

var onClickEmptyT = function() {
    var path = document.getElementById('inpPath').value;
    log(path);
    var th_path = path + ".thumbnails/";
    log(th_path);
    var onSuccess = function(msg) { log("Success: " + msg); };
    var mode = 'emptyThumbnailDirectory';
    var args = JSON.stringify({
        'thumbnailDirectory':   th_path,
    });
    execute(mode, '', args, onSuccess);
};

var onClickScanF = function() {
    var path = document.getElementById('inpPath').value;
    log(path);
    var th_path = path + ".thumbnails/";
    log(th_path);
    var onSuccess = function(msg) {
        log("=== === === === === === === === ===");
        log(msg);
        log("=== === === === === === === === ===");
        var obj = JSON.parse(msg);
        var arr = obj.publications.items;
        if (arr.length > 0) { 
            for (var i = 0; i < arr.length; i++) {
                printItem(arr[i]);
            }
        }
    };
    var mode = 'full';
    var args = JSON.stringify({
        'entireVolume':         false,
        'paths':                [ path ], 
        'recursive':            true,
        'ignoreHidden':         true,
        'thumbnailDirectory':   th_path,
        'thumbnailWidth':       150,
        'thumbnailHeight':      200,
        'formats':              { 'epub': ['.epub', '.epub.zip'] }
    });
    execute(mode, '', args, onSuccess);
};

var onClickScanS = function() {
    var path = document.getElementById('inpPath').value
    log(path);
    var th_path = path + ".thumbnails/";
    log(th_path);
    var single_path = path + document.getElementById('inpSingle').value;
    log(single_path);
    var onSuccess = function(msg) {
        log("=== === === === === === === === ===");
        log(msg);
        log("=== === === === === === === === ===");
        var obj = JSON.parse(msg);
        var arr = obj.publications.items;
        if (arr.length > 0) { 
            for (var i = 0; i < arr.length; i++) {
                printItem(arr[i]);
            }
        }
    };
    var mode = 'single';
    var args = JSON.stringify({
        'format':               "epub",
        'thumbnailDirectory':   th_path,
        'thumbnailWidth':       150,
        'thumbnailHeight':      200,
    });
    execute(mode, single_path, args, onSuccess);
};

var onClickClear = function() {
    document.getElementById('txtInfo').innerHTML = "";
};

var log = function(msg) {
    document.getElementById('txtInfo').innerHTML = msg + "<br/>" + document.getElementById('txtInfo').innerHTML;
};

document.addEventListener('deviceready', onDeviceReady, false);
//onDeviceReady();
