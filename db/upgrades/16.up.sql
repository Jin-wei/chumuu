alter table customer add column `address` varchar(200) default null;
alter table customer add column `city` varchar(45) default null;
alter table customer add column `state` varchar(10) default null;
alter table customer add column `zipcode` varchar(10) default null;
insert into db_upgrade (version) values (16);