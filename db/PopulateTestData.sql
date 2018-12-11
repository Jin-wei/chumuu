/*
-- Query: SELECT * FROM bw.business
LIMIT 0, 1000

-- Date: 2014-02-08 22:58
*/
INSERT INTO `business` (`biz_id`,`name`,`address`,`city`,`state`,`zipcode`,`latitude`,`longitude`,`phone_no`,`opened_date`,`owner_name`,`category`,`note`,`active`) VALUES (100001,'MISSION COFFEE','151 Washington Blvd','Fremont','CA','94539',37.533498,-121.920906,'(510) 623-6920','1998-03-02','Bob Wagner','','',1);
INSERT INTO `business` (`biz_id`,`name`,`address`,`city`,`state`,`zipcode`,`latitude`,`longitude`,`phone_no`,`opened_date`,`owner_name`,`category`,`note`,`active`) VALUES (100002,'TIRAMISU KITCHEN','033 BELDEN PL','San Francisco','CA','94104',37.791116,-122.403816,'','2001-9-4','Tiramisu LLC','','',1);
INSERT INTO `business` (`biz_id`,`name`,`address`,`city`,`state`,`zipcode`,`latitude`,`longitude`,`phone_no`,`opened_date`,`owner_name`,`category`,`note`,`active`) VALUES (100003,'KIKKA','250 EMBARCADERO  7/F','San Francisco','CA','94105',37.788613,-122.393894,'','2001-9-5','KIKKA ITO, INC.','','',1);

/*
-- Query: SELECT * FROM bw.biz_user
LIMIT 0, 1000

-- Date: 2014-02-08 23:39
*/
INSERT INTO `biz_user` (`user_id`,`username`,`password`,`first_name`,`last_name`,`email`,`active`) VALUES (100001,'bwang','mp','Bowen','Wang','bowen.wang@missionpublic.com',1);
INSERT INTO `biz_user` (`user_id`,`username`,`password`,`first_name`,`last_name`,`email`,`active`) VALUES (100002,'jzou','mp','Jie','Zou','zou_jie@hotmail.com',1);
INSERT INTO `biz_user` (`user_id`,`username`,`password`,`first_name`,`last_name`,`email`,`active`) VALUES (100003,'klui','mp','Kin','Lui','kin.lui@missionpublic.com',1);


INSERT INTO `biz_user_rel` (`biz_id`,`user_id`) VALUES (100001,100001);
/*
-- Query: SELECT * FROM bw.customer
LIMIT 0, 1000

-- Date: 2014-02-09 00:02
*/
INSERT INTO `customer` (`username`,`password`,`customer_id`,`first_name`,`last_name`,`email`,`phone_no`,`total_points_earned`,`total_points_redempted`,`tryit_level`,`active`) VALUES ('happyfish','mp',100001,'Kevin','Fish','kfish@gmail.com','510-567-4646',5,1,'Regular',1);
INSERT INTO `customer` (`username`,`password`,`customer_id`,`first_name`,`last_name`,`email`,`phone_no`,`total_points_earned`,`total_points_redempted`,`tryit_level`,`active`) VALUES ('david123','mp',100002,'David','Li','dli@yahoo.com','650-507-3415',0,0,'One Time',1);


INSERT INTO `prod_type` (`type_id`, `name`, `name_lang`, `active`,`biz_id`,`display_order`)VALUES (100001,'Hot Drink',NULL,1,100001,1);

/*
-- Query: SELECT * FROM bw.product
LIMIT 0, 1000

-- Date: 2014-02-08 23:57
*/
INSERT INTO `product` (`prod_id`,`name`,`description`,`type_id`,`price`,`img_url`,`note`,`active`,`biz_id`) VALUES (100001,'Coffee','Black Coffee',100001,2.49,NULL,NULL,1,100001);
INSERT INTO `product` (`prod_id`,`name`,`description`,`type_id`,`price`,`img_url`,`note`,`active`,`biz_id`) VALUES (100002,'Latte','Special Lattee',100001,3.59,NULL,NULL,1,100001);
INSERT INTO `product` (`prod_id`,`name`,`description`,`type_id`,`price`,`img_url`,`note`,`active`,`biz_id`) VALUES (100003,'Expresso','strong shot of coffee',100001,2.49,NULL,NULL,1,100001);
/*
-- Query: SELECT * FROM bw.biz_customer_rel
LIMIT 0, 1000

-- Date: 2014-02-09 00:24
*/
INSERT INTO `biz_customer_rel` (`relation_id`,`biz_id`,`cust_id`,`total_points_earned`,`total_points_redempted`,`loyalty_level`,`active`) VALUES (100001,100001,100001,0,0,'1',1);
INSERT INTO `biz_customer_rel` (`relation_id`,`biz_id`,`cust_id`,`total_points_earned`,`total_points_redempted`,`loyalty_level`,`active`) VALUES (100002,100001,100002,5,1,'2',1);

/*
-- Query: SELECT * FROM bw.point
LIMIT 0, 1000

-- Date: 2014-02-09 00:35
*/
INSERT INTO `point` (`point_id`,`activity_type`,`points`,`active`) VALUES (1001,'Check-In',1,1);
INSERT INTO `point` (`point_id`,`activity_type`,`points`,`active`) VALUES (1002,'Coupon Redeemed',20,1);
INSERT INTO `point` (`point_id`,`activity_type`,`points`,`active`) VALUES (1003,'Recommend',5,1);

/*
-- Query: SELECT * FROM bw.bc_activity
LIMIT 0, 1000

-- Date: 2014-02-09 00:39
*/
INSERT INTO `bc_activity` (`activity_id`,`point_id`,`relation_id`,`points_earned`) VALUES (100001,1001,100001,1);
INSERT INTO `bc_activity` (`activity_id`,`point_id`,`relation_id`,`points_earned`) VALUES (100002,1003,100002,5);
INSERT INTO `bc_activity` (`activity_id`,`point_id`,`relation_id`,`points_earned`) VALUES (100003,1002,100001,20);

/*
-- Query: SELECT * FROM bw.promotion
LIMIT 0, 1000

-- Date: 2014-02-09 00:45
*/
INSERT INTO `promotion` (`name`,`promotion_id`,`biz_id`,`prod_id`,`description`,`discount_pct`,`start_date`,`active`) VALUES ('10% off',100001,100001,100001,'We offer 10% for regular coffee',10,'2014-02-01',1);

/*
-- Query: SELECT * FROM bw.coupon
LIMIT 0, 1000

-- Date: 2014-02-09 00:50
*/
INSERT INTO `coupon` (`coupon_id`,`promo_id`,`biz_id`,`from_cust_id`,`to_email`,`to_cust_id`,`personal_msg`,`expiration_date`,`img_url`,`status`) VALUES (100001,100001,100001,100001,'dli@yahoo.com',100002,'Hi David, I hope you will like my recommendati.',NULL,NULL,'Pending');

