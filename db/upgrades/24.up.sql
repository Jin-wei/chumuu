/**
 * Created by ibm on 14-8-20.
 */
ALTER TABLE promotion
MODIFY COLUMN description varchar(300);
insert into db_upgrade (version) values (24);