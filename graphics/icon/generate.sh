#!/bin/bash

ICON_ANDROID="icon_android.png"
ICON_IOS="icon_ios.png"

# android
rm -rf android/
mkdir android
convert $ICON_ANDROID   -resize 96x96   "android/xhdpi.png"
convert $ICON_ANDROID   -resize 72x72   "android/hdpi.png"
convert $ICON_ANDROID   -resize 48x48   "android/mdpi.png"
convert $ICON_ANDROID   -resize 36x36   "android/ldpi.png"
cp      $ICON_ANDROID                   "android/icon.png"

# ios
rm -rf ios/
mkdir ios
convert $ICON_IOS       -resize 180x180 "ios/icon-60@3x.png"
convert $ICON_IOS       -resize 60x60   "ios/icon-60.png"
convert $ICON_IOS       -resize 120x120 "ios/icon-60@2x.png"
convert $ICON_IOS       -resize 76x76   "ios/icon-76.png"
convert $ICON_IOS       -resize 152x152 "ios/icon-76@2x.png"
convert $ICON_IOS       -resize 40x40   "ios/icon-40.png"
convert $ICON_IOS       -resize 80x80   "ios/icon-40@2x.png"
convert $ICON_IOS       -resize 57x57   "ios/icon.png"
convert $ICON_IOS       -resize 114x114 "ios/icon@2x.png"
convert $ICON_IOS       -resize 72x72   "ios/icon-72.png"
convert $ICON_IOS       -resize 144x144 "ios/icon-72@2x.png"
convert $ICON_IOS       -resize 29x29   "ios/icon-small.png"
convert $ICON_IOS       -resize 58x58   "ios/icon-small@2x.png"
convert $ICON_IOS       -resize 50x50   "ios/icon-50.png"
convert $ICON_IOS       -resize 100x100 "ios/icon-50@2x.png"

