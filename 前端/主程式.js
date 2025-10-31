// API 基礎網址
const API_網址 = 'http://localhost:3001/api';

// 圖表實例
let 銷售圖表, 訂單類型圖表, 時段圖表, 熱門菜品圖表, 分類圖表;

// 顏色配置
const 圖表顏色 = {
    主色: 'rgb(102, 126, 234)',
    次色: 'rgb(118, 75, 162)',
    成功: 'rgb(76, 175, 80)',
    警告: 'rgb(255, 152, 0)',
    危險: 'rgb(244, 67, 54)',
    資訊: 'rgb(3, 169, 244)',
    漸層主色: 'rgba(102, 126, 234, 0.8)',
    漸層次色: 'rgba(118, 75, 162, 0.8)',
};

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    初始化圖表();
    更新所有資料();
});

// 取得日期範圍
function 取得日期範圍() {
    const 天數 = parseInt(document.getElementById('時間範圍').value);
    const 結束日期 = new Date();
    const 開始日期 = new Date();
    開始日期.setDate(開始日期.getDate() - 天數);

    return {
        開始: 格式化日期時間(開始日期, true),
        結束: 格式化日期時間(結束日期, false)
    };
}

// 格式化日期時間
function 格式化日期時間(日期, 是開始) {
    const 年 = 日期.getFullYear();
    const 月 = String(日期.getMonth() + 1).padStart(2, '0');
    const 日 = String(日期.getDate()).padStart(2, '0');
    const 時間 = 是開始 ? '00:00:00' : '23:59:59';
    return `${年}-${月}-${日} ${時間}`;
}

// 格式化金額
function 格式化金額(金額) {
    return '$ ' + Math.round(金額).toLocaleString('zh-TW');
}

// 格式化日期顯示
function 格式化日期顯示(日期字串) {
    const 日期 = new Date(日期字串);
    return `${日期.getMonth() + 1}/${日期.getDate()} ${日期.getHours()}:${String(日期.getMinutes()).padStart(2, '0')}`;
}

// 更新所有資料
async function 更新所有資料() {
    await Promise.all([
        更新總覽資料(),
        更新銷售圖表(),
        更新訂單類型圖表(),
        更新熱門時段圖表(),
        更新熱門菜品圖表(),
        更新分類圖表(),
        更新翻桌率(),
        更新會員表格(),
        更新人力建議(),
        更新備料建議()
    ]);
}

// 更新總覽資料
async function 更新總覽資料() {
    const 日期範圍 = 取得日期範圍();
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/總覽?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 資料 = 結果.資料;
            document.getElementById('總訂單數').textContent = (資料.總訂單數 || 0).toLocaleString();
            document.getElementById('總營收').textContent = 格式化金額(資料.總營收 || 0);
            document.getElementById('平均客單價').textContent = 格式化金額(資料.平均客單價 || 0);
            document.getElementById('消費會員數').textContent = (資料.消費會員數 || 0).toLocaleString();
        }
    } catch (錯誤) {
        console.error('更新總覽資料錯誤:', 錯誤);
    }
}

// 初始化圖表
function 初始化圖表() {
    // 銷售趨勢圖
    const 銷售畫布 = document.getElementById('銷售趨勢圖').getContext('2d');
    銷售圖表 = new Chart(銷售畫布, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // 訂單類型圖
    const 訂單類型畫布 = document.getElementById('訂單類型圖').getContext('2d');
    訂單類型圖表 = new Chart(訂單類型畫布, {
        type: 'doughnut',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        }
    });

    // 熱門時段圖
    const 時段畫布 = document.getElementById('熱門時段圖').getContext('2d');
    時段圖表 = new Chart(時段畫布, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // 熱門菜品圖
    const 菜品畫布 = document.getElementById('熱門菜品圖').getContext('2d');
    熱門菜品圖表 = new Chart(菜品畫布, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });

    // 分類銷售圖
    const 分類畫布 = document.getElementById('分類銷售圖').getContext('2d');
    分類圖表 = new Chart(分類畫布, {
        type: 'pie',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        }
    });
}

// 更新銷售圖表
async function 更新銷售圖表() {
    const 日期範圍 = 取得日期範圍();
    const 分組 = document.getElementById('分組方式').value;
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束,
        分組方式: 分組
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/銷售?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 標籤 = 結果.資料.map(項 => 項.時間區間);
            const 營收資料 = 結果.資料.map(項 => 項.總營收);
            const 訂單資料 = 結果.資料.map(項 => 項.訂單數量);

            銷售圖表.data.labels = 標籤;
            銷售圖表.data.datasets = [
                {
                    label: '營收',
                    data: 營收資料,
                    borderColor: 圖表顏色.主色,
                    backgroundColor: 圖表顏色.漸層主色,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: '訂單數',
                    data: 訂單資料,
                    borderColor: 圖表顏色.次色,
                    backgroundColor: 圖表顏色.漸層次色,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ];

            銷售圖表.options.scales = {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: '營收（元）' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: '訂單數' },
                    grid: { drawOnChartArea: false }
                }
            };

            銷售圖表.update();
        }
    } catch (錯誤) {
        console.error('更新銷售圖表錯誤:', 錯誤);
    }
}

// 更新訂單類型圖表
async function 更新訂單類型圖表() {
    const 日期範圍 = 取得日期範圍();
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/訂單類型?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 標籤 = 結果.資料.map(項 => 項.訂單類型);
            const 數據 = 結果.資料.map(項 => 項.營收);

            訂單類型圖表.data.labels = 標籤;
            訂單類型圖表.data.datasets = [{
                data: 數據,
                backgroundColor: [
                    圖表顏色.主色,
                    圖表顏色.成功,
                    圖表顏色.警告
                ]
            }];

            訂單類型圖表.update();
        }
    } catch (錯誤) {
        console.error('更新訂單類型圖表錯誤:', 錯誤);
    }
}

// 更新熱門時段圖表
async function 更新熱門時段圖表() {
    const 日期範圍 = 取得日期範圍();
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/熱門時段?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 標籤 = 結果.資料.map(項 => `${項.小時}:00`);
            const 訂單數 = 結果.資料.map(項 => 項.訂單數量);
            const 營收 = 結果.資料.map(項 => 項.營收);

            時段圖表.data.labels = 標籤;
            時段圖表.data.datasets = [
                {
                    label: '訂單數',
                    data: 訂單數,
                    backgroundColor: 圖表顏色.漸層主色,
                    yAxisID: 'y'
                },
                {
                    label: '營收',
                    data: 營收,
                    backgroundColor: 圖表顏色.漸層次色,
                    yAxisID: 'y1'
                }
            ];

            時段圖表.options.scales = {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: '訂單數' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: '營收（元）' },
                    grid: { drawOnChartArea: false }
                }
            };

            時段圖表.update();
        }
    } catch (錯誤) {
        console.error('更新熱門時段圖表錯誤:', 錯誤);
    }
}

// 更新熱門菜品圖表
async function 更新熱門菜品圖表() {
    const 日期範圍 = 取得日期範圍();
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束,
        數量限制: 10
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/熱門菜品?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 標籤 = 結果.資料.map(項 => 項.菜名);
            const 數據 = 結果.資料.map(項 => 項.銷售數量);

            const 顏色陣列 = 結果.資料.map((_, 索引) => {
                const 色相 = (索引 * 360 / 結果.資料.length);
                return `hsla(${色相}, 70%, 60%, 0.8)`;
            });

            熱門菜品圖表.data.labels = 標籤;
            熱門菜品圖表.data.datasets = [{
                label: '銷售數量',
                data: 數據,
                backgroundColor: 顏色陣列
            }];

            熱門菜品圖表.update();
        }
    } catch (錯誤) {
        console.error('更新熱門菜品圖表錯誤:', 錯誤);
    }
}

// 更新分類圖表
async function 更新分類圖表() {
    const 日期範圍 = 取得日期範圍();
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/分類?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 標籤 = 結果.資料.map(項 => 項.分類);
            const 數據 = 結果.資料.map(項 => 項.銷售金額);

            分類圖表.data.labels = 標籤;
            分類圖表.data.datasets = [{
                data: 數據,
                backgroundColor: [
                    圖表顏色.主色,
                    圖表顏色.成功,
                    圖表顏色.警告,
                    圖表顏色.危險,
                    圖表顏色.資訊,
                    圖表顏色.次色
                ]
            }];

            分類圖表.update();
        }
    } catch (錯誤) {
        console.error('更新分類圖表錯誤:', 錯誤);
    }
}

// 更新翻桌率
async function 更新翻桌率() {
    const 日期範圍 = 取得日期範圍();
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/翻桌率?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 容器 = document.getElementById('翻桌率內容');

            if (結果.資料.length === 0) {
                容器.innerHTML = '<p style="text-align: center; color: #999;">暫無資料</p>';
                return;
            }

            // 計算平均翻桌率
            const 桌位統計 = {};
            結果.資料.forEach(項 => {
                if (!桌位統計[項.桌號]) {
                    桌位統計[項.桌號] = {
                        總訂單: 0,
                        總時長: 0,
                        次數: 0
                    };
                }
                桌位統計[項.桌號].總訂單 += 項.總訂單數;
                桌位統計[項.桌號].總時長 += 項.平均用餐分鐘數;
                桌位統計[項.桌號].次數++;
            });

            let HTML = '';
            Object.keys(桌位統計).slice(0, 10).forEach(桌號 => {
                const 統計 = 桌位統計[桌號];
                const 平均時長 = Math.round(統計.總時長 / 統計.次數);
                const 每日平均翻桌 = (統計.總訂單 / 統計.次數).toFixed(1);

                HTML += `
                    <div class="統計項目">
                        <span><strong>${桌號}</strong></span>
                        <span>平均用餐: ${平均時長} 分鐘</span>
                        <span>平均翻桌: ${每日平均翻桌} 次/日</span>
                    </div>
                `;
            });

            容器.innerHTML = HTML;
        }
    } catch (錯誤) {
        console.error('更新翻桌率錯誤:', 錯誤);
    }
}

// 更新會員表格
async function 更新會員表格() {
    const 日期範圍 = 取得日期範圍();
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/會員消費?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 表格內容 = document.getElementById('會員表格內容');

            if (結果.資料.length === 0) {
                表格內容.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">暫無資料</td></tr>';
                return;
            }

            let HTML = '';
            結果.資料.slice(0, 10).forEach((會員, 索引) => {
                const 最後消費 = 格式化日期顯示(會員.最後消費時間);
                HTML += `
                    <tr>
                        <td><strong>${索引 + 1}</strong></td>
                        <td>${會員.姓名}</td>
                        <td><span class="會員等級 ${會員.會員等級}">${會員.會員等級}</span></td>
                        <td>${會員.消費次數} 次</td>
                        <td><strong>${格式化金額(會員.總消費金額)}</strong></td>
                        <td>${格式化金額(會員.平均消費金額)}</td>
                        <td>${最後消費}</td>
                    </tr>
                `;
            });

            表格內容.innerHTML = HTML;
        }
    } catch (錯誤) {
        console.error('更新會員表格錯誤:', 錯誤);
    }
}

// 更新人力建議
async function 更新人力建議() {
    const 日期範圍 = 取得日期範圍();
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/人力配置?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 容器 = document.getElementById('人力建議內容');

            // 分析尖峰時段
            const 時段統計 = {};
            結果.資料.forEach(項 => {
                const 小時 = 項.小時;
                if (!時段統計[小時]) {
                    時段統計[小時] = { 訂單總數: 0, 天數: 0 };
                }
                時段統計[小時].訂單總數 += 項.訂單數量;
                時段統計[小時].天數++;
            });

            // 找出最忙碌的時段
            const 時段陣列 = Object.keys(時段統計).map(小時 => ({
                小時: parseInt(小時),
                平均訂單: 時段統計[小時].訂單總數 / 時段統計[小時].天數
            })).sort((a, b) => b.平均訂單 - a.平均訂單);

            let HTML = '<div class="建議項目">📊 <strong>人力配置建議：</strong></div>';

            if (時段陣列.length > 0) {
                const 尖峰時段 = 時段陣列.slice(0, 3);
                HTML += '<div class="建議項目">🔥 <strong>尖峰時段</strong>（需增加人手）：<br>';
                尖峰時段.forEach(項 => {
                    HTML += `&nbsp;&nbsp;• ${項.小時}:00-${項.小時 + 1}:00（平均 ${Math.round(項.平均訂單)} 單）<br>`;
                });
                HTML += '</div>';

                const 離峰時段 = 時段陣列.slice(-3).reverse();
                HTML += '<div class="建議項目">💤 <strong>離峰時段</strong>（可減少人手）：<br>';
                離峰時段.forEach(項 => {
                    HTML += `&nbsp;&nbsp;• ${項.小時}:00-${項.小時 + 1}:00（平均 ${Math.round(項.平均訂單)} 單）<br>`;
                });
                HTML += '</div>';
            }

            容器.innerHTML = HTML;
        }
    } catch (錯誤) {
        console.error('更新人力建議錯誤:', 錯誤);
    }
}

// 更新備料建議
async function 更新備料建議() {
    const 日期範圍 = 取得日期範圍();
    const 參數 = new URLSearchParams({
        開始日期: 日期範圍.開始,
        結束日期: 日期範圍.結束
    });

    try {
        const 回應 = await fetch(`${API_網址}/分析/備料建議?${參數}`);
        const 結果 = await 回應.json();

        if (結果.成功 && 結果.資料) {
            const 容器 = document.getElementById('備料建議內容');

            // 依菜名分組
            const 菜品統計 = {};
            結果.資料.forEach(項 => {
                if (!菜品統計[項.菜名]) {
                    菜品統計[項.菜名] = {
                        分類: 項.分類,
                        總銷量: 0,
                        星期資料: {}
                    };
                }
                菜品統計[項.菜名].總銷量 += 項.總銷量;
                菜品統計[項.菜名].星期資料[項.星期幾] = 項.平均每日銷量;
            });

            // 排序取前10
            const 熱門菜品 = Object.keys(菜品統計)
                .map(菜名 => ({
                    菜名,
                    ...菜品統計[菜名]
                }))
                .sort((a, b) => b.總銷量 - a.總銷量)
                .slice(0, 10);

            let HTML = '<div class="建議項目">📊 <strong>熱門菜品每日建議備料量：</strong></div>';

            熱門菜品.forEach(項 => {
                const 平均銷量 = Math.ceil(項.總銷量 / Object.keys(項.星期資料).length);
                const 建議備料 = Math.ceil(平均銷量 * 1.2); // 增加20%緩衝

                HTML += `
                    <div class="建議項目">
                        🍽️ <strong>${項.菜名}</strong>（${項.分類}）<br>
                        &nbsp;&nbsp;平均銷量：${平均銷量} 份/日<br>
                        &nbsp;&nbsp;建議備料：<strong style="color: ${圖表顏色.主色}">${建議備料} 份/日</strong>
                    </div>
                `;
            });

            容器.innerHTML = HTML;
        }
    } catch (錯誤) {
        console.error('更新備料建議錯誤:', 錯誤);
    }
}
