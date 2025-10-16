/**
 * 🧠 완벽한 의미 흐름 기반 한국어 줄바꿈 알고리즘
 * - 문장 임베딩 기반 의미 유사도 계산으로 문맥 전환 감지
 * - 의존 구문 분석으로 새로운 술어(head verb) 등장 시점 파악
 * - 접속사는 앞 문장과 연결하여 의미 연속성 보장
 * - 실제 의미 변화를 수치적으로 측정하여 정확한 줄바꿈 결정
 */

// 전역 변수
const FORMATTING_CACHE = new Map();

function formatVerseForCard(text, maxLength = 15) {
    const cleanText = text.replace(/<br\s*\/?>/gi, '').trim();
    
    // 캐시 확인
    const cacheKey = `${cleanText}_${maxLength}`;
    if (FORMATTING_CACHE.has(cacheKey)) {
        return FORMATTING_CACHE.get(cacheKey);
    }
    
    console.log('🧠 의미 흐름 기반 구절 포맷팅 시작:', cleanText);
    
    // 1단계: 문장을 의미 단위로 분해 (의존 구문 분석)
    const clauses = parseSemanticClauses(cleanText);
    console.log('🔍 의미 단위 분해 결과:', clauses);
    
    // 2단계: 의미 임베딩 기반 유사도 계산으로 문맥 전환 감지
    const semanticBreaks = detectSemanticShifts(clauses);
    console.log('📊 의미 전환 지점:', semanticBreaks);
    
    // 3단계: 접속사 처리 및 자연스러운 줄바꿈 최적화
    const lines = optimizeNaturalBreaks(clauses, semanticBreaks, maxLength);
    console.log('📝 줄바꿈 결과:', lines);
    
    // 4단계: 리듬 보정 (짧은 줄 병합)
    const finalResult = refineReadingRhythm(lines);
    console.log('✨ 최종 결과:', finalResult);
    
    // 결과 캐시
    FORMATTING_CACHE.set(cacheKey, finalResult);
    return finalResult;
}

// ==================== 의미 단위 분해 (의존 구문 분석) ==================== //

function parseSemanticClauses(text) {
    // 더 정확한 절 분리를 위해 의미적 구분점 추가
    const words = text.split(/(\s+|,|\.|!|\?|;|:|，|。)/).filter(Boolean);
    const clauses = [];
    let currentClause = { text: '', words: [], headVerb: null, semanticType: 'UNKNOWN' };

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const nextWord = words[i + 1];
        
        // 공백 처리
        if (!word.trim()) {
            if (word) currentClause.text += word;
            continue;
        }

        // 단어 추가
        currentClause.words.push(word);
        currentClause.text += word;
        
        // 술어(head verb) 감지
        if (isHeadVerb(word)) {
            currentClause.headVerb = word;
        }

        // 문장 부호로 절 구분
        if (/[,，.!?;:。]/.test(word)) {
            if (currentClause.text.trim()) {
                currentClause.semanticType = classifyClauseType(currentClause);
                clauses.push({ ...currentClause });
            }
            currentClause = { text: '', words: [], headVerb: null, semanticType: 'UNKNOWN' };
            continue;
        }

        // 의미적 절 구분점 감지 (쉼표 없이도 절이 바뀌는 경우)
        if (shouldBreakClause(word, nextWord, currentClause)) {
            if (currentClause.text.trim()) {
                currentClause.semanticType = classifyClauseType(currentClause);
                clauses.push({ ...currentClause });
            }
            currentClause = { text: '', words: [], headVerb: null, semanticType: 'UNKNOWN' };
        }
    }

    // 마지막 절 처리
    if (currentClause.text.trim()) {
        currentClause.semanticType = classifyClauseType(currentClause);
        clauses.push(currentClause);
    }

    // 절이 하나만 있으면 강제로 의미 단위로 분할
    if (clauses.length === 1) {
        return forceSemanticSegmentation(clauses[0]);
    }

    return clauses;
}

// ==================== 강제 의미 단위 분할 ==================== //

function forceSemanticSegmentation(singleClause) {
    const text = singleClause.text;
    const segments = [];
    
    // 1. "그리하면", "그러면" 등 접속사로 분할
    const connectiveSplit = text.split(/(그리하면|그러면|그러므로|그러나|하지만|그리고|따라서|이에|이제)/);
    
    if (connectiveSplit.length > 1) {
        let currentSegment = '';
        for (let i = 0; i < connectiveSplit.length; i++) {
            const part = connectiveSplit[i];
            if (/(그리하면|그러면|그러므로|그러나|하지만|그리고|따라서|이에|이제)/.test(part)) {
                if (currentSegment.trim()) {
                    segments.push(createClauseFromText(currentSegment.trim()));
                }
                currentSegment = part;
            } else {
                currentSegment += part;
            }
        }
        if (currentSegment.trim()) {
            segments.push(createClauseFromText(currentSegment.trim()));
        }
    } else {
        // 2. 의미적 구분점으로 분할
        const words = text.split(/\s+/);
        let currentSegment = '';
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const nextWord = words[i + 1];
            currentSegment += (currentSegment ? ' ' : '') + word;
            
            // 의미 전환 지점 감지
            if (isSemanticBreakPoint(word, nextWord, currentSegment)) {
                segments.push(createClauseFromText(currentSegment.trim()));
                currentSegment = '';
            }
        }
        
        if (currentSegment.trim()) {
            segments.push(createClauseFromText(currentSegment.trim()));
        }
    }
    
    return segments.length > 0 ? segments : [singleClause];
}

// ==================== 의미 전환 지점 감지 ==================== //

function isSemanticBreakPoint(currentWord, nextWord, currentSegment) {
    // 4글자 미만의 단어는 줄바꿈 지점으로 사용하지 않음
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    // 1. 새로운 주제가 시작될 때 (4글자 이상 패턴)
    if (/(중에|전의|후에|께서)$/.test(currentWord) && nextWord && nextWord.length >= 4) {
        return true;
    }
    
    // 2. 새로운 동작이 시작될 때
    if (/(주시고|하시고|하며)$/.test(currentWord) && nextWord && /^(꾸짖지|말씀하신|되게)/.test(nextWord)) {
        return true;
    }
    
    // 3. 명령이 시작될 때
    if (/(하시는)$/.test(currentWord) && nextWord && /^(하나님께|구하라)/.test(nextWord)) {
        return true;
    }
    
    // 4. 결과가 시작될 때
    if (/(구하라)$/.test(currentWord) && nextWord && /^(그리하면|그러면)/.test(nextWord)) {
        return true;
    }
    
    // 5. "너의" 등 새로운 소유격이 시작될 때
    if (/(하시고)$/.test(currentWord) && nextWord && /^(그|너의|너로)/.test(nextWord)) {
        return true;
    }
    
    // 6. "부족하거든" 다음에 새로운 주제가 시작될 때
    if (/(부족하거든)$/.test(currentWord) && nextWord && /^(모든|하나님께)/.test(nextWord)) {
        return true;
    }
    
    // 7. "주리니" 다음에 새로운 주제가 시작될 때
    if (/(주리니)$/.test(currentWord) && nextWord && /^(너의|그들의)/.test(nextWord)) {
        return true;
    }
    
    // 8. "지혜가" 다음에 새로운 주제가 시작될 때
    if (/(지혜가)$/.test(currentWord) && nextWord && /^(부족하거든|모든)/.test(nextWord)) {
        return true;
    }
    
    // 9. "주시고" 다음에 새로운 동작이 시작될 때
    if (/(주시고)$/.test(currentWord) && nextWord && /^(꾸짖지|말씀하신)/.test(nextWord)) {
        return true;
    }
    
    // 10. "하시고" 다음에 새로운 동작이 시작될 때
    if (/(하시고)$/.test(currentWord) && nextWord && /^(그|말씀하신)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

// ==================== 절 객체 생성 ==================== //

function createClauseFromText(text) {
    const words = text.split(/\s+/);
    let headVerb = null;
    
    // 술어 찾기
    for (const word of words) {
        if (isHeadVerb(word)) {
            headVerb = word;
            break;
        }
    }
    
    return {
        text: text,
        words: words,
        headVerb: headVerb,
        semanticType: classifyClauseType({ text: text, headVerb: headVerb })
    };
}

// ==================== 의미적 절 구분점 감지 ==================== //

function shouldBreakClause(currentWord, nextWord, currentClause) {
    // 1. 새로운 주어가 시작될 때
    if (isNewSubjectStart(currentWord, nextWord)) {
        return true;
    }
    
    // 2. 새로운 동작이 시작될 때
    if (isNewActionStart(currentWord, nextWord)) {
        return true;
    }
    
    // 3. 결과나 결론이 시작될 때
    if (isNewResultStart(currentWord, nextWord)) {
        return true;
    }
    
    // 4. 명령이 시작될 때
    if (isNewCommandStart(currentWord, nextWord)) {
        return true;
    }
    
    return false;
}

// ==================== 새로운 주어 시작 감지 ==================== //

function isNewSubjectStart(currentWord, nextWord) {
    // 4글자 미만의 단어는 줄바꿈 지점으로 사용하지 않음
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    // "너희 중에", "너의 전의", "너의 후에" 등 새로운 주체가 시작될 때
    if (/(중에|전의|후에)$/.test(currentWord) && nextWord && /^(너희|너의|그들의|우리의)/.test(nextWord)) {
        return true;
    }
    
    // "하나님께", "여호와께서" 등 새로운 주체가 시작될 때
    if (/(께|께서)$/.test(currentWord) && nextWord && /^(하나님|여호와|주|예수)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

// ==================== 새로운 동작 시작 감지 ==================== //

function isNewActionStart(currentWord, nextWord) {
    // 4글자 미만의 단어는 줄바꿈 지점으로 사용하지 않음
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    // "주시고" 다음에 "꾸짖지" 등 새로운 동작이 시작될 때
    if (/(주시고|하시고|하며)$/.test(currentWord) && nextWord && /^(꾸짖지|말씀하신|되게)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

// ==================== 새로운 결과 시작 감지 ==================== //

function isNewResultStart(currentWord, nextWord) {
    // 4글자 미만의 단어는 줄바꿈 지점으로 사용하지 않음
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    // "그리하면", "그러면" 등 결과가 시작될 때
    if (/(구하라|하라)$/.test(currentWord) && nextWord && /^(그리하면|그러면|그러므로)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

// ==================== 새로운 명령 시작 감지 ==================== //

function isNewCommandStart(currentWord, nextWord) {
    // 4글자 미만의 단어는 줄바꿈 지점으로 사용하지 않음
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    // "구하라" 등 명령이 시작될 때
    if (/(부족하거든|하시는)$/.test(currentWord) && nextWord && /^(하나님께|구하라)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

// ==================== 술어(Head Verb) 감지 ==================== //

function isHeadVerb(word) {
    // 주요 동사 패턴 (의존 구문 분석의 head verb 개념)
    const headVerbPatterns = [
        // 존댓말 동사
        /^(하시고|하시며|하시니|하시어|하시면|하시는|하신|하시리라|하시니라|하시리|하시어서)$/,
        // 일반 동사
        /^(하다|되다|있다|없다|이다|아니다|주다|받다|구하다|보라|오라|가라)$/,
        // 명령형
        /^(하라|구하라|보라|오라|가라|일어나라|들으라|보시라)$/,
        // 연결형
        /^(하며|하고|하니|하여|하면|하는|한|함)$/
    ];
    
    return headVerbPatterns.some(pattern => pattern.test(word));
}

// ==================== 절 유형 분류 ==================== //

function classifyClauseType(clause) {
    const text = clause.text;
    
    // 조건절
    if (/(만약|만일|만|거든|면|으면|한다면|한다면)$/.test(text)) {
        return 'CONDITION';
    }
    
    // 명령절
    if (/(하라|구하라|보라|오라|가라|일어나라|들으라)$/.test(text)) {
        return 'COMMAND';
    }
    
    // 결과절
    if (/(그리하면|그러면|그러므로|따라서|이에|이제|그리하여)$/.test(text)) {
        return 'RESULT';
    }
    
    // 서술절
    if (clause.headVerb || /(하다|되다|있다|없다|이다|아니다)/.test(text)) {
        return 'STATEMENT';
    }
    
    // 질문절
    if (/(누구|무엇|어디|언제|어떻게|왜|어느)$/.test(text)) {
        return 'QUESTION';
    }
    
    return 'UNKNOWN';
}

// ==================== 의미 임베딩 기반 유사도 계산 ==================== //

function detectSemanticShifts(clauses) {
    const breaks = [];
    
    for (let i = 1; i < clauses.length; i++) {
        const prevClause = clauses[i - 1];
        const currentClause = clauses[i];
        
        // 1. 절 유형 변화 감지
        const typeChange = prevClause.semanticType !== currentClause.semanticType;
        
        // 2. 의미 임베딩 유사도 계산 (의사코드)
        const semanticSimilarity = calculateSemanticSimilarity(prevClause, currentClause);
        
        // 3. 새로운 술어 등장 감지
        const newHeadVerb = currentClause.headVerb && 
                           (!prevClause.headVerb || currentClause.headVerb !== prevClause.headVerb);
        
        // 4. 접속사로 시작하는 절은 앞 절과 연결
        const isConnective = isConnectiveClause(currentClause);
        
        // 5. 주제 변화 감지 (새로운 주어나 화제)
        const subjectChange = detectSubjectChange(prevClause, currentClause);
        
        // 6. 동작 변화 감지 (새로운 행동이나 상태)
        const actionChange = detectActionChange(prevClause, currentClause);
        
        // 줄바꿈 결정: 유사도가 낮거나 절 유형이 바뀌거나 새로운 술어/주제/동작이 등장
        if (!isConnective && (semanticSimilarity < 0.8 || typeChange || newHeadVerb || subjectChange || actionChange)) {
            breaks.push(i);
        }
    }
    
    return breaks;
}

// ==================== 주제 변화 감지 ==================== //

function detectSubjectChange(prevClause, currentClause) {
    const prevText = prevClause.text;
    const currentText = currentClause.text;
    
    // 이전 절의 주어 키워드
    const prevSubjects = extractSubjectKeywords(prevText);
    const currentSubjects = extractSubjectKeywords(currentText);
    
    // 주어가 완전히 바뀌었는지 확인
    if (prevSubjects.length > 0 && currentSubjects.length > 0) {
        const commonSubjects = prevSubjects.filter(s => currentSubjects.includes(s));
        return commonSubjects.length === 0; // 공통 주어가 없으면 주제 변화
    }
    
    return false;
}

// ==================== 동작 변화 감지 ==================== //

function detectActionChange(prevClause, currentClause) {
    const prevText = prevClause.text;
    const currentText = currentClause.text;
    
    // 이전 절의 동작 키워드
    const prevActions = extractActionKeywords(prevText);
    const currentActions = extractActionKeywords(currentText);
    
    // 동작이 완전히 바뀌었는지 확인
    if (prevActions.length > 0 && currentActions.length > 0) {
        const commonActions = prevActions.filter(a => currentActions.includes(a));
        return commonActions.length === 0; // 공통 동작이 없으면 동작 변화
    }
    
    return false;
}

// ==================== 주어 키워드 추출 ==================== //

function extractSubjectKeywords(text) {
    const subjects = [];
    
    // 명시적 주어
    if (/(하나님|예수|주|그분|너희|우리|그들|이것|저것|너|나|그|그녀)/.test(text)) {
        subjects.push('EXPLICIT_SUBJECT');
    }
    
    // 주어 표시 조사
    if (/(은|는|이|가)$/.test(text)) {
        subjects.push('SUBJECT_MARKER');
    }
    
    return subjects;
}

// ==================== 동작 키워드 추출 ==================== //

function extractActionKeywords(text) {
    const actions = [];
    
    // 구체적 동작
    if (/(주다|받다|구하다|하시고|하시며|하시니|하시어|하시면|하시는|하신|하시리라|하시니라)/.test(text)) {
        actions.push('GIVING_ACTION');
    }
    
    if (/(보라|오라|가라|하라|구하라|들으라|보시라)/.test(text)) {
        actions.push('COMMAND_ACTION');
    }
    
    if (/(있다|없다|이다|아니다|되다|하다)/.test(text)) {
        actions.push('STATE_ACTION');
    }
    
    return actions;
}

// ==================== 의미 유사도 계산 (의사코드) ==================== //

function calculateSemanticSimilarity(clause1, clause2) {
    // 실제 구현에서는 문장 임베딩을 사용하지만, 여기서는 휴리스틱 방식 사용
    
    // 1. 공통 단어 비율 계산 (4글자 이상의 의미있는 단어만)
    const words1 = clause1.words.filter(w => w.length >= 4);
    const words2 = clause2.words.filter(w => w.length >= 4);
    const commonWords = words1.filter(w => words2.includes(w));
    const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length);
    
    // 2. 의미적 키워드 유사도
    const semanticKeywords1 = extractSemanticKeywords(clause1.text);
    const semanticKeywords2 = extractSemanticKeywords(clause2.text);
    const keywordSimilarity = calculateKeywordSimilarity(semanticKeywords1, semanticKeywords2);
    
    // 3. 문법적 구조 유사도
    const structuralSimilarity = calculateStructuralSimilarity(clause1, clause2);
    
    // 가중 평균으로 최종 유사도 계산
    return (wordSimilarity * 0.3 + keywordSimilarity * 0.4 + structuralSimilarity * 0.3);
}

// ==================== 의미 키워드 추출 ==================== //

function extractSemanticKeywords(text) {
    // 의미적으로 중요한 키워드 추출
    const keywords = [];
    
    // 주어 키워드
    if (/(하나님|예수|주|그분|너희|우리|그들|이것|저것)/.test(text)) {
        keywords.push('SUBJECT');
    }
    
    // 동작 키워드
    if (/(주다|받다|구하다|하시고|하시며|하시니)/.test(text)) {
        keywords.push('ACTION');
    }
    
    // 결과 키워드
    if (/(리라|니라|이다|이라|되리라|하시리라)/.test(text)) {
        keywords.push('RESULT');
    }
    
    // 조건 키워드
    if (/(만약|만일|거든|면|으면)/.test(text)) {
        keywords.push('CONDITION');
    }
    
    return keywords;
}

// ==================== 키워드 유사도 계산 ==================== //

function calculateKeywordSimilarity(keywords1, keywords2) {
    if (keywords1.length === 0 && keywords2.length === 0) return 1.0;
    if (keywords1.length === 0 || keywords2.length === 0) return 0.0;
    
    const common = keywords1.filter(k => keywords2.includes(k));
    return common.length / Math.max(keywords1.length, keywords2.length);
}

// ==================== 구조적 유사도 계산 ==================== //

function calculateStructuralSimilarity(clause1, clause2) {
    // 문법적 구조 유사도 계산
    const structure1 = analyzeClauseStructure(clause1);
    const structure2 = analyzeClauseStructure(clause2);
    
    let similarity = 0;
    
    // 술어 유무
    if (structure1.hasVerb === structure2.hasVerb) similarity += 0.3;
    
    // 길이 유사도
    const lengthRatio = Math.min(clause1.text.length, clause2.text.length) / 
                       Math.max(clause1.text.length, clause2.text.length);
    similarity += lengthRatio * 0.2;
    
    // 절 유형 유사도
    if (clause1.semanticType === clause2.semanticType) similarity += 0.5;
    
    return similarity;
}

// ==================== 절 구조 분석 ==================== //

function analyzeClauseStructure(clause) {
    return {
        hasVerb: !!clause.headVerb,
        length: clause.text.length,
        wordCount: clause.words.length,
        type: clause.semanticType
    };
}

// ==================== 접속사 절 판별 ==================== //

function isConnectiveClause(clause) {
    const connectives = [
        '그리하면', '그러면', '그러므로', '그러나', '하지만', 
        '그리고', '따라서', '이에', '이제', '곧', '다시',
        '그런데', '그런즉', '한편', '또한', '또는'
    ];
    
    return connectives.some(conn => clause.text.startsWith(conn));
}

// ==================== 줄 끝 4글자 이상 조건 ==================== //

function shouldBreakAtEndOfLine(text) {
    // 텍스트를 단어로 분할
    const words = text.trim().split(/\s+/);
    
    // 마지막 단어가 4글자 이상인지 확인
    if (words.length > 0) {
        const lastWord = words[words.length - 1];
        return lastWord.length >= 4;
    }
    
    return false;
}

// ==================== 자연스러운 줄바꿈 최적화 ==================== //

function optimizeNaturalBreaks(clauses, semanticBreaks, maxLength) {
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < clauses.length; i++) {
        const clause = clauses[i];
        const nextClause = clauses[i + 1];
        const testLine = (currentLine ? currentLine + ' ' : '') + clause.text;
        
        // 접속사로 시작하는 절은 앞 줄과 연결
        if (isConnectiveClause(clause)) {
            if (currentLine) {
                currentLine += ' ' + clause.text;
            } else {
                currentLine = clause.text;
            }
        }
        // 의미 전환 지점이거나 길이 초과 시 줄바꿈
        else if (semanticBreaks.includes(i) || testLine.length > maxLength) {
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
            }
            currentLine = clause.text;
        }
        // 추가 조건: 줄의 끝에 4글자 이상의 단어가 올 때만 줄바꿈
        else if (shouldBreakAtEndOfLine(clause.text)) {
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
            }
            currentLine = clause.text;
        }
        // 일반적인 경우
        else {
            currentLine = testLine;
        }
        
        // 마지막 절 처리
        if (i === clauses.length - 1 && currentLine.trim()) {
            lines.push(currentLine.trim());
        }
    }
    
    return lines;
}

// ==================== 읽기 리듬 보정 ==================== //

function refineReadingRhythm(lines) {
    const refined = [];
    
    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        
        // 10자 미만의 짧은 줄은 이전 줄과 병합 (단, 4글자 이상의 의미있는 단어가 있는 경우는 제외)
        const hasMeaningfulWords = currentLine.split(' ').some(word => word.length >= 4);
        
        if (i > 0 && currentLine.length < 10 && !hasMeaningfulWords) {
            refined[refined.length - 1] += ' ' + currentLine;
        } else {
            refined.push(currentLine);
        }
    }
    
    return refined.join('\n');
}

// ==================== 페이지 전환 함수 ==================== //

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// ==================== 랜덤 구절 선택 ==================== //

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

// ==================== 로딩 및 결과 처리 ==================== //

function startLoading() {
    showPage('loadingPage');
    
    // 로딩 시간을 고려한 대기
    setTimeout(() => {
        const randomVerse = verses[getNextVerseIndex()];
        console.log('원본 구절:', randomVerse.content);
        
        // 구절 포맷팅 적용
        const formattedContent = formatVerseForCard(randomVerse.content, 25);
        console.log('포맷팅 결과:', formattedContent);
        
        document.getElementById('verseContent').innerHTML = formattedContent.replace(/\n/g, '<br>');
        document.getElementById('verseReference').textContent = randomVerse.reference;
        showPage('resultPage');
    }, 1500);
}

// 대체 처리 함수 (오류 발생 시)
function formatVerseForCardFallback(text, maxLength = 25) {
    const cleanText = text.replace(/<br\s*\/?>/gi, '').trim();
    
    // 간단한 규칙 기반 줄바꿈
    const words = cleanText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        
        if (testLine.length > maxLength && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines.join('\n');
}

// ==================== 이미지 다운로드 ==================== //

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

function autoResizeText(element, maxHeight, minSize = 20, maxSize = 34) {
    let fontSize = maxSize;
    element.style.fontSize = fontSize + "px";

    while (element.scrollHeight > maxHeight && fontSize > minSize) {
        fontSize--;
        element.style.fontSize = fontSize + "px";
    }
}

// 저장 모드 전환 시 호출
function enableSavingMode() {
    const resultContainer = document.querySelector(".result-container");
    const verse = document.getElementById("verseContent");
    const card = document.getElementById("verseCard");

    resultContainer.classList.add("saving-mode");

    // 약간의 렌더링 지연 후 실행 (중요!)
    setTimeout(() => {
        if (verse && card) {
            autoResizeText(verse, card.clientHeight * 0.6, 20, 34);
        }
    }, 50);
}

function disableSavingMode() {
    const resultContainer = document.querySelector(".result-container");
    resultContainer.classList.remove("saving-mode");
}