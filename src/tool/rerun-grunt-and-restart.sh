#!/bin/sh


cd bizwise
if [ -d dist_tmp ]; then
    rm -r dist_tmp
fi

cd src
if [ -f err.log ]; then
    rm -r err.log
fi
if [ -f out.log ]; then
    rm -r out.log
fi

cd ..

#re-create dist folder
cp -r src dist_tmp
cd dist_tmp

grunt
grunt --gruntfile BizGruntfile.js
grunt --gruntfile CustLoginGruntfile.js
grunt --gruntfile BizLoginGruntfile.js

cd ..

sudo forever stop main.js
if [ -d dist ]; then
    rm -r dist
fi

mv dist_tmp dist
cd dist
sudo forever start -a -o out.log -e err.log main.js

#If error occurs output the error information
if [ -s err.log ]; then
	more err.log
fi
