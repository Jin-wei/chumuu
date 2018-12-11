/**
 * Created by ibm on 15-3-16.
 */
ALTER TABLE bw.order_payment DROP refund;
ALTER TABLE bw.order_payment add column parent_id varchar(20)  default null;
ALTER TABLE bw.order_payment  CHANGE payment_nonce payment_nonce VARCHAR(40);


insert into lov_category (`id`,`category_info`) values (5,'payment_status');
insert into lov_category (`id`,`category_info`) values (6,'payment_type');

ALTER TABLE bw.lov add column status tinyint(1) default null;
insert into lov (`id`,`category_id`,`status`,`status_info`) values (501,5,1,'Authorized');
insert into lov (`id`,`category_id`,`status`,`status_info`) values (502,5,2,'SETTLING');
insert into lov (`id`,`category_id`,`status`,`status_info`) values (503,5,3,'SETTLEMENT');
insert into lov (`id`,`category_id`,`status`,`status_info`) values (504,5,4,'VOID');
insert into lov (`id`,`category_id`,`status`,`status_info`) values (505,5,5,'REFUND');


insert into lov (`id`,`category_id`,`status`,`status_info`) values (601,6,0,'paypal');
insert into lov (`id`,`category_id`,`status`,`status_info`) values (602,6,1,'creditCard');

insert into db_upgrade (version) values (40);