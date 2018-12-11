#!/bin/sh
#This script is used to complete the process of deployment

CREATE_ON="2015-02-05"
LAST_MODIFY="2015-03-04"

v_branch="master"
v_npm=0
v_grunt=1
v_restart=1

while [ -n "$1" ]
do
case "$1" in 
    -b|--branch) #branch
        if [ -n "$2" ]; then
            v_branch=$2
            shift
        else
            echo 'No branch indicated'
            exit -1
        fi
        ;;
    -n|--npm) #npm install
        v_npm=1
        ;;
    -g|--grunt) #run grunt
        if [ -n "$2" ]; then
            v_grunt=$2
            shift
        else
            echo 'No param indicated for grunt'
            exit -1
        fi
        ;;
    -r|--restart) #restart forever nodejs
        if [ -n "$2" ]; then
            v_restart=$2
            shift
        else
            echo 'No param indicated for restart'
            exit -1
        fi
        ;;
    -h|--help) #show help
        echo -e "\nLast Modify: $LAST_MODIFY\n"
        echo -e "Parameters:\n"
        echo -e "-b,--branch: (optional,value madantory [branch name])"
        echo -e "\texample: *.sh -b order\n"
        echo -e "-n,--npm: (optional,no value [indicated run npm install. default value is empty])"
        echo -e "\texample: *.sh -n\n"
        echo -e "-g,--grunt: (optional,value madantory [1:run grunt,0:do not grunt])"
        echo -e "\texample: *.sh -g 0\n"
        echo -e "-r,--restart: (optional,value madantory [1:restart forever nodejs,0:do not restart])"
        echo -e "\texample: *.sh -r 0\n"
        echo -e "Full Example: *.sh -b order -n -g 0 -r 1\n"
        exit -1
        ;;
esac
shift
done

#current pwd should be :  cd /mnt/my-data/tru-menu
if [ ! -d ../backup ]; then
    sudo mkdir ../backup
fi
if [ ! -d ../backup/err_log_bk ]; then
    sudo mkdir ../backup/err_log_bk
fi
if [ ! -d ../backup/out_log_bk ]; then
    sudo mkdir ../backup/out_log_bk
fi

#Back up current src folder
if [ -d ../backup/bizwise_src_bk ]; then
	sudo rm -r ../backup/bizwise_src_bk
fi
sudo cp -r ./bizwise/src ../backup/bizwise_src_bk

#Pull latest code from git, and output current git version, then save the version number into current_git_version.txt
cd bizwise

sudo git checkout $v_branch
sudo git pull

if [ -f ../current_git_version.txt ]; then
    #empty file
	> ../current_git_version.txt
else
    sudo touch ../current_git_version.txt
    sudo chmod 777 ../current_git_version.txt
fi
sudo git log -1 --format="%H">>../current_git_version.txt


if [ -d dist ]; then
    cd dist
else
    cd src
fi

pwd
if [ -f err.log ]; then
    sudo mv err.log ../../../backup/err_log_bk/err-"$(date +%m-%d-%Y_%H-%M)".log
else
    echo "err.log not exist!"
fi

if [ -f out.log ]; then
    sudo mv out.log ../../../backup/out_log_bk/out-"$(date +%m-%d-%Y_%H-%M)".log
else
    echo "out.log not exist!"
fi

cd ..

cd src
if [ -f err.log ]; then
    sudo rm err.log
fi
if [ -f out.log ]; then
    sudo rm out.log
fi

if [ "$v_npm" -eq "1" ]; then
    npm install
fi

cd ..

#re-create dist folder
sudo cp -r src dist_tmp
cd dist_tmp


if [ "$v_grunt" -eq "1" ]; then
    sudo grunt
    sudo grunt --gruntfile BizGruntfile.js
    sudo grunt --gruntfile CustLoginGruntfile.js
    sudo grunt --gruntfile BizLoginGruntfile.js
fi

cd ..

if [ "$v_restart" -eq "1" ]; then
    #Stop Server
    sudo forever stop main.js

    if [ -d dist ]; then
        sudo rm -r dist
    fi

    sudo mv dist_tmp dist
    cd dist

    #Restart Server
    sudo forever start -a -o out.log -e err.log main.js
else
    if [ -d dist ]; then
        sudo rm -r dist
    fi

    sudo mv dist_tmp dist
    cd dist
fi

#If error occurs output the error information
if [ -s err.log ]; then
	sudo more err.log
fi
