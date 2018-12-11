delimiter $$
CREATE TABLE `stat_monthly_order` (
	`id` int(4) NOT NULL AUTO_INCREMENT,
	`biz_id` bigint(4) NOT NULL DEFAULT '0', 
	`product_id` bigint(4) NOT NULL DEFAULT '0',
	`month` int(4) NOT NULL,
	`year` int(4) NOT NULL,
	`year_month` int(4) NOT NULL,
	`monthly_count` int(4) DEFAULT NULL,
	PRIMARY KEY (`id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT= 'This is the table stores monthly order report'$$
insert into db_upgrade (version) values (17);