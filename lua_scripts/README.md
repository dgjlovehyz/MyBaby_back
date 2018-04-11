## DEV环境
```
redis-cli -h 192.168.1.228 -p 6379 -n 0  SCRIPT LOAD "$(cat kem_id_generator.lua)"  
redis-cli -h 192.168.1.228 -p 6379 -n 0 EVALSHA f1c8c21a5ecfad60665f291492a99cba9a5bfb99 0 [模块] [生成个数] 

redis-cli -h 192.168.1.125 -p 6100 -a 123456 -n 10  SCRIPT LOAD "$(cat kmsp_integral.lua)"  
redis-cli -h 192.168.1.125 -p 6100 -a 123456 -n 10 EVALSHA 5dfd4615ab9ab4fd0c651dc2f3fe741a9f34490e 0 [kid] [userId] [type] [action] [_id] [积分]

redis-cli -h 192.168.1.125 -p 6100 -a 123456 -n 10  SCRIPT LOAD "$(cat kmsp_lock.lua)"  
redis-cli -h 192.168.1.125 -p 6100 -a 123456 -n 10 EVALSHA 1bd0cf997de7f947d63f285101ff4346fe6575cc 0 [key] [ex]
```