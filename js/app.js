// app.js - 학습지 UI 제어, 네비게이션, 이벤트 및 채점 시스템
let currentWorksheetData = [];
let currentPageIndex = 1; // 1~5, 6은 답안지

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    generateAndRenderNewWorksheet();
    bindHeaderEvents();
    bindTabEvents();
}

/**
 * 새 문제 생성 및 전체 페이지 렌더링
 */
function generateAndRenderNewWorksheet() {
    currentWorksheetData = MathGenerator.generateWorksheetData(5, 9);
    renderAllPages();
    renderAnswerPages();
    switchPage(currentPageIndex);
}

/**
 * 1~5페이지 렌더링
 */
function renderAllPages() {
    const container = document.getElementById('pagesContainer');
    // 답안지 제외한 일반 페이지만 제거 후 재배치
    const existingWorksheets = container.querySelectorAll('.student-page');
    existingWorksheets.forEach(el => el.remove());

    const pageThemeIcons = ['🐰 토끼', '🐻 곰돌이', '☁️ 구름', '⭐ 별빛', '🎈 풍선'];

    currentWorksheetData.forEach((pageData, pIdx) => {
        const pageEl = document.createElement('section');
        pageEl.className = 'worksheet-page student-page';
        pageEl.id = `page-${pageData.pageNumber}`;
        if (pageData.pageNumber === currentPageIndex) {
            pageEl.classList.add('active');
        }

        const iconLabel = pageThemeIcons[pIdx % pageThemeIcons.length];

        pageEl.innerHTML = `
            <div class="page-top-header">
                <div class="page-title-badge">
                    <span class="page-badge-icon">${iconLabel.split(' ')[0]}</span>
                    <div>
                        <h2 class="page-badge-title">초등학교 2학년 곱셈 세로셈 (두 자릿수 × 한 자릿수)</h2>
                        <span style="font-size: 13px; color: #9A8EA6;">${iconLabel.split(' ')[1]} 마을 연습장 · 제 ${pageData.pageNumber} 쪽</span>
                    </div>
                </div>
                <div class="page-meta-fields">
                    <div class="meta-field"><span>날짜:</span> ________</div>
                    <div class="meta-field"><span>이름:</span> ________</div>
                </div>
            </div>
            <div class="problems-grid">
                ${pageData.problems.map((prob, qIdx) => renderProblemCard(prob, qIdx + 1, false)).join('')}
            </div>
        `;

        // 답안지 바로 앞에 삽입
        const answerPageEl = document.getElementById('answerSheetPage');
        container.insertBefore(pageEl, answerPageEl);
    });

    setupDigitBoxAutoAdvance();
}

/**
 * 문제 카드 HTML 렌더링
 */
function renderProblemCard(prob, orderNum, isAnswerView = false) {
    const tens = Math.floor(prob.top / 10);
    const ones = prob.top % 10;

    // 단계별 문자열 자리 분리
    const s1Ten = Math.floor(prob.step1 / 10);
    const s1One = prob.step1 % 10;
    const s1TenStr = s1Ten > 0 ? String(s1Ten) : '';

    const s2Hun = Math.floor(prob.step2 / 100);
    const s2Ten = Math.floor((prob.step2 % 100) / 10);
    const s2HunStr = s2Hun > 0 ? String(s2Hun) : '';

    const totHun = Math.floor(prob.total / 100);
    const totTen = Math.floor((prob.total % 100) / 10);
    const totOne = prob.total % 10;
    const totHunStr = totHun > 0 ? String(totHun) : '';

    return `
        <div class="problem-card ${isAnswerView ? 'answer-card' : ''}" id="card-${prob.id}">
            <div class="problem-index">문제 ${orderNum}</div>
            <span class="problem-result-mark mark-correct">⭕</span>
            <span class="problem-result-mark mark-wrong">❌</span>

            <div class="vertical-calc-table">
                <!-- 위쪽 두 자릿수 -->
                <div class="calc-row">
                    <span class="calc-char">${tens}</span>
                    <span class="calc-char">${ones}</span>
                </div>
                <!-- 아래쪽 한 자릿수 & 곱셈 기호 -->
                <div class="calc-row">
                    <span class="calc-operator">×</span>
                    <span class="calc-char" style="visibility:hidden">0</span>
                    <span class="calc-char">${prob.bottom}</span>
                </div>
                <div class="calc-divider"></div>

                <!-- 1단계: 일의 자리 곱 (ones * bottom) -->
                <div class="calc-row">
                    <span class="calc-step-hint">${ones}×${prob.bottom}</span>
                    <input type="text" maxlength="1" inputmode="numeric" 
                        class="digit-box input-step1-tens" 
                        data-target="s1Ten" 
                        data-correct="${s1TenStr}"
                        value="${isAnswerView ? s1TenStr : ''}"
                        ${isAnswerView ? 'readonly' : ''} />
                    <input type="text" maxlength="1" inputmode="numeric" 
                        class="digit-box input-step1-ones" 
                        data-target="s1One" 
                        data-correct="${s1One}"
                        value="${isAnswerView ? s1One : ''}"
                        ${isAnswerView ? 'readonly' : ''} />
                </div>

                <!-- 2단계: 십의 자리 곱 (tens * 10 * bottom) -->
                <div class="calc-row">
                    <span class="calc-step-hint">${tens}0×${prob.bottom}</span>
                    <input type="text" maxlength="1" inputmode="numeric" 
                        class="digit-box input-step2-hundreds" 
                        data-target="s2Hun" 
                        data-correct="${s2HunStr}"
                        value="${isAnswerView ? s2HunStr : ''}"
                        ${isAnswerView ? 'readonly' : ''} />
                    <input type="text" maxlength="1" inputmode="numeric" 
                        class="digit-box input-step2-tens" 
                        data-target="s2Ten" 
                        data-correct="${s2Ten}"
                        value="${isAnswerView ? s2Ten : ''}"
                        ${isAnswerView ? 'readonly' : ''} />
                    <span class="calc-char" style="font-size:22px; width:30px; margin:0 1px;">0</span>
                </div>
                <div class="calc-divider"></div>

                <!-- 3단계: 최종 결과 합산 -->
                <div class="calc-row">
                    <input type="text" maxlength="1" inputmode="numeric" 
                        class="digit-box input-total-hundreds" 
                        data-target="totHun" 
                        data-correct="${totHunStr}"
                        value="${isAnswerView ? totHunStr : ''}"
                        ${isAnswerView ? 'readonly' : ''} />
                    <input type="text" maxlength="1" inputmode="numeric" 
                        class="digit-box input-total-tens" 
                        data-target="totTen" 
                        data-correct="${totTen}"
                        value="${isAnswerView ? totTen : ''}"
                        ${isAnswerView ? 'readonly' : ''} />
                    <input type="text" maxlength="1" inputmode="numeric" 
                        class="digit-box input-total-ones" 
                        data-target="totOne" 
                        data-correct="${totOne}"
                        value="${isAnswerView ? totOne : ''}"
                        ${isAnswerView ? 'readonly' : ''} />
                </div>
            </div>
        </div>
    `;
}

/**
 * 답안지 전체(1~5페이지의 모든 정답을 한눈에 볼 수 있도록) 렌더링
 */
function renderAnswerPages() {
    const answerGrid = document.getElementById('answerSheetGrid');
    answerGrid.innerHTML = '';

    currentWorksheetData.forEach((pageData) => {
        const pageHeader = document.createElement('div');
        pageHeader.style.gridColumn = '1 / -1';
        pageHeader.style.padding = '12px 0 6px';
        pageHeader.style.fontFamily = "'Jua', sans-serif";
        pageHeader.style.fontSize = '20px';
        pageHeader.style.color = '#386494';
        pageHeader.style.borderBottom = '2px solid #B5D8F7';
        pageHeader.style.marginTop = '16px';
        pageHeader.textContent = `📖 제 ${pageData.pageNumber} 쪽 정답 및 풀이`;
        answerGrid.appendChild(pageHeader);

        pageData.problems.forEach((prob, qIdx) => {
            const cardWrapper = document.createElement('div');
            cardWrapper.innerHTML = renderProblemCard(prob, qIdx + 1, true);
            answerGrid.appendChild(cardWrapper.firstElementChild);
        });
    });
}

/**
 * 숫자 입력 시 다음 칸 자동 이동 및 백스페이스 시 이전 칸 포커스 이동
 */
function setupDigitBoxAutoAdvance() {
    const inputs = document.querySelectorAll('.student-page .digit-box');
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // 숫자만 허용
            input.value = input.value.replace(/[^0-9]/g, '');

            // 입력 칸 피드백 초기화
            input.classList.remove('is-correct', 'is-wrong');
            const card = input.closest('.problem-card');
            if (card) {
                card.classList.remove('correct', 'wrong');
            }

            if (input.value.length >= 1) {
                // 다음 칸으로 이동
                if (index < inputs.length - 1) {
                    const nextInput = inputs[index + 1];
                    // 같은 카드 안이거나 다음 칸이면 포커스
                    nextInput.focus();
                }
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                const prevInput = inputs[index - 1];
                prevInput.focus();
            }
        });
    });
}

/**
 * 탭 네비게이션 이벤트
 */
function bindTabEvents() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPage = parseInt(btn.dataset.page);
            switchPage(targetPage);
        });
    });
}

/**
 * 페이지 전환
 */
function switchPage(pageNumber) {
    currentPageIndex = pageNumber;

    // 탭 액티브 표시
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.page) === pageNumber);
    });

    // 워크시트 페이지 표시
    document.querySelectorAll('.worksheet-page').forEach(page => {
        page.classList.remove('active');
    });

    if (pageNumber <= 5) {
        const targetPage = document.getElementById(`page-${pageNumber}`);
        if (targetPage) targetPage.classList.add('active');
    } else {
        const answerPage = document.getElementById('answerSheetPage');
        if (answerPage) answerPage.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 상단 컨트롤 버튼 바인딩
 */
function bindHeaderEvents() {
    // 새 문제 만들기
    document.getElementById('btnRegenerate').addEventListener('click', () => {
        if (confirm('새로운 문제로 학습지를 다시 만들까요?\n(입력했던 답안은 초기화됩니다.)')) {
            generateAndRenderNewWorksheet();
        }
    });

    // 인쇄하기
    document.getElementById('btnPrint').addEventListener('click', () => {
        window.print();
    });

    // 현재 페이지 채점하기
    document.getElementById('btnGrade').addEventListener('click', () => {
        gradeCurrentPage();
    });

    // 모달 닫기
    document.getElementById('btnCloseModal').addEventListener('click', () => {
        document.getElementById('scoreModal').classList.remove('active');
    });
}

/**
 * 현재 페이지 채점 로직
 */
function gradeCurrentPage() {
    if (currentPageIndex > 5) {
        alert('답안지 페이지입니다. 1~5쪽 문제 페이지에서 채점해주세요!');
        return;
    }

    const currentPageEl = document.getElementById(`page-${currentPageIndex}`);
    if (!currentPageEl) return;

    const cards = currentPageEl.querySelectorAll('.problem-card');
    let correctCount = 0;
    let totalProblems = cards.length;

    cards.forEach(card => {
        const inputs = card.querySelectorAll('.digit-box');
        let cardAllCorrect = true;

        inputs.forEach(input => {
            const userVal = input.value.trim();
            const correctVal = input.dataset.correct.trim();

            if (userVal === correctVal) {
                input.classList.add('is-correct');
                input.classList.remove('is-wrong');
            } else {
                input.classList.add('is-wrong');
                input.classList.remove('is-correct');
                cardAllCorrect = false;
            }
        });

        if (cardAllCorrect) {
            card.classList.add('correct');
            card.classList.remove('wrong');
            correctCount++;
        } else {
            card.classList.add('wrong');
            card.classList.remove('correct');
        }
    });

    showScoreModal(correctCount, totalProblems);
}

/**
 * 채점 결과 모달 표시
 */
function showScoreModal(correct, total) {
    const modal = document.getElementById('scoreModal');
    const sticker = document.getElementById('modalSticker');
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDesc');

    const ratio = correct / total;
    if (ratio === 1.0) {
        sticker.textContent = '🌟';
        title.textContent = '완벽해요! 100점 만점!';
        desc.textContent = `총 ${total}문제 중 ${correct}문제를 모두 맞혔어요! 곱셈 천재 어린이네요! 🎉`;
    } else if (ratio >= 0.7) {
        sticker.textContent = '👏';
        title.textContent = '정말 잘했어요!';
        desc.textContent = `총 ${total}문제 중 ${correct}문제를 맞혔어요. 틀린 부분만 살짝 다시 풀어볼까요?`;
    } else {
        sticker.textContent = '🌱';
        title.textContent = '차근차근 연습해봐요!';
        desc.textContent = `총 ${total}문제 중 ${correct}문제를 맞혔어요. 답지를 보며 천천히 다시 연습해보세요! 화이팅! 💪`;
    }

    modal.classList.add('active');
}
