const app = document.getElementById("app");

const state = {
  hexagrams: [],
  binaryMap: {},
  selectedHexagram: null
};

function lineToSymbol(v) {
  return v === 1 ? "━━━" : "━ ━";
}

function renderLines(lines = []) {
  return `
    <div class="lines">
      ${[...lines]
        .reverse()
        .map(line => `<div class="line">${lineToSymbol(line)}</div>`)
        .join("")}
    </div>
  `;
}

function getBinary(lines) {
  return lines.join("");
}

function getHexagramByBinary(binary) {
  const id = state.binaryMap[binary];
  return state.hexagrams.find(h => h.id === id) || null;
}

function getOpposite(lines) {
  return lines.map(v => (v === 1 ? 0 : 1));
}

function getInverse(lines) {
  return [...lines].reverse();
}

function getMutual(lines) {
  return [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]];
}

function getSanji(lines) {
  return [
    [lines[0], lines[1], lines[2], lines[1], lines[2], lines[3]],
    [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]],
    [lines[2], lines[3], lines[4], lines[3], lines[4], lines[5]]
  ];
}

function getDerivedSet(base) {
  const lines = base.lines;

  const opposite = getHexagramByBinary(getBinary(getOpposite(lines)));
  const inverse = getHexagramByBinary(getBinary(getInverse(lines)));
  const mutual = getHexagramByBinary(getBinary(getMutual(lines)));
  const sanji = getSanji(lines).map(arr => getHexagramByBinary(getBinary(arr)));

  return { opposite, inverse, mutual, sanji };
}

function renderHexagramCard(title, hexagram) {
  if (!hexagram) {
    return `
      <section class="card">
        <h3>${title}</h3>
        <p>查無對應資料</p>
      </section>
    `;
  }

  return `
    <section class="card">
      <h3>${title}</h3>
      <div class="card-header">
        <div>
          <div class="hexagram-name">${hexagram.kingWenNo}. ${hexagram.nameZh}</div>
          <div class="hexagram-binary">${hexagram.binary}</div>
        </div>
        ${renderLines(hexagram.lines)}
      </div>
      <div class="card-body">
        <p><strong>卦辭：</strong>${hexagram.judgment || ""}</p>
        <p><strong>大象：</strong>${hexagram.image || ""}</p>
      </div>
      <button class="jump-btn" data-id="${hexagram.id}">查看此卦</button>
    </section>
  `;
}

function renderLineTexts(lineTexts = []) {
  const labels = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
  return `
    <section class="card">
      <h3>爻辭</h3>
      <div class="line-texts">
        ${labels.map((label, i) => `
          <div class="line-text-item">
            <div class="line-text-label">${label}</div>
            <div class="line-text-content">${lineTexts[i] || ""}</div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderBaseHexagram(hexagram) {
  return `
    <section class="card main-card">
      <h2>本卦</h2>
      <div class="card-header">
        <div>
          <div class="hexagram-name">${hexagram.kingWenNo}. ${hexagram.nameZh}</div>
          <div class="hexagram-binary">${hexagram.binary}</div>
          <div class="hexagram-meta">上卦：${hexagram.upperTrigram || ""} ／ 下卦：${hexagram.lowerTrigram || ""}</div>
        </div>
        ${renderLines(hexagram.lines)}
      </div>
      <div class="card-body">
        <p><strong>卦辭：</strong>${hexagram.judgment || ""}</p>
        <p><strong>大象：</strong>${hexagram.image || ""}</p>
      </div>
    </section>
  `;
}

function renderSidebar() {
  return `
    <aside class="sidebar">
      <h2>六十四卦</h2>
      <div class="hexagram-list">
        ${state.hexagrams.map(h => `
          <button class="hexagram-item ${state.selectedHexagram?.id === h.id ? "active" : ""}" data-id="${h.id}">
            <span>${h.kingWenNo}. ${h.nameZh}</span>
            <span class="mini-binary">${h.binary}</span>
          </button>
        `).join("")}
      </div>
    </aside>
  `;
}

function renderMain() {
  if (!state.selectedHexagram) {
    return `
      <main class="content">
        <section class="card">
          <h2>請選擇一卦</h2>
          <p>請由左側點選六十四卦。</p>
        </section>
      </main>
    `;
  }

  const base = state.selectedHexagram;
  const derived = getDerivedSet(base);

  return `
    <main class="content">
      ${renderBaseHexagram(base)}
      ${renderLineTexts(base.lineTexts || [])}

      <section class="grid">
        ${renderHexagramCard("錯卦", derived.opposite)}
        ${renderHexagramCard("綜卦", derived.inverse)}
        ${renderHexagramCard("互卦", derived.mutual)}
        ${renderHexagramCard("三極卦 A（123-234）", derived.sanji[0])}
        ${renderHexagramCard("三極卦 B（234-345）", derived.sanji[1])}
        ${renderHexagramCard("三極卦 C（345-456）", derived.sanji[2])}
      </section>
    </main>
  `;
}

function renderApp() {
  app.innerHTML = `
    <div class="layout">
      ${renderSidebar()}
      ${renderMain()}
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelectorAll(".hexagram-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      state.selectedHexagram = state.hexagrams.find(h => h.id === id) || null;
      renderApp();
    });
  });

  document.querySelectorAll(".jump-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      state.selectedHexagram = state.hexagrams.find(h => h.id === id) || null;
      renderApp();
    });
  });
}

async function init() {
  try {
    const res = await fetch("./hexagrams.json");
    const data = await res.json();

    state.hexagrams = data.hexagrams || [];
    state.binaryMap = data.binaryMap || {};

    if (state.hexagrams.length > 0) {
      state.selectedHexagram = state.hexagrams[0];
    }

    renderApp();
  } catch (err) {
    app.innerHTML = `
      <section class="card">
        <h2>載入失敗</h2>
        <p>請確認 ./hexagrams.json 是否存在，且格式正確。</p>
        <pre>${String(err)}</pre>
      </section>
    `;
  }
}

init();
