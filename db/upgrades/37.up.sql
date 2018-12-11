ALTER TABLE bw.order_info ADD COLUMN active tinyint(1) DEFAULT 0 ;
update order_info set active = 1;

insert into db_upgrade (version) values (37);