package com.qiandoudou.controller;

import com.qiandoudou.common.Result;
import com.qiandoudou.entity.Transaction;
import com.qiandoudou.entity.Wallet;
import com.qiandoudou.service.AiService;
import com.qiandoudou.service.TransactionService;
import com.qiandoudou.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 钱包控制器
 */
@RestController
@RequestMapping("/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private AiService aiService;
    
    @Autowired
    private com.qiandoudou.mapper.WalletMapper walletMapper;

    /**
     * 获取用户钱包列表
     */
    @GetMapping("/list")
    public Result<List<Map<String, Object>>> getUserWallets(@RequestParam Long userId) {
        try {
            List<Map<String, Object>> wallets = walletService.getUserWallets(userId);
            return Result.success(wallets);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 创建钱包
     */
    @PostMapping("/create")
    public Result<Wallet> createWallet(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String name = request.get("name").toString();
            Integer type = Integer.valueOf(request.get("type").toString());
            String backgroundImage = (String) request.get("backgroundImage");
            Long aiPartnerId = request.get("aiPartnerId") != null ? 
                Long.valueOf(request.get("aiPartnerId").toString()) : null;

            Wallet wallet = walletService.createWallet(userId, name, type, backgroundImage, aiPartnerId);
            return Result.success("钱包创建成功", wallet);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 转入资金
     */
    @PostMapping("/transfer-in")
    public Result<String> transferIn(@RequestBody Map<String, Object> request) {
        try {
            Long walletId = Long.valueOf(request.get("walletId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = request.get("description").toString();
            String imageUrl = (String) request.get("imageUrl");
            String note = (String) request.get("note");

            walletService.transferIn(walletId, amount, description, imageUrl, note);
            return Result.success("转入成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 转出资金
     */
    @PostMapping("/transfer-out")
    public Result<String> transferOut(@RequestBody Map<String, Object> request) {
        try {
            Long walletId = Long.valueOf(request.get("walletId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = request.get("description").toString();
            String imageUrl = (String) request.get("imageUrl");
            String note = (String) request.get("note");

            walletService.transferOut(walletId, amount, description, imageUrl, note);
            return Result.success("转出成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * AI伴侣自动转账
     */
    @PostMapping("/ai-partner-transfer")
    public Result<String> aiPartnerTransfer(@RequestBody Map<String, Object> request) {
        try {
            Long walletId = Long.valueOf(request.get("walletId").toString());
            Long aiPartnerId = Long.valueOf(request.get("aiPartnerId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String message = request.get("message").toString();
            String aiPartnerName = request.get("aiPartnerName").toString();
            String aiPartnerAvatar = request.get("aiPartnerAvatar").toString();

            walletService.aiPartnerTransfer(walletId, aiPartnerId, amount, message, aiPartnerName, aiPartnerAvatar);
            return Result.success("AI伴侣转账成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取钱包交易记录
     */
    @GetMapping("/transactions")
    public Result<List<Transaction>> getWalletTransactions(@RequestParam Long walletId) {
        try {
            List<Transaction> transactions = transactionService.getWalletTransactions(walletId);
            return Result.success(transactions);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取钱包详情
     */
    @GetMapping("/detail")
    public Result<Wallet> getWalletDetail(@RequestParam Long walletId) {
        try {
            Wallet wallet = walletService.getById(walletId);
            if (wallet == null) {
                return Result.error("钱包不存在");
            }
            return Result.success(wallet);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取公开钱包列表（用于兜圈圈）
     */
    @GetMapping("/public")
    public Result<List<Map<String, Object>>> getPublicWallets() {
        try {
            List<Map<String, Object>> publicWallets = walletService.getPublicWallets();
            return Result.success(publicWallets);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 设置钱包公开状态
     */
    @PutMapping("/set-public")
    public Result<String> setWalletPublic(@RequestBody Map<String, Object> request) {
        try {
            Long walletId = Long.valueOf(request.get("walletId").toString());
            Integer isPublic = Integer.valueOf(request.get("isPublic").toString());
            
            walletService.setWalletPublic(walletId, isPublic);
            return Result.success(isPublic == 1 ? "钱包已设为公开" : "钱包已设为私密");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 上传钱包背景图片
     */
    @PostMapping("/upload-background")
    public Result<Map<String, String>> uploadBackgroundImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("walletId") Long walletId) {
        try {
            if (file.isEmpty()) {
                return Result.error("请选择图片文件");
            }

            // 检查文件类型
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return Result.error("只支持图片格式");
            }

            // 创建上传目录
            String uploadDir = "./uploads/backgrounds/";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 生成文件名
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = "wallet_" + walletId + "_" + System.currentTimeMillis() + extension;
            
            // 保存文件
            Path filePath = Paths.get(uploadDir + filename);
            Files.write(filePath, file.getBytes());

            // 返回文件URL
            String imageUrl = "/uploads/backgrounds/" + filename;
            Map<String, String> result = new HashMap<>();
            result.put("imageUrl", imageUrl);

            return Result.success("图片上传成功", result);
        } catch (IOException e) {
            return Result.error("图片上传失败: " + e.getMessage());
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新钱包背景
     */
    @PutMapping("/update-background")
    public Result<String> updateWalletBackground(@RequestBody Map<String, Object> request) {
        try {
            String walletIdStr = request.get("walletId").toString();
            String backgroundImage = request.get("backgroundImage").toString();
            
            System.out.println("收到更换背景请求 - 钱包ID字符串: " + walletIdStr);
            System.out.println("背景图片长度: " + backgroundImage.length());
            
            Long walletId = Long.valueOf(walletIdStr);
            System.out.println("转换后的钱包ID: " + walletId);

            Wallet wallet = walletService.getById(walletId);
            System.out.println("查找到的钱包: " + (wallet != null ? wallet.getName() : "null"));
            
            if (wallet == null) {
                return Result.error("钱包不存在，ID: " + walletId);
            }

            wallet.setBackgroundImage(backgroundImage);
            walletService.updateById(wallet);

            return Result.success("背景更换成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新钱包名称
     */
    @PutMapping("/update-name")
    public Result<String> updateWalletName(@RequestBody Map<String, Object> request) {
        try {
            Long walletId = Long.valueOf(request.get("walletId").toString());
            String name = request.get("name").toString();
            
            if (name == null || name.trim().isEmpty()) {
                return Result.error("钱包名称不能为空");
            }

            Wallet wallet = walletService.getById(walletId);
            if (wallet == null) {
                return Result.error("钱包不存在");
            }

            wallet.setName(name.trim());
            walletService.updateById(wallet);

            return Result.success("钱包名称修改成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取用户关注的钱包列表
     */
    @GetMapping("/user-followed")
    public Result<List<Map<String, Object>>> getUserFollowedWallets(@RequestParam Long userId) {
        try {
            List<Map<String, Object>> followedWallets = walletMapper.getUserFollowedWallets(userId);
            return Result.success(followedWallets);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取钱包所有者ID
     */
    @GetMapping("/owner")
    public Result<Long> getWalletOwnerId(@RequestParam Long walletId) {
        try {
            Long ownerId = walletMapper.getWalletOwnerId(walletId);
            if (ownerId == null) {
                return Result.error("钱包不存在");
            }
            return Result.success(ownerId);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据图片生成文字描述
     */
    @PostMapping("/generate-text-from-image")
    public Result<String> generateTextFromImage(@RequestBody Map<String, Object> request) {
        try {
            String imageBase64 = (String) request.get("imageBase64");
            String prompt = (String) request.get("prompt");
            
            if (imageBase64 == null || imageBase64.trim().isEmpty()) {
                return Result.error("图片数据不能为空");
            }
            
            // 如果没有提供prompt，使用默认的
            if (prompt == null || prompt.trim().isEmpty()) {
                prompt = "你是一个朋友圈文案助手，根据图片生成朋友圈的文案，少于100字，不要生成其他内容,不要思考太久";
            }
            
            String generatedText = aiService.generateTextFromImageBase64(imageBase64, prompt);
            return Result.success(generatedText);
        } catch (Exception e) {
            return Result.error("图生文生成失败: " + e.getMessage());
        }
    }
}
