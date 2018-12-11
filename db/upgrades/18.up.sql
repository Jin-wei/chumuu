CREATE TABLE `biz_state_tax` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `state` varchar(10) NOT NULL,
  `tax_rate` decimal(5,2) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into biz_state_tax (state,tax_rate) values ('ca',8.75);
insert into db_upgrade (version) values (18);