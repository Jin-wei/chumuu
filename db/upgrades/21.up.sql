/**
 * Created by ibm on 14-8-11.
 */
CREATE TABLE `feedback` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `cust_id` bigint(11) DEFAULT NULL,
  `contact_email` varchar(200) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `content` varchar(1000) NOT NULL,
  `level` int(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE bw.business
MODIFY COLUMN bw.business.desc varchar(1000);
insert into db_upgrade (version) values (21);