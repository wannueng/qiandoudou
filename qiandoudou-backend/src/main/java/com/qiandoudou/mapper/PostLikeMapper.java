package com.qiandoudou.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.qiandoudou.entity.PostLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Delete;

/**
 * 动态点赞 Mapper 接口
 */
@Mapper
public interface PostLikeMapper extends BaseMapper<PostLike> {

    /**
     * 检查用户是否已点赞某个交易
     */
    @Select("SELECT COUNT(*) FROM post_likes " +
            "WHERE post_id = #{transactionId} AND user_id = #{userId} AND deleted = 0")
    Integer checkUserLiked(@Param("transactionId") Long transactionId, @Param("userId") Long userId);

    /**
     * 获取交易的点赞数量
     */
    @Select("SELECT COUNT(*) FROM post_likes " +
            "WHERE post_id = #{transactionId} AND deleted = 0")
    Integer getTransactionLikeCount(@Param("transactionId") Long transactionId);

    /**
     * 获取用户的总获赞数
     */
    @Select("SELECT COUNT(*) FROM post_likes pl " +
            "INNER JOIN transactions t ON pl.post_id = t.id " +
            "WHERE t.user_id = #{userId} AND pl.deleted = 0 AND t.deleted = 0")
    Integer getUserTotalLikes(@Param("userId") Long userId);

    /**
     * 删除点赞记录（软删除）
     */
    @Delete("UPDATE post_likes SET deleted = 1 " +
            "WHERE post_id = #{transactionId} AND user_id = #{userId}")
    void removeLike(@Param("transactionId") Long transactionId, @Param("userId") Long userId);
}
