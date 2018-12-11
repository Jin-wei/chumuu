/*READ ME*/

/*1. RUN THIS SCRIPT BEFORE YOU RUN 'ReadOrderInfo.sql' SCRIPT
  2. Create a empty text file, and copy past data you need from excel file.*/
 
/*READ ME*/


DROP TABLE IF EXISTS `bw`.`excel_data`;

delimiter $$
CREATE TABLE `excel_data` (
	`date` varchar(50) DEFAULT NULL,
	`item_name` varchar(100) DEFAULT NULL,
	`price` decimal(10,2) DEFAULT NULL,
	`qty` double DEFAULT NULL,
	`amount` decimal(10,2) DEFAULT null,
	`percentage` decimal(5,2) DEFAULT NULL
)COMMENT = 'This is a team table to store data from excel file' $$



/*2. Edit the local directory in load command to locate your text file which stores data from excel file */

load data local infile 'D:/WorkData/South Legend China/monthly-by-item2.txt' into table excel_data fields terminated by '\t';





