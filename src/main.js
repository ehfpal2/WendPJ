// src/main.js

import "./style.css";
import lectureDB from "./lecture_db.json";

// -----------------------------
// 0. 전역 상태 & 엘리먼트
// -----------------------------
const viewHome = document.getElementById("view-home");
const viewSelect = document.getElementById("view-select");
const viewResult = document.getElementById("view-result");

const loadingBar = document.getElementById("loading-bar");

const selectTitle = document.getElementById("select-title");
const selectDesc = document.getElementById("select-desc");
const categoryHint = document.getElementById("category-hint");
const categoryContainer = document.getElementById("category-container");

const btnShowRecommend = document.getElementById("btn-show-recommend");
const btnSelectHome = document.getElementById("btn-select-home");
const btnResultRetry = document.getElementById("btn-result-retry");
const btnResultHome = document.getElementById("btn-result-home");

const levelText = document.getElementById("level-text");
const ebsList = document.getElementById("ebs-list");
const megaList = document.getElementById("mega-list");
const etoosList = document.getElementById("etoos-list");

let currentSubject = null; // "kor" | "eng" | "math"
let selectedCategory = null; // 분야명 (ex. "문학")

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
// 2. 화면 전환
// -----------------------------
function showView(name) {
  viewHome.style.display = "none";
  viewSelect.style.display = "none";
  viewResult.style.display = "none";

  if (name === "home") {
    viewHome.style.display = "block";
  } else if (name === "select") {
    viewSelect.style.display = "block";
  } else if (name === "result") {
    viewResult.style.display = "block";
  }
}

// -----------------------------
// 3. 수준 → 개념/심화 매핑
// -----------------------------
function pickDifficultyTypesByLevel(level) {
  // DM CSV 의 "difficulty" 컬럼: "개념" / "심화"
  if (level === "하") return ["개념"];
  if (level === "중") return ["개념", "심화"];
  if (level === "상") return ["심화"];
  return ["개념"];
}

// -----------------------------
// 4. 과목 + 수준 + 분야 → 강의 추천
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

  const byPlatform = {
    ebs: [],
    mega: [],
    etoos: []
  };

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
// 5. 선택 화면 렌더링
// -----------------------------
function renderSelectView(subject) {
  currentSubject = subject;
  selectedCategory = null;

  const cfg = SUBJECT_CONFIG[subject];
  if (!cfg) return;

  // 제목/설명
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

  // 수준 선택 초기화
  document
    .querySelectorAll('input[name="level"]')
    .forEach((input) => (input.checked = false));

  // 카테고리 버튼 렌더링
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
// 6. 결과 화면 렌더링
// -----------------------------
function renderLectureList(container, lectures, platformLabel) {
  container.innerHTML = "";

  if (!lectures || lectures.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-text";
    empty.textContent = `${platformLabel}에 해당 조건의 강의 데이터가 없습니다. (lecture_db.json을 보강해 주세요)`;
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
// 7. 이벤트 바인딩
// -----------------------------
function bindEvents() {
  // 홈: 과목 선택
  document.querySelectorAll(".subject-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const subject = btn.dataset.subject;
      if (!subject) return;

      renderSelectView(subject);
      showView("select");
    });
  });

  // 분야 버튼 선택 (이벤트 위임)
  categoryContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".category-btn");
    if (!btn) return;

    // 기존 선택 해제
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
}

// -----------------------------
// 8. 초기 실행
// -----------------------------
function init() {
  console.log("lectureDB 항목 수:", lectureDB.length);
  loadingBar.style.display = "none";
  bindEvents();
  showView("home");
}

init();
