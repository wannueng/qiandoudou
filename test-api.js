// 钱兜兜API测试脚本
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
let authToken = '';
let userId = '';

// 测试用例配置
const testConfig = {
  username: 'demo_user',
  password: '123456',
  walletName: '测试钱包',
  transferAmount: 100.50,
  transferDescription: '测试转入'
};

// HTTP客户端配置
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
apiClient.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// 测试结果记录
let testResults = [];

function logTest(testName, success, message, data = null) {
  const result = {
    test: testName,
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  testResults.push(result);
  
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}: ${message}`);
  if (data) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
  console.log('');
}

// 测试1: 演示登录
async function testDemoLogin() {
  try {
    const response = await apiClient.post('/auth/demo-login');
    
    if (response.data.code === 200) {
      authToken = response.data.data.token;
      userId = response.data.data.user.id;
      logTest('演示登录', true, '登录成功', {
        userId,
        username: response.data.data.user.username,
        tokenLength: authToken.length
      });
      return true;
    } else {
      logTest('演示登录', false, response.data.message);
      return false;
    }
  } catch (error) {
    logTest('演示登录', false, `请求失败: ${error.message}`);
    return false;
  }
}

// 测试2: 获取钱包列表
async function testGetWallets() {
  try {
    const response = await apiClient.get('/wallet/list', {
      params: { userId }
    });
    
    if (response.data.code === 200) {
      const wallets = response.data.data;
      logTest('获取钱包列表', true, `成功获取${wallets.length}个钱包`, {
        walletCount: wallets.length,
        firstWallet: wallets[0] || null
      });
      return wallets;
    } else {
      logTest('获取钱包列表', false, response.data.message);
      return [];
    }
  } catch (error) {
    logTest('获取钱包列表', false, `请求失败: ${error.message}`);
    return [];
  }
}

// 测试3: 创建钱包
async function testCreateWallet() {
  try {
    const walletData = {
      userId,
      name: testConfig.walletName,
      type: 1,
      backgroundImage: '/img/backgrounds/bg1.jpg',
      aiPartnerId: null
    };
    
    const response = await apiClient.post('/wallet/create', walletData);
    
    if (response.data.code === 200) {
      const wallet = response.data.data;
      logTest('创建钱包', true, '钱包创建成功', {
        walletId: wallet.id,
        walletName: wallet.name,
        balance: wallet.balance
      });
      return wallet;
    } else {
      logTest('创建钱包', false, response.data.message);
      return null;
    }
  } catch (error) {
    logTest('创建钱包', false, `请求失败: ${error.message}`);
    return null;
  }
}

// 测试4: 转入资金
async function testTransferIn(walletId) {
  try {
    const transferData = {
      walletId,
      amount: testConfig.transferAmount,
      description: testConfig.transferDescription
    };
    
    const response = await apiClient.post('/wallet/transfer-in', transferData);
    
    if (response.data.code === 200) {
      logTest('转入资金', true, '转入成功', transferData);
      return true;
    } else {
      logTest('转入资金', false, response.data.message);
      return false;
    }
  } catch (error) {
    logTest('转入资金', false, `请求失败: ${error.message}`);
    return false;
  }
}

// 测试5: 获取钱包详情
async function testGetWalletDetail(walletId) {
  try {
    const response = await apiClient.get('/wallet/detail', {
      params: { walletId }
    });
    
    if (response.data.code === 200) {
      const wallet = response.data.data;
      logTest('获取钱包详情', true, '获取成功', {
        walletId: wallet.id,
        balance: wallet.balance,
        name: wallet.name
      });
      return wallet;
    } else {
      logTest('获取钱包详情', false, response.data.message);
      return null;
    }
  } catch (error) {
    logTest('获取钱包详情', false, `请求失败: ${error.message}`);
    return null;
  }
}

// 测试6: 获取交易记录
async function testGetTransactions(walletId) {
  try {
    const response = await apiClient.get('/wallet/transactions', {
      params: { walletId }
    });
    
    if (response.data.code === 200) {
      const transactions = response.data.data;
      logTest('获取交易记录', true, `获取${transactions.length}条交易记录`, {
        transactionCount: transactions.length,
        latestTransaction: transactions[0] || null
      });
      return transactions;
    } else {
      logTest('获取交易记录', false, response.data.message);
      return [];
    }
  } catch (error) {
    logTest('获取交易记录', false, `请求失败: ${error.message}`);
    return [];
  }
}

// 测试7: 验证余额更新
async function testBalanceUpdate(walletId, expectedBalance) {
  const wallet = await testGetWalletDetail(walletId);
  if (wallet) {
    const actualBalance = parseFloat(wallet.balance);
    const expected = parseFloat(expectedBalance);
    
    if (Math.abs(actualBalance - expected) < 0.01) {
      logTest('余额验证', true, `余额正确: ${actualBalance}`, {
        expected,
        actual: actualBalance
      });
      return true;
    } else {
      logTest('余额验证', false, `余额不匹配，期望: ${expected}, 实际: ${actualBalance}`, {
        expected,
        actual: actualBalance
      });
      return false;
    }
  }
  return false;
}

// 主测试流程
async function runAllTests() {
  console.log('🚀 开始执行钱兜兜API测试...\n');
  
  // 测试1: 登录
  const loginSuccess = await testDemoLogin();
  if (!loginSuccess) {
    console.log('❌ 登录失败，终止测试');
    return;
  }
  
  // 测试2: 获取钱包列表
  const wallets = await testGetWallets();
  
  let testWallet = null;
  let initialBalance = 0;
  
  if (wallets.length > 0) {
    // 使用现有钱包
    testWallet = wallets[0];
    initialBalance = parseFloat(testWallet.balance || 0);
    console.log(`📝 使用现有钱包进行测试: ${testWallet.name} (ID: ${testWallet.id})`);
  } else {
    // 创建新钱包
    testWallet = await testCreateWallet();
    if (!testWallet) {
      console.log('❌ 创建钱包失败，终止测试');
      return;
    }
    initialBalance = 0;
  }
  
  // 测试转入资金
  const transferSuccess = await testTransferIn(testWallet.id);
  if (transferSuccess) {
    // 验证余额更新
    const expectedBalance = initialBalance + testConfig.transferAmount;
    await testBalanceUpdate(testWallet.id, expectedBalance);
    
    // 获取交易记录
    await testGetTransactions(testWallet.id);
  }
  
  // 输出测试总结
  console.log('\n📊 测试总结:');
  console.log('='.repeat(50));
  
  const passCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;
  
  console.log(`总测试数: ${totalCount}`);
  console.log(`通过: ${passCount}`);
  console.log(`失败: ${totalCount - passCount}`);
  console.log(`成功率: ${((passCount / totalCount) * 100).toFixed(1)}%`);
  
  if (passCount === totalCount) {
    console.log('\n🎉 所有测试通过！');
  } else {
    console.log('\n⚠️  存在测试失败，需要修复bug');
    console.log('\n失败的测试:');
    testResults.filter(r => !r.success).forEach(result => {
      console.log(`  - ${result.test}: ${result.message}`);
    });
  }
}

// 执行测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('测试执行出错:', error);
  });
}

module.exports = {
  runAllTests,
  testResults
};




