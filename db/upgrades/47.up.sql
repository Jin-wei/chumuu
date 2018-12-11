ALTER TABLE bw.customer add column biz_id BIGINT(11) unsigned default null;
insert into db_upgrade (version) values (47);