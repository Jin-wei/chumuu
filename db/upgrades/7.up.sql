Alter TABLE product add column  `calorie` int(4) DEFAULT NULL;
ALTER TABLE product add column `spiciness` tinyint(1)  DEFAULT 0;
ALTER TABLE product add column `ingredient` varchar(255)  DEFAULT NULL;
ALTER TABLE product add column `togo` tinyint(1)  DEFAULT 1;

Alter TABLE product modify column  `type_id` bigint(11) unsigned DEFAULT NULL;

ALTER TABLE product DROP FOREIGN KEY product_type_id;
ALTER TABLE product ADD  CONSTRAINT `product_type_id` FOREIGN KEY (`type_id`) REFERENCES `prod_type` (`type_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE coupon DROP FOREIGN KEY coupon_promo_id;

ALTER TABLE promotion DROP FOREIGN KEY promotion_prod_id ;
ALTER TABLE promotion ADD  CONSTRAINT `promotion_prod_id` FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE business add column `desc` varchar(500)  DEFAULT null;

insert into db_upgrade (version) values (7);
