-- 外部参数 模块
local _MODULE = ARGV[1] 

-- 外部参数 生成个数
local _COUNT = tonumber(ARGV[2]) 

-- 环境：
-- 1 开发环境
-- 2 内网测试环境
-- 3 外网测试环境
-- 4 预览环境
-- 5 正式环境

local _ENV = 2

-- 自增长KEY
local _INCRKEY = 'kem:id_generator_' .. _MODULE

-- 预定位
local _INIT = 100000000000

-- 业务ID数组
local _IDS = {}

-- 当前自增值
local _INCREMENT = redis.call('get',_INCRKEY)

-- 如果小于预定位则初始化为预定位
if(_INCREMENT == false or tonumber(_INCREMENT) < _INIT)
then
    redis.call('set',_INCRKEY,_INIT)
end

for i=1,_COUNT,1 do
    _IDS[i] = _MODULE .. _ENV .. redis.call('incr',_INCRKEY)
end

return table.concat(_IDS,',')



