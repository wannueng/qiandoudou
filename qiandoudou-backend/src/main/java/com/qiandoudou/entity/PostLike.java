package com.qiandoudou.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 动态点赞实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("post_likes")
public class PostLike implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 点赞ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 动态ID（这里指向交易ID）
     */
    @TableField("post_id")
    private Long postId;

    /**
     * 点赞用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 是否AI点赞：0-否，1-是
     */
    @TableField("is_ai_like")
    private Integer isAiLike;

    /**
     * AI伴侣ID
     */
    @TableField("ai_partner_id")
    private Long aiPartnerId;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 是否删除：0-否，1-是
     */
    @TableLogic
    private Integer deleted;
}
