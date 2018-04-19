CREATE TABLE `user_child_relation` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
  `user_id` INT(11) NOT NULL COMMENT '用户id',
  `child_id` INT(11) NOT NULL COMMENT '宝贝id',
  `user_relation` VARCHAR(100) DEFAULT NULL COMMENT '用户是宝贝的什么关系',
  `child_relation` VARCHAR(100) DEFAULT NULL COMMENT '宝贝是用户的什么关系',
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;
