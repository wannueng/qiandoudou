package com.qiandoudou.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 剧本章节实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("script_chapters")
public class ScriptChapter implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 章节ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 剧本ID
     */
    private Long scriptId;

    /**
     * 章节序号
     */
    private Integer chapterNumber;

    /**
     * 章节标题
     */
    private String title;

    /**
     * 章节内容
     */
    private String content;

    /**
     * 章节图片URL
     */
    private String imageUrl;

    /**
     * 章节视频URL
     */
    private String videoUrl;

    /**
     * 选择项（JSON格式）
     */
    private String choices;

    /**
     * 解锁所需金额
     */
    private BigDecimal unlockAmount;

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
