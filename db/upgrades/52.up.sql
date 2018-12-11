Alter table product add column `display_order` int(4) unsigned NULL DEFAULT '1';
insert into db_upgrade (version) values (52);