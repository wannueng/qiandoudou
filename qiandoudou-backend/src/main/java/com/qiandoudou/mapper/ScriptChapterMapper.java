package com.qiandoudou.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.qiandoudou.entity.ScriptChapter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 剧本章节Mapper接口
 */
@Mapper
public interface ScriptChapterMapper extends BaseMapper<ScriptChapter> {

    /**
     * 根据剧本ID获取章节列表
     */
    @Select("SELECT * FROM script_chapters WHERE script_id = #{scriptId} AND deleted = 0 ORDER BY chapter_number")
    List<ScriptChapter> getChaptersByScriptId(Long scriptId);

    /**
     * 根据剧本ID和章节号获取章节
     */
    @Select("SELECT * FROM script_chapters WHERE script_id = #{scriptId} AND chapter_number = #{chapterNumber} AND deleted = 0")
    ScriptChapter getChapterByScriptIdAndNumber(Long scriptId, Integer chapterNumber);
}
