

ALTER TABLE bw.promotion ADD discount_level DECIMAL(10,2) ;

CREATE TABLE `order_info` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) NOT NULL,
  `cust_id` bigint(11) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  `order_type` tinyint(4) NOT NULL DEFAULT '1',
  `remark` varchar(200) DEFAULT NULL,
  `order_start` datetime DEFAULT NULL,
  `order_end` datetime DEFAULT NULL,
  `origin_price` decimal(10,2) DEFAULT NULL,
  `actual_price` decimal(10,2) DEFAULT NULL,
  `total_tax` decimal(10,2) DEFAULT NULL,
  `total_discount` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10000 DEFAULT CHARSET=utf8;

CREATE TABLE `order_item` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(11) NOT NULL,
  `prod_id` bigint(11) NOT NULL,
  `prod_name` varchar(100) NOT NULL,
  `quantity` int(4) NOT NULL,
  `origin_price` decimal(10,2) DEFAULT NULL,
  `actual_price` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `remark` varchar(200) DEFAULT NULL,
  `status` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `order_status` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(200) NOT NULL,
  `remark` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


insert into `order_status`(`type_id`,`type_name`,`remark`) values (1,'pending','customer create order ,not verified');
insert into `order_status`(`type_id`,`type_name`,`remark`) values (2,'ccancelled','Customer cancel the order before biz verified it');
insert into `order_status`(`type_id`,`type_name`,`remark`) values (3,'ordered','Biz verify and accept the order');
insert into `order_status`(`type_id`,`type_name`,`remark`) values (4,'bcancelled','the order is canceled after biz verified');
insert into `order_status`(`type_id`,`type_name`,`remark`) values (5,'completed','order is normally completed');
insert into db_upgrade (version) values (25);
