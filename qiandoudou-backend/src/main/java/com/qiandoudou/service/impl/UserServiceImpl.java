package com.qiandoudou.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.qiandoudou.entity.User;
import com.qiandoudou.mapper.UserMapper;
import com.qiandoudou.service.UserService;
import com.qiandoudou.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 微信小程序配置（实际项目中应该从配置文件读取）
    private static final String WX_APPID = "your_wx_appid";
    private static final String WX_SECRET = "your_wx_secret";

    @Override
    public String login(String username, String password) {
        // 根据用户名查找用户
        User user = getUserByUsername(username);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 验证密码 (Demo版本使用明文比较)
        if (!password.equals(user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        // 生成JWT token
        return jwtUtil.generateToken(user.getId(), user.getUsername());
    }

    @Override
    public User register(String username, String password, String nickname, String phone) {
        // 检查用户名是否已存在
        if (getUserByUsername(username) != null) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查手机号是否已存在
        if (phone != null && getUserByPhone(phone) != null) {
            throw new RuntimeException("手机号已注册");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // Demo版本直接存储明文密码
        user.setNickname(nickname);
        user.setPhone(phone);

        // 保存用户
        save(user);
        return user;
    }

    @Override
    public User getUserByUsername(String username) {
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, username);
        return getOne(queryWrapper);
    }

    @Override
    public User getUserByPhone(String phone) {
        if (phone == null) {
            return null;
        }
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getPhone, phone);
        return getOne(queryWrapper);
    }

    @Override
    public String wechatLogin(String code) {
        try {
            // 为了演示，我们简化微信登录流程
            // 实际项目中需要调用微信API获取openid
            String openid = "wx_demo_" + code;
            
            // 查找是否已有该openid的用户
            User user = getUserByOpenid(openid);
            
            if (user == null) {
                // 如果用户不存在，创建新用户
                user = new User();
                user.setUsername("wx_" + System.currentTimeMillis());
                user.setNickname("微信用户");
                user.setOpenid(openid);
                save(user);
            }
            
            // 生成JWT token
            return jwtUtil.generateToken(user.getId(), user.getUsername());
        } catch (Exception e) {
            throw new RuntimeException("微信登录失败: " + e.getMessage());
        }
    }

    @Override
    public User getUserByOpenid(String openid) {
        if (openid == null) {
            return null;
        }
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getOpenid, openid);
        return getOne(queryWrapper);
    }
}
