package com.qiandoudou.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 钱包实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("wallets")
public class Wallet implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 钱包ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 钱包名称
     */
    private String name;

    /**
     * 钱包类型：1-个人钱包，2-情侣钱包
     */
    private Integer type;

    /**
     * 余额
     */
    private BigDecimal balance;

    /**
     * 背景图片URL
     */
    @TableField("background_image")
    private String backgroundImage;

    /**
     * AI伴侣ID（情侣钱包专用）
     */
    @TableField("ai_partner_id")
    private Long aiPartnerId;

    /**
     * 是否公开到社交圈：0-否，1-是
     */
    @TableField("is_public")
    private Integer isPublic;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 是否删除：0-否，1-是
     */
    @TableLogic
    private Integer deleted;
}
