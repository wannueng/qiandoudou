package com.qiandoudou.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 剧本实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("scripts")
public class Script implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 剧本ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 剧本标题
     */
    private String title;

    /**
     * 剧本描述
     */
    private String description;

    /**
     * 分类：1-推荐，2-旅行，3-购物，4-学习，5-健身
     */
    private Integer categoryId;

    /**
     * 封面图片URL
     */
    private String coverImage;

    /**
     * 总章节数
     */
    private Integer totalChapters;

    /**
     * 目标攒钱金额
     */
    private BigDecimal targetAmount;

    /**
     * 攒钱周期（天）
     */
    private Integer durationDays;

    /**
     * 建议每日攒钱金额
     */
    private BigDecimal dailyAmount;

    /**
     * 关注人数
     */
    private Integer followerCount;

    /**
     * 状态：1-启用，0-禁用
     */
    private Integer status;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 是否删除：0-否，1-是
     */
    @TableLogic
    private Integer deleted;
}
