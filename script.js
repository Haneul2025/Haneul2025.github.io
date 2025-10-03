// 페이지 전환 함수
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// 고품질 랜덤 셔플 생성 (Crypto 사용)
function generateShuffledIndices(total) {
    const indices = Array.from({ length: total }, (_, i) => i);
    // Fisher–Yates with crypto
    for (let i = total - 1; i > 0; i--) {
        const randArray = new Uint32Array(1);
        window.crypto.getRandomValues(randArray);
        const j = randArray[0] % (i + 1);
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
}

function getNextVerseIndex() {
    const keyOrder = 'verseOrder';
    const keyPtr = 'versePtr';
    let order = [];
    let ptr = 0;
    try {
        order = JSON.parse(localStorage.getItem(keyOrder) || '[]');
        ptr = parseInt(localStorage.getItem(keyPtr) || '0', 10);
    } catch (_) {
        order = [];
        ptr = 0;
    }

    // 재생성 조건: 비어있거나 길이 불일치/포인터 초과
    if (!Array.isArray(order) || order.length !== verses.length || ptr >= order.length) {
        order = generateShuffledIndices(verses.length);
        ptr = 0;
    }

    const index = order[ptr];
    ptr += 1;
    localStorage.setItem(keyOrder, JSON.stringify(order));
    localStorage.setItem(keyPtr, String(ptr));
    return index;
}

// 로딩 시작 함수
function startLoading() {
    showPage('loadingPage');
    
    setTimeout(() => {
        const randomVerse = verses[getNextVerseIndex()];
        // const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        document.getElementById('verseContent').innerHTML = randomVerse.content;
        document.getElementById('verseReference').textContent = randomVerse.reference;
        showPage('resultPage');
    }, 2000);
}

function downloadImage() {
    const resultContainer = document.querySelector('.result-container');
    const buttonContainer = document.querySelector('.button-container');

    resultContainer.classList.add('saving-mode');
    buttonContainer.style.display = 'none';

    setTimeout(() => {
        html2canvas(resultContainer, {
            width: 1080,
            height: 1920,
            scale: 2,   // 더 선명하게
            logging: false,
            useCORS: true
        }).then(canvas => {
            resultContainer.classList.remove('saving-mode');
            buttonContainer.style.display = '';

            const link = document.createElement('a');
            link.download = '걸음을 향한 말씀.png';
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        });
    }, 200);
}

function autoResizeText(element, maxHeight) {
    let fontSize = parseInt(window.getComputedStyle(element).fontSize);
    while (element.scrollHeight > maxHeight && fontSize > 12) {
        fontSize--;
        element.style.fontSize = fontSize + "px";
    }
}

// 저장 모드 카드가 로드된 뒤 실행
window.addEventListener("load", () => {
    const verse = document.getElementById("verseContent");
    const card = document.getElementById("verseCard");

    if (verse && card) {
        autoResizeText(verse, card.clientHeight * 0.6); 
        // 카드 높이의 60% 안에 들어오도록 줄임
    }
});


// // 이미지 다운로드 함수
// function downloadImage() {
//     const resultContainer = document.querySelector('.result-container');
//     const buttonContainer = document.querySelector('.button-container');
    
//     // 저장 모드 활성화
//     resultContainer.classList.add('saving-mode');
//     buttonContainer.style.display = 'none';
    
//     // 약간의 지연을 주어 스타일이 적용되도록 함
//     setTimeout(() => {
//         // 배경 이미지 로드
//         const backgroundImg = new Image();
//         backgroundImg.crossOrigin = 'anonymous';
        
//         backgroundImg.onload = function() {
//             // html2canvas로 컨테이너 캡처 (배경 제외)
//             html2canvas(resultContainer, {
//                 width: 1080,
//                 height: 1920,
//                 scale: 1,
//                 logging: false,
//                 useCORS: true,
//                 allowTaint: true,
//                 backgroundColor: null,
//                 foreignObjectRendering: true,
//                 imageTimeout: 15000,
//                 removeContainer: false,
//                 ignoreElements: function(element) {
//                     // 배경 이미지 요소는 무시하고 나중에 수동으로 추가
//                     return element.classList.contains('blur-overlay') || 
//                            element.classList.contains('blur-circle');
//                 }
//             }).then(canvas => {
//                 // 새로운 캔버스 생성 (배경 이미지 포함)
//                 const finalCanvas = document.createElement('canvas');
//                 const ctx = finalCanvas.getContext('2d');
//                 finalCanvas.width = 1080;
//                 finalCanvas.height = 1920;
                
//                 // 배경 이미지 그리기
//                 ctx.drawImage(backgroundImg, 0, 0, 1080, 1920);
                
//                 // 원본 캔버스 내용을 배경 위에 그리기
//                 ctx.drawImage(canvas, 0, 0);
                
//                 // 저장 모드 해제
//                 resultContainer.classList.remove('saving-mode');
//                 buttonContainer.style.display = '';
                
//                 // 다운로드 링크 생성
//                 const link = document.createElement('a');
//                 link.download = 'Haneul_2025_말씀카드.png';
//                 link.href = finalCanvas.toDataURL('image/png', 1.0);
//                 link.click();
//             }).catch(error => {
//                 console.error('이미지 저장 중 오류 발생:', error);
//                 fallbackDownload();
//             });
//         };
        
//         backgroundImg.onerror = function() {
//             console.warn('배경 이미지 로드 실패, 대안 방법 사용');
//             fallbackDownload();
//         };
        
//         // 배경 이미지 로드 시작
//         backgroundImg.src = './back.jpg';
        
//         // 대안 다운로드 함수
//         function fallbackDownload() {
//             // 저장 모드 해제
//             resultContainer.classList.remove('saving-mode');
//             buttonContainer.style.display = '';
            
//             // 대안 방법: 카드만 저장
//             const card = document.getElementById('verseCard');
//             html2canvas(card, {
//                 backgroundColor: '#ffffff',
//                 scale: 2,
//                 logging: false,
//                 useCORS: true
//             }).then(canvas => {
//                 const link = document.createElement('a');
//                 link.download = 'Haneul_2025_말씀카드_카드만.png';
//                 link.href = canvas.toDataURL('image/png');
//                 link.click();
//             });
//         }
//     }, 100);
// }
