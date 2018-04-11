-- 外部参数 key
local _key = ARGV[1] 

-- 外部参数 有效期(秒)
local _ex = tonumber(ARGV[2]) 

local _lock_key = 'kmsp_lock:' .. _key

local exists = tonumber(redis.call('EXISTS',_lock_key))

if(exists == 0)
then
	redis.call('SETEX',_lock_key,_ex,1)
	return 1
end

return 0



