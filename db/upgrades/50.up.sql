ALTER TABLE bw.business add column created_by bigint(11) unsigned default null;
insert into db_upgrade (version) values (50);