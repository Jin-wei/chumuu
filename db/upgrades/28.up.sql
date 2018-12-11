ALTER TABLE bw.order_info MODIFY COLUMN cust_id bigint(11) default null ;
ALTER TABLE bw.order_info ADD COLUMN people_num int(4) default null ;

insert into db_upgrade (version) values (28);