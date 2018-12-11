Alter table customer change `first_name` `first_name` varchar(45);
Alter table customer change `last_name` `last_name` varchar(45);

CREATE TABLE `db_upgrade` (
  `version` bigint(11) unsigned NOT NULL,
  `upgrade_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold db upgrade information.';
 
 insert into db_upgrade (version) values (1);
  