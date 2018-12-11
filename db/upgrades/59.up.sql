
DROP TABLE IF EXISTS `biz_menu`;
CREATE TABLE `biz_menu` (
  `menu_id` bigint(11) NOT NULL AUTO_INCREMENT,
  `menu_name` varchar(255) NOT NULL,
  `menu_name_lang` varchar(255) DEFAULT NULL,
  `display_type` bigint(1) DEFAULT '1' COMMENT '0隐藏 1显示 2区间显示',
  `start_time` datetime DEFAULT NULL COMMENT '区间开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '区间结束时间',
  `system_flag` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `biz_id` bigint(11) unsigned NOT NULL,
  PRIMARY KEY (`menu_id`),
  UNIQUE KEY `menu_name` (`menu_name`,`biz_id`) USING BTREE,
  KEY `biz_id` (`biz_id`),
  CONSTRAINT `biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ;

ALTER TABLE prod_type add column menu_id  bigint(11) ;
ALTER table prod_type add constraint `menu_id` foreign key (`menu_id`) references biz_menu(`menu_id`);

insert into db_upgrade (version) values (59);