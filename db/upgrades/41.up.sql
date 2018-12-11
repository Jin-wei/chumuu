ALTER TABLE bw.product MODIFY COLUMN bw.product.description varchar(500);
ALTER TABLE bw.product MODIFY COLUMN bw.product.description_lang varchar(500);

ALTER TABLE bw.biz_user add column gender tinyint(1) not null  default 1;
ALTER TABLE bw.biz_user add column avatar varchar(200) default null;
ALTER TABLE bw.biz_user add column address varchar(200) default null;
ALTER TABLE bw.biz_user add column city varchar(45) default null;
ALTER TABLE bw.biz_user add column state varchar(10) default null;
ALTER TABLE bw.biz_user add column zipcode varchar(10) default null;
ALTER TABLE bw.customer add column avatar varchar(200) default null;