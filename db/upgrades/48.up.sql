ALTER TABLE bw.customer ADD CONSTRAINT customer_phone_uk unique (phone_no);
insert into db_upgrade (version) values (48);