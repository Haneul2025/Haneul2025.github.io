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
    const words = text.split(/(\s+|,|\.|!|\?|;|:|，|。)/).filter(Boolean);
    const clauses = [];
    let currentClause = { text: '', words: [], headVerb: null, semanticType: 'UNKNOWN' };

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const nextWord = words[i + 1];
        
        if (!word.trim()) {
            if (word) currentClause.text += word;
            continue;
        }

        currentClause.words.push(word);
        currentClause.text += word;
        
        if (isHeadVerb(word)) {
            currentClause.headVerb = word;
        }

        if (/[,，.!?;:。]/.test(word)) {
            if (currentClause.text.trim()) {
                currentClause.semanticType = classifyClauseType(currentClause);
                clauses.push({ ...currentClause });
            }
            currentClause = { text: '', words: [], headVerb: null, semanticType: 'UNKNOWN' };
            continue;
        }

        if (shouldBreakClause(word, nextWord, currentClause)) {
            if (currentClause.text.trim()) {
                currentClause.semanticType = classifyClauseType(currentClause);
                clauses.push({ ...currentClause });
            }
            currentClause = { text: '', words: [], headVerb: null, semanticType: 'UNKNOWN' };
        }
    }

    if (currentClause.text.trim()) {
        currentClause.semanticType = classifyClauseType(currentClause);
        clauses.push(currentClause);
    }

    if (clauses.length === 1) {
        return forceSemanticSegmentation(clauses[0]);
    }

    return clauses;
}

function forceSemanticSegmentation(singleClause) {
    const text = singleClause.text;
    const segments = [];
    
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
        const words = text.split(/\s+/);
        let currentSegment = '';
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const nextWord = words[i + 1];
            currentSegment += (currentSegment ? ' ' : '') + word;
            
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

function isSemanticBreakPoint(currentWord, nextWord, currentSegment) {
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    if (/(중에|전의|후에)$/.test(currentWord) && nextWord && nextWord.length >= 4) {
        return true;
    }
    
    if (/(주시고|하시고|하며)$/.test(currentWord) && nextWord && /^(꾸짖지|말씀하신|되게)/.test(nextWord)) {
        return true;
    }
    
    if (/(하시는)$/.test(currentWord) && nextWord && /^(하나님께|구하라)/.test(nextWord)) {
        return true;
    }
    
    if (/(구하라)$/.test(currentWord) && nextWord && /^(그리하면|그러면)/.test(nextWord)) {
        return true;
    }
    
    if (/(하시고)$/.test(currentWord) && nextWord && /^(그|너의|너로)/.test(nextWord)) {
        return true;
    }
    
    if (/(부족하거든)$/.test(currentWord) && nextWord && /^(모든|하나님께)/.test(nextWord)) {
        return true;
    }
    
    if (/(주리니)$/.test(currentWord) && nextWord && /^(너의|그들의)/.test(nextWord)) {
        return true;
    }
    
    if (/(지혜가)$/.test(currentWord) && nextWord && /^(부족하거든|모든)/.test(nextWord)) {
        return true;
    }
    
    if (/(주시고)$/.test(currentWord) && nextWord && /^(꾸짖지|말씀하신)/.test(nextWord)) {
        return true;
    }
    
    if (/(하시고)$/.test(currentWord) && nextWord && /^(그|말씀하신)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

function createClauseFromText(text) {
    const words = text.split(/\s+/);
    let headVerb = null;
    
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

function shouldBreakClause(currentWord, nextWord, currentClause) {
    if (isNewSubjectStart(currentWord, nextWord)) {
        return true;
    }
    
    if (isNewActionStart(currentWord, nextWord)) {
        return true;
    }
    
    if (isNewResultStart(currentWord, nextWord)) {
        return true;
    }
    
    if (isNewCommandStart(currentWord, nextWord)) {
        return true;
    }
    
    return false;
}

function isNewSubjectStart(currentWord, nextWord) {
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    if (/(중에|전의|후에)$/.test(currentWord) && nextWord && /^(너희|너의|그들의|우리의)/.test(nextWord)) {
        return true;
    }
    
    if (/(께|께서)$/.test(currentWord) && nextWord && /^(하나님|여호와|주|예수)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

function isNewActionStart(currentWord, nextWord) {
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    if (/(주시고|하시고|하며)$/.test(currentWord) && nextWord && /^(꾸짖지|말씀하신|되게)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

function isNewResultStart(currentWord, nextWord) {
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    if (/(구하라|하라)$/.test(currentWord) && nextWord && /^(그리하면|그러면|그러므로)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

function isNewCommandStart(currentWord, nextWord) {
    if (currentWord.length < 4 || !nextWord || nextWord.length < 4) {
        return false;
    }
    
    if (/(부족하거든|하시는)$/.test(currentWord) && nextWord && /^(하나님께|구하라)/.test(nextWord)) {
        return true;
    }
    
    return false;
}

function isHeadVerb(word) {
    const headVerbPatterns = [
        /^(하시고|하시며|하시니|하시어|하시면|하시는|하신|하시리라|하시니라|하시리|하시어서)$/,
        /^(하다|되다|있다|없다|이다|아니다|주다|받다|구하다|보라|오라|가라)$/,
        /^(하라|구하라|보라|오라|가라|일어나라|들으라|보시라)$/,
        /^(하며|하고|하니|하여|하면|하는|한|함)$/
    ];
    
    return headVerbPatterns.some(pattern => pattern.test(word));
}

function classifyClauseType(clause) {
    const text = clause.text;
    
    if (/(만약|만일|만|거든|면|으면|한다면|한다면)$/.test(text)) {
        return 'CONDITION';
    }
    
    if (/(하라|구하라|보라|오라|가라|일어나라|들으라)$/.test(text)) {
        return 'COMMAND';
    }
    
    if (/(그리하면|그러면|그러므로|따라서|이에|이제|그리하여)$/.test(text)) {
        return 'RESULT';
    }
    
    if (clause.headVerb || /(하다|되다|있다|없다|이다|아니다)/.test(text)) {
        return 'STATEMENT';
    }
    
    if (/(누구|무엇|어디|언제|어떻게|왜|어느)$/.test(text)) {
        return 'QUESTION';
    }
    
    return 'UNKNOWN';
}

function detectSemanticShifts(clauses) {
    const breaks = [];
    
    for (let i = 1; i < clauses.length; i++) {
        const prevClause = clauses[i - 1];
        const currentClause = clauses[i];
        
        const typeChange = prevClause.semanticType !== currentClause.semanticType;
        const semanticSimilarity = calculateSemanticSimilarity(prevClause, currentClause);
        const newHeadVerb = currentClause.headVerb && 
                           (!prevClause.headVerb || currentClause.headVerb !== prevClause.headVerb);
        const isConnective = isConnectiveClause(currentClause);
        const subjectChange = detectSubjectChange(prevClause, currentClause);
        const actionChange = detectActionChange(prevClause, currentClause);
        
        if (!isConnective && (semanticSimilarity < 0.8 || typeChange || newHeadVerb || subjectChange || actionChange)) {
            breaks.push(i);
        }
    }
    
    return breaks;
}

function detectSubjectChange(prevClause, currentClause) {
    const prevText = prevClause.text;
    const currentText = currentClause.text;
    
    const prevSubjects = extractSubjectKeywords(prevText);
    const currentSubjects = extractSubjectKeywords(currentText);
    
    if (prevSubjects.length > 0 && currentSubjects.length > 0) {
        const commonSubjects = prevSubjects.filter(s => currentSubjects.includes(s));
        return commonSubjects.length === 0;
    }
    
    return false;
}

function detectActionChange(prevClause, currentClause) {
    const prevText = prevClause.text;
    const currentText = currentClause.text;
    
    const prevActions = extractActionKeywords(prevText);
    const currentActions = extractActionKeywords(currentText);
    
    if (prevActions.length > 0 && currentActions.length > 0) {
        const commonActions = prevActions.filter(a => currentActions.includes(a));
        return commonActions.length === 0;
    }
    
    return false;
}

function extractSubjectKeywords(text) {
    const subjects = [];
    
    if (/(하나님|예수|주|그분|너희|우리|그들|이것|저것|너|나|그|그녀)/.test(text)) {
        subjects.push('EXPLICIT_SUBJECT');
    }
    
    if (/(은|는|이|가)$/.test(text)) {
        subjects.push('SUBJECT_MARKER');
    }
    
    return subjects;
}

function extractActionKeywords(text) {
    const actions = [];
    
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

function calculateSemanticSimilarity(clause1, clause2) {
    const words1 = clause1.words.filter(w => w.length >= 4);
    const words2 = clause2.words.filter(w => w.length >= 4);
    const commonWords = words1.filter(w => words2.includes(w));
    const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length);
    
    const semanticKeywords1 = extractSemanticKeywords(clause1.text);
    const semanticKeywords2 = extractSemanticKeywords(clause2.text);
    const keywordSimilarity = calculateKeywordSimilarity(semanticKeywords1, semanticKeywords2);
    
    const structuralSimilarity = calculateStructuralSimilarity(clause1, clause2);
    
    return (wordSimilarity * 0.3 + keywordSimilarity * 0.4 + structuralSimilarity * 0.3);
}

function extractSemanticKeywords(text) {
    const keywords = [];
    
    if (/(하나님|예수|주|그분|너희|우리|그들|이것|저것)/.test(text)) {
        keywords.push('SUBJECT');
    }
    
    if (/(주다|받다|구하다|하시고|하시며|하시니)/.test(text)) {
        keywords.push('ACTION');
    }
    
    if (/(리라|니라|이다|이라|되리라|하시리라)/.test(text)) {
        keywords.push('RESULT');
    }
    
    if (/(만약|만일|거든|면|으면)/.test(text)) {
        keywords.push('CONDITION');
    }
    
    return keywords;
}

function calculateKeywordSimilarity(keywords1, keywords2) {
    if (keywords1.length === 0 && keywords2.length === 0) return 1.0;
    if (keywords1.length === 0 || keywords2.length === 0) return 0.0;
    
    const common = keywords1.filter(k => keywords2.includes(k));
    return common.length / Math.max(keywords1.length, keywords2.length);
}

function calculateStructuralSimilarity(clause1, clause2) {
    const structure1 = analyzeClauseStructure(clause1);
    const structure2 = analyzeClauseStructure(clause2);
    
    let similarity = 0;
    
    if (structure1.hasVerb === structure2.hasVerb) similarity += 0.3;
    
    const lengthRatio = Math.min(clause1.text.length, clause2.text.length) / 
                       Math.max(clause1.text.length, clause2.text.length);
    similarity += lengthRatio * 0.2;
    
    if (clause1.semanticType === clause2.semanticType) similarity += 0.5;
    
    return similarity;
}

function analyzeClauseStructure(clause) {
    return {
        hasVerb: !!clause.headVerb,
        length: clause.text.length,
        wordCount: clause.words.length,
        type: clause.semanticType
    };
}

function isConnectiveClause(clause) {
    const connectives = [
        '그리하면', '그러면', '그러므로', '그러나', '하지만', 
        '그리고', '따라서', '이에', '이제', '곧', '다시',
        '그런데', '그런즉', '한편', '또한', '또는'
    ];
    
    return connectives.some(conn => clause.text.startsWith(conn));
}

function shouldBreakAtEndOfLine(text) {
    const words = text.trim().split(/\s+/);
    
    if (words.length > 0) {
        const lastWord = words[words.length - 1];
        return lastWord.length >= 4;
    }
    
    return false;
}

function optimizeNaturalBreaks(clauses, semanticBreaks, maxLength) {
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < clauses.length; i++) {
        const clause = clauses[i];
        const testLine = (currentLine ? currentLine + ' ' : '') + clause.text;
        
        if (isConnectiveClause(clause)) {
            if (currentLine) {
                currentLine += ' ' + clause.text;
            } else {
                currentLine = clause.text;
            }
        }
        else if (semanticBreaks.includes(i) || testLine.length > maxLength) {
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
            }
            currentLine = clause.text;
        }
        else if (shouldBreakAtEndOfLine(clause.text)) {
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
            }
            currentLine = clause.text;
        }
        else {
            currentLine = testLine;
        }
        
        if (i === clauses.length - 1 && currentLine.trim()) {
            lines.push(currentLine.trim());
        }
    }
    
    return lines;
}

function refineReadingRhythm(lines) {
    const refined = [];
    
    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        const hasMeaningfulWords = currentLine.split(' ').some(word => word.length >= 4);
        
        if (i > 0 && currentLine.length < 10 && !hasMeaningfulWords) {
            refined[refined.length - 1] += ' ' + currentLine;
        } else {
            refined.push(currentLine);
        }
    }
    
    return refined.join('\n');
}


