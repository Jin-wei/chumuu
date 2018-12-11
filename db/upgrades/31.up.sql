
CREATE TABLE `order_payment` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `payment_nonce` varchar(40) NOT NULL,
  `payment_id` varchar(20) DEFAULT NULL,
  `order_id` bigint(11) NOT NULL,
  `biz_id` bigint(11) NOT NULL,
  `cust_id` bigint(11) NOT NULL,
  `payment_info` varchar(100) DEFAULT NULL,
  `payment_type` tinyint(1) DEFAULT '1',
  `payment_due` decimal(10,2) NOT NULL,
  `payment_actual` decimal(10,2) NOT NULL,
  `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `billing_address` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;


insert into db_upgrade (version) values (31);