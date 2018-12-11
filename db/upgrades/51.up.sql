 CREATE TABLE `table_qrcode` (
     `seq_id` bigint(11) unsigned NOT NULL,
     `code` varchar(50) NOT NULL,
     `table_id` int(11) DEFAULT NULL,
     `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`seq_id`),
      UNIQUE KEY `table_qrcode_code_uk` (`code`),
      UNIQUE KEY `table_qrcode_table_id_uk` (`table_id`)
    ) ENGINE=InnoDB CHARSET=utf8 COMMENT= 'This is the table to store table proxy qr code';

insert into db_upgrade (version) values (51);