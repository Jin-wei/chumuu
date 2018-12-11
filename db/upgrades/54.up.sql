Alter table biz_printer add column `print_num` int(4) default 0;
insert into db_upgrade (version) values (54);