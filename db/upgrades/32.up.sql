CREATE UNIQUE INDEX bizId_tableName_unique ON biz_table (biz_id,name);

ALTER TABLE bw.order_info ADD COLUMN phone varchar(15) default null ;
ALTER TABLE bw.order_info ADD COLUMN address varchar(200) default null ;
ALTER TABLE bw.order_info ADD COLUMN username varchar(50) default null ;

ALTER TABLE bw.order_item ADD COLUMN unit_price decimal(10,2) default null ;

insert into db_upgrade (version) values (32);