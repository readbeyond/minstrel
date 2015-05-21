#!/bin/bash

DEST=/tmp/minstrel-debug.apk

echo "[INFO] Building APK..."
cordova build android
echo "[INFO] Building APK... done"
cp "platforms/android/build/outputs/apk/android-debug.apk" "$DEST"
echo "[INFO] Copied APK to $DEST"

