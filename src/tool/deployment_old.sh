#!/bin/sh
#This script is used to complete the process of deployment

#Back up current src folder
if [ -d /home/ec2-user/backup/src_bk ]; then
	rm -r /home/ec2-user/backup/src_bk
fi
cp -r /home/ec2-user/bizwise/src /home/ec2-user/backup/src_bk

#Pull latest code from git, and output current git version, then save the version number into current_git_version.txt
cd /home/ec2-user/bizwise

if [ !$1 ]; then
	git checkout master
fi
if [ $1 ]; then
	git checkout $1
fi

git pull

if [ -f /home/ec2-user/current_git_version.txt ]; then
	rm /home/ec2-user/current_git_version.txt
fi
git log -1 --format="%H">>/home/ec2-user/current_git_version.txt

#Update Node.JS Install package

#Stop Server
forever stop main.js

#Back up forever.log err.log out.log
if [ -f /home/ec2-user/.forever/forever.log ]; then
	mv /home/ec2-user/.forever/forever.log /home/ec2-user/backup/forever_log_bk/forever-"$(date +%m-%d-%Y_%H-%M)"
else
	echo "forever.log not exist!"
fi

if [ -d dist ]; then
    cd dist
else
    cd src
fi

if [ -f err.log ]; then
    mv err.log /home/ec2-user/backup/err_log_bk/err-"$(date +%m-%d-%Y_%H-%M)"
else
    echo "err.log not exist!"
fi

if [ -f out.log ]; then
    mv out.log /home/ec2-user/backup/out_log_bk/out-"$(date +%m-%d-%Y_%H-%M)"
else
    echo "out.log not exist!"
fi

cd ..

if [ -d dist ]; then
    rm -r dist
fi

cd src
if [ -f err.log ]; then
    rm err.log
fi
if [ -f out.log ]; then
    rm out.log
fi
npm install
cd ..

#re-create dist folder
cp -r src dist
cd dist
grunt
grunt --gruntfile BizGruntfile.js
grunt --gruntfile CustLoginGruntfile.js
grunt --gruntfile BizLoginGruntfile.js

#Restart Server
forever start -a -o out.log -e err.log main.js

#If error occurs output the error information
if [ -s err.log ]; then
	more err.log
fi
