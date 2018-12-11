drop table order_info;
drop table order_item;
drop table order_status;

CREATE TABLE `order_info` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) NOT NULL,
  `cust_id` bigint(11) NOT NULL,
  `status` int(4) NOT NULL DEFAULT '100',
  `order_type` tinyint(4) NOT NULL DEFAULT '1',
  `remark` varchar(200) DEFAULT NULL,
  `order_start` datetime DEFAULT NULL,
  `order_end` datetime DEFAULT NULL,
  `promo_info` varchar(50) DEFAULT NULL,
  `origin_price` decimal(10,2) DEFAULT NULL,
  `actual_price` decimal(10,2) DEFAULT NULL,
  `total_tax` decimal(10,2) DEFAULT NULL,
  `total_discount` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `operator` varchar(100) DEFAULT NULL,
  `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8;

CREATE TABLE `order_item` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(11) NOT NULL,
  `prod_id` bigint(11) NOT NULL,
  `prod_name` varchar(100) NOT NULL,
  `promo_info` varchar(50) DEFAULT NULL,
  `quantity` int(4) NOT NULL,
  `origin_price` decimal(10,2) DEFAULT NULL,
  `actual_price` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `remark` varchar(200) DEFAULT NULL,
  `operator` varchar(20) DEFAULT NULL,
  `status` int(4) NOT NULL DEFAULT '201',
  `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `lov` (
  `id` int(4) NOT NULL,
  `category_id` int(4) NOT NULL,
  `status_info` varchar(40) NOT NULL,
  `status_desc` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `lov_category` (
  `id` int(4) NOT NULL DEFAULT '0',
  `category_info` varchar(100) NOT NULL,
  `remark` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into `lov_category`(`id`,`category_info`,`remark`) values (1,'order_status',null);
insert into `lov_category`(`id`,`category_info`,`remark`) values (2,'item_status',null);



insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (100,1,'Submitted','customer submited the order');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (101,1,'Cancelled','customer or business canceled order');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (102,1,'Confirmed','business confire the order');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (103,1,'In Progress','business set order in progress');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (104,1,'Completed','business Completed the order');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (109,1,'Expired','System set the order expired');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (201,2,'Pending','The item pending ,the order not in progress');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (202,2,'Sent to Kitchen','The item is sent to kichen,the order in progress');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (203,2,'Cancelled','The item is cancelled ');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (204,2,'Served','The item is served');

insert into db_upgrade (version) values (26);
