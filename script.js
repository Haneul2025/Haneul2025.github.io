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
    // 버튼 숨기기
    const buttonContainer = document.querySelector('.button-container');
    const originalButtonDisplay = buttonContainer.style.display;
    buttonContainer.style.display = 'none';
    
    // 전체 결과 페이지를 1080x1920 크기로 캡처
    const resultPage = document.getElementById('resultPage');
    
    html2canvas(resultPage, {
        width: 1080,
        height: 1920,
        scale: 1,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f5f5dc', // 기본 배경색 설정 (베이지색)
        foreignObjectRendering: true
    }).then(canvas => {
        // 버튼 다시 표시
        buttonContainer.style.display = originalButtonDisplay;
        
        // 다운로드 링크 생성
        const link = document.createElement('a');
        link.download = 'Haneul_2025_말씀카드.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    }).catch(error => {
        // 버튼 다시 표시 (에러 시에도)
        buttonContainer.style.display = originalButtonDisplay;
        console.error('이미지 저장 중 오류 발생:', error);
        
        // 대안: 카드만 저장
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
}
