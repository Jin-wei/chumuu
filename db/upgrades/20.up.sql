ALTER TABLE bw.business
MODIFY COLUMN bw.business.name varchar(100);
ALTER TABLE bw.business
MODIFY COLUMN bw.business.address varchar(100);
ALTER TABLE bw.business
MODIFY COLUMN bw.business.website varchar(255);

insert into db_upgrade (version) values (20);