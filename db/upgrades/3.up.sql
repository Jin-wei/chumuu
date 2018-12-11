alter table business add column img_url varchar(100) DEFAULT NULL;
alter table promotion add column img_url varchar(100) DEFAULT NULL;

insert into db_upgrade (version) values (3);