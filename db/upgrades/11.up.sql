ALTER TABLE customer add column `fb_access_token` varchar(200)  default NULL;
ALTER TABLE customer add column `fb_id` varchar(200)  default NULL;

CREATE TABLE `product_comment` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `prod_id` bigint(11) NOT NULL,
  `cust_id` bigint(11) NOT NULL,
  `comment` varchar(500) NOT NULL,
  `rating` smallint(1) NOT NULL,
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `state` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `biz_comment` (
      `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
      `biz_id` bigint(11) DEFAULT NULL,
      `cust_id` bigint(11) DEFAULT NULL,
      `comment` varchar(500) NOT NULL,
      `price_level` int(1) NOT NULL,
      `service_level` int(1) NOT NULL,
      `food_quality` int(1) NOT NULL,
      `state` tinyint(1) NOT NULL DEFAULT '1',
      `createtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into db_upgrade (version) values (11);