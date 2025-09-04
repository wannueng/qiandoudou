package com.qiandoudou.controller;

import com.qiandoudou.common.Result;
import com.qiandoudou.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

/**
 * 用户控制器
 * 处理 /api/user 路径下的用户相关请求
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private SocialService socialService;

    /**
     * 获取用户互动消息
     */
    @GetMapping("/interaction-messages")
    public Result<List<Map<String, Object>>> getUserInteractionMessages(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        try {
            System.out.println("获取用户互动消息: userId=" + userId + ", page=" + page + ", pageSize=" + pageSize);
            List<Map<String, Object>> messages = socialService.getUserInteractionMessages(userId, page, pageSize);
            return Result.success(messages);
        } catch (Exception e) {
            System.err.println("获取用户互动消息失败: " + e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取用户未读消息数量
     */
    @GetMapping("/unread-count")
    public Result<Integer> getUnreadMessageCount(@RequestParam Long userId) {
        try {
            System.out.println("获取用户未读消息数量: userId=" + userId);
            Integer count = socialService.getUnreadMessageCount(userId);
            return Result.success(count);
        } catch (Exception e) {
            System.err.println("获取用户未读消息数量失败: " + e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    /**
     * 标记消息为已读
     */
    @PostMapping("/mark-read")
    public Result<String> markMessagesAsRead(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            System.out.println("标记消息为已读: userId=" + userId);
            socialService.markMessagesAsRead(userId);
            return Result.success("标记成功");
        } catch (Exception e) {
            System.err.println("标记消息为已读失败: " + e.getMessage());
            return Result.error(e.getMessage());
        }
    }
}
