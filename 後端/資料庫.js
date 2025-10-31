const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 建立或連接資料庫
const 資料庫 = new sqlite3.Database(path.join(__dirname, '餐飲系統.db'), (錯誤) => {
  if (錯誤) {
    console.error('資料庫連接錯誤:', 錯誤);
  } else {
    console.log('✓ 資料庫連接成功');
    初始化資料庫();
  }
});

function 初始化資料庫() {
  資料庫.serialize(() => {
    // 會員資料表
    資料庫.run(`
      CREATE TABLE IF NOT EXISTS 會員 (
        會員編號 INTEGER PRIMARY KEY AUTOINCREMENT,
        姓名 TEXT NOT NULL,
        電話 TEXT UNIQUE NOT NULL,
        電子郵件 TEXT,
        點數 INTEGER DEFAULT 0,
        會員等級 TEXT DEFAULT '一般會員',
        註冊時間 DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 菜單項目表
    資料庫.run(`
      CREATE TABLE IF NOT EXISTS 菜單項目 (
        項目編號 INTEGER PRIMARY KEY AUTOINCREMENT,
        菜名 TEXT NOT NULL,
        分類 TEXT NOT NULL,
        售價 REAL NOT NULL,
        成本 REAL NOT NULL,
        描述 TEXT,
        是否供應 BOOLEAN DEFAULT 1
      )
    `);

    // 桌位表
    資料庫.run(`
      CREATE TABLE IF NOT EXISTS 桌位 (
        桌位編號 INTEGER PRIMARY KEY AUTOINCREMENT,
        桌號 TEXT UNIQUE NOT NULL,
        容納人數 INTEGER NOT NULL,
        狀態 TEXT DEFAULT '可用'
      )
    `);

    // 訂單表
    資料庫.run(`
      CREATE TABLE IF NOT EXISTS 訂單 (
        訂單編號 INTEGER PRIMARY KEY AUTOINCREMENT,
        訂單號碼 TEXT UNIQUE NOT NULL,
        會員編號 INTEGER,
        桌位編號 INTEGER,
        訂單類型 TEXT NOT NULL,
        總金額 REAL NOT NULL,
        訂單狀態 TEXT DEFAULT '處理中',
        建立時間 DATETIME DEFAULT CURRENT_TIMESTAMP,
        完成時間 DATETIME,
        FOREIGN KEY (會員編號) REFERENCES 會員(會員編號),
        FOREIGN KEY (桌位編號) REFERENCES 桌位(桌位編號)
      )
    `);

    // 訂單明細表
    資料庫.run(`
      CREATE TABLE IF NOT EXISTS 訂單明細 (
        明細編號 INTEGER PRIMARY KEY AUTOINCREMENT,
        訂單編號 INTEGER NOT NULL,
        項目編號 INTEGER NOT NULL,
        數量 INTEGER NOT NULL,
        單價 REAL NOT NULL,
        小計 REAL NOT NULL,
        FOREIGN KEY (訂單編號) REFERENCES 訂單(訂單編號),
        FOREIGN KEY (項目編號) REFERENCES 菜單項目(項目編號)
      )
    `);

    // 訂位表
    資料庫.run(`
      CREATE TABLE IF NOT EXISTS 訂位 (
        訂位編號 INTEGER PRIMARY KEY AUTOINCREMENT,
        會員編號 INTEGER,
        顧客姓名 TEXT NOT NULL,
        顧客電話 TEXT NOT NULL,
        桌位編號 INTEGER,
        人數 INTEGER NOT NULL,
        訂位時間 DATETIME NOT NULL,
        訂位狀態 TEXT DEFAULT '待確認',
        備註 TEXT,
        建立時間 DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (會員編號) REFERENCES 會員(會員編號),
        FOREIGN KEY (桌位編號) REFERENCES 桌位(桌位編號)
      )
    `);

    console.log('✓ 資料表初始化完成');
  });
}

module.exports = 資料庫;
