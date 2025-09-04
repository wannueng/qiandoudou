package com.qiandoudou.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 消息通知实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("notifications")
public class Notification implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 通知ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 接收用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 发送者用户ID
     */
    @TableField("sender_id")
    private Long senderId;

    /**
     * 通知类型：1-点赞，2-评论，3-关注，4-系统通知
     */
    private Integer type;

    /**
     * 通知标题
     */
    private String title;

    /**
     * 通知内容
     */
    private String content;

    /**
     * 关联ID（动态ID、评论ID等）
     */
    @TableField("related_id")
    private Long relatedId;

    /**
     * 关联的钱包ID
     */
    @TableField("wallet_id")
    private Long walletId;

    /**
     * 关联的交易ID
     */
    @TableField("transaction_id")
    private Long transactionId;

    /**
     * 动态图片URL
     */
    @TableField("post_image")
    private String postImage;

    /**
     * 是否已读：0-否，1-是
     */
    @TableField("is_read")
    private Integer isRead;

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
