1.After you get menu data csv file. Go to yelp find its resturant information: (name, address, phone number)

2.Go to http://www.latlong.net/convert-address-to-lat-long.html to use to address to get the Latitude and Longitude.

3.Go to mysql to intial the business with the above information. And initial the biz user. And initial biz user relation.
	NOTICE*:check the last manual input business in business table to ensure the biz_id you need to insert
	
	Mysql code: 
		Intial Biz: INSERT INTO `business` (`biz_id`,`name`,`address`,`city`,`state`,`zipcode`,`latitude`,`longitude`,`phone_no`,`owner_name`,`category`,`note`,`active`) VALUES (44,'Ray’s Crab Shack','5989 Mowry Ave','Newark','CA','94560',37.525934,-122.007426,'(510) 792-8808','','','',1);

		Intial Biz User: INSERT INTO `biz_user` (`user_id`,`username`,`password`,`gender`,`first_name`,`last_name`,`active`) VALUES (44,'Ray’s Crab Shack','',1,'Ray','',1);

		Intial Biz User Relation: INSERT INTO `biz_user_rel` (`user_id`,`biz_id`,`role_type`) VALUES (44,44,9);

4. Ensure the menu data format match import_sample.csv, and make sure it is .csv file.

5. rename the menu data file to target_menu_data.csv, and cover the target_menu_data.csv in the production server: /opt/trumenu/dist/tool/target_menu_data.csv

6. connect to production server via terminal. follow the code below:

	cd /opt/trumenu/dist/tool/
	
	more target_menu_data.csv

	Ensure the data inside of csv file is correct.

7. input menu data via csv-import-mysql.js. follow the code below:

	node csv-import-mysql.js (biz_id of the target biz)



