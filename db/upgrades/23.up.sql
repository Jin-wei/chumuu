CREATE TABLE `biz_img` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) NOT NULL,
  `img_url` varchar(200) NOT NULL,
  `des` varchar(200) DEFAULT NULL,
  `flag` int(4) DEFAULT '0',
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

insert into db_upgrade (version) values (23);