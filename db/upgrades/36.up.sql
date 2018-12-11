ALTER TABLE bw.biz_user_rel ADD COLUMN role_type tinyint(1) DEFAULT '0' ;
ALTER TABLE bw.biz_user_rel ADD COLUMN remark varchar(100) DEFAULT null ;

update bw.biz_user_rel set role_type='9';



insert into db_upgrade (version) values (36);
