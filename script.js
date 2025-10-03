// 페이지 전환 함수
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// 로딩 시작 함수
function startLoading() {
    showPage('loadingPage');
    
    setTimeout(() => {
        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        document.getElementById('verseContent').innerHTML = randomVerse.content;
        document.getElementById('verseReference').textContent = randomVerse.reference;
        showPage('resultPage');
    }, 2000);
}

// 이미지 다운로드 함수
function downloadImage() {
    const resultContainer = document.querySelector('.result-container');
    const buttonContainer = document.querySelector('.button-container');

    // 저장 모드 활성화
    resultContainer.classList.add('saving-mode');
    buttonContainer.style.display = 'none';

    setTimeout(() => {
        const backgroundImg = new Image();
        backgroundImg.crossOrigin = 'anonymous';
        backgroundImg.src = './back.jpg';  // ✅ 배경 정확히 지정

        backgroundImg.onload = function () {
            html2canvas(resultContainer, {
                width: 1080,
                height: 1920,
                scale: 2, // 더 선명하게
                logging: false,
                useCORS: true,
                backgroundColor: null,
                ignoreElements: (element) => {
                    return element.classList.contains('blur-overlay') ||
                           element.classList.contains('blur-circle');
                }
            }).then(canvas => {
                // 최종 캔버스 (1080x1920)
                const finalCanvas = document.createElement('canvas');
                const ctx = finalCanvas.getContext('2d');
                finalCanvas.width = 1080;
                finalCanvas.height = 1920;

                // ✅ 배경 먼저 채우기
                ctx.drawImage(backgroundImg, 0, 0, 1080, 1920);

                // ✅ 카드 캡처본 합성
                const offsetX = (1080 - canvas.width) / 2;
                const offsetY = (1920 - canvas.height) / 2;
                ctx.drawImage(canvas, offsetX, offsetY);

                // 저장 모드 해제
                resultContainer.classList.remove('saving-mode');
                buttonContainer.style.display = '';

                // 다운로드 링크
                const link = document.createElement('a');
                link.download = 'Haneul_2025_말씀카드.png';
                link.href = finalCanvas.toDataURL('image/png', 1.0);
                link.click();
            }).catch(error => {
                console.error('이미지 저장 중 오류 발생:', error);
                fallbackDownload();
            });
        };

        backgroundImg.onerror = function () {
            console.warn('배경 이미지 로드 실패 → fallback 사용');
            fallbackDownload();
        };

        // 대안 저장 함수 (카드만)
        function fallbackDownload() {
            resultContainer.classList.remove('saving-mode');
            buttonContainer.style.display = '';

            const card = document.getElementById('verseCard');
            html2canvas(card, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'Haneul_2025_말씀카드_카드만.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    }, 200);
}

