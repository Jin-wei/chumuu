alter table order_payment add column status tinyint(1) not null default 1;
alter table order_payment add column refund decimal(10,2) not null default 0;

update order_payment set status = 2;

insert into db_upgrade (version) values (39);