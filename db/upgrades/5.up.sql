Alter table business change `category` `category` varchar(255);

alter table business add column `country` varchar(45) DEFAULT NULL;
alter table business add column  `kids_goodfor` tinyint(1) DEFAULT '1';
alter table business add column  `neighborhood` varchar(255) DEFAULT NULL;
alter table business add column  `alcohol` varchar(255) DEFAULT NULL;
alter table business add column  `attire` varchar(100) DEFAULT NULL;
alter table business add column  `chain_name` varchar(100) DEFAULT NULL;
alter table business add column  `kids_menu` tinyint(1) DEFAULT '0';
alter table business add column  `services` varchar(500) DEFAULT NULL;
alter table business add column  `options` varchar(500) DEFAULT NULL;
alter table business add column  `payment_cashonly` tinyint(1) DEFAULT '0';
alter table business add column  `price_level` int(11) DEFAULT NULL;
alter table business add column  `reservations` tinyint(1) DEFAULT '1';
alter table business add column  `website` varchar(100) DEFAULT NULL;
alter table business add column  `wifi` tinyint(1) DEFAULT '0';
alter table business add column  `fax` varchar(50) DEFAULT NULL;
alter table business add column  `groups_goodfor` tinyint(1) DEFAULT '1';
alter table business add column  `hours` varchar(500) DEFAULT NULL;
alter table business add column  `hours_display` varchar(500) DEFAULT NULL;
alter table business add column  `open_24hrs` tinyint(1) DEFAULT '0';
alter table business add column  `rating` int(11) DEFAULT NULL;
alter table business add column  `email` varchar(100) DEFAULT NULL;
alter table business add column  `smoking` tinyint(1) DEFAULT '0';
alter table business add column  `parking` varchar(200) DEFAULT NULL;
alter table business add column  `seating_outdoor` tinyint(1) DEFAULT '0';
alter table business add column  `accessible_wheelchair` tinyint(1) DEFAULT '1';
alter table business add column  `room_private` tinyint(1) DEFAULT '0';

CREATE TABLE `prod_type` (
  `type_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_lang` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `biz_id` bigint(11) unsigned NOT NULL,
  PRIMARY KEY (`type_id`),
  CONSTRAINT `type_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold product type information.'

CREATE UNIQUE INDEX prodtype_bizIdName ON prod_type (biz_id,name);


Alter table product change `name` `name` varchar(100);
Alter table product change `description` `description` varchar(255);
Alter table product add column `type_Id`  bigint(11) unsigned;
Alter table product  add column `name_lang` varchar(100) DEFAULT NULL;
Alter table product  add column  `description_lang` varchar(255) DEFAULT NULL;
Alter table product  add column  `options` varchar(255) DEFAULT NULL;

--data migration
insert into prod_type (biz_id, name) select distinct biz_id, type from product;
update product a join prod_type b on a.biz_id=b.biz_id and a.type=b.name set a.type_id=b.type_id;

--constraints
Alter table product change `type_Id` `type_id` bigint(11) unsigned NOT NULL;
Alter table product add  CONSTRAINT `product_type_id` FOREIGN KEY (`type_id`) REFERENCES `prod_type` (`type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

Alter table product drop column `type`;

insert into db_upgrade (version) values (5);

