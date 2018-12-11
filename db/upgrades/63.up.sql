Alter table order_item_temp add column `batch_state` tinyint(1) default 0;

insert into db_upgrade (version) values (63);