/**
 * 로딩 페이지 로직
 * - 구절 선택 및 포맷팅
 * - 결과 페이지로 리다이렉트
 * - 뒤로가기 방지
 */

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', function() {
    // 뒤로가기 완전 차단: 히스토리 조작
    // 현재 페이지를 히스토리에 고정
    history.replaceState(null, null, location.href);
    history.pushState(null, null, location.href);
    
    // 뒤로가기 시 현재 페이지로 강제 이동
    window.addEventListener('popstate', function(event) {
        // 히스토리를 여러 번 추가하여 뒤로가기 불가능하게
        history.pushState(null, null, location.href);
        history.pushState(null, null, location.href);
        history.pushState(null, null, location.href);
    });
    
    // 페이지를 떠나려고 할 때도 방지
    window.addEventListener('beforeunload', function(event) {
        // 로딩 중에는 페이지를 떠나지 못하게
        event.preventDefault();
        event.returnValue = '';
    });
    
    // 주기적으로 히스토리 조작 (뒤로가기 완전 차단)
    const historyBlockInterval = setInterval(function() {
        history.pushState(null, null, location.href);
    }, 100);
    
    // 로딩 시간을 고려한 대기
    setTimeout(() => {
        // 히스토리 조작 중지
        clearInterval(historyBlockInterval);
        
        // beforeunload 이벤트 제거
        window.removeEventListener('beforeunload', arguments.callee);
        
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


