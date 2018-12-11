ALTER TABLE bw.order_info add column op_remark varchar(1000) default null;

CREATE TABLE `order_status_history` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(11) NOT NULL,
  `order_status` tinyint(1) NOT NULL,
  `op_user` varchar(100) DEFAULT NULL,
  `op_remark` varchar(200) DEFAULT NULL,
  `op_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;


CREATE TRIGGER order_status_trigger
AFTER
update
ON `order_info`
FOR EACH ROW
BEGIN
if new.status!=old.status then
insert into order_status_history(`order_id`,`order_status`,`op_user`,`op_remark`) values (old.id,new.status,new.operator,new.op_remark);
end if;
END;

ALTER TABLE bw.biz_user ADD CONSTRAINT biz_user_unique_email unique (email);

insert into db_upgrade (version) values (43);