ALTER TABLE bw.business ADD COLUMN order_status tinyint(1) default '0' ;

ALTER TABLE bw.business MODIFY COLUMN bw.business.phone_no varchar(100);

insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (402,4,'Booth','');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (403,4,'Round','');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (404,4,'Square','');
insert into `lov`(`id`,`category_id`,`status_info`,`status_desc`) values (405,4,'Rectangular','');

insert into db_upgrade (version) values (29);