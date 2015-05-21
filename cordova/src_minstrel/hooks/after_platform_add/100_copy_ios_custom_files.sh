#!/bin/bash

ROOT_DIR=$1
DST_PLAT="$1/platforms/ios"

SRC_FILE_1="$1/static/ios/AppDelegate.m"
DST_FILE_1="$1/platforms/ios/Minstrel/Classes/AppDelegate.m"

SRC_FILE_2="$1/static/ios/MainViewController.h"
DST_FILE_2="$1/platforms/ios/Minstrel/Classes/MainViewController.h"

SRC_FILE_3="$1/static/ios/MainViewController.m"
DST_FILE_3="$1/platforms/ios/Minstrel/Classes/MainViewController.m"

SRC_FILE_4="$1/static/ios/Minstrel-Info.plist"
DST_FILE_4="$1/platforms/ios/Minstrel/Minstrel-Info.plist"

echo "[INFO] Root dir is $ROOT_DIR ..."

if [ -e "$DST_PLAT" ]
then
    echo "[INFO] Copying $SRC_FILE_1 into $DST_FILE_1 ..."
    cp $SRC_FILE_1 $DST_FILE_1
    echo "[INFO] Copying $SRC_FILE_1 into $DST_FILE_1 ... done"
    
    echo "[INFO] Copying $SRC_FILE_2 into $DST_FILE_2 ..."
    cp $SRC_FILE_2 $DST_FILE_2
    echo "[INFO] Copying $SRC_FILE_2 into $DST_FILE_2 ... done"
    
    echo "[INFO] Copying $SRC_FILE_3 into $DST_FILE_3 ..."
    cp $SRC_FILE_3 $DST_FILE_3
    echo "[INFO] Copying $SRC_FILE_3 into $DST_FILE_3 ... done"
    
    echo "[INFO] Copying $SRC_FILE_4 into $DST_FILE_4 ..."
    cp $SRC_FILE_4 $DST_FILE_4
    echo "[INFO] Copying $SRC_FILE_4 into $DST_FILE_4 ... done"
fi

exit 0
