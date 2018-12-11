delimiter $$

CREATE TABLE `point` (
  `point_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `activity_type` varchar(15) NOT NULL,
  `points` bigint(11) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`point_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to manage the point system.'$$


delimiter $$

CREATE TABLE `business` (
  `biz_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(10) DEFAULT NULL,
  `zipcode` varchar(10) DEFAULT NULL,
  `latitude` float(10,6) DEFAULT NULL,
  `longitude` float(10,6) DEFAULT NULL,
  `phone_no` varchar(100) DEFAULT NULL,
  `opened_date` date DEFAULT NULL,
  `owner_name` varchar(45) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `note` varchar(100) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `img_url` varchar(100) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  `kids_goodfor` tinyint(1) DEFAULT '1',
  `neighborhood` varchar(255) DEFAULT NULL,
  `alcohol` varchar(255) DEFAULT NULL,
  `attire` varchar(100) DEFAULT NULL,
  `chain_name` varchar(100) DEFAULT NULL,
  `kids_menu` tinyint(1) DEFAULT '0',
  `services` varchar(500) DEFAULT NULL,
  `options` varchar(500) DEFAULT NULL,
  `payment_cashonly` tinyint(1) DEFAULT '0',
  `price_level` int(11) DEFAULT NULL,
  `reservations` tinyint(1) DEFAULT '1',
  `website` varchar(255) DEFAULT NULL,
  `wifi` tinyint(1) DEFAULT '0',
  `fax` varchar(50) DEFAULT NULL,
  `groups_goodfor` tinyint(1) DEFAULT '1',
  `hours` varchar(500) DEFAULT NULL,
  `hours_display` varchar(500) DEFAULT NULL,
  `open_24hrs` tinyint(1) DEFAULT '0',
  `rating` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `smoking` tinyint(1) DEFAULT '0',
  `seating_outdoor` tinyint(1) DEFAULT '0',
  `accessible_wheelchair` tinyint(1) DEFAULT '1',
  `room_private` tinyint(1) DEFAULT '0',
  `desc` varchar(1000) DEFAULT NULL,
  `yelp_id` varchar(200) DEFAULT NULL,
  `time_offset` int(11) NOT NULL DEFAULT '-7',
  `name_lang` varchar(100) DEFAULT NULL,
  `biz_unique_name` varchar(200) DEFAULT NULL,
  `order_status` tinyint(1) DEFAULT '0',
  `printer_lang` tinyint(1) DEFAULT '1' COMMENT '1:name (name_lang) 2: name_lang (name)3: name4: name_lang',
  `parking` tinyint(1) DEFAULT '0',
  `parent_id` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`biz_id`),
  UNIQUE KEY `business_name_uk` (`biz_unique_name`)
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8 COMMENT='This is the table to hold business information.';
$$


delimiter $$


CREATE TABLE `biz_user` (
  `user_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(40) DEFAULT NULL,
  `gender` tinyint(1) DEFAULT '1',
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `phone_no` varchar(15) DEFAULT NULL,
  `avatar` varchar(200) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(10) DEFAULT NULL,
  `zipcode` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_username` (`username`),
  UNIQUE KEY `biz_user_unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COMMENT='This is the table to hold business user information.'$$


delimiter $$

CREATE TABLE `prod_type` (
  `type_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_lang` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `external_id` varchar(255) DEFAULT NULL,
  `biz_id` bigint(11) unsigned NOT NULL,
  `display_order` int(4) unsigned NULL DEFAULT '1',
  PRIMARY KEY (`type_id`),
  CONSTRAINT `type_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product type information.'$$

delimiter $$
CREATE UNIQUE INDEX prodtype_bizIdName
    ON prod_type (biz_id,name)$$


delimiter $$

CREATE TABLE `product` (
  `prod_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `img_url` varchar(100) DEFAULT NULL,
  `note` varchar(100) DEFAULT NULL,
  `biz_id` bigint(11) unsigned NOT NULL,
  `type_id` bigint(11) unsigned DEFAULT NULL,
  `name_lang` varchar(100) DEFAULT NULL,
  `description_lang` varchar(500) DEFAULT NULL,
  `options` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `calorie` int(4) DEFAULT NULL,
  `spiciness` tinyint(1) DEFAULT '0',
  `ingredient` varchar(255) DEFAULT NULL,
  `togo` tinyint(1) DEFAULT '1',
  `special` tinyint(1) NOT NULL DEFAULT '0',
  `ingredient_lang` varchar(255) DEFAULT NULL,
  `external_id` varchar(200)  default NULL,
  PRIMARY KEY (`prod_id`),
  UNIQUE KEY `product_bizIdName` (`biz_id`,`name`),
  KEY `product_type_id` (`type_id`),
  CONSTRAINT `product_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `product_type_id` FOREIGN KEY (`type_id`) REFERENCES `prod_type` (`type_id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=103177 DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product information.';$$

delimiter $$

CREATE TABLE `promotion` (
  `name` varchar(100) NOT NULL,
  `promotion_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) unsigned NOT NULL,
  `prod_id` bigint(11) unsigned DEFAULT NULL,
  `description` varchar(300) DEFAULT NULL,
  `discount_pct` bigint(11) unsigned DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `img_url` varchar(100) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `week_sched` tinyint(1) NOT NULL DEFAULT '127',
  `discount_level` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`promotion_id`),
  KEY `promotion_biz_id` (`biz_id`),
  KEY `promotion_prod_id` (`prod_id`),
  CONSTRAINT `promotion_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `promotion_prod_id` FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=100018 DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product promotion information.';$$

delimiter $$

CREATE TABLE `customer` (
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(40) DEFAULT NULL,
  `customer_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone_no` varchar(15) DEFAULT NULL,
  `total_points_earned` bigint(11) unsigned NOT NULL DEFAULT '0',
  `total_points_redempted` bigint(11) unsigned NOT NULL DEFAULT '0',
  `tryit_level` varchar(10) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` tinyint(1) DEFAULT '1',
  `fb_access_token` varchar(200) DEFAULT NULL,
  `fb_id` varchar(200) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(10) DEFAULT NULL,
  `zipcode` varchar(10) DEFAULT NULL,
  `avatar` varchar(200) DEFAULT NULL,
  `wechat_id` varchar(60) DEFAULT NULL,
  `wechat_status` tinyint(1) DEFAULT '1',
  `biz_id` bigint(11) unsigned DEFAULT NULL
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `customer_username` (`username`),
  UNIQUE KEY `customer_email` (`email`),
  UNIQUE KEY `customer_wechat_uk` (`wechat_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='This is the table to hold customer information.'; $$



delimiter $$

CREATE TABLE `coupon` (
  `coupon_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `promo_id` bigint(11) unsigned DEFAULT NULL,
  `biz_id` bigint(11) unsigned NOT NULL,
  `from_cust_id` bigint(11) unsigned NOT NULL,
  `to_email` varchar(50) DEFAULT NULL,
  `to_cust_id` bigint(11) unsigned NOT NULL,
  `personal_msg` varchar(160) NOT NULL,
  `expiration_date` date DEFAULT NULL,
  `img_url` varchar(100) DEFAULT NULL,
  `status` varchar(15) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`coupon_id`),
  KEY `coupon_biz_id` (`biz_id`),
  KEY `coupon_promo_id` (`promo_id`),
  KEY `coupon_from_cust_id` (`from_cust_id`),
  KEY `coupon_to_cust_id` (`to_cust_id`),
  CONSTRAINT `coupon_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `coupon_from_cust_id` FOREIGN KEY (`from_cust_id`) REFERENCES `customer` (`customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `coupon_to_cust_id` FOREIGN KEY (`to_cust_id`) REFERENCES `customer` (`customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=100025 DEFAULT CHARSET=utf8 COMMENT='This is the table to hold coupon or recommendation.';$$


delimiter $$

CREATE TABLE `sharing` (
  `sharing_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `biz_id` bigint(11) unsigned NOT NULL,
  `cust_id` bigint(11) unsigned NOT NULL,
  `prod_id` bigint(11)  unsigned NULL,
  `img_url` varchar(100) DEFAULT NULL,
  `sharing_text` varchar(160) NOT NULL,
  `owner_pick` tinyint(1) NOT NULL DEFAULT '0',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sharing_id`),
  CONSTRAINT `sharing_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `sharing_prod_id` FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `sharing_cust_id` FOREIGN KEY (`cust_id`) REFERENCES `customer` (`customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold social sharing.'$$


delimiter $$

CREATE TABLE `biz_customer_rel` (
  `relation_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
    `biz_id` bigint(11) unsigned NOT NULL,
    `cust_id` bigint(11) unsigned NOT NULL,
    `total_points_earned` bigint(11) unsigned NOT NULL DEFAULT '0',
    `total_points_redempted` bigint(11) unsigned NOT NULL DEFAULT '0',
    `loyalty_level` varchar(10) DEFAULT NULL,
    `active` tinyint(1) NOT NULL DEFAULT '1',
    `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `checkIn` tinyint(1) DEFAULT '0',
    `favorite` tinyint(1) DEFAULT '0',
    `comment` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`relation_id`),
  UNIQUE KEY `biz_customer_rel_bizcust` (`biz_id`,`cust_id`),
  KEY `biz_customer_rel_cust_id` (`cust_id`),
  CONSTRAINT `biz_customer_rel_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `biz_customer_rel_cust_id` FOREIGN KEY (`cust_id`) REFERENCES `customer` (`customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold business to customer relationship.'$$



delimiter $$

CREATE TABLE `bc_activity` (
  `activity_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `point_id` bigint(11) unsigned NOT NULL,
  `relation_id` bigint(11) unsigned NOT NULL,
  `points_earned` bigint(11) DEFAULT 0,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`activity_id`),
  CONSTRAINT `bc_activity_relation_id` FOREIGN KEY (`relation_id`) REFERENCES `biz_customer_rel` (`relation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `bc_activity_point_id` FOREIGN KEY (`point_id`) REFERENCES `point` (`point_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold customer activity related to a business.'$$

delimiter $$

CREATE TABLE `c_activity` (
  `activity_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `cust_id` bigint(11) unsigned NOT NULL,
  `point_id` bigint(11) unsigned NOT NULL,
  `points_earned` bigint(11) DEFAULT 0,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`activity_id`),
  CONSTRAINT `c_activity_cust_id` FOREIGN KEY (`cust_id`) REFERENCES `customer` (`customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `c_activity_point_id` FOREIGN KEY (`point_id`) REFERENCES `point` (`point_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold customer activity not related to a business.'$$

delimiter $$
CREATE TABLE `db_upgrade` (
  `version` bigint(11) unsigned NOT NULL,
  `upgrade_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold db upgrade information.';$$

 delimiter $$
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
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold biz user apply information.';$$

 delimiter $$
 CREATE TABLE `biz_user_rel` (
   `user_id` bigint(11) NOT NULL,
   `biz_id` bigint(11) NOT NULL,
   `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `role_type` tinyint(1) DEFAULT '9',
   `remark` varchar(100) DEFAULT NULL,
   PRIMARY KEY (`user_id`,`biz_id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;$$

 delimiter $$
  CREATE TABLE `date_dimension` (
    `id` int(4) NOT NULL AUTO_INCREMENT,
    `day` int(4) NOT NULL,
    `week` int(4) NOT NULL,
    `month` int(4) NOT NULL,
    `year` int(4) NOT NULL,
    `year_month` int(4) NOT NULL,
    `year_week` int(4) NOT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8 COMMENT='This is the table to save date by day as a date dimension table.';$$

  delimiter $$
   CREATE TABLE `stat_menu_click` (
     `id` int(4) NOT NULL AUTO_INCREMENT,
     `biz_id` int(4) NOT NULL DEFAULT '0',
     `product_id` int(4) NOT NULL DEFAULT '0',
     `date_id` int(4) NOT NULL DEFAULT '0',
     `count` int(4) DEFAULT NULL,
     `order_count` int(11) default 0,
     PRIMARY KEY (`id`)
   ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8  COMMENT='This is the table to save product click count by day';$$

   delimiter $$
    CREATE TABLE `stat_cust_checkin` (
      `id` int(4) NOT NULL AUTO_INCREMENT,
      `biz_id` int(4) NOT NULL DEFAULT '0',
      `count` int(4) DEFAULT NULL,
      `date_id` int(4) NOT NULL DEFAULT '0',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to save customer check in biz count by day.';$$

    delimiter $$
        CREATE TABLE `product_customer_rel` (
          `product_id` bigint(11) unsigned NOT NULL,
          `customer_id` bigint(11) unsigned NOT NULL,
          `createDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT `product_customer_rel_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`prod_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
          PRIMARY KEY (`product_id`,`customer_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;$$

    delimiter $$
    CREATE TABLE `product_comment` (
      `id` bigint(11) NOT NULL AUTO_INCREMENT,
      `prod_id` bigint(11) NOT NULL,
      `cust_id` bigint(11) NOT NULL,
      `comment` varchar(500) NOT NULL,
      `rating` smallint(1) NOT NULL,
      `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `state` tinyint(1) NOT NULL DEFAULT '1',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB  DEFAULT CHARSET=utf8;$$

     delimiter $$
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;$$

	delimiter $$
	CREATE TABLE `product_ranking` (
	  `ranking_num` int(2) NOT NULL,
	  `biz_id` bigint(11) unsigned NOT NULL,
	  `prod_id` bigint(11) unsigned NOT NULL,
	  PRIMARY KEY (`prod_id`),
	  CONSTRAINT `topten_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
	  CONSTRAINT `topten_prod_id` FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
	)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT= 'This is the table to hold top 10 products among all products'$$

    delimiter $$
    	CREATE TABLE `biz_state_tax` (
            `id` bigint(11) NOT NULL AUTO_INCREMENT,
            `state` varchar(10) NOT NULL,
            `tax_rate` decimal(5,2) NOT NULL,
            `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `city` varchar(45) NOT NULL ,
            PRIMARY KEY (`id`),
            UNIQUE KEY `biz_tax_local_unique` (`state`,`city`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT= 'This is the table to save the tax rate by United States'$$

    delimiter $$
        CREATE TABLE `stat_menu_order` (
          `id` int(4) NOT NULL AUTO_INCREMENT,
          `biz_id` int(4) NOT NULL DEFAULT '0',
          `product_id` int(4) NOT NULL DEFAULT '0',
          `date_id` int(4) NOT NULL DEFAULT '0',
          `count` int(4) DEFAULT NULL,
          PRIMARY KEY (`id`)
        ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COMMENT= 'This is the table to save the menu order for statistics'$$

    delimiter $$
    CREATE TABLE `feedback` (
      `id` bigint(11) NOT NULL AUTO_INCREMENT,
      `cust_id` bigint(11) DEFAULT NULL,
      `contact_email` varchar(200) DEFAULT NULL,
      `contact_phone` varchar(20) DEFAULT NULL,
      `content` varchar(1000) NOT NULL,
      `level` int(1) NOT NULL DEFAULT '0',
      `active` tinyint(1) NOT NULL DEFAULT '1',
      `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT= 'This is the table to save customer feedback'$$
    delimiter $$
    CREATE TABLE `biz_img` (
      `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
      `biz_id` bigint(11) NOT NULL,
      `img_url` varchar(200) NOT NULL,
      `des` varchar(200) DEFAULT NULL,
      `flag` int(4) DEFAULT '0',
      `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT= 'This is the table to save biz image'$$
     delimiter $$
     insert into db_upgrade (version) values (23);$$

     delimiter $$
     CREATE TABLE `biz_table` (
       `id` bigint(11) NOT NULL AUTO_INCREMENT,
       `biz_id` bigint(11) NOT NULL,
       `name` varchar(20) NOT NULL,
       `remark` varchar(100) DEFAULT NULL,
       `table_type` int(4) NOT NULL DEFAULT '400',
       `seats` int(4) NOT NULL DEFAULT '1',
       `status` int(4) NOT NULL DEFAULT '300',
       `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       `create_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB  DEFAULT CHARSET=utf8;$$

     delimiter $$
     CREATE UNIQUE INDEX bizId_tableName_unique ON biz_table (biz_id,name);$$


     delimiter $$
     CREATE TABLE `order_info` (
       `id` bigint(11) NOT NULL AUTO_INCREMENT,
       `biz_id` bigint(11) NOT NULL,
       `cust_id` bigint(11) DEFAULT NULL,
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
       `table_id` bigint(11) DEFAULT NULL,
       `people_num` int(4) DEFAULT NULL,
       `phone` varchar(15) DEFAULT NULL,
       `address` varchar(200) DEFAULT NULL,
       `username` varchar(50) DEFAULT NULL,
       `seq` int(4)  DEFAULT NULL,
        `finish` tinyint(1) DEFAULT '0',
        `active` tinyint(1) DEFAULT '0',
        `op_remark` varchar(1000) DEFAULT NULL,
        `gift_flag` tinyint(1) DEFAULT '0',
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB  DEFAULT CHARSET=utf8;$$

    delimiter $$
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
       `prod_name_lang` varchar(100) DEFAULT NULL,
       `unit_price` decimal(10,2) DEFAULT NULL,
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB  DEFAULT CHARSET=utf8;$$


    delimiter $$
     CREATE TABLE `lov` (
       `id` int(4) NOT NULL,
       `category_id` int(4) NOT NULL,
       `status_info` varchar(40) NOT NULL,
       `status_desc` varchar(100) DEFAULT NULL,
       `status` tinyint(1) DEFAULT NULL,
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

     CREATE TABLE `lov_category` (
       `id` int(4) NOT NULL DEFAULT '0',
       `category_info` varchar(100) NOT NULL,
       `remark` varchar(100) DEFAULT NULL,
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8;$$

        delimiter $$
     insert into `lov_category`(`id`,`category_info`,`remark`) values (1,'order_status',null);
     insert into `lov_category`(`id`,`category_info`,`remark`) values (2,'item_status',null);
     insert into `lov_category`(`id`,`category_info`,`remark`) values (3,'table_status',null);
     insert into `lov_category`(`id`,`category_info`,`remark`) values (4,'table_type',null);
     insert into lov_category (`id`,`category_info`) values (5,'payment_status');
     insert into lov_category (`id`,`category_info`) values (6,'payment_type');

     $$


    delimiter $$
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
     insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (400,4,'Booth','');
     insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (401,4,'Round','');
     insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (402,4,'Square','');
     insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (403,4,'Rectangular','');
     insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (300,3,'Open','The table is open ');
     insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (301,3,'Reserved','The table is reserved ');
     insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (302,3,'Seated','The customer is seated ');
     insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (303,3,'Clean up','The table has been clean up ');


     insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (401,4,'separate room','The table is in separate room ');
     insert into lov (`id`,`category_id`,`status`,`status_info`) values (501,5,1,'Authorized');
     insert into lov (`id`,`category_id`,`status`,`status_info`) values (502,5,2,'SETTLING');
     insert into lov (`id`,`category_id`,`status`,`status_info`) values (503,5,3,'SETTLEMENT');
     insert into lov (`id`,`category_id`,`status`,`status_info`) values (504,5,4,'VOID');
     insert into lov (`id`,`category_id`,`status`,`status_info`) values (505,5,5,'REFUND');


     insert into lov (`id`,`category_id`,`status`,`status_info`) values (601,6,0,'paypal');
     insert into lov (`id`,`category_id`,`status`,`status_info`) values (602,6,1,'creditCard');
     $$

     delimiter $$
     CREATE TABLE `biz_printer` (
       `id` bigint(11) NOT NULL AUTO_INCREMENT,
           `biz_id` bigint(11) NOT NULL,
           `type` tinyint(1) NOT NULL DEFAULT '1',
           `name` varchar(40) NOT NULL,
           `ip` varchar(20) NOT NULL,
           `local` varchar(40) DEFAULT NULL,
           `remark` varchar(100) DEFAULT NULL,
           `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
           `create_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8;$$

      delimiter $$
     CREATE TABLE `biz_order_seq` (
       `biz_id` bigint(11) NOT NULL,
       `seq` int(4) NOT NULL DEFAULT '1000',
       PRIMARY KEY (`biz_id`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8;$$

    delimiter $$
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;$$

    delimiter $$
    CREATE TABLE `order_payment` (
      `id` bigint(11) NOT NULL AUTO_INCREMENT,
      `payment_nonce` varchar(40) DEFAULT NULL,
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
      `status` tinyint(1) NOT NULL DEFAULT '1',
      `parent_id` varchar(20) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB  DEFAULT CHARSET=utf8;$$

    delimiter $$
    CREATE TABLE `biz_user_mobile` (
      `biz_id` bigint(11) NOT NULL,
      `device_token` varchar(100) NOT NULL,
      `device_type` tinyint(1) NOT NULL DEFAULT '1',
      `sound` tinyint(1) NOT NULL DEFAULT '1',
      `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`biz_id`,`device_token`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;$$


  delimiter $$
  CREATE TABLE `order_status_history` (
    `id` bigint(11) NOT NULL AUTO_INCREMENT,
    `order_id` bigint(11) NOT NULL,
    `order_status` tinyint(1) NOT NULL,
    `op_user` varchar(100) DEFAULT NULL,
    `op_remark` varchar(200) DEFAULT NULL,
    `op_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB  DEFAULT CHARSET=utf8;$$

  delimiter $$
  CREATE TRIGGER order_status_trigger
  AFTER
  update
  ON `order_info`
  FOR EACH ROW
  BEGIN
  if new.status!=old.status then
  insert into order_status_history(`order_id`,`order_status`,`op_user`,`op_remark`) values (old.id,new.status,new.operator,new.op_remark);
  end if;
  END;$$

  delimiter $$
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
  $$

    delimiter $$
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
    $$
    delimiter $$
    CREATE TABLE `stat_monthly_order` (
    	`id` int(4) NOT NULL AUTO_INCREMENT,
    	`biz_id` bigint(4) NOT NULL DEFAULT '0',
    	`product_id` bigint(4) NOT NULL DEFAULT '0',
    	`month` int(4) NOT NULL,
    	`year` int(4) NOT NULL,
    	`year_month` int(4) NOT NULL,
    	`monthly_count` int(4) DEFAULT NULL,
    	PRIMARY KEY (`id`)
    )ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT= 'This is the table stores monthly order report';
    $$
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
    CREATE TABLE `admin_user` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `username` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
      `name` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
      `password` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
      `admin_status` tinyint(1) NOT NULL DEFAULT '1',
      `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      `remark` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `admin_username_uk` (`username`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  commit;

