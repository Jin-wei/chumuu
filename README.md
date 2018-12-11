This is a node.js project

Database set up

1. Download and install latest mysql database

2. Login mysql as root user

3. run script CreateSchema.sql

4. run script CreateTables.sql

5. populate test data by running script PopulateTestData.sql 

Resource Database set up

1. Download and install latest mongo db
2. Start mongod

Native Image library set up

1. Follow this installation guide in http://www.imagemagick.org/  to install imagemagick on the machine, it is needed for upload images.

Native pdf library set up

1. It is used for pdf generatation.  
Download and install package from this link  
https://wkhtmltopdf.org/downloads.html

On OS X, use version 0.10.


On Ubuntu:

Download: wkhtmltox-0.12.2.1_linux-precise-amd64.deb

Install: dpkg -i wkhtmltox-0.12.2.1_linux-precise-amd64.deb

Add Chinese character support in PDF on Ubuntu:

Install font: apt-get install fonts-wqy-microhei ttf-wqy-microhei fonts-wqy-zenhei ttf-wqy-zenhei

Clear font cache:fc-cache -f -v


Develop environment set up

1. Download and install node.js

2. Get the source by clone this repository.

3. go to folder src

4. Run install: sudo npm install

5. Start the server: npm start  (note: in linux you need start node as sudo node main.js)

6. API documents ( you can use any rest api client tool)

	Get a list of  all supported APIs by
	GET: http://127.0.0.1:8080/ 
	or 
	http://localhost:8080/apidoc/index.html

	APIs consume and produce JSON data if not otherwise specified.

7.Run test: npm test

---Development environment in windows set up

1.Download and install node.js
    Get: http://nodejs.org/download/

2.Download and install git
    Get:https://help.github.com/articles/set-up-git

3.Set git  window environment variable
    Add git path into system environment variables “path”
    C:\Users\ibm\AppData\Local\GitHub\PortableGit_XXXXX\bin
    C:\Users\ibm\AppData\Local\GitHub\PortableGit_XXXXX\libexec\git-core

4.Download and install Python
    Get:https://www.python.org/download/releases/2.7.6/
    Don't user the lastest version python, Nodejs only support version 2.5.X - 3.X.X
    Add Python path into system environment vairables "path"
    C:\Python27

5.Download and install Visual Studio 2012
    If your windows has been installed the lastest  ".netframework " ,you need not  install ".netframework".
    Otherwise,you must install ".netframework4" before install visual studio.
    Get:http://download.microsoft.com/download/8/1/b/81b0c41a-595f-4d5d-8c83-bb29addb265d/vs2012_winexp_chs.iso

6.Npm install
    Use the CMD program ,go to the src folder of node.js project, then execute "npm install"

7. Npm start
   Execute "npm start"

8.Start different app

node main.js -p [port] -a [biz,admin,web]

