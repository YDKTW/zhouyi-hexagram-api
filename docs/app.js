const API_BASE = "http://5.78.134.137:3000";

const statusEl = document.getElementById("status");
const analyzeBtn = document.getElementById("analyzeBtn");
const hexagramIdEl = document.getElementById("hexagramId");
const movingLinesGroup = document.getElementById("movingLinesGroup");

const baseHexagramEl = document.getElementById("baseHexagram");
const oppositeHexagramEl = document.getElementById("oppositeHexagram");
const inverseHexagramEl = document.getElementById("inverseHexagram");
const mutualHexagramEl = document.getElementById("mutualHexagram");
const changedHexagramEl = document.getElementById("changedHexagram");
const sanjiAEl = document.getElementById("sanjiA");
const sanjiBEl = document.getElementById("sanjiB");
const sanjiCEl = document.getElementById("sanjiC");
const movingLinesTextEl = document.getElementById("movingLinesText");

const lineNames = ["初", "二", "三", "四", "五", "上"];

const hexagramOptions = [
  { id: 1, name: "乾" }, { id: 2, name: "坤" }, { id: 3, name: "屯" }, { id: 4, name: "蒙" },
  { id: 5, name: "需" }, { id: 6, name: "訟" }, { id: 7, name: "師" }, { id: 8, name: "比" },
  { id: 9, name: "小畜" }, { id: 10, name: "履" }, { id: 11, name: "泰" }, { id: 12, name: "否" },
  { id: 13, name: "同人" }, { id: 14, name: "大有" }, { id: 15, name: "謙" }, { id: 16, name: "豫" },
  { id: 17, name: "隨" }, { id: 18, name: "蠱" }, { id: 19, name: "臨" }, { id: 20, name: "觀" },
  { id: 21, name: "噬嗑" }, { id: 22, name: "賁" }, { id: 23, name: "剝" }, { id: 24, name: "復" },
  { id: 25, name: "無妄" }, { id: 26, name: "大畜" }, { id: 27, name: "頤" }, { id: 28, name: "大過" },
  { id: 29, name: "坎" }, { id: 30, name: "離" }, { id: 31, name: "咸" }, { id: 32, name: "恆" },
  { id: 33, name: "遯" }, { id: 34, name: "大壯" }, { id: 35, name: "晉" }, { id: 36, name: "明夷" },
  { id: 37, name: "家人" }, { id: 38, name: "睽" }, { id: 39, name: "蹇" }, { id: 40, name: "解" },
  { id: 41, name: "損" }, { id: 42, name: "益" }, { id: 43, name: "夬" }, { id: 44, name: "姤" },
  { id: 45, name: "萃" }, { id: 46, name: "升" }, { id: 47, name: "困" }, { id: 48, name: "井" },
  { id: 49, name: "革" }, { id: 50, name: "鼎" }, { id: 51, name: "震" }, { id: 52, name: "艮" },
  { id: 53, name: "漸" }, { id: 54, name: "歸妹" }, { id: 55, name: "豐" }, { id: 56, name: "旅" },
  { id: 57, name: "巽" }, { id: 58, name: "兌" }, { id: 59, name: "渙" }, { id: 60, name: "節" },
  { id: 61, name: "中孚" }, { id: 62, name: "小過" }, { id: 63, name: "既濟" }, { id: 64, name: "未濟" }
];

function initHexagramSelect() {
  if (!hexagramIdEl) return;

  hexagramIdEl.innerHTML = '<option value="">請選擇本卦</option>';

  hexagramOptions.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.id}. ${item.name}`;
    hexagramIdEl.appendChild(option);
  });

  hexagramIdEl.value = "1";
}

function getSelectedMovingLines() {
  if (!movingLinesGroup) return [];

  return Array.from(
    movingLinesGroup.querySelectorAll('input[type="checkbox"]:checked')
  )
    .map((input) => Number(input.value))
    .filter((value) => Number.isInteger(value))
    .sort((a, b) => a - b);
}

function getMovesBooleanArray() {
  const selected = getSelectedMovingLines();
  return [1, 2, 3, 4, 5, 6].map((lineNo) => selected.includes(lineNo));
}

function setStatus(message, isError = false) {
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.style.background = isError ? "var(--error-bg)" : "var(--status-bg)";
  statusEl.style.color = isError ? "var(--error-text)" : "var(--status-text)";
  statusEl.style.borderColor = isError ? "var(--error-border)" : "var(--status-border)";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderLineShape(value) {
  if (value === 1) {
    return `
      <div class="line-shape">
        <div class="yang"></div>
      </div>
    `;
  }

  return `
    <div class="line-shape">
      <div class="yin-left"></div>
      <div class="yin-right"></div>
    </div>
  `;
}

function renderLines(lines = []) {
  if (!Array.isArray(lines) || lines.length !== 6) {
    return "<div class='section-text'>無六爻資料</div>";
  }

  const topToBottom = [...lines].reverse();

  return `
    <div class="lines">
      ${topToBottom
        .map((line, index) => {
          const label = lineNames[5 - index];
          return `
            <div class="line">
              <div class="line-label">${label}</div>
              ${renderLineShape(line)}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function normalizeLineTexts(lineTexts) {
  if (!lineTexts) return [];

  if (Array.isArray(lineTexts)) {
    return lineTexts.map((text, index) => ({
      label: `${lineNames[index] || index + 1}爻`,
      text: text || ""
    }));
  }

  if (typeof lineTexts === "object") {
    return Object.keys(lineTexts).map((key) => ({
      label: `${key}爻`,
      text: lineTexts[key] || ""
    }));
  }

  return [];
}

function renderLineTexts(lineTexts) {
  const items = normalizeLineTexts(lineTexts);

  if (!items.length) return "";

  return `
    <div class="section-title">爻辭</div>
    <div class="line-texts">
      ${items
        .map(
          (item) => `
            <div class="line-text-item">
              <strong>${escapeHtml(item.label)}</strong><br />
              ${escapeHtml(item.text)}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function pickHexagram(data, keys = []) {
  if (!data || typeof data !== "object") return null;

  for (const key of keys) {
    const value = data[key];
    if (value && typeof value === "object") {
      return value;
    }
  }

  return null;
}

function pickSanji(data, key) {
  if (!data || typeof data !== "object") return null;

  const sanji = data.sanji || data.sanjiHexagrams || data.sanjiResult || {};
  return sanji[key] || sanji[key.toLowerCase()] || data[`sanji${key}`] || null;
}

function formatMovingLinesText(value) {
  if (!value) return "無動爻分析";

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const label = item.label || item.name || `第 ${item.index ?? ""} 爻`;
          const text = item.text || item.value || "";
          return `${label}：${text}`.trim();
        }
        return "";
      })
      .filter(Boolean);

    return parts.length ? parts.join("；") : "無動爻分析";
  }

  if (typeof value === "object") {
    if (value.label || value.text) {
      return `${value.label || "動爻"}：${value.text || ""}`.trim();
    }

    const parts = Object.keys(value)
      .map((key) => `${key}：${value[key]}`)
      .filter(Boolean);

    return parts.length ? parts.join("；") : "無動爻分析";
  }

  return String(value);
}

function renderHexagramCard(hexagram) {
  if (!hexagram) {
    return "查無資料";
  }

  const title = hexagram.name || hexagram.nameZh || hexagram.title || "未命名卦";
  const symbol = hexagram.symbol || hexagram.unicodeSymbol || "";
  const judgment = hexagram.judgment || hexagram.text || "";
  const image = hexagram.image || hexagram.imageText || "";
  const upper = hexagram.upper || hexagram.upperTrigram || "";
  const lower = hexagram.lower || hexagram.lowerTrigram || "";
  const number = hexagram.id || hexagram.kingWenNo || hexagram.number || "";
  const lines = hexagram.lines || [];
  const lineTexts = hexagram.lineTexts || hexagram.line_texts || hexagram.yaoTexts || null;

  return `
    <div class="hexagram-header">
      <div>
        <div class="hexagram-title">${escapeHtml(title)}</div>
        <div class="hexagram-meta">
          卦序：${escapeHtml(number || "-")}　
          上卦：${escapeHtml(upper || "-")}　
          下卦：${escapeHtml(lower || "-")}
        </div>
      </div>
      <div class="symbol">${escapeHtml(symbol)}</div>
    </div>

    ${renderLines(lines)}

    <div class="section-title">卦辭</div>
    <div class="section-text">${escapeHtml(judgment || "無資料")}</div>

    <div class="section-title">大象辭</div>
    <div class="section-text">${escapeHtml(image || "無資料")}</div>

    ${renderLineTexts(lineTexts)}
  `;
}

function renderSimpleHexagramCard(hexagram) {
  if (!hexagram) {
    return "查無資料";
  }

  const title = hexagram.name || hexagram.nameZh || hexagram.title || "未命名卦";
  const symbol = hexagram.symbol || hexagram.unicodeSymbol || "";
  const judgment = hexagram.judgment || hexagram.text || "";
  const upper = hexagram.upper || hexagram.upperTrigram || "";
  const lower = hexagram.lower || hexagram.lowerTrigram || "";
  const number = hexagram.id || hexagram.kingWenNo || hexagram.number || "";
  const lines = hexagram.lines || [];

  return `
    <div class="hexagram-header">
      <div>
        <div class="hexagram-title">${escapeHtml(title)}</div>
        <div class="hexagram-meta">
          卦序：${escapeHtml(number || "-")}　
          上卦：${escapeHtml(upper || "-")}　
          下卦：${escapeHtml(lower || "-")}
        </div>
      </div>
      <div class="symbol">${escapeHtml(symbol)}</div>
    </div>

    ${renderLines(lines)}

    <div class="section-title">卦辭</div>
    <div class="section-text">${escapeHtml(judgment || "無資料")}</div>
  `;
}

function resetCards() {
  if (baseHexagramEl) baseHexagramEl.innerHTML = "尚未查詢";
  if (oppositeHexagramEl) oppositeHexagramEl.innerHTML = "尚未查詢";
  if (inverseHexagramEl) inverseHexagramEl.innerHTML = "尚未查詢";
  if (mutualHexagramEl) mutualHexagramEl.innerHTML = "尚未查詢";
  if (changedHexagramEl) changedHexagramEl.innerHTML = "尚未查詢";
  if (sanjiAEl) sanjiAEl.innerHTML = "尚未查詢";
  if (sanjiBEl) sanjiBEl.innerHTML = "尚未查詢";
  if (sanjiCEl) sanjiCEl.innerHTML = "尚未查詢";
  if (movingLinesTextEl) movingLinesTextEl.textContent = "尚未查詢";
}

async function analyzeHexagram() {
  const hexagramId = Number(hexagramIdEl?.value);
  const changingLines = getSelectedMovingLines();
  const moves = getMovesBooleanArray();

  if (!hexagramId || hexagramId < 1 || hexagramId > 64) {
    setStatus("請先選擇 1 到 64 的本卦。", true);
    return;
  }

  setStatus("分析中...");
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "分析中...";
  }

  try {
    const payload = {
      hexagramId,
      changingLines,
      moves
    };

    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status} - ${text}`);
    }

    const data = await response.json();

    const baseData = pickHexagram(data, ["base", "baseHexagram"]);
    const oppositeData = pickHexagram(data, ["opposite", "oppositeHexagram"]);
    const inverseData = pickHexagram(data, ["inverse", "inverseHexagram"]);
    const mutualData = pickHexagram(data, ["mutual", "mutualHexagram"]);
    const changedData = pickHexagram(data, [
      "changed",
      "changedHexagram",
      "result",
      "resultHexagram"
    ]);

    const sanjiAData = pickSanji(data, "A");
    const sanjiBData = pickSanji(data, "B");
    const sanjiCData = pickSanji(data, "C");

    if (baseHexagramEl) {
      baseHexagramEl.innerHTML = renderHexagramCard(baseData);
    }

    if (oppositeHexagramEl) {
      oppositeHexagramEl.innerHTML = renderSimpleHexagramCard(oppositeData);
    }

    if (inverseHexagramEl) {
      inverseHexagramEl.innerHTML = renderSimpleHexagramCard(inverseData);
    }

    if (mutualHexagramEl) {
      mutualHexagramEl.innerHTML = renderSimpleHexagramCard(mutualData);
    }

    if (changedHexagramEl) {
      changedHexagramEl.innerHTML = renderSimpleHexagramCard(changedData);
    }

    if (sanjiAEl) {
      sanjiAEl.innerHTML = renderSimpleHexagramCard(sanjiAData);
    }

    if (sanjiBEl) {
      sanjiBEl.innerHTML = renderSimpleHexagramCard(sanjiBData);
    }

    if (sanjiCEl) {
      sanjiCEl.innerHTML = renderSimpleHexagramCard(sanjiCData);
    }

    if (movingLinesTextEl) {
      movingLinesTextEl.textContent = formatMovingLinesText(
        data.movingLinesText || data.movingLineText || data.moving || data.movesText
      );
    }

    setStatus(`分析完成：第 ${hexagramId} 卦`);
  } catch (error) {
    console.error(error);
    resetCards();
    setStatus(`分析失敗：${error.message}`, true);
  } finally {
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "開始分析";
    }
  }
}

if (analyzeBtn) {
  analyzeBtn.addEventListener("click", analyzeHexagram);
}

window.addEventListener("DOMContentLoaded", () => {
  initHexagramSelect();
  analyzeHexagram();
});
