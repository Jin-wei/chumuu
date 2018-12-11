CREATE SCHEMA `bw` ;
CREATE USER 'biz'@'localhost' IDENTIFIED BY 'wise';

GRANT ALL privileges ON bw.* TO 'biz'@'localhost'IDENTIFIED BY 'wise';
