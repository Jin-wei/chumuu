1. tru-menu.com aliyun server system centos 6.5 ,the ip is 182.92.220.150
Use putty to connect server without private key.
Enter the user name and password from the document.

2.Unistall mysql 5.1 and install mysql 5.6
sudo rpm -qa|grep -i mysql
sudo rpm -e mysql*

sudo rpm -ivh cdn.mysql.com
sudo vi /ect/my.cnf
set mysql enviroment config
service mysql start
##### mysql client connect user is same to ec2

3.install mongodb
the install step is same to ec2

4.start mongodb
cd /root/mongodb/mongodb-2.6.4/bin
./mongod --dbpath=../../mongodata --logpath=../../mongolog/mongodb.log

5.elasticsearch install and start
the step is same to ec2


6.node ,npm and forever install
the step is same to ec2

7.ImageMagick install
Download the lastest file from imagemagick server http://www.imagemagick.org/
install zlibjpeg, zlibpng,and proc etc refer to ec2.md

8.Nginx install and start
The step is same to ec2

9.get all code from github
cd /root/source/bizwise
git pull
###### please use your username and password in github

10.check the system config file
###### If the system config have improvement ,please update the files in aliyun server.
cd /root/source/bizwise/src/lib/config
sudo vi SystemConfig.js

cd /root/source/bizwise/src/public/web/js
sudo vi system_config.js
#######################################

10.start main.js with forever

cd /root/source/bizwise/src
forever start  -a  -o out.log -e err.log main.js
