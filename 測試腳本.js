// 測試腳本 - 驗證 API 是否正常運作
const http = require('http');

// API 基礎 URL
const API_HOST = 'localhost';
const API_PORT = 3001;

// 測試資料
const 測試案例 = [
    {
        名稱: '總覽資料',
        路徑: '/api/分析/總覽',
        參數: '開始日期=2025-10-01 00:00:00&結束日期=2025-10-31 23:59:59'
    },
    {
        名稱: '銷售分析（每日）',
        路徑: '/api/分析/銷售',
        參數: '開始日期=2025-10-01 00:00:00&結束日期=2025-10-31 23:59:59&分組方式=日'
    },
    {
        名稱: '熱門菜品',
        路徑: '/api/分析/熱門菜品',
        參數: '開始日期=2025-10-01 00:00:00&結束日期=2025-10-31 23:59:59&數量限制=5'
    },
    {
        名稱: '訂單類型分布',
        路徑: '/api/分析/訂單類型',
        參數: '開始日期=2025-10-01 00:00:00&結束日期=2025-10-31 23:59:59'
    },
    {
        名稱: '熱門時段',
        路徑: '/api/分析/熱門時段',
        參數: '開始日期=2025-10-01 00:00:00&結束日期=2025-10-31 23:59:59'
    }
];

// 執行 HTTP 請求
function 發送請求(路徑, 參數) {
    return new Promise((resolve, reject) => {
        const 完整路徑 = encodeURI(`${路徑}?${參數}`);

        const 選項 = {
            hostname: API_HOST,
            port: API_PORT,
            path: 完整路徑,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const 請求 = http.request(選項, (回應) => {
            let 資料 = '';

            回應.on('data', (區塊) => {
                資料 += 區塊;
            });

            回應.on('end', () => {
                try {
                    const 結果 = JSON.parse(資料);
                    resolve(結果);
                } catch (錯誤) {
                    reject(new Error('無法解析 JSON: ' + 資料));
                }
            });
        });

        請求.on('error', (錯誤) => {
            reject(錯誤);
        });

        請求.end();
    });
}

// 執行所有測試
async function 執行測試() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 開始測試 API...');
    console.log('='.repeat(60) + '\n');

    let 成功數 = 0;
    let 失敗數 = 0;

    for (const 測試 of 測試案例) {
        try {
            console.log(`📝 測試：${測試.名稱}`);
            console.log(`   路徑：${測試.路徑}`);

            const 結果 = await 發送請求(測試.路徑, 測試.參數);

            if (結果.成功) {
                console.log(`   ✅ 成功！`);

                // 顯示部分資料
                if (Array.isArray(結果.資料)) {
                    console.log(`   📊 資料筆數：${結果.資料.length}`);
                    if (結果.資料.length > 0) {
                        console.log(`   🔍 第一筆資料：`, JSON.stringify(結果.資料[0], null, 2).substring(0, 200) + '...');
                    }
                } else if (結果.資料) {
                    console.log(`   📊 資料：`, JSON.stringify(結果.資料, null, 2).substring(0, 200) + '...');
                }

                成功數++;
            } else {
                console.log(`   ❌ 失敗：${結果.錯誤訊息}`);
                失敗數++;
            }
        } catch (錯誤) {
            console.log(`   ❌ 錯誤：${錯誤.message}`);
            失敗數++;
        }

        console.log('');
    }

    console.log('='.repeat(60));
    console.log(`📊 測試結果：`);
    console.log(`   ✅ 成功：${成功數} 個測試`);
    console.log(`   ❌ 失敗：${失敗數} 個測試`);
    console.log('='.repeat(60) + '\n');

    if (失敗數 === 0) {
        console.log('🎉 所有測試通過！API 運作正常。\n');
        console.log('📱 您現在可以在瀏覽器中開啟 前端/儀表板.html 查看完整的儀表板。\n');
    } else {
        console.log('⚠️  部分測試失敗，請檢查伺服器是否正在運行。\n');
        console.log('💡 提示：執行 npm run server 啟動伺服器\n');
    }
}

// 執行測試
執行測試().catch(錯誤 => {
    console.error('\n❌ 測試執行錯誤：', 錯誤.message);
    console.log('\n💡 請確認伺服器已啟動：npm run server\n');
});
