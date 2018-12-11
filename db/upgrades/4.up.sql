alter table product change column price  price decimal(10,2) DEFAULT NULL;
insert into db_upgrade (version) values (4);