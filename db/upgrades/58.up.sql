
UPDATE operator_history SET operation='scan' WHERE operation='sweep'

CREATE TABLE `all_callOut` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(30) DEFAULT NULL,
  `call_content` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
)
CREATE TABLE `biz_callOut` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) DEFAULT NULL,
  `callOut_id` bigint(11) DEFAULT NULL,
  `title` varchar(30) DEFAULT NULL,
  `call_ content` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
)

insert into all_callOut (id,title,call_content) values
(1,'我要结账','XXX号桌,吃饱啦,结账吧'),
(2,'我要催菜','XXX号桌,快点上菜'),
(3,'我要茶水','XXX号桌,请给我一杯茶水'),
(4,'呼叫服务员','XXX号桌呼叫服务员')

insert into db_upgrade (version) values (58);