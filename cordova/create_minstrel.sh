#!/bin/bash

SRC="src_minstrel"
ID="it.readbeyond.minstrel"
NAME="Minstrel"
DIR="minstrel"

# DO NOT MODIFY BELOW THIS LINE
# UNLESS YOU KNOW WHAT YOU ARE DOING

PLATFORM="all"
SH_BUILD="build.sh"
SH_REINSTALL="reinstall_plugins.sh"

if [ "$#" -ge "1" ]
then
    PLATFORM="$1"
    if [ "$PLATFORM" != "android" ] && [ "$PLATFORM" != "ios" ]
    then
        echo "[ERRO] Unrecognized platform: $PLATFORM"
        echo "[INFO] Usage: $ bash $0 [android|ios]"
        exit 1
    fi
fi

echo "[INFO] Removing $DIR ..."
rm -rf $DIR
echo "[INFO] Removing $DIR ... done"
    
echo "[INFO] Calling cordova create $DIR $ID $NAME ..."
cordova create "$DIR" "$ID" "$NAME"
echo "[INFO] Calling cordova create $DIR $ID $NAME ... done"

echo "[INFO] Removing $DIR/config.xml ..."
rm -f "$DIR/config.xml"
echo "[INFO] Removing $DIR/config.xml ... done"

echo "[INFO] Removing $DIR/hooks ..."
rm -rf "$DIR/hooks"
echo "[INFO] Removing $DIR/hooks ... done"

echo "[INFO] Removing $DIR/www ..."
rm -rf "$DIR/www"
echo "[INFO] Removing $DIR/www ... done"

echo "[INFO] Creating sym links into $DIR ..."
ln -s "../$SRC/config.xml" "$DIR/config.xml"
ln -s "../$SRC/hooks" "$DIR/hooks"
ln -s "../$SRC/res" "$DIR/res"
ln -s "../$SRC/static" "$DIR/static"
ln -s "../$SRC/www" "$DIR/www"
ln -s "../$SRC/$SH_BUILD" "$DIR/$SH_BUILD"
ln -s "../$SRC/$SH_REINSTALL" "$DIR/$SH_REINSTALL"
echo "[INFO] Creating sym links into $DIR ... done"

if [ "$PLATFORM" == "all" ] || [ "$PLATFORM" == "android" ]
then
    echo "[INFO] Calling cordova platform add android ..."
    cd $DIR
    cordova platform add android
    cd ..    
    echo "[INFO] Calling cordova platform add android ... done"
fi

if [ "$PLATFORM" == "all" ] || [ "$PLATFORM" == "ios" ]
then
    echo "[INFO] Calling cordova platform add ios ..."
    cd $DIR
    cordova platform add ios
    cd ..
    echo "[INFO] Calling cordova platform add ios ... done"
fi

echo "[INFO] Reinstalling plugins ..."
cd $DIR
bash $SH_REINSTALL
cd .. 
echo "[INFO] Reinstalling plugins ... done"

exit 0

