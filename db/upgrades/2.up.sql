Alter table customer change `password` `password` varchar(40);
Alter table biz_user change `password` `password` varchar(40);

alter table customer add column last_login_date  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
alter table biz_user add column last_login_date  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;

insert into db_upgrade (version) values (2);