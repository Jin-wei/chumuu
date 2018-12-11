ALTER TABLE bw.prod_type 
CHANGE COLUMN `display_order` `display_order` INT(4) UNSIGNED NULL DEFAULT '1' ;

insert into db_upgrade (version) values (15);

