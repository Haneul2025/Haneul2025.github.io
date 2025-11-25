/**
 * 결과 페이지 로직
 * - URL 파라미터에서 구절 정보 읽기
 * - 화면에 구절 표시
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
    
    // URL 파라미터에서 구절 정보 가져오기
    const params = new URLSearchParams(window.location.search);
    const content = params.get('content');
    const reference = params.get('reference');
    
    if (content && reference) {
        document.getElementById('verseContent').innerHTML = content;
        document.getElementById('verseReference').textContent = reference;
    } else {
        // 파라미터가 없으면 로딩 페이지로 리다이렉트
        window.location.href = 'loading.html';
    }
});


