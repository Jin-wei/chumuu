
ALTER TABLE business add column `yelp_id` varchar(200)  default NULL;
ALTER TABLE biz_customer_rel add column `checkIn` tinyint(1)  default 0;
ALTER TABLE biz_customer_rel add column `favorite` tinyint(1)  default 0;

CREATE TABLE `product_customer_rel` (
  `product_id` bigint(11) unsigned NOT NULL,
  `customer_id` bigint(11) unsigned NOT NULL,
  `createDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `product_customer_rel_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`prod_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  PRIMARY KEY (`product_id`,`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


insert into db_upgrade (version) values (10);