// KHỞI TẠO TRÁI TIM BAY
function createHearts() {
    const container = document.getElementById('heart-container');
    for (let i = 0; i < 35; i++) {
        let heart = document.createElement('div');
        heart.className = 'heart';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 4 + 4) + 's';
        heart.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(heart);
    }
}
createHearts();

const screens = document.querySelectorAll('.screen');
let currentScreenIndex = 0;
let isAnimating = false;

// HÀM CHUYỂN TRANG CHÍNH
function goToNextScreen() {
    if (isAnimating || currentScreenIndex >= screens.length - 1) return;
    triggerTransition(() => {
        screens[currentScreenIndex].classList.remove('active');
        currentScreenIndex++;
        screens[currentScreenIndex].classList.add('active');
    });
}

function goToPrevScreen() {
    if (isAnimating || currentScreenIndex <= 0) return;
    triggerTransition(() => {
        screens[currentScreenIndex].classList.remove('active');
        currentScreenIndex--;
        screens[currentScreenIndex].classList.add('active');
    });
}

// MỞ THIỆP VÀ CHUYỂN TRANG
function openEnvelope(element) {
    let bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        let playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Trình duyệt chặn phát nhạc tự động.", error);
            });
        }
    }
    element.classList.add('open');
    setTimeout(() => goToNextScreen(), 800);
}

// ĐIỀU HƯỚNG MŨI TÊN BÀN PHÍM VÀ CHUỘT
function handleNavigation(direction) {
    if (currentScreenIndex === 0) return; 
    if (document.getElementById('galaxy-view').classList.contains('active')) return;
    if (document.getElementById('quiz-modal') && document.getElementById('quiz-modal').classList.contains('active')) return;

    if (direction === 'next') goToNextScreen();
    else if (direction === 'prev') goToPrevScreen();
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') handleNavigation('next');
    else if (e.key === 'ArrowLeft') handleNavigation('prev');
});

window.addEventListener('wheel', (e) => {
    if (e.deltaY > 50) handleNavigation('next');
    else if (e.deltaY < -50) handleNavigation('prev');
});

// ==========================================
// LOGIC VUỐT ĐIỆN THOẠI (THÔNG MINH)
// ==========================================
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

window.addEventListener('touchstart', e => {
    // Bỏ qua vuốt nếu đang chạm vào Hành trình, Vòng màu, Dải ngân hà, hoặc Khung Chat
    if (e.target.closest('.timeline-wrapper') || e.target.id === 'colorWheel' || e.target.closest('#galaxy-view') || e.target.closest('.chat-modal-box')) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: true});

window.addEventListener('touchend', e => {
    if (e.target.closest('.timeline-wrapper') || e.target.id === 'colorWheel' || e.target.closest('#galaxy-view') || e.target.closest('.chat-modal-box')) return;
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, {passive: true});

function handleSwipe() {
    let swipeX = touchStartX - touchEndX;
    let swipeY = Math.abs(touchStartY - touchEndY);
    
    if (swipeX > 50 && swipeY < 50) handleNavigation('next'); 
    if (swipeX < -50 && swipeY < 50) handleNavigation('prev'); 
}

function triggerTransition(callback) {
    isAnimating = true;
    const transition = document.getElementById('transition-overlay');
    transition.classList.add('active');
    transition.classList.remove('done');

    setTimeout(() => {
        callback();
        transition.classList.remove('active');
        transition.classList.add('done');
        
        setTimeout(() => {
            transition.style.transition = 'none';
            transition.classList.remove('done');
            setTimeout(() => { transition.style.transition = ''; isAnimating = false; }, 800);
        }, 800);
    }, 800);
}

// ==========================================
// CẤU HÌNH DISCORD WEBHOOK CỦA ÔNG
// ==========================================
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1559593302540685432/gl3Xsh4NXOxnS4LPk58SysMXfCLcZ4ajVDq3Igr8LDl7TRozbk6vbGmRCzoIx4_uoOie";

function sendToDiscord(message, file = null) {
    if (!DISCORD_WEBHOOK_URL) return;
    
    const formData = new FormData();
    formData.append("content", message);
    if (file) {
        formData.append("file", file, "mau_nail.jpg");
    }

    fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        body: formData
    }).catch(err => console.log("Lỗi gửi Discord:", err));
}

// ==========================================
// LOGIC NAIL (LƯU LOCALSTORAGE + GỬI DISCORD)
// ==========================================
let nailUploadCount = 0;
function previewNail(event) {
    if (nailUploadCount >= 3) return;
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Img = e.target.result;
            document.getElementById('nail-preview').src = base64Img;
            document.getElementById('nail-preview').style.display = 'block';
            document.getElementById('nail-placeholder-text').style.display = 'none';
            document.querySelector('.nail-frame').style.background = 'none';
            document.querySelector('.nail-frame').style.border = 'none';
            nailUploadCount++;
            document.getElementById('nail-chance').innerText = 3 - nailUploadCount;
            
            // Lưu vào bộ nhớ máy bồ để lỡ F5 không mất
            localStorage.setItem("saved_nail", base64Img);

            // Bắn ảnh ngay lập tức về Discord
            sendToDiscord(`💅 **Công chúa vừa chọn mẫu Nail mới (Lần ${nailUploadCount}/3):**`, file);

            if (nailUploadCount >= 3) {
                document.getElementById('nail-status').innerHTML = "<b>Đã chốt mẫu này nha công chúa! 💅</b>";
                document.getElementById('nail-upload-btn').style.display = 'none';
            }
        }
        reader.readAsDataURL(file);
    }
}

// VẼ VÒNG TRÒN 12 MÀU
const canvas = document.getElementById('colorWheel');
let pickedColor = '';
let chosenColorsArray = [];

if (canvas) {
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2;
    const colors = [
        '#FF0000', '#FF7F00', '#FFFF00', '#7FFF00', '#00FF00', '#00FF7F',
        '#00FFFF', '#007FFF', '#0000FF', '#7F00FF', '#FF00FF', '#FF007F'
    ];
    
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, i * Math.PI / 6, (i + 1) * Math.PI / 6);
        ctx.fillStyle = colors[i];
        ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.25, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    let isDragging = false;
    function updateColorFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if(e.touches) {
            x = e.touches[0].clientX - rect.left; y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left; y = e.clientY - rect.top;
        }
        const dx = x - radius; const dy = y - radius;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist > radius) { x = radius + (dx/dist)*radius; y = radius + (dy/dist)*radius; }
        
        const cursor = document.getElementById('colorCursor');
        cursor.style.left = x + 'px'; cursor.style.top = y + 'px';

        const p = ctx.getImageData(x, y, 1, 1).data;
        if (p[3] === 0) return; 
        pickedColor = `rgb(${p[0]},${p[1]},${p[2]})`;
        cursor.style.backgroundColor = pickedColor;
    }

    canvas.addEventListener('mousedown', (e) => { isDragging = true; updateColorFromEvent(e); });
    canvas.addEventListener('mousemove', (e) => { if(isDragging) updateColorFromEvent(e); });
    window.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('touchstart', (e) => { isDragging = true; updateColorFromEvent(e); });
    canvas.addEventListener('touchmove', (e) => { if(isDragging) updateColorFromEvent(e); e.preventDefault();});
    window.addEventListener('touchend', () => { isDragging = false; });
}

// ==========================================
// LOGIC CHỌN MÀU (LƯU LOCALSTORAGE + GỬI DISCORD)
// ==========================================
function confirmColor() {
    if (!pickedColor) { alert('Em hãy rê chuột vào vòng tròn để chọn màu trước nhé!'); return; }
    if (chosenColorsArray.length < 3) {
        chosenColorsArray.push(pickedColor);
        let slot = document.getElementById(`slot-${chosenColorsArray.length}`);
        slot.style.backgroundColor = pickedColor;
        slot.style.border = '2px solid #333';
        updateInviteColors();
        
        // Lưu vào bộ nhớ máy để lỡ F5 không mất
        localStorage.setItem("saved_colors", JSON.stringify(chosenColorsArray));

        // Khi đủ 3 màu thì báo về Discord
        if (chosenColorsArray.length === 3) {
            sendToDiscord(`👗 **Công chúa đã chốt xong 3 màu Dresscode:**\n• Màu 1: \`${chosenColorsArray[0]}\`\n• Màu 2: \`${chosenColorsArray[1]}\`\n• Màu 3: \`${chosenColorsArray[2]}\``);
        }
    } else { alert("Đã đủ 3 màu rồi công chúa ơi!"); }
}

function resetColors() {
    chosenColorsArray = [];
    document.getElementById('invite-dresscode-colors').innerHTML = '<span style="font-size: 14px; font-weight: normal; color: #999;">(Chưa chọn màu)</span>';
    for(let i=1; i<=3; i++) {
        let slot = document.getElementById(`slot-${i}`);
        slot.style.backgroundColor = 'transparent';
        slot.style.border = '2px dashed var(--pink-primary)';
    }
    // Xóa trong bộ nhớ khi nàng chọn lại
    localStorage.removeItem("saved_colors");
}

function updateInviteColors() {
    const container = document.getElementById('invite-dresscode-colors');
    container.innerHTML = '';
    chosenColorsArray.forEach(color => {
        let div = document.createElement('div');
        div.style.width = '24px'; div.style.height = '24px';
        div.style.borderRadius = '4px';
        div.style.backgroundColor = color;
        div.style.border = '1px solid #666';
        container.appendChild(div);
    });
}

// ==========================================
// TỰ ĐỘNG PHỤC HỒI DỮ LIỆU KHI TẢI LẠI TRANG
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // Phục hồi Nail
    const savedNail = localStorage.getItem("saved_nail");
    if (savedNail) {
        document.getElementById('nail-preview').src = savedNail;
        document.getElementById('nail-preview').style.display = 'block';
        document.getElementById('nail-placeholder-text').style.display = 'none';
        document.querySelector('.nail-frame').style.background = 'none';
        document.querySelector('.nail-frame').style.border = 'none';
    }

    // Phục hồi Màu sắc
    const savedColors = localStorage.getItem("saved_colors");
    if (savedColors) {
        chosenColorsArray = JSON.parse(savedColors);
        chosenColorsArray.forEach((color, idx) => {
            let slot = document.getElementById(`slot-${idx + 1}`);
            if (slot) {
                slot.style.backgroundColor = color;
                slot.style.border = '2px solid #333';
            }
        });
        updateInviteColors();
    }
});

// CHẠY HÀNH TRÌNH TỚI ĐIỂM CUỐI VÀ HIỆN COMING SOON
const journeyStops = [
    { index: 0, path: [ {id: 'node-1', x: 80, y: 85} ] },
    { index: 1, path: [ {id: null, x: 130, y: 44}, {id: 'node-2', x: 180, y: 30} ] },
    { index: 2, path: [ {id: null, x: 230, y: 44}, {id: 'node-3', x: 280, y: 85} ] },
    { index: 3, path: [ {id: null, x: 330, y: 126}, {id: 'node-4', x: 380, y: 140} ] },
    { index: 4, path: [ {id: null, x: 430, y: 126}, {id: 'node-5', x: 480, y: 85} ] },
    { index: 5, path: [ {id: null, x: 530, y: 44}, {id: 'node-6', x: 580, y: 30} ] },
    { index: 6, path: [ {id: null, x: 630, y: 44}, {id: 'node-7', x: 680, y: 85} ] },
    { index: 7, path: [ {id: null, x: 730, y: 126}, {id: 'node-8', x: 780, y: 140} ] },
    { index: 8, path: [ {id: null, x: 830, y: 126}, {id: 'node-9', x: 880, y: 85} ] },
    { index: 9, path: [ {id: null, x: 930, y: 44}, {id: 'node-10', x: 980, y: 30} ] },
    { index: 10, path: [ {id: null, x: 1030, y: 44}, {id: 'node-11', x: 1080, y: 85} ] },
    { index: 11, path: [ {id: null, x: 1130, y: 126}, {id: 'node-12', x: 1180, y: 140} ] },
    { index: 12, path: [ {id: null, x: 1230, y: 126}, {id: 'node-end', x: 1280, y: 85} ] }
];
let currentJourneyStep = 0;

function advanceTimeline() {
    if (currentJourneyStep >= journeyStops.length) return;
    let btn = document.getElementById('btn-timeline');
    if(!btn) return;
    btn.disabled = true;
    let dot = document.getElementById('light-dot');
    
    let currentPath = journeyStops[currentJourneyStep].path;
    
    if (currentJourneyStep === 0) {
        dot.classList.add('charging');
        setTimeout(() => {
            dot.classList.remove('charging');
            setTimeout(() => {
                runPath(currentPath, dot, btn);
            }, 50); 
        }, 1500);
    } else {
        runPath(currentPath, dot, btn);
    }
}

function runPath(currentPath, dot, btn) {
    dot.classList.add('active'); 
    let delay = 0;
    currentPath.forEach((node, idx) => {
        setTimeout(() => {
            dot.style.left = node.x + 'px'; 
            dot.style.top = node.y + 'px';
            let nodeElement = document.getElementById(node.id);
            if (nodeElement) nodeElement.classList.remove('hidden-node');
            
            if (idx === currentPath.length - 1) {
                currentJourneyStep++;
                if (currentJourneyStep >= journeyStops.length) {
                    btn.innerText = "Hành trình còn dài... 💖"; 
                    document.getElementById('node-end').classList.add('show-coming-soon');
                } else { 
                    btn.innerText = "Tiếp tục chạy 🚀"; 
                    btn.disabled = false; 
                }
            }
        }, delay);
        delay += 450; 
    });
}

// --- 1. CHATBOX TRẮC NGHIỆM GIẢI MÃ QUÀ ---
const quizData = {
    1: { 
        unlocked: false,
        questions: [
            { q: "Câu 1: Lần đầu đi Thảo Cầm Viên là ngày nào?", options: ["A. 12/6", "B. 20/6", "C. 25/6"], correctIndex: 1 }, 
            { q: "Câu 2: Vậy lần đó chúng ta mặc áo màu gì?", options: ["A. Đen", "B. Đỏ", "C. Trắng"], correctIndex: 2 },
            { q: "Câu 3: Lần đầu tụi mình gặp nhau mình đi ăn ở đâu?", options: ["A. Chicken box", "B. Kope chicken", "C. Sugar chicken"], correctIndex: 0 }
        ]
    },
    2: { 
        unlocked: false,
        questions: [
            { q: "Câu 1: Bộ phim đầu tiên tụi mình đi coi chung là gì?", options: ["A. Conan Movie 28", "B. The Odyssey", "C. Spider man brand new day"], correctIndex: 2 },
            { q: "Câu 2: Món nào sau đây là món anh đã từng nói với em là thích nhất?", options: ["A. Cơm cháy kho quẹt", "B. Bột chiên", "C. Cơm tấm"], correctIndex: 1 },
            { q: "Câu 3: Lần đầu tiên chúng mình hôn môi nhau là ở đâu?", options: ["A. Công viên Võ Thị Sáu", "B. Rạp chiếu phim", "C. Vincom"], correctIndex: 0 }
        ]
    },
    3: { 
        unlocked: false,
        questions: [
            { q: "Câu 1: Trong Messenger hiện tại biệt danh em đặt cho anh là gì?", options: ["A. Ăm chã húi", "B. Chong oiiiiiiii", "C. Oxa iuuu"], correctIndex: 1 },
            { q: "Câu 2: Nhà hàng mà tụi mình chính thức quen nhau là nhà hàng gì?", options: ["A. Bontà restaurant", "B. Deca 14", "C. Mango restaurant"], correctIndex: 2 },
            { q: "Câu 3: Câu hỏi cuối cùng: mình chính thức quen nhau vào ngày bao nhiêu?", options: ["A. 22/7", "B. 20/7", "C. 26/7"], correctIndex: 0 }
        ]
    }
};

let activeQuizGiftId = null;
let currentQIdx = 0;

function openGiftQuiz(giftId) {
    if (quizData[giftId].unlocked) return; 
    
    activeQuizGiftId = giftId;
    currentQIdx = 0;
    document.getElementById('quiz-modal').classList.add('active');
    document.getElementById('quiz-chat-log').innerHTML = '<div class="msg-bubble msg-bot">Bấm nút bên dưới để giải mã hộp quà này nhé Công Chúa!</div>';
    document.getElementById('btn-start-quiz').style.display = 'block';
    document.getElementById('quiz-options-area').style.display = 'none';
}

function closeQuizModal() {
    document.getElementById('quiz-modal').classList.remove('active');
}

function startQuizTest() {
    document.getElementById('btn-start-quiz').style.display = 'none';
    document.getElementById('quiz-options-area').style.display = 'flex';
    askQuizQuestion();
}

function askQuizQuestion() {
    const data = quizData[activeQuizGiftId].questions[currentQIdx];
    appendMsgToChat(data.q, 'bot');
    
    for(let i=0; i<3; i++){
        const btn = document.getElementById(`opt-${i}`);
        btn.innerText = data.options[i];
    }
}

function submitQuizAns(selectedIndex) {
    const data = quizData[activeQuizGiftId].questions[currentQIdx];
    const userText = data.options[selectedIndex];
    appendMsgToChat(userText, 'user');

    if(selectedIndex === data.correctIndex) {
        setTimeout(() => {
            currentQIdx++;
            if(currentQIdx < 3) {
                appendMsgToChat("Đúng rồi nè 🥰 Tiếp câu nữa nha!", 'bot');
                setTimeout(askQuizQuestion, 600);
            } else {
                appendMsgToChat("Giỏi quá! 🔓 Ổ khóa đã mở. Đóng bảng này lại và xem quà nha!", 'bot');
                document.getElementById('quiz-options-area').style.display = 'none';
                
                quizData[activeQuizGiftId].unlocked = true;
                
                document.getElementById(`gift-closed-${activeQuizGiftId}`).style.display = 'none';
                document.getElementById(`gift-opened-${activeQuizGiftId}`).style.display = 'flex';
                document.getElementById(`gift-box-${activeQuizGiftId}`).classList.remove('bounce-3d');
            }
        }, 500);
    } else {
        setTimeout(() => {
            appendMsgToChat("Sai mất tiêu rồi 😝 Chọn lại nha công chúa!", 'bot');
        }, 500);
    }
}

function appendMsgToChat(text, sender) {
    const log = document.getElementById('quiz-chat-log');
    log.innerHTML += `<div class="msg-bubble msg-${sender}">${text}</div>`;
    log.scrollTop = log.scrollHeight;
}

let galaxyScrollInterval;

function openGalaxy(mediaArray) {
    const galaxy = document.getElementById('galaxy-view');
    const contentBox = document.getElementById('galaxy-content');
    contentBox.innerHTML = ''; 

    mediaArray.forEach(item => {
        let el;
        if (item.type === 'img') {
            el = document.createElement('img'); 
            el.src = item.src; 
        } else if (item.type === 'video') {
            el = document.createElement('video'); 
            el.src = item.src;
            el.autoplay = true; 
            el.loop = true; 
            el.muted = true;
            el.volume = 0;
            el.setAttribute('muted', 'true');
            
            // 3 LỆNH CHÍ MẠNG ÉP ĐIỆN THOẠI PLAY VIDEO
            el.setAttribute('playsinline', ''); // Phải viết thường
            el.setAttribute('webkit-playsinline', ''); 
            
            // Ép hệ thống chạy
            setTimeout(() => {
                let playPromise = el.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => console.log("Đợi người dùng tương tác"));
                }
            }, 100);
        }
        if (el) {
            contentBox.appendChild(el);
        }
    });

    galaxy.classList.add('active');
    galaxy.scrollTop = 0;

    clearInterval(galaxyScrollInterval);
    galaxyScrollInterval = setInterval(() => {
        galaxy.scrollTop += 1;
    }, 15);
}

function closeGalaxy() {
    document.getElementById('galaxy-view').classList.remove('active');
    clearInterval(galaxyScrollInterval);
    setTimeout(() => { document.getElementById('galaxy-content').innerHTML = ''; }, 300);
}
