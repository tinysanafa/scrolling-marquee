// 載入 Firebase (使用 ES Module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

/* =========================================================
   ⚠️ Firebase 設定區 (請替換為你的設定)
========================================================= */
const firebaseConfig = {
    // ⬇️ 請將這些值替換成你 Firebase Console 中的內容 <======
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com", 
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
    // ⬆️ ================================================
};

// 初始化 Firebase (若未填寫設定可能會報錯，加入 try-catch 避免影響其他功能)
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
} catch (error) {
    console.warn("Firebase 未設定或設定錯誤，連線功能將無法使用。錯誤訊息:", error.message);
}


document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================================
       活動標題設定
    ========================================================= */
    const titleText = document.getElementById('animated-title');
    const titleInput = document.getElementById('title-input');
    const setTitleBtn = document.getElementById('set-title-btn');

    // 載入儲存的標題
    const savedTitle = localStorage.getItem('dashboard_title');
    if(savedTitle) {
        titleText.textContent = savedTitle;
        titleInput.value = savedTitle;
    }

    setTitleBtn.addEventListener('click', () => {
        const newTitle = titleInput.value.trim() || '互動式直播系統';
        titleText.textContent = newTitle;
        localStorage.setItem('dashboard_title', newTitle);
        // 重新觸發動畫
        titleText.style.animation = 'none';
        setTimeout(() => { titleText.style.animation = 'drift 3s ease-in-out infinite alternate'; }, 10);
    });

    /* =========================================================
       1️⃣ 跑馬燈設定
    ========================================================= */
    const textInput = document.getElementById('mq-text-input');
    const colorInput = document.getElementById('mq-color-input');
    const bgInput = document.getElementById('mq-bg-input');
    const speedInput = document.getElementById('mq-speed-input');
    const applyMqBtn = document.getElementById('apply-mq-btn');
    
    const mqBox = document.getElementById('marquee-box');
    const mqContent = document.getElementById('marquee-text');

    // 預設載入 LocalStorage
    const loadMarqueeSettings = () => {
        const settings = JSON.parse(localStorage.getItem('marquee_settings')) || {
            text: '歡迎來到本直播頻道！🚀🚀🚀',
            color: '#ffffff',
            bg: '#ff4757',
            speed: '15'
        };
        
        textInput.value = settings.text;
        colorInput.value = settings.color;
        bgInput.value = settings.bg;
        speedInput.value = settings.speed;

        applyMarquee(settings);
    };

    const applyMarquee = (settings) => {
        mqContent.textContent = settings.text;
        mqContent.style.color = settings.color;
        mqBox.style.backgroundColor = settings.bg;
        mqContent.style.animationDuration = `${settings.speed}s`;
    };

    applyMqBtn.addEventListener('click', () => {
        const settings = {
            text: textInput.value || '請輸入文字',
            color: colorInput.value,
            bg: bgInput.value,
            speed: speedInput.value
        };
        localStorage.setItem('marquee_settings', JSON.stringify(settings));
        applyMarquee(settings);
    });

    loadMarqueeSettings();

    /* =========================================================
       2️⃣ 倒數計時器
    ========================================================= */
    const minInput = document.getElementById('timer-min');
    const secInput = document.getElementById('timer-sec');
    const startBtn = document.getElementById('start-timer-btn');
    const resetBtn = document.getElementById('reset-timer-btn');
    const timeDisplay = document.getElementById('timer-display');
    const timerAlert = document.getElementById('timer-alert');

    let timerInterval;
    let totalSeconds = 0;
    let isRunning = false;

    const updateDisplay = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${m}:${s}`;
    };

    startBtn.addEventListener('click', () => {
        if (isRunning) return; // 避免重複按

        timerAlert.classList.add('hidden');
        
        const m = parseInt(minInput.value) || 0;
        const s = parseInt(secInput.value) || 0;
        totalSeconds = m * 60 + s;

        if (totalSeconds <= 0) return;

        isRunning = true;
        updateDisplay(totalSeconds);

        timerInterval = setInterval(() => {
            totalSeconds--;
            updateDisplay(totalSeconds);

            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                timerAlert.classList.remove('hidden');
                // 可外加音效在這裡
            }
        }, 1000);
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        timerAlert.classList.add('hidden');
        const m = parseInt(minInput.value) || 0;
        const s = parseInt(secInput.value) || 0;
        updateDisplay(m * 60 + s);
    });

    // 初始顯示
    updateDisplay((parseInt(minInput.value)||0)*60 + parseInt(secInput.value)||0);

    /* =========================================================
       3️⃣ YouTube 影片載入
    ========================================================= */
    const ytInput = document.getElementById('yt-url-input');
    const loadYtBtn = document.getElementById('load-yt-btn');
    const ytContainer = document.getElementById('video-container');

    // 解析 YouTube Video ID
    function getYouTubeID(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    loadYtBtn.addEventListener('click', () => {
        const url = ytInput.value.trim();
        const videoId = getYouTubeID(url);
        
        if (videoId) {
            ytContainer.innerHTML = `
                <iframe width="100%" height="100%" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    title="YouTube video player" frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        } else {
            alert('無法解析 YouTube 網址，請確認網址格式正確。');
        }
    });

    /* =========================================================
       4️⃣ 隨機抽號碼機
    ========================================================= */
    const rngStart = document.getElementById('rng-start');
    const rngEnd = document.getElementById('rng-end');
    const rngCount = document.getElementById('rng-count');
    const rngExclude = document.getElementById('rng-exclude');
    const rngNoRepeat = document.getElementById('rng-no-repeat');
    
    const drawBtn = document.getElementById('rng-draw-btn');
    const clearRngBtn = document.getElementById('rng-clear-btn');
    
    const resultArea = document.getElementById('rng-current-result');
    const historyList = document.getElementById('rng-history-list');

    let historyRecords = [];

    drawBtn.addEventListener('click', () => {
        const min = parseInt(rngStart.value);
        const max = parseInt(rngEnd.value);
        const count = parseInt(rngCount.value) || 1;
        
        let excludeArr = rngExclude.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        
        if (max < min) {
            alert("結束值必須大於開始值！");
            return;
        }

        // 收集可用的號碼池
        let pool = [];
        for (let i = min; i <= max; i++) {
            if (excludeArr.includes(i)) continue; // 排除設定的號碼
            if (rngNoRepeat.checked && historyRecords.includes(i)) continue; // 排除已抽過的號碼
            pool.push(i);
        }

        if (pool.length < count) {
            alert(`可用號碼不足！(剩餘可用: ${pool.length} 個)`);
            return;
        }

        resultArea.innerHTML = ''; // 清空當前結果

        for (let i = 0; i < count; i++) {
            // 從 pool 隨機抓取
            const randIndex = Math.floor(Math.random() * pool.length);
            const drawnNumber = pool[randIndex];
            
            // 加入當前顯示 (帶動畫)
            const resultElem = document.createElement('div');
            resultElem.className = 'result-card';
            resultElem.textContent = drawnNumber;
            // 加入微小延遲讓動畫分開觸發
            resultElem.style.animationDelay = `${i * 0.15}s`;
            resultArea.appendChild(resultElem);

            // 紀錄
            historyRecords.push(drawnNumber);
            
            // 從 pool 移除避免同一次內重複
            pool.splice(randIndex, 1);
        }

        updateHistoryDisplay();
    });

    clearRngBtn.addEventListener('click', () => {
        if(confirm('確定要清除所有已抽出的紀錄嗎？')) {
            historyRecords = [];
            resultArea.innerHTML = '';
            updateHistoryDisplay();
        }
    });

    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        historyRecords.forEach(num => {
            const tag = document.createElement('span');
            tag.className = 'history-tag';
            tag.textContent = num;
            historyList.appendChild(tag);
        });
    }

    /* =========================================================
       5️⃣ 下方互動區（打賞／按讚）與 Firebase 即時同步
    ========================================================= */
    const interactBtns = document.querySelectorAll('.interact-btn');
    const animLayer = document.getElementById('animation-layer');

    // 負責製造噴發漂浮動畫
    function createFloatingAnimation(iconStr, btnElement) {
        const rect = btnElement.getBoundingClientRect();
        const floatEl = document.createElement('div');
        floatEl.className = 'floating-icon';
        floatEl.textContent = iconStr;
        
        // 隨機 x 偏移
        const randomX = (Math.random() - 0.5) * 50; 
        
        floatEl.style.left = `${rect.left + rect.width / 2 + randomX}px`;
        floatEl.style.top = `${rect.top}px`;
        
        animLayer.appendChild(floatEl);

        setTimeout(() => {
            floatEl.remove();
        }, 2000);
    }

    // 將按鈕點擊推播給 Firebase
    interactBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.getAttribute('data-type');
            const iconStr = btn.querySelector('.icon').textContent;
            
            // 本地動畫
            createFloatingAnimation(iconStr, btn);

            // 更新 Firebase counter
            if (db) {
                const countRef = ref(db, `interactions/${type}`);
                runTransaction(countRef, (currentData) => {
                    return (currentData || 0) + 1;
                }).catch(err => console.error("Update failed:", err));
            }
        });
    });

    // 監聽 Firebase 變化並更新介面顯示的數字
    if (db) {
        const types = ['like', 'star', 'rocket'];
        types.forEach(type => {
            const countRef = ref(db, `interactions/${type}`);
            onValue(countRef, (snapshot) => {
                const data = snapshot.val();
                if (data !== null) {
                    const countSpan = document.getElementById(`count-${type}`);
                    if(countSpan) countSpan.textContent = data;
                }
            });
        });
    }

});
