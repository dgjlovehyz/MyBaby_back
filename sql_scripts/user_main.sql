CREATE TABLE `user_main` (
  `user_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
  `open_id` VARCHAR(100) DEFAULT NULL COMMENT '微信过来的用户标识',
  `status` INT(4) DEFAULT 0 COMMENT '状态',
  `creat_time` datetime NOT NULL DEFAULT now() COMMENT '是否删除',
  `is_delete` BOOL NOT NULL DEFAULT FALSE COMMENT '是否删除',
  PRIMARY KEY (`user_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;
