ALTER TABLE bw.customer add column table_id BIGINT(11) unsigned default null;
ALTER TABLE bw.biz_table add column pass varchar(10) default null;
insert into db_upgrade (version) values (49);