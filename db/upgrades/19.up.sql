CREATE TABLE `stat_menu_order` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `biz_id` int(4) NOT NULL DEFAULT '0',
  `product_id` int(4) NOT NULL DEFAULT '0',
  `date_id` int(4) NOT NULL DEFAULT '0',
  `count` int(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
insert into db_upgrade (version) values (19);