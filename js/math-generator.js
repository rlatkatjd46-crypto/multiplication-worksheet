/**
 * 초등 2학년 두 자릿수 X 한 자릿수 곱셈 문제 생성기
 */
class MathGenerator {
    /**
     * @param {number} top 두 자릿수 (11 ~ 99)
     * @param {number} bottom 한 자릿수 (2 ~ 9)
     */
    static createProblem(top, bottom) {
        const tens = Math.floor(top / 10);
        const ones = top % 10;

        // 1단계: 일의 자리 곱 (ones * bottom)
        const step1 = ones * bottom;
        // 2단계: 십의 자리 곱 (tens * 10 * bottom)
        const step2 = tens * bottom * 10;
        // 최종 합
        const total = top * bottom;

        return {
            top,
            bottom,
            tens,
            ones,
            step1, // 예: 19 * 3 -> 9 * 3 = 27
            step2, // 10 * 3 = 30
            total, // 57
            // 빈칸 자릿수 문자열 (정답 비교용)
            step1Str: String(step1).padStart(2, '0'),
            step2Str: String(step2).padStart(2, '0'),
            totalStr: String(total)
        };
    }

    /**
     * 2학년 수준에 맞춘 랜덤 문제 1개 생성
     * 너무 어렵지 않으면서 올림이 골고루 나오도록 조절
     */
    static generateSingleProblem(forceRegrouping = null) {
        let top, bottom;
        while (true) {
            top = Math.floor(Math.random() * 89) + 11; // 11 ~ 99
            bottom = Math.floor(Math.random() * 8) + 2; // 2 ~ 9

            const ones = top % 10;
            const hasRegrouping = (ones * bottom) >= 10;

            if (forceRegrouping === null) {
                break;
            } else if (forceRegrouping === true && hasRegrouping) {
                break;
            } else if (forceRegrouping === false && !hasRegrouping) {
                break;
            }
        }
        return this.createProblem(top, bottom);
    }

    /**
     * 5개 페이지 분량의 문제 세트 생성 (페이지당 9문제 = 총 45문제)
     */
    static generateWorksheetData(totalPages = 5, perPage = 9) {
        const pages = [];
        const usedProblems = new Set();

        for (let p = 1; p <= totalPages; p++) {
            const pageProblems = [];
            for (let i = 0; i < perPage; i++) {
                let problem;
                let key;
                let attempts = 0;
                do {
                    // 페이지 초반(1~2페이지)은 올림 없는 문제도 골고루 섞음
                    const force = p <= 2 && i < 4 ? false : (Math.random() > 0.4);
                    problem = this.generateSingleProblem(force);
                    key = `${problem.top}x${problem.bottom}`;
                    attempts++;
                } while (usedProblems.has(key) && attempts < 50);

                usedProblems.add(key);
                pageProblems.push({
                    id: `p${p}_q${i + 1}`,
                    pageNumber: p,
                    problemNumber: i + 1,
                    ...problem
                });
            }
            pages.push({
                pageNumber: p,
                problems: pageProblems
            });
        }
        return pages;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathGenerator;
}
