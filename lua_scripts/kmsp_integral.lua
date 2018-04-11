-- 外部参数 模块
local _kid = ARGV[1] 

-- 外部参数 生成个数
local _userId = ARGV[2] 

-- 外部参数 类型 1 积分 2 优惠券 3 优惠卡
local _type = ARGV[3] 

-- 外部参数 操作类型 0 归还 1 使用
local _action = ARGV[4] 

-- 外部参数 标识id
local _id = tonumber(ARGV[5]) 

-- 外部参数 积分
local _i = tonumber(ARGV[6]) 

if(_type == "1")
then
    -- 1 积分
    if(_i <= 0)
    then
        return 0;
    end
    
    local _key = 'integral:' .. _kid

    if(_action == "0")
    then
        local exists = tonumber(redis.call('HEXISTS',_key,_userId))
        if(exists == 1)
        then
            local __i = tonumber(redis.call('HGET',_key,_userId))
            if(_i > __i) then return 0 end
            if(_i == __i) 
            then
                redis.call('HDEL',_key,_userId)
            else
                if(_i > 0) then _i = _i * -1 end 
                    redis.call('HINCRBY',_key,_userId,_i)
            end
        end
    elseif(_action == "1")
    then
        redis.call('HINCRBY',_key,_userId,_i)
    else
        return 0
    end

elseif(_type == "2")
then
    -- 2 优惠卷
    local _key = 'coupon:' .. _kid .. '_' .. _userId 
    local _r_key = 'coupon_r:' .. _kid .. '_' .. _id 

    if(_action == "0")
    then
        redis.call('HDEL',_key,_id)
        redis.call('HDEL',_r_key,_userId)
    elseif(_action == "1")
    then
        redis.call('HSET',_key,_id,1)
        redis.call('HSET',_r_key,_userId,1)
    else
        return 0
    end

elseif(_type == "3")
then
    -- 3 优惠卡
    local _key = 'card:' .. _kid .. '_' .. _userId 
    local _r_key = 'card_r:' .. _kid .. '_' .. _id 

    if(_action == "0")
    then
        local exists = tonumber(redis.call('HEXISTS',_key,_id))
        if(exists == 1)
        then
            local __i = tonumber(redis.call('HGET',_key,_id))
            if(_i > __i) then return 0 end
            if(_i == __i) 
            then
                redis.call('HDEL',_key,_id)
                redis.call('HDEL',_r_key,_userId)
            else
                if(_i < 0) then _i = _i * -1 end 
                local __i = tonumber(redis.call('HGET',_key,_id))
                redis.call('HSET',_key,_id,__i - _i)
            end
        end
    elseif(_action == "1")
    then
        local str__i = redis.call('HGET',_key,_id)
        local __i = tonumber((str__i and {str__i} or {0})[1])
        local str_r_i = tostring(_i + __i)
        redis.call('HSET',_key,_id,str_r_i)
        redis.call('HSET',_r_key,_userId,str_r_i)
    else
        return 0
    end
else
    return 0
end

return 1
