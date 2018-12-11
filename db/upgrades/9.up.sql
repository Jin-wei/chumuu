ALTER TABLE prod_type add column `display_order` int(4) unsigned NOT NULL;


CREATE TABLE `date_dimension` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `day` int(4) NOT NULL,
  `week` int(4) NOT NULL,
  `month` int(4) NOT NULL,
  `year` int(4) NOT NULL,
  `year_month` int(4) NOT NULL,
  `year_week` int(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;


CREATE TABLE `stat_cust_checkin` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `biz_id` int(4) NOT NULL DEFAULT '0',
  `count` int(4) DEFAULT NULL,
  `date_id` int(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `stat_menu_click` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `biz_id` int(4) NOT NULL DEFAULT '0',
  `product_id` int(4) NOT NULL DEFAULT '0',
  `date_id` int(4) NOT NULL DEFAULT '0',
  `count` int(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

insert into db_upgrade (version) values (9);