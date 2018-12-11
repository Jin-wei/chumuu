Staging and Production Hosting on AWS
================================================

## Production Environment  
### a. Database  
   Cloud management: standalone DB instance using RDS (Amazon Relational Database Service). This is not installed on EC2 instance.  
   End Point Access: bw.c9erfktsehne.us-west-1.rds.amazonaws.com:3306  
   Engine: mysql (5.6.17)  
   Storage: 5GB  
   Instance Class: db.t1.micro  
   DB Name: bw  
   Publicly Accessible: Yes  
   Master Username: root  
   Password: ----ask  
### b. Application Server(s)  
   Cloud Management: EC2 instance. Based on need, we can add more servers.  
   Description: Amazon Linux AMI x86_64 PV EBS  
   Platform: Amazon Linux  
   Image Size: 8GB  
   Visibility: Public  
   Public DNS: ec2-54-183-93-247.us-west-1.compute.amazonaws.com 
   Public IP: 54.183.93.247 
   Instance type: m1.small 
### c. Load Balancer  
   DNS Name: TBD 
   Public IP: TBD  


## Staging Environment  
App Server: 
   Public DNS: ec2-54-183-2-38.us-west-1.compute.amazonaws.com 
   Public IP: 54.183.2.38 

RDS: 
   Hostname: bw.ca1khqs4nesh.us-west-1.rds.amazonaws.com:3306 
   User name: root 
   password: ask 
   
   

