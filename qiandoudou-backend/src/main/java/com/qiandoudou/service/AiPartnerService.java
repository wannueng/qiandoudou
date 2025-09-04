package com.qiandoudou.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.qiandoudou.entity.AiPartner;

import java.util.List;

/**
 * AI伴侣服务接口
 */
public interface AiPartnerService extends IService<AiPartner> {

    /**
     * 获取所有可用的AI伴侣
     */
    List<AiPartner> getAvailablePartners();

    /**
     * 根据性别获取AI伴侣
     */
    List<AiPartner> getPartnersByGender(Integer gender);
}
