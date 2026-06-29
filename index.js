const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. 八卦定義
const TRIGRAMS = {
  "乾": { binary: [1, 1, 1], nature: "天" },
  "兌": { binary: [1, 1, 0], nature: "澤" },
  "離": { binary: [1, 0, 1], nature: "火" },
  "震": { binary: [1, 0, 0], nature: "雷" },
  "巽": { binary: [0, 1, 1], nature: "風" },
  "坎": { binary: [0, 1, 0], nature: "水" },
  "艮": { binary: [0, 0, 1], nature: "山" },
  "坤": { binary: [0, 0, 0], nature: "地" }
};

// 2. 六十四卦資料庫（節錄部分，完整內容請從你附件程式貼上）
const HEXAGRAMS_DEFINITION = [
  {
    id: 1,
    name: "乾",
    symbol: "乾為天",
    upper: "乾",
    lower: "乾",
    judgment: "元，亨，利，貞。",
    image: "天行健，君子以自強不息。",
    lines: [1,1,1,1,1,1],
    linesText: [
      "潛龍勿用。",
      "見龍在田，利見大人。",
      "君子終日乾乾，夕惕若，厲无咎。",
      "或躍在淵，无咎。",
      "飛龍在天，利見大人。",
      "亢龍有悔。"
    ]
  },
  // ...其餘 63 卦依照附件貼上...
];

// 3. 工具函式
function findHexagramById(id) {
  return HEXAGRAMS_DEFINITION.find(h => h.id === id);
}

function findHexagramByLines(lines) {
  const key = lines.join('');
  return HEXAGRAMS_DEFINITION.find(h => h.lines.join('') === key);
}

function getLineLabel(idx, val) {
  const labelsYang = ["初九","九二","九三","九四","九五","上九"];
  const labelsYin  = ["初六","六二","六三","六四","六五","上六"];
  return val === 1 ? labelsYang[idx] : labelsYin[idx];
}

// 4. 主分析 API
app.post('/analyze', (req, res) => {
  try {
    const { hexagramId, moves, baseLines } = req.body || {};

    // 4.1 決定本卦
    let base;
    if (hexagramId != null) {
      base = findHexagramById(Number(hexagramId));
    } else if (Array.isArray(baseLines) && baseLines.length === 6) {
      base = findHexagramByLines(baseLines);
    }

    if (!base) {
      return res.status(400).json({ error: "無法找到對應本卦。請檢查 hexagramId 或 baseLines。" });
    }

    const bl = base.lines;

    // 4.2 錯卦：陰陽互換
    const oppositeLines = bl.map(line => line === 1 ? 0 : 1);
    const opposite = findHexagramByLines(oppositeLines);

    // 4.3 綜卦：上下倒置
    const inverseLines = [...bl].reverse();
    const inverse = findHexagramByLines(inverseLines);

    // 4.4 互卦：依你現有定義（此處先留空或依原程式）
    const mutual = base; // TODO: 依你原程式補上

    // 4.5 變卦 / 之卦：根據動爻 moves
    const safeMoves = Array.isArray(moves) && moves.length === 6 ? moves : [false,false,false,false,false,false];
    const resLines = bl.map((line, idx) => safeMoves[idx] ? (line === 1 ? 0 : 1) : line);
    const result = findHexagramByLines(resLines) || base;

    // 4.6 三極卦 A/B/C（依你附件邏輯）
    const sanjiALines = [bl[0], bl[1], bl[2], bl[1], bl[2], bl[3]];
    const sanjiA = findHexagramByLines(sanjiALines);

    const sanjiBLines = [bl[1], bl[2], bl[3], bl[2], bl[3], bl[4]];
    const sanjiB = findHexagramByLines(sanjiBLines);

    const sanjiCLines = [bl[2], bl[3], bl[4], bl[3], bl[4], bl[5]];
    const sanjiC = findHexagramByLines(sanjiCLines);

    // 4.7 動爻爻辭
    const movingLinesText = [];
    safeMoves.forEach((isMoving, idx) => {
      if (isMoving) {
        movingLinesText.push({
          index: idx + 1,
          label: getLineLabel(idx, bl[idx]),
          text: base.linesText[idx]
        });
      }
    });

    // 4.8 統一輸出
    const responseData = {
      base: {
        id: base.id,
        name: base.name,
        symbol: base.symbol,
        upper: base.upper,
        lower: base.lower,
        judgment: base.judgment,
        image: base.image,
        lines: base.lines
      },
      opposite: opposite && {
        id: opposite.id,
        name: opposite.name,
        symbol: opposite.symbol,
        judgment: opposite.judgment
      },
      inverse: inverse && {
        id: inverse.id,
        name: inverse.name,
        symbol: inverse.symbol,
        judgment: inverse.judgment
      },
      mutual: mutual && {
        id: mutual.id,
        name: mutual.name,
        symbol: mutual.symbol,
        judgment: mutual.judgment
      },
      result: result && {
        id: result.id,
        name: result.name,
        symbol: result.symbol,
        judgment: result.judgment
      },
      sanji: {
        A: sanjiA && { id: sanjiA.id, name: sanjiA.name, symbol: sanjiA.symbol, judgment: sanjiA.judgment },
        B: sanjiB && { id: sanjiB.id, name: sanjiB.name, symbol: sanjiB.symbol, judgment: sanjiB.judgment },
        C: sanjiC && { id: sanjiC.id, name: sanjiC.name, symbol: sanjiC.symbol, judgment: sanjiC.judgment }
      },
      movingLinesText
    };

    return res.json(responseData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "伺服器內部演算錯誤" });
  }
});

// 健康檢查
app.get('/', (req, res) => {
  res.send("周易象數分析儀 API 微服務運行中。歡迎接入 Dify 工作流！");
});

app.listen(PORT, () => {
  console.log(`周易象數分析儀微服務已啟動，監聽埠口: ${PORT}`);
});
