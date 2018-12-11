ALTER TABLE bw.biz_customer_rel ADD COLUMN comment varchar(100) default null ;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE bw.order_item ADD COLUMN prod_name_lang varchar(100) default null ;

insert into db_upgrade (version) values (30);
