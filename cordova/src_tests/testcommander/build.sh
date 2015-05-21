#!/bin/bash

APK="platforms/android/build/outputs/apk/android-debug.apk"
DEST="/tmp/testcommander.apk"

echo "[INFO] Reinstalling plugin from ../src/ ..."
bash reinstall_plugin.sh
echo "[INFO] Reinstalling plugin from ../src/ ... done"

echo "[INFO] Building APK..."
cordova build android
echo "[INFO] Building APK... done"

if [ -e $APK ]
then
    cp "$APK" "$DEST"
    echo "[INFO] Copied into $DEST"
else
    echo "[ERRO] Error: APK was not generated"
fi


