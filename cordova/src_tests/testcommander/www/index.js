var onDeviceReady = function() {
    log("deviceready...");
    document.getElementById('btnFSInfo').addEventListener('click', onClickFSInfo, false); 
    document.getElementById('btnListSub').addEventListener('click', onClickListSub, false); 
    
    document.getElementById('btnCheckFE').addEventListener('click', onClickCheckFE, false); 
    document.getElementById('btnDelRel').addEventListener('click', onClickDelRel, false); 
    document.getElementById('btnDelAbs').addEventListener('click', onClickDelAbs, false); 
    document.getElementById('btnCopy').addEventListener('click', onClickCopy, false); 
    document.getElementById('btnMove').addEventListener('click', onClickMove, false); 
    document.getElementById('btnWrite').addEventListener('click', onClickWrite, false); 
    document.getElementById('btnCopyWWW').addEventListener('click', onClickCopyWWW, false); 

    document.getElementById('btnToast').addEventListener('click', onClickToast, false); 
    document.getElementById('btnDim').addEventListener('click', onClickDim, false); 
    document.getElementById('btnUndim').addEventListener('click', onClickUndim, false); 
    document.getElementById('btnSetBr').addEventListener('click', onClickSetBr, false); 
    document.getElementById('btnGetBr').addEventListener('click', onClickGetBr, false); 
    document.getElementById('btnOrientA').addEventListener('click', onClickOrientA, false); 
    document.getElementById('btnOrientL').addEventListener('click', onClickOrientL, false); 
    document.getElementById('btnOrientP').addEventListener('click', onClickOrientP, false); 
    document.getElementById('btnOpenURL').addEventListener('click', onClickOpenURL, false); 
    document.getElementById('btnClear').addEventListener('click', onClickClear, false);
    log("deviceready... OK");
};

var onCommanderError = function(msg) {
    log("Commander error! " + msg);
    alert("Commander error! " + msg);
};

var execute = function(command, parameters, onSuccess) {
    log("Invoking commander with command " + command + " ...");
    Commander.createEvent(command, parameters, onSuccess, onCommanderError);
    log("Invoking commander with command " + command + " ... done");
};

var onClickCheckFE = function() {
    var value = document.getElementById('inpPath').value;
    log(value);
    var onSuccess  = function(msg) { log("Success: " + msg); };
    var command = 'checkFileExists';
    var parameters = JSON.stringify({ 'path': value });
    execute(command, parameters, onSuccess);
};

var onClickDelRel = function() {
    var value = document.getElementById('inpPath').value;
    log(value);
    var onSuccess  = function(msg) { log("Success: " + msg); };
    var command = 'deleteRelative';
    var parameters = JSON.stringify({ 'path': value });
    execute(command, parameters, onSuccess);
};

var onClickDelAbs = function() {
    var value = document.getElementById('inpPath').value;
    log(value);
    var onSuccess  = function(msg) { log("Success: " + msg); };
    var command = 'deleteAbsolute';
    var parameters = JSON.stringify({ 'path': value });
    execute(command, parameters, onSuccess);
};

var onClickCopy = function() {
    var value = document.getElementById('inpPath').value;
    log(value);
    var dest = document.getElementById('inpDest').value;
    log(dest);
    var onSuccess  = function(msg) { log("Success: " + msg); };
    var command = 'copy';
    var parameters = JSON.stringify({ 'source': value, 'destination': dest });
    execute(command, parameters, onSuccess);
};

var onClickMove = function() {
    var value = document.getElementById('inpPath').value;
    log(value);
    var dest = document.getElementById('inpDest').value;
    log(dest);
    var onSuccess  = function(msg) { log("Success: " + msg); };
    var command = 'move';
    var parameters = JSON.stringify({ 'source': value, 'destination': dest });
    execute(command, parameters, onSuccess);
};

var onClickWrite = function() {
    var value = document.getElementById('inpPath').value;
    log(value);
    var dest = document.getElementById('inpDest').value;
    log(dest);
    var onSuccess  = function(msg) { log("Success: " + msg); };
    var command = 'writeToFile';
    var parameters = JSON.stringify({ 'string': value, 'destination': dest });
    execute(command, parameters, onSuccess);
};

var onClickCopyWWW = function() {
    var value = "ebooks/dummy.txt";
    log(value);
    var dest = document.getElementById('inpDest').value;
    log(dest);
    var onSuccess  = function(msg) { log("Success: " + msg); };
    var command = 'copyFromAssetsWWW';
    var parameters = JSON.stringify({ 'source': value, 'destination': dest });
    execute(command, parameters, onSuccess);
};

var onClickOpenURL = function() {
    var value = document.getElementById('inpURL').value;
    log(value);
    var onSuccess  = function(msg) { log("Open external URL success"); };
    var command = 'openExternalURL';
    var parameters = JSON.stringify({ 'url': value });
    execute(command, parameters, onSuccess);
};

var onClickOrientA = function() {
    var onSuccess  = function(msg) { log("Set orientation auto success"); };
    var command = 'orient';
    var parameters = JSON.stringify({ 'value': 'auto' });
    execute(command, parameters, onSuccess);
};

var onClickOrientL = function() {
    var onSuccess  = function(msg) { log("Set orientation landscape success"); };
    var command = 'orient';
    var parameters = JSON.stringify({ 'value': 'landscape' });
    execute(command, parameters, onSuccess);
};

var onClickOrientP = function() {
    var onSuccess  = function(msg) { log("Set orientation portrait success"); };
    var command = 'orient';
    var parameters = JSON.stringify({ 'value': 'portrait' });
    execute(command, parameters, onSuccess);
};

var onClickSetBr = function() {
    var value = document.getElementById('inpBr').value;
    var onSuccess  = function(msg) { log("Set brightness success"); };
    var command = 'setbrightness';
    var parameters = JSON.stringify({ 'value': value });
    execute(command, parameters, onSuccess);
};

var onClickGetBr = function() {
    var onSuccess  = function(msg) { log(msg); };
    var command = 'getbrightness';
    var parameters = JSON.stringify({});
    execute(command, parameters, onSuccess);
};

var onClickDim = function() {
    var onSuccess  = function(msg) { log("Dim success"); };
    var command = 'dim';
    var parameters = JSON.stringify({ 'dim': true });
    execute(command, parameters, onSuccess);
};

var onClickUndim = function() {
    var onSuccess  = function(msg) { log("Undim success"); };
    var command = 'dim';
    var parameters = JSON.stringify({ 'dim': false });
    execute(command, parameters, onSuccess);
};

var onClickToast = function() {
    var msg = document.getElementById('inpMsg').value;
    log("Toasting: " + msg);
    var onSuccess  = function(msg) { log("Toast success"); };
    var command = 'toast';
    var parameters = JSON.stringify({ 'message': msg });
    execute(command, parameters, onSuccess);
};

var onClickFSInfo = function() {
    var onSuccess  = function(msg) {
        var jsonObject = JSON.parse(msg);
        log("externalStorage: "       + jsonObject['root']);
        log("fileSeparator:"          + jsonObject['separator']);
        log("iOSDocumentsDirectory: " + jsonObject['documentsDir']);
        log("iOSCacheDirectory: "     + jsonObject['cacheDir']);
        log("storageRoots:"           + jsonObject['storageRoots']);
    };
    var command    = 'filesystemInfo';
    var parameters = JSON.stringify({});
    execute(command, parameters, onSuccess);
};


var onClickListSub = function() {
    //log(document.getElementById('inpPath').value);
    var onSuccess  = function(msg) {
        var storageDirectories = JSON.parse(msg);
        var map                = [];
        var roots              = Object.keys(storageDirectories).sort();
        var k                  = 0;
        for (var i = 0; i < roots.length; i++) {
            var root = roots[i];
            var info = storageDirectories[root];
            if (info) {
                var internal = info['internal'];
                var dirs     = info['subdirectories'];
                if (dirs.length > 0) {
                    for (var j = 0; j < dirs.length; j++) {
                        var path = dirs[j];
                        log("root: " + root + " internal: " + internal + " path: " + path);
                    }
                }
            }
        }
    };
    var command    = 'listSubdirectories';
    var parameters = JSON.stringify({ 'recursive': false, 'ignoreHidden': true });
    execute(command, parameters, onSuccess);
};

var onClickClear = function() {
    document.getElementById('txtInfo').innerHTML = "";
};

var log = function(msg) {
    document.getElementById('txtInfo').innerHTML = msg + "<br/>" + document.getElementById('txtInfo').innerHTML;
};

document.addEventListener('deviceready', onDeviceReady, false);
//onDeviceReady();
