insert into `lov_category`(`id`,`category_info`,`remark`) values (3,'table_status',null);
insert into `lov_category`(`id`,`category_info`,`remark`) values (4,'table_type',null);

insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (300,3,'Open','The table is open ');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (301,3,'Reserved','The table is reserved ');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (302,3,'Seated','The customer is seated ');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (303,3,'Clean up','The table has been clean up ');

insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (400,4,'Dispersed','The table is dispersed ');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (401,4,'separate room','The table is in separate room ');

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;


ALTER TABLE order_info add column `table_id` bigint(11) default null;




