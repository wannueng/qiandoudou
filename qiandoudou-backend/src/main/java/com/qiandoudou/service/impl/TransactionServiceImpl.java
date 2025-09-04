package com.qiandoudou.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.qiandoudou.entity.Transaction;
import com.qiandoudou.mapper.TransactionMapper;
import com.qiandoudou.service.TransactionService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 交易记录服务实现类
 */
@Service
public class TransactionServiceImpl extends ServiceImpl<TransactionMapper, Transaction> implements TransactionService {

    @Override
    public List<Transaction> getWalletTransactions(Long walletId) {
        LambdaQueryWrapper<Transaction> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Transaction::getWalletId, walletId)
                .orderByDesc(Transaction::getCreateTime);
        return list(queryWrapper);
    }

    @Override
    public List<Transaction> getUserTransactions(Long userId) {
        LambdaQueryWrapper<Transaction> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Transaction::getUserId, userId)
                .orderByDesc(Transaction::getCreateTime);
        return list(queryWrapper);
    }
}
