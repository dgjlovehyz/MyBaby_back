CREATE TABLE `child_main` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
  `child_id`int(11) NOT NULL COMMENT '宝贝id',
  `name` VARCHAR(100) NOT NULL COMMENT '宝贝名字',
  `sex` INT(4) NOT NULL COMMENT '宝贝性别',
  `birth_time` int(11)  NOT NULL  COMMENT '出生日期',
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;