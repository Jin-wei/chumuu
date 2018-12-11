#!/bin/bash
#This script is used to complete the process of deployment

git log -1 --format="%H" >> src/which_version

v_grunt=0

if [  -n "$1"  ]; then
	v_grunt=$1
fi

#re-create dist folder
rm -rf dist
cp -r src dist
cd dist
cp public/web/js/stg_system_config.js public/web/js/system_config.js
cp lib/config/stg_SystemConfig.js lib/config/SystemConfig.js

npm install

if [ "$v_grunt" -eq "1" ]; then
    grunt
    grunt --gruntfile BizGruntfile.js
    grunt --gruntfile CustLoginGruntfile.js
    grunt --gruntfile BizLoginGruntfile.js
fi

cd ..

