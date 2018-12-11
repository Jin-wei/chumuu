CREATE TABLE `product_label` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `prod_id` bigint(11) NOT NULL,
  `label_id` bigint(11) NOT NULL,
  `label_name` varchar(30) DEFAULT '0',
  PRIMARY KEY (`id`)
)

CREATE TABLE `all_label` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `label_name` varchar(30) DEFAULT NULL,
  `label_name_lan` varchar(30) DEFAULT NULL,
  `key_word` varchar(1000) DEFAULT NULL,
  `key_word_lan` varchar(1000) DEFAULT NULL,
  `label_kind` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
)


insert into all_label (id,label_name,key_word,label_kind) values
(1,'特价菜','',0),
(2,'热销菜','',0),
(3,'十元以下','',0),
(4,'十元','',0),
(5,'二十元','',0),
(6,'三十元','',0),
(7,'四十元','',0),
(8,'五十元以上','',0),
(9,'烘焙甜品饮料','蛋糕面包饼干披萨派蛋挞司康塔泡芙奶油霜布丁冷饮果酱冰淇淋果冻咖啡豆浆奶茶酒果汁花草茶',0),
(10,'蔬菜水果','彩椒番茄南瓜玉米茄子黄瓜豇豆青椒苦瓜冬瓜丝瓜秋葵西葫芦毛豆豌豆四季豆荷兰豆蚕豆圣女果扁豆刀豆瓠瓜玉米笋西红柿椰子草莓橙牛油果木瓜山楂蓝莓西瓜柚子火龙果樱桃榴莲西柚桃葡萄金橘黄桃百香果杨梅桔子荔枝无花果石榴杏子桑葚哈密瓜柿子李子青梅枇杷香瓜甘蔗覆盆子杨桃橘子金桔杏土豆萝卜紫薯红薯胡萝卜山药藕芋头笋茭白马蹄牛蒡菱角芹菜白菜韭菜菠菜西兰花圆白菜花椰菜莴苣青菜娃娃菜生菜甘蓝蒜薹紫甘蓝空心菜油菜荠菜香椿茼蒿菜心芥兰黄花菜韭黄苋菜紫苏芥菜油麦菜豌豆苗苦菊青蒜鱼腥草马兰蕨菜西洋菜水芹儿菜豌豆尖芝麻菜芦蒿穿心莲孢子甘蓝萝卜苗红菜苔牛至蒿子杆包菜莴笋花菜蒜苔豆苗披萨草香菇杏鲍菇银耳木耳金针菇蘑菇茶树菇平菇松茸鸡腿菇草菇竹荪蟹味菇花菇猴头菇牛肝菌灵芝榛蘑白玉菇姬松茸滑子菇发菜白灵菇袖珍菇双孢菇秀珍菇',0),
(11,'水产','海水鱼淡水鱼鱼头鱼干鱼籽鱼肚虾仁海米虾皮明虾基围虾龙虾小龙虾河虾海虾皮皮虾北极虾虾干青虾草虾海白虾虾米蛤蜊干贝鲍鱼扇贝牡蛎青口蛏子鲜贝北极贝河蚌螃蟹梭子蟹大闸蟹蟹肉',0),
(12,'肉类','猪肉排骨猪肉末五花肉猪蹄瘦肉里脊猪肝猪排猪肚猪皮猪骨肥肠猪油猪腰猪耳朵猪心猪血猪肺肉末鸡翅鸡胸鸡腿鸡爪鸡肉乌鸡鸡胗土鸡仔鸡三黄鸡鸡肝老母鸡鸡心柴鸡童子鸡牛肉牛腩牛排肥牛牛里脊牛腱牛尾牛肉末牛筋牛百叶牛骨牛肉馅羊肉羊排羊腿羊肉片羊蝎子鸭腿鸭肉老鸭鸭胗鸭血鸭掌鸭翅鸭舌鸭肠鸭脖鸭肝鸭爪',0),
(13,'蛋豆制品','豆腐香干豆渣千张腐竹素鸡油豆皮豆干豆腐皮鸡蛋咸蛋皮蛋鹌鹑蛋鸭蛋咸鸭蛋',0)

Alter table order_item add column `prod_label` varchar(30) default Null;

DROP TABLE IF EXISTS `operator_user`;
CREATE TABLE `operator_user` (
    `operator_id` bigint(11) NOT NULL AUTO_INCREMENT COMMENT '客户自增长ID',
    `openid` varchar(50) DEFAULT NULL COMMENT '微信用户的唯一标识',
    `type` bigint(11) DEFAULT NULL COMMENT '1微信 2其他',
    `nickname` varchar(50) DEFAULT NULL COMMENT '用户昵称',
    `sex` bigint(11) DEFAULT NULL COMMENT '用户的性别，值为1时是男性，值为2时是女性，值为0时是未知',
    `province` varchar(50) DEFAULT NULL COMMENT '用户个人资料填写的省份',
    `city` varchar(50) DEFAULT NULL COMMENT '用户个人资料填写的城市',
    `country` varchar(50) DEFAULT NULL COMMENT '国家，如中国为CN',
    `headimgurl` varchar(200) DEFAULT NULL COMMENT '微信用户头像，最后一个数值代表正方形头像大小',
    `privilege` varchar(200) DEFAULT NULL COMMENT '微信用户特权信息，json 数组',
    `unionid` varchar(50) DEFAULT NULL COMMENT '微信只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段',
    `device` varchar(50) DEFAULT NULL,
    `user_agent` varchar(200) DEFAULT NULL,
    `ip` varchar(50) DEFAULT NULL,
    `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_on` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`operator_id`)
) ;


DROP TABLE IF EXISTS `operator_history`;
CREATE TABLE `operator_history` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `operator_id` bigint(11) NOT NULL,
  `operation` varchar(50) DEFAULT NULL ,
  `customer_id` bigint(11) DEFAULT NULL,
   `created_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ;

Alter table order_info add column `operator_id` bigint(11) DEFAULT NULL;

insert into db_upgrade (version) values (57);