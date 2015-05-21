var audio = null;

var speed = 1.0;

var onDeviceReady = function() {
    log("deviceready...");
    document.getElementById('btnLoad1').addEventListener('click', onClickLoad1, false); 
    document.getElementById('btnLoad2').addEventListener('click', onClickLoad2, false); 
    document.getElementById('btnPlay').addEventListener('click', onClickPlay, false); 
    document.getElementById('btnPause').addEventListener('click', onClickPause, false); 
    document.getElementById('btnStop').addEventListener('click', onClickStop, false); 
    document.getElementById('btnClear').addEventListener('click', onClickClear, false); 
    document.getElementById('btnSlower').addEventListener('click', onClickSlower, false); 
    document.getElementById('btnReset').addEventListener('click', onClickReset, false); 
    document.getElementById('btnFaster').addEventListener('click', onClickFaster, false); 
    log("deviceready... OK");
};

var load = function(mode) {
    log(document.getElementById('inpPath').value);
    var src = "file://" + document.getElementById('inpPath').value;
    log(src);
    log("Creating MediaRB with mode " + mode + " ...");
    audio = new MediaRB(src, function(){ alert("Success!"); }, function(msg){ alert("Error! " + msg); }, null, mode);
    log("Creating MediaRB... done");
    speed = 1.0;
};

var onClickLoad1 = function() {
    load("mode1");
};

var onClickLoad2 = function() {
    load("mode2");
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

var onClickSlower = function() {
    log("Pressed slower...");
    if (audio === null) {
        log("audio is null");
        return;
    }
    log("Current speed: " + speed);
    speed = speed - 0.1;
    log("New speed: " + speed);
    audio.setPlaybackSpeed(speed);
    log("Pressed slower... OK");
};

var onClickReset = function() {
    log("Pressed reset...");
    if (audio === null) {
        log("audio is null");
        return;
    }
    log("Current speed: " + speed);
    speed = 1.0;
    log("New speed: " + speed);
    audio.setPlaybackSpeed(speed);
    log("Pressed reset... OK");
};

var onClickFaster = function() {
    log("Pressed faster...");
    if (audio === null) {
        log("audio is null");
        return;
    }
    log("Current speed: " + speed);
    speed = speed + 0.1;
    log("New speed: " + speed);
    audio.setPlaybackSpeed(speed);
    log("Pressed faster... OK");
};

var onClickClear = function() {
    document.getElementById('txtInfo').innerHTML = "";
};

var log = function(msg) {
    document.getElementById('txtInfo').innerHTML = msg + "<br/>" + document.getElementById('txtInfo').innerHTML;
};

document.addEventListener('deviceready', onDeviceReady, false);
//onDeviceReady();
