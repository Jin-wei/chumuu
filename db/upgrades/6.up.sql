ALTER TABLE bw.biz_user DROP FOREIGN KEY user_biz_id;
Alter table biz_user drop column biz_id;
Alter table biz_user  add column  `phone_no` varchar(15) DEFAULT NULL;
ALTER TABLE customer add column `gender` tinyint(1)  default 1;
ALTER TABLE biz_user add column `gender` tinyint(1)  default 1

CREATE TABLE `biz_application` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(11) NOT NULL,
  `biz_name` varchar(45) DEFAULT NULL,
  `address` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  `zipcode` varchar(10) DEFAULT NULL,
  `latitude` float(10,6) DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `phone_num` varchar(15) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




CREATE TABLE `biz_user_rel` (
  `user_id` bigint(11) NOT NULL,
  `biz_id` bigint(11) NOT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`biz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

