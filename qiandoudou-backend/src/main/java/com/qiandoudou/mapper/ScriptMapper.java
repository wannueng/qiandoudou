package com.qiandoudou.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.qiandoudou.entity.Script;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 剧本Mapper接口
 */
@Mapper
public interface ScriptMapper extends BaseMapper<Script> {

    /**
     * 根据分类获取剧本列表
     */
    @Select("SELECT * FROM scripts WHERE category_id = #{categoryId} AND status = 1 AND deleted = 0 ORDER BY follower_count DESC")
    List<Script> getScriptsByCategory(Integer categoryId);

    /**
     * 获取推荐剧本列表
     */
    @Select("SELECT * FROM scripts WHERE status = 1 AND deleted = 0 ORDER BY follower_count DESC")
    List<Script> getRecommendedScripts();
}
