package com.qiandoudou.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.qiandoudou.entity.Transaction;
import com.qiandoudou.entity.Wallet;
import com.qiandoudou.mapper.WalletMapper;
import com.qiandoudou.service.TransactionService;
import com.qiandoudou.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 钱包服务实现类
 */
@Service
public class WalletServiceImpl extends ServiceImpl<WalletMapper, Wallet> implements WalletService {

    @Autowired
    private TransactionService transactionService;

    @Override
    public List<Map<String, Object>> getUserWallets(Long userId) {
        return baseMapper.getUserWalletsWithPartner(userId);
    }

    @Override
    public Wallet createWallet(Long userId, String name, Integer type, String backgroundImage, Long aiPartnerId) {
        Wallet wallet = new Wallet();
        wallet.setUserId(userId);
        wallet.setName(name);
        wallet.setType(type);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setBackgroundImage(backgroundImage);
        wallet.setAiPartnerId(aiPartnerId);
        wallet.setIsPublic(0); // 默认不公开

        save(wallet);
        return wallet;
    }

    @Override
    @Transactional
    public void transferIn(Long walletId, BigDecimal amount, String description, String imageUrl, String note) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("转入金额必须大于0");
        }

        Wallet wallet = getById(walletId);
        if (wallet == null) {
            throw new RuntimeException("钱包不存在");
        }

        // 更新钱包余额
        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        updateById(wallet);

        // 创建交易记录
        Transaction transaction = new Transaction();
        transaction.setWalletId(walletId);
        transaction.setUserId(wallet.getUserId());
        transaction.setType(1); // 转入
        transaction.setAmount(amount);
        transaction.setBalanceAfter(newBalance);
        transaction.setDescription(description);
        transaction.setImageUrl(imageUrl);
        transaction.setNote(note);
        // 时间字段由MyBatis Plus自动填充，但我们也可以手动设置确保正确
        transaction.setCreateTime(java.time.LocalDateTime.now());
        transactionService.save(transaction);
    }

    @Override
    @Transactional
    public void transferOut(Long walletId, BigDecimal amount, String description, String imageUrl, String note) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("转出金额必须大于0");
        }

        Wallet wallet = getById(walletId);
        if (wallet == null) {
            throw new RuntimeException("钱包不存在");
        }

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("余额不足");
        }

        // 更新钱包余额
        BigDecimal newBalance = wallet.getBalance().subtract(amount);
        wallet.setBalance(newBalance);
        updateById(wallet);

        // 创建交易记录
        Transaction transaction = new Transaction();
        transaction.setWalletId(walletId);
        transaction.setUserId(wallet.getUserId());
        transaction.setType(2); // 转出
        transaction.setAmount(amount);
        transaction.setBalanceAfter(newBalance);
        transaction.setDescription(description);
        transaction.setImageUrl(imageUrl);
        transaction.setNote(note);
        // 时间字段由MyBatis Plus自动填充，但我们也可以手动设置确保正确
        transaction.setCreateTime(java.time.LocalDateTime.now());
        transactionService.save(transaction);
    }

    @Override
    @Transactional
    public void scriptSaving(Long walletId, BigDecimal amount, String description, Long scriptChapterId) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("攒钱金额必须大于0");
        }

        Wallet wallet = getById(walletId);
        if (wallet == null) {
            throw new RuntimeException("钱包不存在");
        }

        // 更新钱包余额
        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        updateById(wallet);

        // 创建交易记录
        Transaction transaction = new Transaction();
        transaction.setWalletId(walletId);
        transaction.setUserId(wallet.getUserId());
        transaction.setType(3); // 剧本攒钱
        transaction.setAmount(amount);
        transaction.setBalanceAfter(newBalance);
        transaction.setDescription(description);
        transaction.setScriptChapterId(scriptChapterId);
        // 时间字段由MyBatis Plus自动填充，但我们也可以手动设置确保正确
        transaction.setCreateTime(java.time.LocalDateTime.now());
        transactionService.save(transaction);
    }

    @Override
    public List<Map<String, Object>> getPublicWallets() {
        return baseMapper.getPublicWalletsWithRecentTransactions();
    }

    @Override
    public void setWalletPublic(Long walletId, Integer isPublic) {
        Wallet wallet = getById(walletId);
        if (wallet == null) {
            throw new RuntimeException("钱包不存在");
        }
        
        wallet.setIsPublic(isPublic);
        updateById(wallet);
    }

    @Override
    @Transactional
    public void aiPartnerTransfer(Long walletId, Long aiPartnerId, BigDecimal amount, String message, String aiPartnerName, String aiPartnerAvatar) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("转入金额必须大于0");
        }

        // 获取钱包
        Wallet wallet = getById(walletId);
        if (wallet == null) {
            throw new RuntimeException("钱包不存在");
        }

        // 更新钱包余额
        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        updateById(wallet);

        // 创建AI伴侣交易记录
        Transaction transaction = new Transaction();
        transaction.setWalletId(walletId);
        transaction.setUserId(wallet.getUserId()); // 使用钱包所有者ID
        transaction.setType(1); // 转入类型
        transaction.setAmount(amount);
        transaction.setBalanceAfter(newBalance);
        transaction.setDescription("AI伴侣转账");
        transaction.setNote(message);
        // 设置AI伴侣相关字段
        transaction.setAiPartnerId(aiPartnerId);
        transaction.setAiPartnerName(aiPartnerName);
        transaction.setAiPartnerAvatar(aiPartnerAvatar);
        transaction.setAiMessage(message);
        // 设置模拟语音URL和时长（用于语音播放功能）
        transaction.setVoiceUrl("mock_voice_" + aiPartnerId + "_" + System.currentTimeMillis()); // 模拟语音URL，前端会处理为模拟播放
        transaction.setVoiceDuration("12s");

        transactionService.save(transaction);
    }
}
