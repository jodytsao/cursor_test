const express = require('express');
const cors = require('cors');
const 分析服務 = require('./分析服務');

const 應用程式 = express();
const 埠號 = process.env.PORT || 3001;

// 中介軟體
應用程式.use(cors());
應用程式.use(express.json());

// URL 解碼中介軟體 - 處理中文路徑
應用程式.use((請求, 回應, 下一步) => {
    請求.url = decodeURI(請求.url);
    下一步();
});

// ============ API 路由 ============

// 取得銷售分析資料
應用程式.get('/api/分析/銷售', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期, 分組方式 } = 請求.query;
    const 資料 = await 分析服務.取得銷售分析(
      開始日期 || 取得過去日期(30),
      結束日期 || 取得當前日期(),
      分組方式 || '日'
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('銷售分析錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// 取得熱門菜品
應用程式.get('/api/分析/熱門菜品', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期, 數量限制 } = 請求.query;
    const 資料 = await 分析服務.取得熱門菜品(
      開始日期 || 取得過去日期(30),
      結束日期 || 取得當前日期(),
      parseInt(數量限制) || 10
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('熱門菜品分析錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// 取得翻桌率分析
應用程式.get('/api/分析/翻桌率', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期 } = 請求.query;
    const 資料 = await 分析服務.取得翻桌率分析(
      開始日期 || 取得過去日期(7),
      結束日期 || 取得當前日期()
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('翻桌率分析錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// 取得熱門時段分析
應用程式.get('/api/分析/熱門時段', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期 } = 請求.query;
    const 資料 = await 分析服務.取得熱門時段分析(
      開始日期 || 取得過去日期(30),
      結束日期 || 取得當前日期()
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('熱門時段分析錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// 取得會員消費分析
應用程式.get('/api/分析/會員消費', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期 } = 請求.query;
    const 資料 = await 分析服務.取得會員消費分析(
      開始日期 || 取得過去日期(30),
      結束日期 || 取得當前日期()
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('會員消費分析錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// 取得菜品分類分析
應用程式.get('/api/分析/分類', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期 } = 請求.query;
    const 資料 = await 分析服務.取得分類分析(
      開始日期 || 取得過去日期(30),
      結束日期 || 取得當前日期()
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('分類分析錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// 取得訂單類型分布
應用程式.get('/api/分析/訂單類型', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期 } = 請求.query;
    const 資料 = await 分析服務.取得訂單類型分布(
      開始日期 || 取得過去日期(30),
      結束日期 || 取得當前日期()
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('訂單類型分析錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// 取得儀表板總覽
應用程式.get('/api/分析/總覽', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期 } = 請求.query;
    const 資料 = await 分析服務.取得總覽資料(
      開始日期 || 取得過去日期(30),
      結束日期 || 取得當前日期()
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('總覽資料錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// 取得人力配置建議
應用程式.get('/api/分析/人力配置', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期 } = 請求.query;
    const 資料 = await 分析服務.取得人力配置建議(
      開始日期 || 取得過去日期(30),
      結束日期 || 取得當前日期()
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('人力配置分析錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// 取得食材備料建議
應用程式.get('/api/分析/備料建議', async (請求, 回應) => {
  try {
    const { 開始日期, 結束日期 } = 請求.query;
    const 資料 = await 分析服務.取得備料建議(
      開始日期 || 取得過去日期(30),
      結束日期 || 取得當前日期()
    );
    回應.json({ 成功: true, 資料 });
  } catch (錯誤) {
    console.error('備料建議分析錯誤:', 錯誤);
    回應.status(500).json({ 成功: false, 錯誤訊息: 錯誤.message });
  }
});

// ============ 輔助函數 ============

function 取得當前日期() {
  return new Date().toISOString().split('T')[0] + ' 23:59:59';
}

function 取得過去日期(天數) {
  const 日期 = new Date();
  日期.setDate(日期.getDate() - 天數);
  return 日期.toISOString().split('T')[0] + ' 00:00:00';
}

// ============ 啟動伺服器 ============

應用程式.listen(埠號, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🍽️  餐飲管理系統後台儀表板`);
  console.log(`${'='.repeat(50)}`);
  console.log(`伺服器運行於: http://localhost:${埠號}`);
  console.log(`\nAPI 可用路由:`);
  console.log(`  GET /api/分析/總覽      - 取得儀表板總覽資料`);
  console.log(`  GET /api/分析/銷售      - 取得銷售分析（支援日/週/月/季/年）`);
  console.log(`  GET /api/分析/熱門菜品  - 取得熱門菜品排行`);
  console.log(`  GET /api/分析/翻桌率    - 取得翻桌率分析`);
  console.log(`  GET /api/分析/熱門時段  - 取得熱門時段分析`);
  console.log(`  GET /api/分析/會員消費  - 取得會員消費習慣分析`);
  console.log(`  GET /api/分析/分類      - 取得菜品分類分析`);
  console.log(`  GET /api/分析/訂單類型  - 取得訂單類型分布`);
  console.log(`  GET /api/分析/人力配置  - 取得人力配置建議`);
  console.log(`  GET /api/分析/備料建議  - 取得食材備料建議`);
  console.log(`${'='.repeat(50)}\n`);
});

module.exports = 應用程式;
