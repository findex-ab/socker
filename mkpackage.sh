TARGET_DIR=tmp/socker

mkdir -p $TARGET_DIR 
cp ./package.json $TARGET_DIR/. 
cp ./tsconfig.json $TARGET_DIR/.
cp -r ./server $TARGET_DIR/.
cp -r ./client $TARGET_DIR/.
cp -r ./shared $TARGET_DIR/.
