package com.qiandoudou.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.qiandoudou.entity.Transaction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 交易记录 Mapper 接口
 */
@Mapper
public interface TransactionMapper extends BaseMapper<Transaction> {

    /**
     * 获取交易所有者ID
     */
    @Select("SELECT user_id FROM transactions WHERE id = #{transactionId} AND deleted = 0")
    Long getTransactionOwnerId(@Param("transactionId") Long transactionId);

    /**
     * 获取交易图片
     */
    @Select("SELECT image_url FROM transactions WHERE id = #{transactionId} AND deleted = 0")
    String getTransactionImage(@Param("transactionId") Long transactionId);

    /**
     * 获取交易所属的钱包ID
     */
    @Select("SELECT wallet_id FROM transactions WHERE id = #{transactionId} AND deleted = 0")
    Long getTransactionWalletId(@Param("transactionId") Long transactionId);
}
