/**
 * 로딩 페이지 로직
 * - 구절 선택 및 포맷팅
 * - 결과 페이지로 리다이렉트
 */

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', function() {
    // 로딩 시간을 고려한 대기
    setTimeout(() => {
        const randomVerse = verses[getNextVerseIndex()];
        console.log('원본 구절:', randomVerse.content);
        
        // 구절 포맷팅 적용
        const formattedContent = formatVerseForCard(randomVerse.content, 25);
        console.log('포맷팅 결과:', formattedContent);
        
        // 결과를 URL 파라미터로 전달
        const params = new URLSearchParams();
        params.set('content', formattedContent.replace(/\n/g, '<br>'));
        params.set('reference', randomVerse.reference);
        
        // 결과 페이지로 이동
        window.location.href = `result.html?${params.toString()}`;
    }, 1500);
});

