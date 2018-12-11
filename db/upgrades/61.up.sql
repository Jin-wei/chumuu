Alter table product add column `sold_out_flag` tinyint(1) default 0;

insert into db_upgrade (version) values (61);