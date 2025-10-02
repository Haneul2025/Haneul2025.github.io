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
    
    // 약간의 지연을 주어 스타일이 적용되도록 함
    setTimeout(() => {
        html2canvas(resultContainer, {
            width: 1080,
            height: 1920,
            scale: 1,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            foreignObjectRendering: true,
            imageTimeout: 15000,
            removeContainer: false
        }).then(canvas => {
            // 저장 모드 해제
            resultContainer.classList.remove('saving-mode');
            buttonContainer.style.display = '';
            
            // 다운로드 링크 생성
            const link = document.createElement('a');
            link.download = 'Haneul_2025_말씀카드.png';
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        }).catch(error => {
            console.error('이미지 저장 중 오류 발생:', error);
            
            // 저장 모드 해제
            resultContainer.classList.remove('saving-mode');
            buttonContainer.style.display = '';
            
            // 대안 방법: 카드만 저장
            const card = document.getElementById('verseCard');
            html2canvas(card, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'Haneul_2025_말씀카드_카드만.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    }, 100);
}
