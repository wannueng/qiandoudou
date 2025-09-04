package com.qiandoudou.service.impl;

import com.qiandoudou.entity.AiPartner;
import com.qiandoudou.service.AiService;
import com.qiandoudou.service.AiPartnerService;
import com.qiandoudou.service.ImageToTextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Base64;

/**
 * AI服务实现类
 * 注意：这里只是预留接口，实际项目中需要集成真实的AI服务
 */
@Service
public class AiServiceImpl implements AiService {

    @Value("${ai.api.base-url}")
    private String aiApiBaseUrl;

    @Value("${ai.api.api-key}")
    private String aiApiKey;

    @Autowired
    private AiPartnerService aiPartnerService;

    @Autowired
    private ImageToTextService imageToTextService;

    @Override
    public String generateScriptContent(String theme, String previousContent, String userChoice) {
        // TODO: 集成OpenAI或其他AI服务生成剧本内容
        // 这里返回模拟内容
        return "根据你的选择：" + userChoice + "，故事继续发展...（这里是AI生成的剧本内容，实际项目中需要调用真实的AI API）";
    }

    @Override
    public String generateScriptImage(String content) {
        // TODO: 集成DALL-E或其他AI图片生成服务
        // 这里返回模拟图片URL
        return "/img/scripts/generated_" + System.currentTimeMillis() + ".jpg";
    }

    @Override
    public String generatePartnerComment(Long partnerId, String postContent) {
        try {
            AiPartner partner = aiPartnerService.getById(partnerId);
            if (partner == null) {
                return "亲爱的，你今天的表现真不错！";
            }

            // 根据AI伴侣的性格生成不同风格的评论
            String personality = partner.getPersonality();
            String name = partner.getName();

            if (personality.contains("温柔")) {
                return name + "：" + "亲爱的，看到你这样努力储蓄，我真的很开心呢～继续加油哦！💕";
            } else if (personality.contains("幽默")) {
                return name + "：" + "哇，又存钱了！看来我们离财务自由又近了一步，今晚庆祝一下？😄";
            } else if (personality.contains("可爱")) {
                return name + "：" + "好棒好棒！你是最厉害的储蓄小能手！✨";
            } else {
                return name + "：" + "很好的理财决策，这样的习惯值得坚持。";
            }
        } catch (Exception e) {
            return "亲爱的，你今天的表现真不错！";
        }
    }

    @Override
    public String generatePartnerVoice(Long partnerId, String text) {
        // TODO: 集成语音合成服务
        // 这里返回模拟语音文件URL
        return "/voice/partner_" + partnerId + "_" + System.currentTimeMillis() + ".mp3";
    }

    @Override
    public String generateTextFromImage(String imageUrl) {
        try {
            // 1. 先将图片URL转换为base64
            String imageBase64 = convertImageUrlToBase64(imageUrl);
            
            // 2. 调用图生文API
            String prompt = "你是一个朋友圈文案助手，根据图片生成朋友圈的文案，少于100字，不要生成其他内容,不要思考太久";
            return imageToTextService.generateTextFromImage(imageBase64, prompt);
        } catch (Exception e) {
            // 如果调用失败，返回默认描述
            return "这是一张很棒的图片，记录了美好的时刻！";
        }
    }

    /**
     * 将图片URL转换为base64编码
     */
    private String convertImageUrlToBase64(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            try (InputStream inputStream = url.openStream();
                 ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                
                byte[] imageBytes = outputStream.toByteArray();
                return Base64.getEncoder().encodeToString(imageBytes);
            }
        } catch (Exception e) {
            throw new RuntimeException("图片转换为base64失败: " + e.getMessage(), e);
        }
    }

    @Override
    public String generateTextFromImageBase64(String imageBase64, String prompt) {
        return imageToTextService.generateTextFromImage(imageBase64, prompt);
    }
}
