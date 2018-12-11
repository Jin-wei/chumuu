Alter table product add column `unitofmeasure` varchar(20) default Null;
Alter table product_extend add column `extend_price` decimal(10,0) DEFAULT '0';
insert into db_upgrade (version) values (56);