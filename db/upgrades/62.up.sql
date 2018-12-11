DROP TABLE IF EXISTS `biz_checkout_info`;
CREATE TABLE `biz_checkout_info` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) DEFAULT NULL,
  `checkout_id` int(4) DEFAULT NULL,
  `checkout_name` varchar(30) DEFAULT NULL,
  `checkout_remark` varchar(100) DEFAULT NULL,
  `status` int(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `order_money`;
CREATE TABLE `order_money` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) NOT NULL,
  `order_id` bigint(11) DEFAULT NULL,
  `payment_type` bigint(11) DEFAULT NULL,
  `payment_money` double DEFAULT NULL,
  `status` int(4) DEFAULT NULL,
  `operator` varchar(50) DEFAULT NULL,
  `remark` varchar(100) DEFAULT NULL,
  `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
insert into db_upgrade (version) values (62);