package com.qiandoudou.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户剧本进度实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("user_script_progress")
public class UserScriptProgress implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 进度ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 钱包ID
     */
    private Long walletId;

    /**
     * 剧本ID
     */
    private Long scriptId;

    /**
     * 当前章节
     */
    private Integer currentChapter;

    /**
     * 已支付金额
     */
    private BigDecimal totalPaid;

    /**
     * 已做选择（JSON格式）
     */
    private String choicesMade;

    /**
     * 状态：1-进行中，2-已完成，3-已放弃
     */
    private Integer status;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 完成时间
     */
    private LocalDateTime completeTime;

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
