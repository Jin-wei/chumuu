ALTER TABLE prod_type add column `external_id` varchar(200)  default NULL;
ALTER TABLE product add column `external_id` varchar(200)  default NULL;

insert into db_upgrade (version) values (12);