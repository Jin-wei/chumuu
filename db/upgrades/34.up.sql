ALTER TABLE bw.business ADD COLUMN printer_lang tinyint(1) DEFAULT '1' COMMENT '1:name (name_lang) 2: name_lang (name)3: name4: name_lang' ;

CREATE TABLE `biz_order_seq` (
  `biz_id` bigint(11) NOT NULL,
  `seq` int(4) NOT NULL DEFAULT '1000',
  PRIMARY KEY (`biz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE bw.order_info ADD COLUMN seq int(4)  default null  ;
ALTER TABLE bw.order_info ADD COLUMN finish tinyint(1)  default '0'  ;

insert into biz_order_seq select distinct(biz_id),1000 from business where active =1;

insert into db_upgrade (version) values (34);