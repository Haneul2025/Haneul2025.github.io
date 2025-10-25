# The Steps of Haneul - 하늘의 걸음

> 선한 사람의 걸음을 여호와께서 정하시니 그분은 그 길을 기뻐하십니다.  
> **시편 37편 23절**

## 📖 프로젝트 소개

**The Steps of Haneul**은 성경 구절을 랜덤하게 추천해주는 웹 애플리케이션입니다. 매일 하나님의 말씀으로 하루를 시작할 수 있도록 도와주는 디지털 성경 카드 서비스입니다.

## ✨ 주요 기능

- **랜덤 구절 추천**: 중복 없이 성경 구절을 랜덤하게 제공
- **아름다운 디자인**: 깔끔하고 감성적인 카드 형태의 UI
- **이미지 저장**: 추천받은 구절을 이미지로 저장하여 공유 가능
- **의미 기반 줄바꿈**: AI 기반 자연스러운 텍스트 포맷팅
- **반응형 디자인**: 모바일과 데스크톱 모두 최적화

## 🛠 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인, 애니메이션
- **Vanilla JavaScript**: 순수 자바스크립트로 구현

### 외부 라이브러리
- **html2canvas**: 이미지 생성 및 다운로드
- **Google Fonts**: Noto Serif KR 폰트
- **Adobe Fonts**: 추가 폰트 지원

### 폰트
- **국립박물관문화재단클래식**: OTF 폰트 파일 포함
  - Light, Medium, Bold 가중치 지원

## 📁 프로젝트 구조

```
Haneul2025.github.io/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── script.js           # 메인 JavaScript 로직
├── data.js             # 성경 구절 데이터 (4,800+ 구절)
├── HaneulLogo.png      # 로고 이미지
├── back.jpg            # 배경 이미지
├── OTF/                # 폰트 파일
│   ├── 국립박물관문화재단클래식B.otf
│   ├── 국립박물관문화재단클래식L.otf
│   └── 국립박물관문화재단클래식M.otf
└── README.md           # 프로젝트 문서
```

## 🎯 핵심 알고리즘

### 의미 기반 줄바꿈 시스템
- **의존 구문 분석**: 문장의 의미 단위를 자동 분해
- **의미 임베딩**: 문맥 전환 지점을 수치적으로 감지
- **자연스러운 포맷팅**: 읽기 리듬을 고려한 최적화된 줄바꿈

### 랜덤 선택 시스템
- **Fisher-Yates 셔플**: 암호학적으로 안전한 랜덤 생성
- **중복 방지**: localStorage를 활용한 순환 선택
- **캐싱**: 포맷팅 결과 캐싱으로 성능 최적화

## 📊 데이터 구조

### 성경 구절 데이터 (data.js)
```javascript
const verses = [
    {
        content: "구절 내용",
        reference: "성경 위치"
    },
    // ... 4,800+ 구절
];
```

### 주요 함수들
- `formatVerseForCard()`: 의미 기반 텍스트 포맷팅
- `getNextVerseIndex()`: 중복 없는 랜덤 선택
- `downloadImage()`: 이미지 생성 및 다운로드
- `startLoading()`: 페이지 전환 및 로딩 처리

## 🚀 빠른 시작

### 로컬 개발 환경 설정

1. **저장소 클론**
```bash
git clone https://github.com/Haneul2025/Haneul2025.github.io.git
cd Haneul2025.github.io
```

2. **로컬 서버 실행**
```bash
# Python 3 사용
python -m http.server 8000

# 또는 Node.js 사용
npx serve .

# 또는 Live Server (VS Code 확장) 사용
```

3. **브라우저에서 확인**
```
http://localhost:8000
```

### GitHub Pages 배포

1. **저장소 포크** 또는 **새 저장소 생성**
2. **파일 업로드** 또는 **Git으로 푸시**
3. **Settings > Pages**에서 소스 선택
4. **자동 배포** 완료

### 사용 방법

1. **웹사이트 접속**: GitHub Pages로 호스팅된 사이트 방문
2. **시작하기**: "시작하기" 버튼 클릭
3. **구절 확인**: 로딩 후 추천받은 성경 구절 확인
4. **이미지 저장**: "이미지 저장" 버튼으로 카드 다운로드
5. **다시 뽑기**: "다시 뽑기" 버튼으로 새로운 구절 받기

## 🎨 디자인 특징

- **미니멀 디자인**: 깔끔하고 집중도 높은 UI
- **감성적 색상**: 따뜻하고 평화로운 색상 팔레트
- **타이포그래피**: 가독성 높은 한글 폰트 사용
- **애니메이션**: 부드러운 전환 효과와 로딩 애니메이션

## 📱 반응형 지원

- **모바일**: 320px 이상의 모든 모바일 기기
- **태블릿**: 768px 이상의 태블릿 기기
- **데스크톱**: 1024px 이상의 데스크톱 환경

## 🔧 개발 가이드

### 코드 구조 분석

#### 1. 메인 HTML (index.html)
```html
<!-- 3개 페이지 구조 -->
<div id="mainPage">     <!-- 시작 페이지 -->
<div id="loadingPage">  <!-- 로딩 페이지 -->
<div id="resultPage">   <!-- 결과 페이지 -->
```

#### 2. 스타일시트 (styles.css)
- **반응형 디자인**: 모바일 퍼스트 접근
- **CSS Grid & Flexbox**: 레이아웃 구성
- **애니메이션**: CSS transitions와 keyframes 활용

#### 3. 데이터 관리 (data.js)
- **4,800+ 성경 구절**: JSON 배열 형태
- **구조**: `{content: "구절", reference: "출처"}`

#### 4. 핵심 로직 (script.js)
- **의미 기반 줄바꿈**: `formatVerseForCard()` 함수
- **랜덤 선택**: `getNextVerseIndex()` 함수
- **이미지 생성**: `downloadImage()` 함수

### 주요 함수 상세

#### `formatVerseForCard(text, maxLength)`
```javascript
// 의미 단위 분해 → 유사도 계산 → 자연스러운 줄바꿈
const clauses = parseSemanticClauses(cleanText);
const semanticBreaks = detectSemanticShifts(clauses);
const lines = optimizeNaturalBreaks(clauses, semanticBreaks, maxLength);
```

#### `getNextVerseIndex()`
```javascript
// Fisher-Yates 셔플 + localStorage 중복 방지
const order = generateShuffledIndices(verses.length);
const index = order[ptr];
```

### 커스터마이징 가이드

#### 1. 새로운 구절 추가
```javascript
// data.js에 추가
{
    content: "새로운 성경 구절",
    reference: "성경 위치"
}
```

#### 2. 디자인 수정
```css
/* styles.css에서 색상 변경 */
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
}
```

#### 3. 폰트 변경
```css
/* Google Fonts 또는 로컬 폰트 사용 */
@font-face {
    font-family: 'YourFont';
    src: url('./fonts/your-font.otf');
}
```

### 성능 최적화

- **캐싱**: `FORMATTING_CACHE`로 포맷팅 결과 저장
- **지연 로딩**: 필요시에만 리소스 로드
- **압축**: 이미지와 폰트 파일 최적화

### 브라우저 호환성

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

### 디버깅 팁

1. **콘솔 로그**: `console.log`로 포맷팅 과정 확인
2. **개발자 도구**: Network 탭에서 리소스 로딩 확인
3. **모바일 테스트**: Chrome DevTools Device Mode 활용

## 🛠 개발 환경

### 필수 도구
- **코드 에디터**: VS Code, Sublime Text, Atom 등
- **브라우저**: Chrome, Firefox, Safari, Edge
- **Git**: 버전 관리

### 권장 확장 프로그램 (VS Code)
- **Live Server**: 로컬 서버 실행
- **Prettier**: 코드 포맷팅
- **ESLint**: JavaScript 린팅
- **Auto Rename Tag**: HTML 태그 자동 수정

### 테스트 방법
1. **로컬 테스트**: `python -m http.server 8000`
2. **모바일 테스트**: 실제 기기 또는 DevTools
3. **크로스 브라우저**: 여러 브라우저에서 확인

## 📋 체크리스트

### 배포 전 확인사항
- [ ] 모든 기능 정상 작동
- [ ] 모바일 반응형 확인
- [ ] 이미지 다운로드 테스트
- [ ] 구절 포맷팅 품질 확인
- [ ] 로딩 시간 최적화

### 코드 품질
- [ ] 변수명 명확성
- [ ] 함수 주석 작성
- [ ] 에러 처리 구현
- [ ] 성능 최적화

## 🔧 개발 정보

- **개발자**: Haneul2025
- **라이선스**: MIT License
- **호스팅**: GitHub Pages
- **최종 업데이트**: 2025년

## 📞 문의

프로젝트에 대한 문의사항이나 제안사항이 있으시면 GitHub Issues를 통해 연락해주세요.

---

*"하나님의 말씀으로 시작하는 아름다운 하루를 만들어가세요"*

