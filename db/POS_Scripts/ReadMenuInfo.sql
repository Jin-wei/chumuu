
/*+++++ READ ME +++++

1. You need to add customers' schema into your schemas first. 
2. Only insert the test business data for the first time. Put '#' in front of the statement to switch it off, and delete '#' to switch it on.

+++++ READ ME +++++*/


/*INSERT INTO `business` (`biz_id`,`name`,`address`,`city`,`state`,`zipcode`,`phone_no`) VALUES (3,'South China Legend','1720 N. Milpitas Blvd','Milpitas','CA','95035','408-934-3970');*/


/*Begin work for prod_type table*/

/*INSERT data to prod_type table*/


INSERT INTO `bw`.`prod_type`
(`biz_id`, `external_id`, `name`, `name_lang`, `display_order`)
SELECT
	3 AS `biz_id`, GUID, TITLENG, TITLECH, GROUPX
FROM
    rest_slegeng.table_catx
WHERE 
	(rest_slegeng.table_catx.MENUTYPE = 'A')
AND
	(NOT EXISTS (SELECT * FROM `bw`.`prod_type` 
	WHERE (`bw`.`prod_type`.`external_id` = rest_slegeng.table_catx.GUID)));

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
DELETE data from prod_type table by setting value of column 'active' of deleted data to 0.*/


UPDATE `bw`.`prod_type` t1, rest_slegeng.table_catx
SET 
	t1.`active` = 0
WHERE
	(t1.`external_id` NOT IN (select rest_slegeng.table_catx.GUID from rest_slegeng.table_catx)) AND (rest_slegeng.table_catx.MENUTYPE = 'A') AND (t1.`active` = 1) AND (t1.`biz_id` = 3);

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
UPDATE data for prod_type table*/


UPDATE `bw`.`prod_type` t2, rest_slegeng.table_catx c2
SET 
	t2.`name` = c2.TITLENG,
    t2.`name_lang` = c2.TITLECH,
	t2.`display_order` = c2.GROUPX,
	t2.`active` = 1
WHERE
    (t2.`external_id` = c2.GUID) AND (c2.MENUTYPE = 'A') AND (t2.`biz_id` = 3);

/*Done for prod_type table*/



/*Begin work for product table*/

/*There are two steps for inserting data to product table:
1. INSERT data to product table, and leave column 'type_id' with its default value NULL */


INSERT INTO `bw`.`product`
(`biz_id`, `external_id`, `name`, `name_lang`, `description`, `description_lang`, `price`)
SELECT
    3 AS `biz_id`, GUID, BOXENG, BOXCHN, DESEN, DESCH, PRICE
FROM
    rest_slegeng.table_menux
WHERE 
	rest_slegeng.table_menux.MENUTYPE = 'A'
AND
	rest_slegeng.table_menux.PRICE != 0
AND
	(NOT EXISTS (SELECT * FROM `bw`.`product` 
	WHERE (`bw`.`product`.`name` = rest_slegeng.table_menux.BOXENG)))
GROUP BY BOXENG HAVING (count(*) = 1);


/*2. UPDATE 'type_id' for product table with its correct value.*/


UPDATE `bw`.`product`, `bw`.`prod_type`, rest_slegeng.table_menux
SET 
	`bw`.`product`.`type_id` = `bw`.`prod_type`.`type_id`
WHERE
	`bw`.`prod_type`.`name` = rest_slegeng.table_menux.DEPTNAME
AND
	rest_slegeng.table_menux.BOXENG = `bw`.`product`.`name`
AND
	`bw`.`product`.`biz_id` = 3
AND
	`bw`.`prod_type`.`biz_id` = 3;

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
DELETE data from prod_type table by setting value of column 'active' of deleted data to 0.*/


UPDATE `bw`.`product` p1, rest_slegeng.table_menux
SET 
	p1.`active` = 0
WHERE
	(p1.`external_id` NOT IN (select rest_slegeng.table_menux.GUID from rest_slegeng.table_menux)) AND (rest_slegeng.table_menux.MENUTYPE = 'A') AND (p1.`active` = 1) AND (p1.`biz_id` = 3);


/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
UPDATE data for product table*/


UPDATE `bw`.`product` p2, rest_slegeng.table_menux t2
SET 
	p2.`name` = t2.BOXENG,
    p2.`name_lang` = t2.BOXCHN,
    p2.`description` = t2.DESEN,
    p2.`description_lang` = t2.DESCH,
    p2.`price` = t2.PRICE,
	p2.`active` = 1
WHERE
   (p2.`external_id` = t2.GUID) AND (t2.MENUTYPE = 'A') AND (p2.`biz_id` = 3);


/*Done for product table*/


/*DELETE all comma from name_lang and description_lang in product table*/
UPDATE bw.product p SET p.name_lang = REPLACE (p.name_lang, ',', '');
UPDATE bw.product p SET p.description_lang = REPLACE (p.description_lang, ',', '')


