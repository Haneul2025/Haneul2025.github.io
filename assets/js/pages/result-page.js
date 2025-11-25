/**
 * 결과 페이지 로직
 * - URL 파라미터에서 구절 정보 읽기
 * - 화면에 구절 표시
 */

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', function() {
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

