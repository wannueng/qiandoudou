package com.qiandoudou.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qiandoudou.service.ImageToTextService;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 图生文服务实现类
 */
@Service
public class ImageToTextServiceImpl implements ImageToTextService {

    private static final Logger logger = LoggerFactory.getLogger(ImageToTextServiceImpl.class);

    @Value("${ai.image-to-text.api-url:http://113.45.231.186:1236/generate}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Pattern thinkTagPattern = Pattern.compile("<think>.*?</think>", Pattern.DOTALL);
    // 用于提取JSON中text字段内容的正则表达式
    private final Pattern jsonTextPattern = Pattern.compile("\\{\"text\":\"([^\"]*?)\"\\}");

    @Override
    public String generateTextFromImage(String imageBase64, String prompt) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            // 构造请求
            HttpPost httpPost = new HttpPost(apiUrl);
            httpPost.setHeader("Content-Type", "application/json");

            // 构造请求体
            Map<String, Object> payload = new HashMap<>();
            payload.put("image", new String[]{imageBase64});
            payload.put("prompt", prompt != null ? prompt : "你是一个朋友圈文案助手，根据图片生成朋友圈的文案，少于100字，不要生成其他内容,不要思考太久");

            String jsonPayload = objectMapper.writeValueAsString(payload);
            StringEntity entity = new StringEntity(jsonPayload, StandardCharsets.UTF_8);
            httpPost.setEntity(entity);

            // 发送请求
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getStatusLine().getStatusCode();
                
                if (statusCode == 200) {
                    String responseBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                    
                    // 添加日志：打印AI接口返回值
                    logger.info("图生文API返回值: {}", responseBody);
                    
                    // 处理响应
                    String resultText = extractTextFromResponse(responseBody);
                    
                    // 去除 <think></think> 部分
                    resultText = thinkTagPattern.matcher(resultText).replaceAll("");
                    
                    logger.info("处理后的文本: {}", resultText);
                    
                    return resultText.trim();
                } else {
                    String errorBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                    logger.error("图生文API调用失败，状态码: {}, 响应: {}", statusCode, errorBody);
                    throw new RuntimeException("API调用失败，状态码: " + statusCode);
                }
            }
        } catch (IOException e) {
            logger.error("图生文API调用异常: {}", e.getMessage(), e);
            throw new RuntimeException("图生文API调用异常: " + e.getMessage(), e);
        }
    }

    /**
     * 从API响应中提取文本内容
     * 处理格式如: {"text":"\n竹影婆娑，绿裳映幽。风过处，叶动心弦，偷得半日闲。"}
     */
    private String extractTextFromResponse(String responseBody) {
        try {
            // 首先尝试解析为JSON
            JsonNode responseJson = objectMapper.readTree(responseBody);
            
            // 如果响应是JSON对象且包含text字段
            if (responseJson.isObject() && responseJson.has("text")) {
                String textContent = responseJson.get("text").asText();
                // 去除开头的换行符和空格
                return textContent.replaceAll("^\\s*\\n\\s*", "").trim();
            }
            
            // 如果是其他格式，尝试使用正则表达式提取
            java.util.regex.Matcher matcher = jsonTextPattern.matcher(responseBody);
            if (matcher.find()) {
                String textContent = matcher.group(1);
                // 去除开头的换行符和空格
                return textContent.replaceAll("^\\s*\\n\\s*", "").trim();
            }
            
            // 如果是纯文本响应
            if (responseJson.isTextual()) {
                return responseJson.asText().trim();
            }
            
            // 其他情况，返回原始响应
            return responseBody.trim();
            
        } catch (Exception e) {
            logger.warn("解析响应JSON失败，尝试直接处理: {}", e.getMessage());
            
            // JSON解析失败，尝试正则表达式直接处理字符串
            java.util.regex.Matcher matcher = jsonTextPattern.matcher(responseBody);
            if (matcher.find()) {
                String textContent = matcher.group(1);
                // 去除开头的换行符和空格
                return textContent.replaceAll("^\\s*\\n\\s*", "").trim();
            }
            
            // 最后返回原始内容
            return responseBody.trim();
        }
    }
}
