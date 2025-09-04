package com.qiandoudou.controller;

import com.qiandoudou.common.Result;
import com.qiandoudou.entity.User;
import com.qiandoudou.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            String token = userService.login(username, password);
            User user = userService.getUserByUsername(username);

            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("user", user);

            return Result.success("登录成功", result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<User> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String nickname = request.get("nickname");
            String phone = request.get("phone");

            User user = userService.register(username, password, nickname, phone);
            return Result.success("注册成功", user);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 微信登录
     */
    @PostMapping("/wechat-login")
    public Result<Map<String, Object>> wechatLogin(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            if (code == null || code.isEmpty()) {
                return Result.error("微信授权码不能为空");
            }

            String token = userService.wechatLogin(code);
            
            // 通过token解析出用户信息（简化处理）
            String openid = "wx_demo_" + code;
            User user = userService.getUserByOpenid(openid);

            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("user", user);

            return Result.success("微信登录成功", result);
        } catch (Exception e) {
            return Result.error("微信登录失败：" + e.getMessage());
        }
    }
}
