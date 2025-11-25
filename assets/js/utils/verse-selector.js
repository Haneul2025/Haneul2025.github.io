/**
 * 랜덤 구절 선택 유틸리티
 * - Fisher-Yates 셔플 알고리즘 사용
 * - localStorage를 활용한 중복 방지
 */

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


