var audio = null;

var onDeviceReady = function() {
    log("deviceready...");
    document.getElementById('btnLoad').addEventListener('click', onClickLoad, false); 
    document.getElementById('btnPlay').addEventListener('click', onClickPlay, false); 
    document.getElementById('btnPause').addEventListener('click', onClickPause, false); 
    document.getElementById('btnStop').addEventListener('click', onClickStop, false); 
    document.getElementById('btnClear').addEventListener('click', onClickClear, false); 
    log("deviceready... OK");
};

var onClickLoad = function() {
    log(document.getElementById('inpPath').value);
    var src = "file://" + document.getElementById('inpPath').value;
    log(src);
    log("Creating Media...");
    audio = new Media(src, function(){ alert("Success!"); }, function(msg){ alert("Error! " + msg); }, null);
    log("Creating Media... done");
};

var onClickPlay = function() {
    log("Pressed play...");
    if (audio === null) {
        log("audio is null");
        return;
    }
    audio.play();
    log("Pressed play... OK");
};

var onClickPause = function() {
    log("Pressed pause...");
    if (audio === null) {
        log("audio is null");
        return;
    }
    audio.pause();
    log("Pressed pause... OK");
};

var onClickStop = function() {
    log("Pressed stop...");
    if (audio === null) {
        log("audio is null");
        return;
    }
    audio.stop();
    log("Pressed stop... OK");
};

var onClickClear = function() {
    document.getElementById('txtInfo').innerHTML = "";
};

var log = function(msg) {
    document.getElementById('txtInfo').innerHTML = msg + "<br/>" + document.getElementById('txtInfo').innerHTML;
};

document.addEventListener('deviceready', onDeviceReady, false);
//onDeviceReady();
