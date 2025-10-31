const 資料庫 = require('./資料庫');

class 分析服務 {
  // 取得銷售分析資料
  取得銷售分析(開始日期, 結束日期, 分組方式 = '日') {
    return new Promise((resolve, reject) => {
      let 日期格式;
      switch (分組方式) {
        case '日':
          日期格式 = '%Y-%m-%d';
          break;
        case '週':
          日期格式 = '%Y-W%W';
          break;
        case '月':
          日期格式 = '%Y-%m';
          break;
        case '季':
          // SQLite 沒有直接的季度函數，使用月份計算
          日期格式 = '%Y-Q' + "||((CAST(strftime('%m', 建立時間) AS INTEGER) + 2) / 3)";
          break;
        case '年':
          日期格式 = '%Y';
          break;
        default:
          日期格式 = '%Y-%m-%d';
      }

      const 查詢語句 = `
        SELECT
          strftime('${日期格式}', 建立時間) as 時間區間,
          COUNT(*) as 訂單數量,
          SUM(總金額) as 總營收,
          AVG(總金額) as 平均客單價,
          SUM(CASE WHEN 訂單類型 = '桌邊點餐' THEN 1 ELSE 0 END) as 內用數量,
          SUM(CASE WHEN 訂單類型 = '線上點餐' THEN 1 ELSE 0 END) as 線上數量,
          SUM(CASE WHEN 訂單類型 = '外帶' THEN 1 ELSE 0 END) as 外帶數量
        FROM 訂單
        WHERE 建立時間 BETWEEN ? AND ?
          AND 訂單狀態 = '已完成'
        GROUP BY 時間區間
        ORDER BY 時間區間
      `;

      資料庫.all(查詢語句, [開始日期, 結束日期], (錯誤, 資料列) => {
        if (錯誤) reject(錯誤);
        else resolve(資料列);
      });
    });
  }

  // 取得熱門菜品
  取得熱門菜品(開始日期, 結束日期, 數量限制 = 10) {
    return new Promise((resolve, reject) => {
      const 查詢語句 = `
        SELECT
          菜單.項目編號,
          菜單.菜名,
          菜單.分類,
          菜單.售價,
          SUM(明細.數量) as 銷售數量,
          SUM(明細.小計) as 銷售金額,
          COUNT(DISTINCT 明細.訂單編號) as 訂單次數
        FROM 訂單明細 明細
        JOIN 菜單項目 菜單 ON 明細.項目編號 = 菜單.項目編號
        JOIN 訂單 ON 明細.訂單編號 = 訂單.訂單編號
        WHERE 訂單.建立時間 BETWEEN ? AND ?
          AND 訂單.訂單狀態 = '已完成'
        GROUP BY 菜單.項目編號
        ORDER BY 銷售數量 DESC
        LIMIT ?
      `;

      資料庫.all(查詢語句, [開始日期, 結束日期, 數量限制], (錯誤, 資料列) => {
        if (錯誤) reject(錯誤);
        else resolve(資料列);
      });
    });
  }

  // 取得翻桌率分析
  取得翻桌率分析(開始日期, 結束日期) {
    return new Promise((resolve, reject) => {
      const 查詢語句 = `
        SELECT
          桌位.桌號,
          桌位.容納人數,
          COUNT(訂單.訂單編號) as 總訂單數,
          AVG(CAST((julianday(訂單.完成時間) - julianday(訂單.建立時間)) * 24 * 60 AS INTEGER)) as 平均用餐分鐘數,
          strftime('%Y-%m-%d', 訂單.建立時間) as 日期,
          strftime('%H', 訂單.建立時間) as 時段
        FROM 訂單
        JOIN 桌位 ON 訂單.桌位編號 = 桌位.桌位編號
        WHERE 訂單.建立時間 BETWEEN ? AND ?
          AND 訂單.訂單狀態 = '已完成'
          AND 訂單.訂單類型 = '桌邊點餐'
          AND 訂單.完成時間 IS NOT NULL
        GROUP BY 桌位.桌位編號, 日期
        ORDER BY 日期, 桌位.桌號
      `;

      資料庫.all(查詢語句, [開始日期, 結束日期], (錯誤, 資料列) => {
        if (錯誤) reject(錯誤);
        else resolve(資料列);
      });
    });
  }

  // 取得熱門時段分析
  取得熱門時段分析(開始日期, 結束日期) {
    return new Promise((resolve, reject) => {
      const 查詢語句 = `
        SELECT
          strftime('%H', 建立時間) as 小時,
          COUNT(*) as 訂單數量,
          SUM(總金額) as 營收,
          AVG(總金額) as 平均客單價,
          SUM(CASE WHEN 訂單類型 = '桌邊點餐' THEN 1 ELSE 0 END) as 內用數,
          SUM(CASE WHEN 訂單類型 = '線上點餐' THEN 1 ELSE 0 END) as 線上數,
          SUM(CASE WHEN 訂單類型 = '外帶' THEN 1 ELSE 0 END) as 外帶數
        FROM 訂單
        WHERE 建立時間 BETWEEN ? AND ?
          AND 訂單狀態 = '已完成'
        GROUP BY 小時
        ORDER BY 小時
      `;

      資料庫.all(查詢語句, [開始日期, 結束日期], (錯誤, 資料列) => {
        if (錯誤) reject(錯誤);
        else resolve(資料列);
      });
    });
  }

  // 取得會員消費習慣分析
  取得會員消費分析(開始日期, 結束日期) {
    return new Promise((resolve, reject) => {
      const 查詢語句 = `
        SELECT
          會員.會員編號,
          會員.姓名,
          會員.會員等級,
          COUNT(訂單.訂單編號) as 消費次數,
          SUM(訂單.總金額) as 總消費金額,
          AVG(訂單.總金額) as 平均消費金額,
          MAX(訂單.建立時間) as 最後消費時間,
          GROUP_CONCAT(DISTINCT 訂單.訂單類型) as 消費方式
        FROM 會員
        LEFT JOIN 訂單 ON 會員.會員編號 = 訂單.會員編號
        WHERE 訂單.建立時間 BETWEEN ? AND ?
          AND 訂單.訂單狀態 = '已完成'
        GROUP BY 會員.會員編號
        ORDER BY 總消費金額 DESC
        LIMIT 50
      `;

      資料庫.all(查詢語句, [開始日期, 結束日期], (錯誤, 資料列) => {
        if (錯誤) reject(錯誤);
        else resolve(資料列);
      });
    });
  }

  // 取得菜品分類分析
  取得分類分析(開始日期, 結束日期) {
    return new Promise((resolve, reject) => {
      const 查詢語句 = `
        SELECT
          菜單.分類,
          COUNT(DISTINCT 菜單.項目編號) as 品項數量,
          SUM(明細.數量) as 銷售數量,
          SUM(明細.小計) as 銷售金額,
          AVG(菜單.售價) as 平均售價
        FROM 訂單明細 明細
        JOIN 菜單項目 菜單 ON 明細.項目編號 = 菜單.項目編號
        JOIN 訂單 ON 明細.訂單編號 = 訂單.訂單編號
        WHERE 訂單.建立時間 BETWEEN ? AND ?
          AND 訂單.訂單狀態 = '已完成'
        GROUP BY 菜單.分類
        ORDER BY 銷售金額 DESC
      `;

      資料庫.all(查詢語句, [開始日期, 結束日期], (錯誤, 資料列) => {
        if (錯誤) reject(錯誤);
        else resolve(資料列);
      });
    });
  }

  // 取得訂單類型分布
  取得訂單類型分布(開始日期, 結束日期) {
    return new Promise((resolve, reject) => {
      const 查詢語句 = `
        SELECT
          訂單類型,
          COUNT(*) as 數量,
          SUM(總金額) as 營收,
          AVG(總金額) as 平均金額
        FROM 訂單
        WHERE 建立時間 BETWEEN ? AND ?
          AND 訂單狀態 = '已完成'
        GROUP BY 訂單類型
      `;

      資料庫.all(查詢語句, [開始日期, 結束日期], (錯誤, 資料列) => {
        if (錯誤) reject(錯誤);
        else resolve(資料列);
      });
    });
  }

  // 取得儀表板總覽資料
  取得總覽資料(開始日期, 結束日期) {
    return new Promise((resolve, reject) => {
      const 查詢語句 = `
        SELECT
          COUNT(*) as 總訂單數,
          SUM(總金額) as 總營收,
          AVG(總金額) as 平均客單價,
          COUNT(DISTINCT 會員編號) as 消費會員數,
          SUM(CASE WHEN 訂單類型 = '桌邊點餐' THEN 總金額 ELSE 0 END) as 內用營收,
          SUM(CASE WHEN 訂單類型 = '線上點餐' THEN 總金額 ELSE 0 END) as 線上營收,
          SUM(CASE WHEN 訂單類型 = '外帶' THEN 總金額 ELSE 0 END) as 外帶營收
        FROM 訂單
        WHERE 建立時間 BETWEEN ? AND ?
          AND 訂單狀態 = '已完成'
      `;

      資料庫.get(查詢語句, [開始日期, 結束日期], (錯誤, 資料) => {
        if (錯誤) reject(錯誤);
        else resolve(資料);
      });
    });
  }

  // 取得人力配置建議（基於熱門時段）
  取得人力配置建議(開始日期, 結束日期) {
    return new Promise((resolve, reject) => {
      const 查詢語句 = `
        SELECT
          strftime('%H', 建立時間) as 小時,
          strftime('%w', 建立時間) as 星期幾,
          COUNT(*) as 訂單數量,
          AVG(總金額) as 平均營收
        FROM 訂單
        WHERE 建立時間 BETWEEN ? AND ?
          AND 訂單狀態 = '已完成'
        GROUP BY 小時, 星期幾
        ORDER BY 小時, 星期幾
      `;

      資料庫.all(查詢語句, [開始日期, 結束日期], (錯誤, 資料列) => {
        if (錯誤) reject(錯誤);
        else resolve(資料列);
      });
    });
  }

  // 取得食材備料建議（基於熱門菜品）
  取得備料建議(開始日期, 結束日期) {
    return new Promise((resolve, reject) => {
      const 查詢語句 = `
        SELECT
          菜單.菜名,
          菜單.分類,
          strftime('%w', 訂單.建立時間) as 星期幾,
          AVG(明細.數量) as 平均每日銷量,
          SUM(明細.數量) as 總銷量
        FROM 訂單明細 明細
        JOIN 菜單項目 菜單 ON 明細.項目編號 = 菜單.項目編號
        JOIN 訂單 ON 明細.訂單編號 = 訂單.訂單編號
        WHERE 訂單.建立時間 BETWEEN ? AND ?
          AND 訂單.訂單狀態 = '已完成'
        GROUP BY 菜單.項目編號, 星期幾
        ORDER BY 總銷量 DESC
      `;

      資料庫.all(查詢語句, [開始日期, 結束日期], (錯誤, 資料列) => {
        if (錯誤) reject(錯誤);
        else resolve(資料列);
      });
    });
  }
}

module.exports = new 分析服務();
