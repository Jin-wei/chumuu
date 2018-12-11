Database deployment

1. Run db upgrade [version].up.sql through mysql client
You can find latest version in 'db_upgrade' table in mysql
Make sure MySql is connected to the server as specified in /home/ec2-user/bizwise/src/lib/config/SystemConfig.js

Code deployment

1. Connect a terminal client to EC2 of STG or Prod
ssh -i KEYFILENAME ec2-user@stg.tru-menu.com  (Mac/Linux)
use putty for Windows 

2. change dictionary to tru-menu folder: [cd /mnt/my-data/tru-menu]

3. run script: [./deployment_new.sh] , then enter github username & password, that is all.
for more parameters of shell, run [./deployment_new.sh -h], you will get:

------------------------------------------------------------------
    Last Modified: 2015-02-05

    Parameters:

    -b,--branch: (optional,value madantory [branch name])
        example: *.sh -b order

    -n,--npm: (optional,no value [indicated run npm install. default value is empty])
        example: *.sh -n

    -g,--grunt: (optional,value madantory [1:run grunt,0:do not grunt])
        example: *.sh -g 0

    -r,--restart: (optional,value madantory [1:restart forever nodejs,0:do not restart])
        example: *.sh -r 0

    Full Example: *.sh -b order -n -g 0 -r 1
------------------------------------------------------------------
