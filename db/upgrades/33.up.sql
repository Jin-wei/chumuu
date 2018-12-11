Truncate table biz_state_tax;

ALTER TABLE bw.biz_state_tax ADD COLUMN city varchar(45) not null  ;

CREATE UNIQUE INDEX biz_tax_local_unique ON biz_state_tax (state,city);

insert into biz_state_tax (state,city,tax_rate) select distinct state,city,8.75 from business;

insert into db_upgrade (version) values (33);