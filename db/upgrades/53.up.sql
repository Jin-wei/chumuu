insert into biz_order_seq select distinct(business.biz_id),1000 from business left join biz_order_seq on business.biz_id=biz_order_seq.biz_id where biz_order_seq.biz_id is null;
update order_info set seq=id where seq is null;
Alter table biz_printer add column `device_name` varchar(20) default null;
Alter table biz_printer add column `operator_id` varchar(20) default null;
Alter table biz_printer add column `bind_status` int(4) unsigned NULL DEFAULT '0';
ALTER TABLE biz_printer MODIFY  ip varchar(20) NULL;
insert into db_upgrade (version) values (53);