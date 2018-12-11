Alter table business add column `wxpay_flag` tinyint(1) default 0;
Alter table order_info add column `pay_state` tinyint(1) default 0;
insert into db_upgrade (version) values (59);