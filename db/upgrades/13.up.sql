
ALTER TABLE stat_menu_click add column `order_count` int(11) default 0;
ALTER TABLE business add column `time_offset` int(11) NOT NULL default -7;
ALTER TABLE business add column `name_lang` varchar(100) ;

insert into db_upgrade (version) values (13);
