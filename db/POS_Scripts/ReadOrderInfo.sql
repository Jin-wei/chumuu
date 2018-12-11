/*READ ME*/
/*DO NOT RUN THIS SCRIPT BEFORE YOU RUN 'Excel_To_Mysql.sql' SCRIPT*/
/*READ ME*/

DROP FUNCTION IF EXISTS SPLIT_STR;

CREATE FUNCTION SPLIT_STR(
  x VARCHAR(255),
  delim VARCHAR(12),
  pos INT
)
RETURNS VARCHAR(255)
RETURN REPLACE(SUBSTRING(SUBSTRING_INDEX(x, delim, pos),
       LENGTH(SUBSTRING_INDEX(x, delim, pos -1)) + 1),
       delim, '');

/*@mon stores month of the imported data
  @yea stores year of the imported data*/

SET @mon = SPLIT_STR((SELECT `date` FROM excel_data LIMIT 1), '-', 2);
SET @yea = SPLIT_STR((SELECT `date` FROM excel_data LIMIT 1), '-', 1);

/*Insert data to 'stat_monthly_order' table. Colomn 'monthly_count' stores the number of orders per month*/

INSERT INTO `stat_monthly_order`
(`biz_id`, `product_id`, `month`, `year`, `year_month`, `monthly_count`)
SELECT p.`biz_id`, p.`prod_id`, @mon, @yea, @yea * IF(@mon>9,100,10) + @mon, e.`qty`
FROM `product` p, `excel_data` e
WHERE
p.`name` = e.`item_name` AND e.item_name != 'STEAM RICE'
AND
NOT EXISTS (SELECT * FROM `bw`.`stat_monthly_order`, `bw`.`excel_data` , `bw`.`product`
	WHERE 	
	`bw`.`product`.`name` = `bw`.`excel_data`.`item_name`
	AND
	`bw`.`stat_monthly_order`.`biz_id` = `bw`.`product`.`biz_id`
	AND
	`bw`.`product`.`prod_id` = `bw`.`stat_monthly_order`.`product_id`
	AND
	`bw`.`stat_monthly_order`.`month` = @mon
	AND
	`bw`.`stat_monthly_order`.`year`= @yea
	);

/*Drop 'excel_data' table which stores data from excel file */
DROP TABLE excel_data;