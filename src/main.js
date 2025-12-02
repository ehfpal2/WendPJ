// src/main.js

import "./style.css";
import lectureDB from "./lecture_db.json";

// -----------------------------
// 0. 전역 상태 & 엘리먼트
// -----------------------------
const viewHome = document.getElementById("view-home");
const viewSelect = document.getElementById("view-select");
const viewResult = document.getElementById("view-result");
const viewQuiz = document.getElementById("view-quiz");
const viewTestResult = document.getElementById("view-test-result");

const loadingBar = document.getElementById("loading-bar");

// 선택(수준/분야) 화면
const selectTitle = document.getElementById("select-title");
const selectDesc = document.getElementById("select-desc");
const categoryHint = document.getElementById("category-hint");
const categoryContainer = document.getElementById("category-container");

// 추천 결과 화면
const levelText = document.getElementById("level-text");
const ebsList = document.getElementById("ebs-list");
const megaList = document.getElementById("mega-list");
const etoosList = document.getElementById("etoos-list");

const btnShowRecommend = document.getElementById("btn-show-recommend");
const btnSelectHome = document.getElementById("btn-select-home");
const btnResultRetry = document.getElementById("btn-result-retry");
const btnResultHome = document.getElementById("btn-result-home");

// 내 수준 테스트 관련
const btnGoTest = document.getElementById("btn-go-test");
const quizWrap = document.getElementById("quiz-wrap");
const quizTitle = document.getElementById("quiz-title");
const quizForm = document.getElementById("quiz-form");
const btnSubmitTest = document.getElementById("btn-submit-test");
const btnTestHome = document.getElementById("btn-test-home");
const btnTestToHome = document.getElementById("btn-test-to-home");
const btnTestToSelect = document.getElementById("btn-test-to-select");
const testResultText = document.getElementById("test-result-text");

// 상태
let currentSubject = null; // 추천용: "kor" | "eng" | "math"
let selectedCategory = null;
let quizSubject = null; // 테스트 중인 과목
let quizQuestions = [];
let lastTestLevel = null;
let currentQuestionIndex = 0; // ✅ 지금 보고 있는 문제 번호

// -----------------------------
// 1. 과목별 카테고리 정의
// -----------------------------
const SUBJECT_CONFIG = {
  kor: {
    name: "국어",
    categories: ["문학", "비문학", "독서", "언어와 매체", "화법과 작문"]
  },
  math: {
    name: "수학",
    categories: ["수학Ⅰ", "수학Ⅱ", "확률과 통계", "미적분", "기하"]
  },
  eng: {
    name: "영어",
    categories: ["독해", "듣기", "문법"]
  }
};

// -----------------------------
// 2. 수능 스타일 테스트용 문항 데이터 (5지선다형)
// -----------------------------
const TEST_QUESTIONS = {
  kor: [
    // 국어 1번 – 학습 활동지 문항
    {
      text:
        "다음은 윗글을 읽고 학생이 작성한 학습 활동지이다. 윗글을 바탕으로 할 때, 적절하지 않은 것은?",
      passage:
        "[아래의 핵심 개념에 대해 윗글에 제시된 학자들이 보일 수 있는 입장을 작성해 봅시다.]\n\n" +
        "■ [핵심 개념 1] 자아에 대한 인식과 경험적 인식\n" +
        "- 칸트: 자아를 인식하는 방식과 사물/세계의 대상을 경험적으로 인식하는 방식은 다르다.\n" +
        "- 흄: 자아는 지각들의 다발이며, 자아에 대한 인식은 경험적 인식과 구별되지 않는다.\n\n" +
        "■ [핵심 개념 2] 추상화 과정\n" +
        "- 스트로슨: 경험으로부터의 추상화 과정을 거치지 않고도 ‘나’를 인식할 수 있다는 주장에 동의하지 않는다.\n" +
        "- 칸트: ‘나’를 인식할 수 있다는 점에 동의한다(선험적 통각).\n\n" +
        "■ [핵심 개념 3] 통시적 인격과 도덕적 존재\n" +
        "- 로크: 의식의 연속성(기억)은 인격 동일성의 근거가 될 수 있다.\n" +
        "- 기타 입장: 시간의 흐름 속 동일한 인격으로서의 ‘나’라는 개념을 수용한다.",
      choices: [
        "칸트의 입장에 따르면, 자아 인식과 세계 인식은 동일한 방식이므로 구별할 필요가 없다는 학생의 결론은 옳다.",
        "스트로슨의 입장에 따르면, 경험을 거치지 않고도 ‘나’를 인식할 수 있다는 주장에 동의하기 어렵다.",
        "칸트의 입장에 따르면, 선험적 통각에 근거하여 ‘나’를 인식할 수 있다는 점에 동의한다.",
        "로크의 입장에 따르면, 기억의 연속성은 인격 동일성 논의의 근거가 될 수 있다.",
        "통시적 동일성을 수용하는 입장에 따르면, 시간의 흐름 속 동일한 인격으로서의 ‘나’를 개념적으로 인정한다."
      ],
      answerIndex: 1, // TODO: 실제 정답으로 0~4 설정
      difficulty: "hard"
    },
    // 국어 2번 – <보기> 반응 문항
    {
      text: "윗글을 바탕으로 <보기>를 이해한 반응으로 가장 적절한 것은?",
      passage:
        "<보기>\n" +
        "갑: 두뇌에서 일어나는 의식을 스캔하여 프로그램으로 재현한다고 상상해 보자. 그런 경우, 본래의 자신과 재현된 의식은 동일한 인격이 아니다. 두뇌에서 일어나는 의식은 신체 전체의 작용에 연관된 것이기 때문이다. 즉, 뇌로만 재현된 의식은 인격일 수 없다. '생각하는 나'의 지속만으로는 인격의 동일성이 보장될 수 없고, 살아 있는 신체도 인격의 구성 요소에 포함되어야 한다.\n" +
        "을: 그렇지 않아. 프로그램으로 재현된 의식은 본래의 자신과 동일한 인격이야. 비록 프로그램은 신체가 없지만 우리 두뇌와 프로그램이 수행하는 사고 기능에는 근본적인 차이가 없으므로, 인격의 동일성은 동일한 사고 기능의 동일성을 기준으로 판별해야 해.",
      choices: [
        "통제설에 의하면, 프로그램으로 재현된 의식만으로도 인격이 된다는 을의 입장은 옳다.",
        "스트로슨에 의하면, 신체를 지니지 않은 존재에게 인격을 귀속할 수 없다는 을의 입장은 옳지 않다.",
        "칸트에 의하면, ‘생각하는 나’의 지속만으로 인격 동일성이 보장되지 않는다는 갑의 입장은 옳지 않다.",
        "가튼에 의하면, 인격 동일성은 자기 지식이 아니라 사고 기능의 동일성으로 판별해야 한다는 을의 입장은 옳지 않다.",
        "통제설에 의하면, 인간과 다른 존재라도 동일한 사고 기능이 있다면 그 동일성을 기준으로 인격 동일성을 판단할 수 있다는 을의 입장은 옳다."
      ],
      answerIndex: 2, // TODO: 실제 정답으로 0~4 설정
      difficulty: "hard"
    },
    {
      text: "다음 중 문맥상 가장 어색한 문장은 무엇인가?",
      choices: [
        "나는 오늘 학교에서 친구를 만났다.",
        "책을 다 읽고 나니 마음이 한결 가벼워졌다.",
        "그는 버스를 타고 걸어서 집에 갔다.",
        "창밖을 보며 생각에 잠겼다.",
        "시험을 앞두고 마음이 조금 긴장되었다."
      ],
      answerIndex: 2,
      difficulty: "mid"
    },
    {
      text: "다음 중 띄어쓰기가 바르게 된 것은?",
      choices: [
        "할수있다",
        "할 수있다",
        "할수 있다",
        "할 수 있다",
        "할  수  있다"
      ],
      answerIndex: 3,
      difficulty: "easy"
    },
    {
      text:
        "다음 글의 필자의 태도로 가장 적절한 것은?\n\n\"우리는 익숙한 것에 안주하기보다, 낯선 질문을 통해 스스로를 점검해야 한다.\"",
      choices: [
        "냉소적이다",
        "회의적이다",
        "성찰적이다",
        "공격적이다",
        "무관심하다"
      ],
      answerIndex: 2,
      difficulty: "mid"
    },
    {
      text: "고전 시가의 특징으로 적절하지 않은 것은?",
      choices: [
        "정형화된 율격을 가진다.",
        "관습적인 표현이 반복된다.",
        "한 시대의 정서를 담아낸 경우가 많다.",
        "운율이 형성된 경우가 많다.",
        "대부분 산문 형식으로 서술된다."
      ],
      answerIndex: 4,
      difficulty: "hard"
    }
  ],

  eng: [
    {
      text: "Choose the sentence that is grammatically correct.",
      choices: [
        "He don't like coffee.",
        "He doesn't likes coffee.",
        "He doesn't like coffee.",
        "He not like coffee.",
        "He no like coffee."
      ],
      answerIndex: 2,
      difficulty: "easy"
    },
    {
      text:
        "빈칸에 가장 알맞은 것을 고르시오.\n\nIf you study hard, you _____ pass the exam.",
      choices: ["must", "will", "have", "did", "mighted"],
      answerIndex: 1,
      difficulty: "easy"
    },
    {
      text:
        "다음 우리말을 가장 자연스럽게 영작한 것은?\n\n\"나는 그 소식을 듣고 매우 놀랐다.\"",
      choices: [
        "I was very surprised hearing the news.",
        "I was very surprised to hear the news.",
        "I very surprised when I hear the news.",
        "I am very surprised heard the news.",
        "I surprised very when I heard the news."
      ],
      answerIndex: 1,
      difficulty: "mid"
    },
    {
      text:
        "다음 글의 요지로 가장 적절한 것은?\n\n\"True friendship is not about being inseparable, but about being able to feel close even when you are apart.\"",
      choices: [
        "친구는 항상 곁에 있어야 한다.",
        "친구와 자주 연락하는 것이 중요하다.",
        "진정한 우정은 물리적 거리를 넘어선다.",
        "어릴 때 사귄 친구가 가장 소중하다.",
        "멀리 사는 친구와는 우정을 유지하기 어렵다."
      ],
      answerIndex: 2,
      difficulty: "mid"
    },
    {
      text:
        "밑줄 친 부분과 의미가 가장 가까운 것을 고르시오.\n\nThe project was <u>called off</u> due to heavy rain.",
      choices: ["started", "delayed", "canceled", "expanded", "discussed"],
      answerIndex: 2,
      difficulty: "hard"
    },
    {
      text:
        "다음 중 듣기 평가 상황에서 가장 자연스럽게 쓰일 표현은?",
      choices: [
        "\"Could you repeat that, please?\"",
        "\"How do you spell your name?\"",
        "\"What time is our meeting?\"",
        "\"Do you like this book?\"",
        "\"Where did you buy it?\""
      ],
      answerIndex: 0,
      difficulty: "easy"
    }
  ],

  math: [
    {
      text: "다음 중 소수(prime number)는?",
      choices: ["9", "11", "21", "27", "33"],
      answerIndex: 1,
      difficulty: "easy"
    },
    {
      text: "방정식 2x - 5 = 9의 해는?",
      choices: ["2", "3", "5", "7", "9"],
      answerIndex: 3,
      difficulty: "easy"
    },
    {
      text:
        "함수 f(x) = x² 에서 x가 2에서 3으로 증가할 때, 함수값 f(x)의 증가는?",
      choices: ["3", "4", "5", "7", "9"],
      answerIndex: 2,
      difficulty: "mid"
    },
    {
      text: "수열 an = 2n + 1 에 대한 설명으로 옳은 것은?",
      choices: [
        "등비수열이며 공비는 2이다.",
        "등차수열이며 공차는 1이다.",
        "등차수열이며 공차는 2이다.",
        "등비수열이며 공비는 3이다.",
        "상수수열이다."
      ],
      answerIndex: 2,
      difficulty: "mid"
    },
    {
      text: "다음 함수 중 x가 증가할수록 항상 감소하는 함수는?",
      choices: [
        "y = -2x + 1",
        "y = x²",
        "y = 2x - 3",
        "y = x³",
        "y = |x|"
      ],
      answerIndex: 0,
      difficulty: "hard"
    },
    {
      text:
        "두 사건 A, B가 서로 독립일 때, P(A)=0.4, P(B)=0.5이면 P(A∩B)는?",
      choices: ["0.1", "0.2", "0.4", "0.5", "0.9"],
      answerIndex: 1,
      difficulty: "hard"
    }
  ]
};

// -----------------------------
// 3. 화면 전환
// -----------------------------
function showView(name) {
  viewHome.style.display = "none";
  viewSelect.style.display = "none";
  viewResult.style.display = "none";
  viewQuiz.style.display = "none";
  viewTestResult.style.display = "none";

  if (name === "home") viewHome.style.display = "block";
  else if (name === "select") viewSelect.style.display = "block";
  else if (name === "result") viewResult.style.display = "block";
  else if (name === "quiz") viewQuiz.style.display = "block";
  else if (name === "test-result") viewTestResult.style.display = "block";
}

// -----------------------------
// 4. 수준 → 개념/심화 매핑
// -----------------------------
function pickDifficultyTypesByLevel(level) {
  if (level === "하") return ["개념"];
  if (level === "중") return ["개념", "심화"];
  if (level === "상") return ["심화"];
  return ["개념"];
}

// -----------------------------
// 5. 과목 + 수준 + 분야 → 강의 추천
// -----------------------------
function getRecommendedLectures(subject, level, category) {
  if (!lectureDB || lectureDB.length === 0) {
    return { ebs: [], mega: [], etoos: [] };
  }

  const difficultyTypes = pickDifficultyTypesByLevel(level);

  const filtered = lectureDB.filter(
    (item) =>
      item.subject_en === subject &&
      item.category === category &&
      difficultyTypes.includes(item.difficulty)
  );

  const byPlatform = { ebs: [], mega: [], etoos: [] };

  filtered.forEach((item) => {
    if (item.logo === "ebs") byPlatform.ebs.push(item);
    else if (item.logo === "mega") byPlatform.mega.push(item);
    else if (item.logo === "etoos") byPlatform.etoos.push(item);
  });

  const MAX_PER_PLATFORM = 6;
  Object.keys(byPlatform).forEach((key) => {
    byPlatform[key] = byPlatform[key].slice(0, MAX_PER_PLATFORM);
  });

  return byPlatform;
}

// -----------------------------
// 6. 선택 화면 렌더링 (추천용)
// -----------------------------
function renderSelectView(subject) {
  currentSubject = subject;
  selectedCategory = null;

  const cfg = SUBJECT_CONFIG[subject];
  if (!cfg) return;

  selectTitle.textContent = `${cfg.name} 인강 추천`;
  if (subject === "kor") {
    selectDesc.textContent =
      "현재 국어 실력을 상/중/하 중에서 선택하고, 문학/비문학/독서 등 공부하려는 영역을 고르면 사이트별 추천 강의를 보여줍니다.";
    categoryHint.textContent =
      "예) 문학 작품 중심으로 공부하고 싶으면 '문학', 비문학 독해를 올리고 싶으면 '비문학' 또는 '독서'를 선택하세요.";
  } else if (subject === "math") {
    selectDesc.textContent =
      "현재 수학 실력을 상/중/하 중에서 선택하고, 수학Ⅰ/Ⅱ/확통/미적분/기하 중에서 공부하려는 단원을 골라주세요.";
    categoryHint.textContent =
      "예) 공통/일반 선택은 수학Ⅰ/Ⅱ, 확률·통계/미적분/기하는 선택 과목 영역입니다.";
  } else if (subject === "eng") {
    selectDesc.textContent =
      "현재 영어 실력을 상/중/하 중에서 선택하고, 독해/듣기/문법 중 집중하고 싶은 영역을 선택하세요.";
    categoryHint.textContent =
      "예) 지문 훈련이 필요하면 '독해', 듣기 모의평가 대비는 '듣기', 기본기를 다지고 싶다면 '문법'을 선택하세요.";
  }

  document
    .querySelectorAll('input[name="level"]')
    .forEach((input) => (input.checked = false));

  categoryContainer.innerHTML = "";
  cfg.categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-btn";
    btn.dataset.category = cat;
    btn.textContent = cat;
    categoryContainer.appendChild(btn);
  });
}

// -----------------------------
// 7. 추천 결과 화면 렌더링
// -----------------------------
function renderLectureList(container, lectures, platformLabel) {
  container.innerHTML = "";

  if (!lectures || lectures.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-text";
    empty.textContent = `${platformLabel}에 해당 조건의 강의 데이터가 없습니다. `;
    container.appendChild(empty);
    return;
  }

  lectures.forEach((item) => {
    const card = document.createElement("div");
    card.className = "teacher-card";

    const platformEl = document.createElement("div");
    platformEl.className = "platform";
    platformEl.textContent = item.platform_ko || platformLabel;

    const nameEl = document.createElement("div");
    nameEl.className = "name";
    nameEl.textContent = item.name;

    const metaEl = document.createElement("div");
    metaEl.className = "meta";
    const category = item.category ? `${item.category}` : "";
    const difficulty = item.difficulty ? `${item.difficulty}` : "";
    const teacher = item.teacher ? `강사: ${item.teacher}` : "";
    metaEl.textContent = [category, difficulty, teacher]
      .filter(Boolean)
      .join(" · ");

    const linkEl = document.createElement("a");
    linkEl.href = item.link || "#";
    linkEl.target = "_blank";
    linkEl.rel = "noopener noreferrer";
    linkEl.textContent = "강의 바로가기";

    card.appendChild(platformEl);
    card.appendChild(nameEl);
    card.appendChild(metaEl);
    card.appendChild(linkEl);

    container.appendChild(card);
  });
}

function renderResult(subject, level, category) {
  const cfg = SUBJECT_CONFIG[subject];
  const subjectName = cfg ? cfg.name : "";
  const diffTypes = pickDifficultyTypesByLevel(level).join(" / ");

  levelText.innerHTML = `
    과목: <strong>${subjectName}</strong>
    <span class="badge-level">${level} 수준</span>
    <span class="badge-category">${category}</span>
    <br/>
    <span style="font-size:0.9rem;color:#666;">(이 수준에는 주로 ${diffTypes} 강의를 추천합니다)</span>
  `;

  const { ebs, mega, etoos } = getRecommendedLectures(
    subject,
    level,
    category
  );

  renderLectureList(ebsList, ebs, "EBS");
  renderLectureList(megaList, mega, "메가스터디");
  renderLectureList(etoosList, etoos, "이투스");
}

// -----------------------------
// 8. 내 수준 테스트용 유틸 & 렌더링
// -----------------------------
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomQuestions(subject, count = 6) {
  const pool = TEST_QUESTIONS[subject] || [];
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ✅ 한 문제씩만 보이도록 표시 상태를 갱신
function updateQuestionVisibility() {
  const questionEls = quizForm.querySelectorAll(".question");
  questionEls.forEach((el, idx) => {
    el.style.display = idx === currentQuestionIndex ? "block" : "none";
  });

  if (!quizSubject || quizQuestions.length === 0) return;

  // 제목에 현재 진행도 표시
  const cfg = SUBJECT_CONFIG[quizSubject];
  const subjectName = cfg ? cfg.name : "";
  quizTitle.textContent = `${subjectName} 수능 스타일 내 수준 테스트 (${currentQuestionIndex + 1}/${quizQuestions.length})`;

  // 버튼 텍스트 변경: 마지막 문제일 때만 '채점하기'
  if (currentQuestionIndex < quizQuestions.length - 1) {
    btnSubmitTest.textContent = "다음 문제";
  } else {
    btnSubmitTest.textContent = "채점하기";
  }
}

function renderQuiz(subject) {
  quizSubject = subject;
  quizQuestions = pickRandomQuestions(subject, 6);
  quizForm.innerHTML = "";

  const cfg = SUBJECT_CONFIG[subject];
  const subjectName = cfg ? cfg.name : "";
  quizTitle.textContent = `${subjectName} 수능 스타일 내 수준 테스트`;

  quizQuestions.forEach((q, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question";

    const p = document.createElement("p");
    p.textContent = `${idx + 1}. ${q.text || ""}`;
    wrapper.appendChild(p);

    // 긴 지문/보기 영역
    if (q.passage) {
      const pre = document.createElement("pre");
      pre.textContent = q.passage;
      wrapper.appendChild(pre);
    }

    const choicesDiv = document.createElement("div");
    choicesDiv.className = "choices";

    (q.choices || []).forEach((choiceText, cIdx) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `test-q${idx}`;
      input.value = String(cIdx);

      const numLabel = `(${cIdx + 1}) `;

      label.appendChild(input);

      const span = document.createElement("span");
      span.textContent = " " + numLabel + choiceText;
      label.appendChild(span);

      choicesDiv.appendChild(label);
    });

    wrapper.appendChild(choicesDiv);
    quizForm.appendChild(wrapper);
  });

  currentQuestionIndex = 0;      // 첫 문제부터 시작
  updateQuestionVisibility();    // ✅ 한 문제만 보이도록
  quizWrap.style.display = "block";
}

function gradeTest() {
  if (!quizSubject || quizQuestions.length === 0) {
    alert("먼저 테스트할 과목을 선택해 주세요.");
    return;
  }

  let score = 0;
  let maxScore = 0;
  let correctCount = 0;

  quizQuestions.forEach((q, idx) => {
    // 정답이 설정되지 않은 문항은 채점에서 제외
    if (q.answerIndex === null || typeof q.answerIndex === "undefined") {
      return;
    }

    const checked = quizForm.querySelector(
      `input[name="test-q${idx}"]:checked`
    );
    const weight =
      q.difficulty === "easy" ? 1 : q.difficulty === "mid" ? 2 : 3;
    maxScore += weight;

    if (!checked) return;
    const userAnswer = parseInt(checked.value, 10);
    if (userAnswer === q.answerIndex) {
      correctCount += 1;
      score += weight;
    }
  });

  if (maxScore === 0) {
    alert("채점 가능한 문항이 없습니다. answerIndex를 확인해 주세요.");
    return;
  }

  const ratio = score / maxScore;
  let level;
  if (ratio >= 0.75) level = "상";
  else if (ratio >= 0.45) level = "중";
  else level = "하";

  lastTestLevel = level;

  const cfg = SUBJECT_CONFIG[quizSubject];
  const subjectName = cfg ? cfg.name : "";

  testResultText.innerHTML = `
    <strong>${subjectName}</strong> 내 수준 테스트 결과<br/>
    정답 개수(채점 대상 문항): <strong>${correctCount}</strong> / ${
      quizQuestions.filter(
        (q) => q.answerIndex !== null && typeof q.answerIndex !== "undefined"
      ).length
    }문항<br/>
    난이도 가중 점수 비율: ${(ratio * 100).toFixed(1)}%<br/>
    → 추천 수준: <span class="badge-level">${level}</span>
  `;

  showView("test-result");
}

// -----------------------------
// 9. 이벤트 바인딩
// -----------------------------
function bindEvents() {
  // 홈: 과목 선택 (바로 추천용)
  document.querySelectorAll(".subject-btn[data-subject]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const subject = btn.dataset.subject;
      if (!subject) return;
      renderSelectView(subject);
      showView("select");
    });
  });

  // 홈: 내 수준 테스트하기
  btnGoTest.addEventListener("click", () => {
    quizSubject = null;
    quizQuestions = [];
    quizWrap.style.display = "none";
    showView("quiz");
  });

  // 테스트 화면: 과목 선택
  document
    .querySelectorAll(".subject-btn[data-test-subject]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const subject = btn.dataset.testSubject;
        renderQuiz(subject);
      });
    });

  // 분야 버튼 선택 (추천용)
  categoryContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".category-btn");
    if (!btn) return;

    categoryContainer
      .querySelectorAll(".category-btn")
      .forEach((b) => b.classList.remove("selected"));

    btn.classList.add("selected");
    selectedCategory = btn.dataset.category;
  });

  // 추천 보기
  btnShowRecommend.addEventListener("click", () => {
    if (!currentSubject) {
      alert("먼저 과목을 선택해 주세요.");
      showView("home");
      return;
    }

    const levelInput = document.querySelector('input[name="level"]:checked');
    if (!levelInput) {
      alert("내 수준(상/중/하)을 선택해 주세요.");
      return;
    }
    const level = levelInput.value;

    if (!selectedCategory) {
      alert("공부하려는 분야를 선택해 주세요.");
      return;
    }

    renderResult(currentSubject, level, selectedCategory);
    showView("result");
  });

  // 선택 화면 -> 홈
  btnSelectHome.addEventListener("click", () => {
    currentSubject = null;
    selectedCategory = null;
    showView("home");
  });

  // 결과 화면 -> 다시 선택
  btnResultRetry.addEventListener("click", () => {
    if (!currentSubject) {
      showView("home");
      return;
    }
    renderSelectView(currentSubject);
    showView("select");
  });

  // 결과 화면 -> 홈
  btnResultHome.addEventListener("click", () => {
    currentSubject = null;
    selectedCategory = null;
    showView("home");
  });

  // ✅ 테스트: '다음 문제' / '채점하기' 동작 분기
  btnSubmitTest.addEventListener("click", () => {
    if (!quizSubject || quizQuestions.length === 0) {
      alert("먼저 테스트할 과목을 선택해 주세요.");
      return;
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      currentQuestionIndex += 1;
      updateQuestionVisibility();
    } else {
      // 마지막 문제 → 채점
      gradeTest();
    }
  });

  // 테스트 화면 -> 홈
  btnTestHome.addEventListener("click", () => {
    quizSubject = null;
    quizQuestions = [];
    showView("home");
  });

  // 테스트 결과 -> 홈
  btnTestToHome.addEventListener("click", () => {
    showView("home");
  });

  // 테스트 결과 -> 과목/분야 선택 화면으로 이동 + 수준 미리 체크
  btnTestToSelect.addEventListener("click", () => {
    if (!quizSubject || !lastTestLevel) {
      showView("home");
      return;
    }
    renderSelectView(quizSubject);
    showView("select");
    const input = document.querySelector(
      `input[name="level"][value="${lastTestLevel}"]`
    );
    if (input) input.checked = true;
  });
}

// -----------------------------
// 10. 초기 실행
// -----------------------------
function init() {
  console.log("lectureDB 항목 수:", lectureDB.length);
  loadingBar.style.display = "none";
  bindEvents();
  showView("home");
}

init();
