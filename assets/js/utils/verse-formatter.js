/**
 * ✨ 자연스러운 한국어 줄바꿈 알고리즘 (성경 구절 최적화)
 * 
 * 핵심 원칙:
 * 1. 금칙 문자 처리 - 줄 처음/끝에 오면 안 되는 문자 방지
 * 2. 조사 바인딩 - 명사+조사가 절대 분리되지 않도록
 * 3. 의존명사/보조용언 - 본용언과 함께 유지
 * 4. 관형절 유지 - 수식 구조 보존
 * 5. 접속사 처리 - 자연스러운 문장 연결
 * 6. 시각적 밸런스 - 줄 길이 균형으로 읽기 편안함
 * 7. 의미 단위 존중 - 문맥 전환 시점 감지
 */

// 전역 변수
const FORMATTING_CACHE = new Map();

// ==================== 한국어 언어학적 규칙 정의 ==================== //

// 금칙 문자: 줄 처음에 올 수 없는 문자
const LINE_START_FORBIDDEN = [',', '.', '!', '?', ':', ';', ')', ']', '}', '…'];

// 금칙 문자: 줄 끝에 올 수 없는 문자
const LINE_END_FORBIDDEN = ['(', '[', '{'];

// 접속사/연결어 (앞 문장과 연결하는 것이 자연스러움)
const CONNECTIVES = [
    '그러나', '그러므로', '그리하면', '그러면', '그런데', '그리고', '그래서',
    '따라서', '하지만', '그런즉', '이에', '이제', '곧', '또한', '또', '다시',
    '한편', '즉', '예컨대', '만약', '만일', '오직'
];

// 고어체 종결어미 패턴 (성경 특화)
const CLASSICAL_ENDINGS = [
    /로다$/, /도다$/, /니라$/, /이라$/, /리라$/, /리로다$/,
    /노라$/, /느니라$/, /하느니라$/, /하리라$/, /하시리라$/,
    /되리라$/, /이로다$/, /하리로다$/
];

// 성경 고유명사 패턴
const BIBLE_NAMES = [
    '여호와', '하나님', '예수', '그리스도', '성령', '아버지',
    '이스라엘', '유다', '예루살렘', '시온', '다윗', '아브라함',
    '모세', '바울', '베드로', '요한'
];

// ==================== 메인 포맷팅 함수 ==================== //

function formatVerseForCard(text, maxLength = 15) {
    const cleanText = text.replace(/<br\s*\/?>/gi, ' ').trim();
    
    // 캐시 확인
    const cacheKey = `${cleanText}_${maxLength}`;
    if (FORMATTING_CACHE.has(cacheKey)) {
        return FORMATTING_CACHE.get(cacheKey);
    }
    
    console.log('✨ 자연스러운 한국어 줄바꿈 시작:', cleanText);
    
    // 1단계: 공백 정규화 및 전처리
    const normalized = normalizeText(cleanText);
    console.log('🔄 정규화:', normalized);
    
    // 2단계: 의미 단위로 분해 (접속사, 동사, 구두점 기준)
    const segments = segmentByMeaning(normalized);
    console.log('🔍 의미 단위:', segments);
    
    // 3단계: 줄바꿈 후보 지점 탐색
    const breakCandidates = findBreakCandidates(segments, maxLength);
    console.log('📍 줄바꿈 후보:', breakCandidates);
    
    // 4단계: 최적의 줄바꿈 선택 (시각적 밸런스 + 의미 보존)
    const lines = selectOptimalBreaks(segments, breakCandidates, maxLength);
    console.log('📝 선택된 줄:', lines);
    
    // 5단계: 금칙 문자 규칙 적용
    const refined = applyForbiddenCharRules(lines);
    console.log('✅ 금칙 문자 처리:', refined);
    
    // 6단계: 최종 다듬기
    const finalResult = finalPolish(refined);
    console.log('✨ 최종 결과:', finalResult);
    
    // 결과 캐시
    FORMATTING_CACHE.set(cacheKey, finalResult);
    return finalResult;
}

// ==================== 1단계: 텍스트 정규화 ==================== //

function normalizeText(text) {
    // 여러 공백을 하나로
    let normalized = text.replace(/\s+/g, ' ');
    
    // 구두점 앞뒤 공백 정리
    normalized = normalized.replace(/\s*([,.])\s*/g, '$1 ');
    
    // 마지막 공백 제거
    normalized = normalized.trim();
    
    return normalized;
}

// ==================== 2단계: 의미 단위 분해 ==================== //

function segmentByMeaning(text) {
    const segments = [];
    let currentSegment = '';
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const nextWord = words[i + 1];
        const prevWord = words[i - 1];
        
        // 현재 단어를 세그먼트에 추가
        currentSegment += (currentSegment ? ' ' : '') + word;
        
        // 줄바꿈이 가능한 지점인지 확인
        const shouldBreak = isNaturalBreakPoint(word, nextWord, prevWord, currentSegment);
        
        if (shouldBreak && nextWord) {
            // 다음 단어가 접속사면 포함시킴
            if (CONNECTIVES.some(conn => nextWord.startsWith(conn))) {
                i++;
                currentSegment += ' ' + words[i];
            }
            
            segments.push({
                text: currentSegment.trim(),
                endsWithVerb: hasVerbEnding(word),
                endsWithClassical: hasClassicalEnding(word),
                length: currentSegment.trim().length
            });
            currentSegment = '';
        }
    }
    
    // 남은 부분 추가
    if (currentSegment.trim()) {
        const lastWord = words[words.length - 1];
        segments.push({
            text: currentSegment.trim(),
            endsWithVerb: hasVerbEnding(lastWord),
            endsWithClassical: hasClassicalEnding(lastWord),
            length: currentSegment.trim().length
        });
    }
    
    return segments;
}

/**
 * 자연스러운 줄바꿈 지점 판단
 */
function isNaturalBreakPoint(currentWord, nextWord, prevWord, currentSegment) {
    if (!nextWord) return false;
    
    // 1. 접속사 앞 (그러나, 그러므로 등)
    if (CONNECTIVES.some(conn => nextWord.startsWith(conn))) {
        return true;
    }
    
    // 2. 고어체 종결어미 뒤 (~로다, ~니라, ~리라 등)
    if (hasClassicalEnding(currentWord)) {
        return true;
    }
    
    // 3. 동사 종결형 뒤 (~하시며, ~하시고, ~하시니)
    if (hasVerbEnding(currentWord) && !isAuxiliaryConnection(nextWord)) {
        // 단, 다음이 보조동사 연결이 아닌 경우만
        return true;
    }
    
    // 4. 구두점 뒤
    if (/[,.]$/.test(currentWord)) {
        return true;
    }
    
    // 5. 너무 긴 세그먼트 (강제 분할)
    if (currentSegment.length > 25) {
        // 조사가 아닌 경우에만
        if (!isParticle(nextWord)) {
            return true;
        }
    }
    
    return false;
}

/**
 * 고어체 종결어미 확인
 */
function hasClassicalEnding(word) {
    return CLASSICAL_ENDINGS.some(pattern => pattern.test(word));
}

/**
 * 동사 종결형 확인
 */
function hasVerbEnding(word) {
    const verbPatterns = [
        /하시며$/, /하시고$/, /하시니$/, /하시어$/, /하시면$/,
        /하며$/, /하고$/, /하니$/, /하여$/, /하면$/,
        /이며$/, /이고$/, /이니$/, /있고$/, /없고$/,
        /되며$/, /되고$/, /되니$/, /주며$/, /주고$/,
        /올리사$/, /일으키시며$/
    ];
    return verbPatterns.some(pattern => pattern.test(word));
}

/**
 * 보조동사 연결 확인
 */
function isAuxiliaryConnection(word) {
    const auxiliaries = ['주다', '드리다', '보다', '내다', '버리다', '있다', '없다'];
    return auxiliaries.some(aux => word.includes(aux));
}

/**
 * 조사 여부 확인
 */
function isParticle(word) {
    const particles = ['은', '는', '이', '가', '을', '를', '의', '에', '와', '과', '도', '만'];
    return particles.some(p => word === p || word.endsWith(p));
}

// ==================== 3단계: 줄바꿈 후보 지점 탐색 ==================== //

function findBreakCandidates(segments, maxLength) {
    const candidates = [];
    let currentLine = '';
    let currentLineSegments = [];
    
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const testLine = currentLine ? `${currentLine} ${segment.text}` : segment.text;
        
        if (testLine.length <= maxLength) {
            // 현재 줄에 추가 가능
            currentLine = testLine;
            currentLineSegments.push(i);
        } else {
            // 현재 줄이 maxLength를 초과함
            if (currentLineSegments.length > 0) {
                candidates.push({
                    segments: [...currentLineSegments],
                    text: currentLine,
                    breakAfter: true,
                    score: calculateBreakScore(segments, currentLineSegments[currentLineSegments.length - 1])
                });
            }
            currentLine = segment.text;
            currentLineSegments = [i];
        }
    }
    
    // 마지막 줄
    if (currentLineSegments.length > 0) {
        candidates.push({
            segments: currentLineSegments,
            text: currentLine,
            breakAfter: false,
            score: 1.0
        });
    }
    
    return candidates;
}

/**
 * 줄바꿈 지점의 적절성 점수 계산 (높을수록 좋음)
 */
function calculateBreakScore(segments, segmentIndex) {
    const segment = segments[segmentIndex];
    let score = 0.5; // 기본 점수
    
    // 고어체 종결어미로 끝나면 +0.3
    if (segment.endsWithClassical) {
        score += 0.3;
    }
    
    // 동사로 끝나면 +0.2
    if (segment.endsWithVerb) {
        score += 0.2;
    }
    
    // 적절한 길이 (10~18자) +0.1
    if (segment.length >= 10 && segment.length <= 18) {
        score += 0.1;
    }
    
    return Math.min(score, 1.0);
}

// ==================== 4단계: 최적의 줄바꿈 선택 ==================== //

function selectOptimalBreaks(segments, candidates, maxLength) {
    // 이미 candidates가 줄 단위로 나뉘어 있음
    const lines = candidates.map(c => c.text);
    
    // 시각적 밸런스 개선
    return balanceLines(lines, maxLength);
}

/**
 * 줄 길이 밸런스 조정
 */
function balanceLines(lines, maxLength) {
    if (lines.length <= 1) return lines;
    
    const balanced = [];
    let i = 0;
    
    while (i < lines.length) {
        const currentLine = lines[i];
        const nextLine = lines[i + 1];
        
        // 현재 줄이 너무 짧고, 다음 줄이 있으면 병합 고려
        if (nextLine && currentLine.length < 8 && (currentLine.length + nextLine.length) <= maxLength * 1.2) {
            balanced.push(`${currentLine} ${nextLine}`);
            i += 2;
        } 
        // 현재 줄이 너무 길면 분할 고려
        else if (currentLine.length > maxLength * 1.3) {
            const split = smartSplit(currentLine, maxLength);
            balanced.push(...split);
            i++;
        }
        else {
            balanced.push(currentLine);
            i++;
        }
    }
    
    return balanced;
}

/**
 * 긴 줄을 지능적으로 분할
 */
function smartSplit(line, maxLength) {
    const words = line.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        if (testLine.length <= maxLength) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [line];
}

// ==================== 5단계: 금칙 문자 규칙 적용 ==================== //

function applyForbiddenCharRules(lines) {
    const refined = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const nextLine = lines[i + 1];
        
        // 다음 줄이 금칙 문자로 시작하면 현재 줄에 병합
        if (nextLine) {
            const nextFirstChar = nextLine.trim()[0];
            if (LINE_START_FORBIDDEN.includes(nextFirstChar)) {
                // 다음 줄의 첫 단어를 현재 줄에 병합
                const nextWords = nextLine.trim().split(' ');
                line = `${line} ${nextWords[0]}`;
                lines[i + 1] = nextWords.slice(1).join(' ');
            }
        }
        
        // 현재 줄이 금칙 문자로 끝나면 다음 줄의 첫 단어 가져오기
        const lastChar = line.trim()[line.trim().length - 1];
        if (nextLine && LINE_END_FORBIDDEN.includes(lastChar)) {
            const nextWords = nextLine.trim().split(' ');
            if (nextWords.length > 0) {
                line = `${line} ${nextWords[0]}`;
                lines[i + 1] = nextWords.slice(1).join(' ');
            }
        }
        
        if (line.trim()) {
            refined.push(line.trim());
        }
    }
    
    // 빈 줄 제거
    return refined.filter(line => line.length > 0);
}

// ==================== 6단계: 최종 다듬기 ==================== //

function finalPolish(lines) {
    // Widow/Orphan 방지: 마지막 줄이 너무 짧으면 이전 줄과 병합
    if (lines.length >= 2) {
        const lastLine = lines[lines.length - 1];
        const secondLastLine = lines[lines.length - 2];
        
        // 마지막 줄이 5자 이하면 병합 고려
        if (lastLine.length <= 5 && !hasClassicalEnding(lastLine)) {
            const merged = `${secondLastLine} ${lastLine}`;
            // 병합해도 너무 길지 않으면 병합
            if (merged.length <= 25) {
                lines[lines.length - 2] = merged;
                lines.pop();
            }
        }
    }
    
    // 줄 사이 개행 문자로 연결
    return lines.join('\n');
}

// ==================== 내보내기 ==================== //

// 브라우저 환경에서 전역으로 사용 가능하도록
if (typeof window !== 'undefined') {
    window.formatVerseForCard = formatVerseForCard;
}
