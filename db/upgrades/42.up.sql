CREATE TABLE `biz_user_mobile` (
  `biz_id` bigint(11) NOT NULL,
  `device_token` varchar(100) NOT NULL,
  `device_type` tinyint(1) NOT NULL DEFAULT '1',
  `sound` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`biz_id`,`device_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into db_upgrade (version) values (42);