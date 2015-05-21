#!/bin/bash

function create_test {
    PLUGIN=$1
    SRC_TESTS="src_tests"
    SH_BUILD="build.sh"
    SH_REINSTALL="reinstall_plugin.sh"

    # PLUGIN
    SRC="$SRC_TESTS/test$PLUGIN"
    ID="it.readbeyond.test$PLUGIN"
    NAME="Test$PLUGIN"
    DIR="test$PLUGIN"

    echo "  [INFO] Removing $DIR ..."
    rm -rf $DIR
    echo "  [INFO] Removing $DIR ... done"
    
    echo "  [INFO] Calling cordova create $DIR $ID $NAME ..."
    cordova create "$DIR" "$ID" "$NAME"
    echo "  [INFO] Calling cordova create $DIR $ID $NAME ... done"
    
    echo "  [INFO] Removing $DIR/www ..."
    rm -rf "$DIR/www"
    echo "  [INFO] Removing $DIR/www ... done"


    echo "  [INFO] Creating sym links into $DIR/www ..."
    ln -s "../$SRC/www" "$DIR/www"
    ln -s "../$SRC/$SH_BUILD" "$DIR/$SH_BUILD"
    ln -s "../$SRC/$SH_REINSTALL" "$DIR/$SH_REINSTALL"
    echo "  [INFO] Creating sym links into $DIR/www ... done"
    
    echo "  [INFO] Calling cordova platform add android ..."
    cd $DIR
    cordova platform add android
    bash $SH_REINSTALL
    cd ..    
    echo "  [INFO] Calling cordova platform add android ... done"
}

TESTS=(commander librarian media mediarb unzipper)
ARG=$1

if [ "$ARG" == "all" ]
then
    echo "[INFO] Creating all tests ..."
    for i in ${TESTS[@]}
    do
        echo "[INFO] Creating test $i ..."
        create_test $i
        echo "[INFO] Creating test $i ... done"
    done
    echo "[INFO] Creating all tests ... done"

    exit 0
fi

for i in ${TESTS[@]}
do
    if [ "$ARG" == "$i" ]
    then
        echo "[INFO] Creating test $i ..."
        create_test $i
        echo "[INFO] Creating test $i ... done"
        exit 0
    fi
done

echo "[ERRO] Unrecognized plugin: $ARG"
echo "[INFO] Usage: $ bash $0 [all|commander|librarian|media|mediarb|unzipper]"
exit 1

