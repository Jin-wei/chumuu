Alter table order_item_temp add column `qr` varchar(100) default null;

insert into db_upgrade (version) values (64);