ALTER TABLE bw.customer add column wechat_id varchar(60) default null;

ALTER TABLE bw.customer add column wechat_status tinyint(1) default 1;

ALTER TABLE bw.customer ADD CONSTRAINT customer_wechat_uk unique (wechat_id);

ALTER TABLE bw.business add column parent_id BIGINT(11) default null;

CREATE TABLE `customer_contact` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `cust_id` bigint(11) unsigned NOT NULL,
  `receiver` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `zipcode` varchar(20) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `customer_gift` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `gift_code` varchar(20) NOT NULL,
  `from_cust` bigint(11) NOT NULL,
  `to_cust` bigint(11) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `order_id` bigint(11) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gift_code_uk` (`gift_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE bw.order_info add column gift_flag tinyint(1) default 0;

insert into db_upgrade (version) values (44);