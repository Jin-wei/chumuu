UPDATE bw.product set name=prod_id where name is null;
ALTER TABLE bw.product  CHANGE name name VARCHAR(100) NOT NULL;


ALTER TABLE promotion add column `discount_amount` decimal(10,2)  DEFAULT null;

insert into db_upgrade (version) values (8);

