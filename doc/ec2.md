AWS EC2 Setup
=============
# Connect to EC2 Instance:  
* Open an SSH client. (find out how to connect using PuTTY)  
* Locate your private key file (mpinc.pem). The wizard automatically detects the key you used to launch the instance.  
* Your key must not be publicly viewable for SSH to work. Use this command if needed: chmod 400 mpinc.pem  
* Connect to your instance using its Public IP:  

# Install node on EC2 AMIS:  
## Option 1: download package and install  
* Upgrade python version on EC2 AMIS from 2.6 to 2.7:  
$ sudo yum install python27  
$ sudo rm /usr/bin/python  
$ sudo ln -s /usr/bin/python2.7 /usr/bin/python  
$ sudo vi /usr/bin/yum update the first line in this file to: #!/usr/bin/python2.6  
* Get Node package (now includes npm!)  
$ wget -c http://nodejs.org/dist/v0.10.28/node-v0.10.28-linux-x64.tar.gz  
$ tar -zxvf  node-v0.10.28-linux-x64.tar.gz  
$ sudo vi .bash_profile (from home directory) 
     PATH=$PATH:$HOME/bin:/home/ec2-user/ode-v0.10.28-linux-x64/bin 
$ sudo source .bash_profile (from home directory, simply type cd)
$ sudo vi /etc/sudoers  
    secure_path = /sbin:/bin:/usr/sbin:/usr/bin:/usr/local/bin:/home/ec2-user/node-v0.10.28-linux-x64/bin  
* Install additional packages  
$ sudo npm install forever -g  


## Option 2: Build from the source  
1. http://iconof.com/blog/how-to-install-setup-node-js-on-amazon-aws-ec2-complete-guide/
* Upgrade python version on EC2 AMIS from 2.6 to 2.7:  
$ sudo yum install python27  
$ sudo rm /usr/bin/python  
$ sudo ln -s /usr/bin/python2.7 /usr/bin/python  
$ sudo vi /usr/bin/yum update the first line in this file to: #!/usr/bin/python2.6  

* Install forever Set forever env parameter on EC2 AMIS:  
$ sudo ln -s /usr/local/bin/node /usr/bin/node  
$ sudo ln -s /usr/local/lib/node /usr/lib/node  
$ sudo ln -s /usr/local/bin/npm /usr/bin/npm  
$ sudo ln -s /usr/local/bin/node-waf /usr/bin/node-waf  
$ sudo npm install forever -g  


# Update mysql to 5.6  
## Option 1: download package and install  
1. Download 5.6  rpm file from mysql.com  
$ wget –c http://dev.mysql.com/get/Downloads/MySQL-5.6/MySQL-server-5.6.17-1.rhel5.x86_64.rpm/from/http://cdn.mysql.com  
2. Uninstall mysql 5.5 from ec2 linux    
$ sudo rpm -qa|grep -i mysql  
$ sudo rpm -e mysql55-server-5.5.36-1.44.amzn1.x86_64    
$ sudo rpm -e  mysql55-5.5.36-1.44.amzn1.x86_64   
$ Install mysql 5.6 rpm file  
$ sudo rpm -ivh cdn.mysql.com  
$ Start mysql service  
$ sudo service mysql start  

## Option 2: download package and install  
* Use RDS from Amazon to create a MySql 5.6 instance  
* Application Server running on different instance and point to DB instance  

# Native pdf library set up  
* Download and install package from this link
https://code.google.com/p/wkhtmltopdf/downloads/list?can=1
* On OS X, use version 0.10. 
* On Ubuntu, use version 0.9.9 32 or 64 bit. Don't try to use the version installed via apt-get because it is missing features and requires and X server.  
* Question: what about Amazon Linux?
* https://code.google.com/p/wkhtmltopdf/downloads/detail?name=wkhtmltopdf-0.9.9-static-amd64.tar.bz2&can=1&q=0.9.9


# Install Mongodb  
* Follow the following instructions
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-red-hat-centos-or-fedora-linux/  
Create a /etc/yum.repos.d/mongodb.repo file  
$ vi /etc/yum.repos.d/mongodb.repo  
[mongodb]
name=MongoDB Repository
baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64/
gpgcheck=0
enabled=1  
$ sudo yum install mongodb-org  
$ sudo service mongod start  
$ more /var/log/mongodb/mongod.log (verify)  

# Native Image library set up  
* Follow this installation guide  
http://www.imagemagick.org/  to install imagemagick on the machine, it is needed for upload images.  
* Download the package from http://www.imagemagick.org/script/binary-releases.php#unix  
$  wget -c http://www.imagemagick.org/download/linux/CentOS/x86_64/ImageMagick-6.8.9-2.x86_64.rpm  
* Install from package does not work!!!  

* Install from source: http://www.imagemagick.org/script/install-source.php#unix  
$ wget -c http://www.imagemagick.org/download/ImageMagick.tar.gz  
$ tar xvzf ImageMagick.tar.gz  
$ cd ImageMagick-6.8.9  
$ ./configure  
$ make  

* Install  
$ sudo make install  
$ sudo ldconfig /usr/local/lib  
$ /usr/local/bin/convert logo: logo.gif (verify the ImageMagick install)  
$ cd
$ vi .bash_profile
  PATH=$PATH:$HOME/bin:$HOME/node-v0.10.28-linux-x64/bin:$HOME/wkhtmltox/bin:/usr/local/bin

* If ImageMagick can't convert png or jpeg ect file ,install the following lib file
1.zlib

$ wget http://www.imdong.net/uplocal/soft/zlib-1.2.8.tar.gz
$ tar -zvxf zlib-1.2.8.tar.gz
$ cd zlib-1.2.8/
$ ./configure
$ make && make install

2.freetype

$ wget http://download.savannah.gnu.org/releases/freetype/freetype-2.4.9.tar.gz
$ tar -zvxf freetype-2.4.9.tar.gz
$ cd freetype-2.4.9
$ ./configure
$ make
$ make install


3.libpng

$ wget http://www.imdong.net/uplocal/soft/libpng-1.2.50.tar.gz
$ tar -zvxf libpng-1.2.50.tar.gz
$ cd libpng-1.2.50/
$ ./configure
$ make && make install

4.jpeg

$ wget http://www.ijg.org/files/jpegsrc.v9.tar.gz
$ tar -zvxf jpegsrc.v9.tar.gz
$ cd jpeg-6b/
$ ./configure
$ make && make install



# Install nginx 
### Install package 

$ yum install pcre pcre-devel 

$ wget http://nginx.org/download/nginx-1.7.1.tar.gz 

$ targ -zxvf nginx-1.7.1.tar.gz 

$ cd nginx-1.7.1 

$ ./configure 

$ make && make install 

$ sudo /usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf 

$ sudo vi /usr/local/nginx/conf/nginx.conf 

upstream backend 
{ 
    server   localhost:8080; 
} 
 
server 
{ 
    listen   80; 
    server_name  54.183.2.38; 
    access_log  logs/host.access.log  main; 
    
    location / 
    { 
        proxy_pass http://127.0.0.1:8080/; 
        alias /web/; 
        index customer.html; 
    } 
} 

server 
{ 
    listen 80; 
    server_name biz.tru-menu.com; 
    location / 
    { 
        proxy_pass http://127.0.0.1:8080/; 
        index business.html; 
    } 
} 
 
### Deploy  
$ sudo /usr/local/nginx/sbin/nginx -s reload 
 
## godaddy configuration
Subdomain	    Forward to	               Type 
biz                        http://tru-menu.com     Forward with Masking 

Hostnames	   IP Addresses 
WWW                54.183.2.38 

A (Host)	   Points To 
	@	   54.183.2.38		
	biz	   50.63.202.24 	
 
# elastic search 
 wget -c https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.3.0.tar.gz 
 
 tar -zxvf elasticsearch-1.3.0.tar.gz 
 
 cd elasticsearch-1.3.0 
 
 git clone https://github.com/elasticsearch/elasticsearch-servicewrapper -c -client 
 
 cd elasticsearch-servicewrapper 
 
 sudo vi elasticsearch.conf 
 
    update the parameter ES_HOME ,set it elasticsearch directory path 
    
 sudo ./elasticsearch start 
 
# setenv.sh
 ./setenv.sh
 	This script restarts nginx, elasticsearch, and mongodb

# mongodb_back_up.sh
 ./mongodb_back_up.sh
 	This script backups data in mongodb under ~/backup/mongodb_bk/

# deployment.sh
 ./deployment.sh nameOfbranch
 
 	type the name of the branch after ./deploymen.sh will switch to that branch first, and do the git pull
 	
 ./deployment.sh
 
 	Only type ./deployment.sh without anything after it, system will switch to master branch, and do the git pull
 	
 Also, this script backups source code under ~/backup/src_bk as well as erorr.log, forever.log and out.log under ~/backup/
 
# ios push pem create and install
openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
openssl pkcs12 -in key.p12 -out key.pem -nodes
copy cert.pem and key.pem to bizwise folder

# braintree setup and test account
--test credit card account
card number :4111111111111111
cvv :100
expired : 10/20
--test paypal account
test@test.com  test