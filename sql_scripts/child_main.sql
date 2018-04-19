CREATE TABLE `child_main` (
  `child_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
  `uuid` VARCHAR(100) NOT NULL COMMENT '宝贝唯一编号',
  `name` VARCHAR(100) NOT NULL COMMENT '宝贝名字',
  `sex` INT(4) NOT NULL COMMENT '宝贝性别1女，2男',
  `birth_time` datetime  NOT NULL  COMMENT '出生日期',
  `status` INT(4) DEFAULT 0 COMMENT '状态',
  `creat_time` datetime DEFAULT now() COMMENT '创建时间',
  `is_delete` BOOL NOT NULL DEFAULT FALSE COMMENT '是否删除',
  PRIMARY KEY (`child_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;