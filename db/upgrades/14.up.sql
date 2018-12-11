
delimiter $$
CREATE TABLE `product_ranking` (
	`ranking_num` int(2) NOT NULL,
	`biz_id` bigint(11) unsigned NOT NULL,
	`prod_id` bigint(11) unsigned NOT NULL,
	PRIMARY KEY (`prod_id`),
	CONSTRAINT `topten_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
	CONSTRAINT `topten_prod_id` FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT= 'This is the table to hold top 10 products among all products'$$

ALTER TABLE bw.business ADD biz_unique_name VARCHAR(200)
ALTER TABLE bw.business ADD CONSTRAINT business_name_uk unique (biz_unique_name);
ALTER TABLE bw.product ADD special TINYINT(1) NOT NULL DEFAULT '0'
insert into db_upgrade (version) values (14);

