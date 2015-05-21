#!/bin/bash

ROOT_DIR=$1
SRC_FILE="$1/static/android/MainActivity.java"
DST_PLAT="$1/platforms/android"
DST_FILE="$1/platforms/android/src/it/readbeyond/minstrel/MainActivity.java"

echo "[INFO] Root dir is $ROOT_DIR ..."

if [ -e "$DST_PLAT" ]
then
    echo "[INFO] Copying $SRC_FILE into $DST_FILE ..."
    cp $SRC_FILE $DST_FILE
    echo "[INFO] Copying $SRC_FILE into $DST_FILE ... done"
fi

exit 0
