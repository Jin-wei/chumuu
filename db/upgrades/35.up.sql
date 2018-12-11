CREATE TABLE `biz_order_stat` (
  `biz_id` bigint(11) NOT NULL,
  `date_id` bigint(11) NOT NULL,
  `total_sales` decimal(10,2) DEFAULT NULL,
  `total_tax` decimal(10,2) DEFAULT NULL,
  `total_cash` decimal(10,2) DEFAULT NULL,
  `total_card` decimal(10,2) DEFAULT NULL,
  `dine_in_count` int(4) DEFAULT NULL,
  `togo_count` int(4) DEFAULT NULL,
  `create_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`biz_id`,`date_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into db_upgrade (version) values (35);