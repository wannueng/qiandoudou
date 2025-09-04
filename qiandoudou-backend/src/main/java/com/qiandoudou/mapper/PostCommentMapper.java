package com.qiandoudou.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.qiandoudou.entity.PostComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 动态评论 Mapper 接口
 */
@Mapper
public interface PostCommentMapper extends BaseMapper<PostComment> {

    /**
     * 获取交易的评论列表
     */
    @Select("SELECT pc.*, u.nickname as user_nickname, u.avatar as user_avatar " +
            "FROM post_comments pc " +
            "LEFT JOIN users u ON pc.user_id = u.id " +
            "WHERE pc.post_id = #{transactionId} AND pc.deleted = 0 " +
            "ORDER BY pc.create_time ASC")
    List<Map<String, Object>> getTransactionComments(@Param("transactionId") Long transactionId);

    /**
     * 获取交易的评论数量
     */
    @Select("SELECT COUNT(*) FROM post_comments " +
            "WHERE post_id = #{transactionId} AND deleted = 0")
    Integer getTransactionCommentCount(@Param("transactionId") Long transactionId);

    /**
     * 获取用户的总评论数
     */
    @Select("SELECT COUNT(*) FROM post_comments " +
            "WHERE user_id = #{userId} AND deleted = 0")
    Integer getUserTotalComments(@Param("userId") Long userId);
}
