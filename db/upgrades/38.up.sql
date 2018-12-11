alter table product add column ingredient_lang varchar(255) default null;
insert into db_upgrade (version) values (38);