CREATE TABLE `biz_extend` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(11) DEFAULT NULL,
  `biz_id` bigint(11) NOT NULL,
  `extend_type` int(11) DEFAULT NULL COMMENT '0一级，1二级',
  `extend_name` varchar(50) DEFAULT NULL,
  `extend_name_lan` varchar(50) DEFAULT NULL,
  `extend_price` decimal(10,0) DEFAULT '0',
  `state` int(11) DEFAULT NULL,
  `remark` varchar(100) DEFAULT NULL,
  `created_on` timestamp NULL DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `product_extend` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `prod_id` bigint(11) NOT NULL,
  `extend_id` bigint(11) NOT NULL,
  PRIMARY KEY (`id`)
);


Alter table order_item add column `prod_extend` varchar(100) default Null;
Alter table order_item add column `extend_price` decimal(10) default 0;
Alter table order_item add column `extend_total_price` decimal(10) default 0;

insert into db_upgrade (version) values (55);