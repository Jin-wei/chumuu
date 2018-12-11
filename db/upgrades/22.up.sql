alter table promotion add column week_sched tinyint(1) default 127 not null;
insert into db_upgrade (version) values (22);