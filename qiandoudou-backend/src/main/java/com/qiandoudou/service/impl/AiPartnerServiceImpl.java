package com.qiandoudou.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.qiandoudou.entity.AiPartner;
import com.qiandoudou.mapper.AiPartnerMapper;
import com.qiandoudou.service.AiPartnerService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AI伴侣服务实现类
 */
@Service
public class AiPartnerServiceImpl extends ServiceImpl<AiPartnerMapper, AiPartner> implements AiPartnerService {

    @Override
    public List<AiPartner> getAvailablePartners() {
        LambdaQueryWrapper<AiPartner> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByAsc(AiPartner::getId);
        return list(queryWrapper);
    }

    @Override
    public List<AiPartner> getPartnersByGender(Integer gender) {
        LambdaQueryWrapper<AiPartner> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AiPartner::getGender, gender)
                .orderByAsc(AiPartner::getId);
        return list(queryWrapper);
    }
}
