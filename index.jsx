import React, { useMemo, useState, useEffect } from "react";

// 單檔 React 應用：網路自診模擬（20種<1%版 v1.3）
// 變更：
// - 修正排序：依「命中比例」為主排序（相同時以盛行率做次序）
// - 在命中數旁顯示命中的「症狀名稱清單」
// - 標題文字：結果區維持「你可能確診了...」
// - 淡入顯示：估算完成後逐一淡入
// - 標籤更名：
//   「成年人盛行率 / 年發生率」→「成年人盛行率」
//   「痊癒/緩解或良好控制」→「痊癒/良好控制率」
//   「年重症/死亡風險」→「重症/死亡風險」

export default function App() {
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState("select");
  const [showProb, setShowProb] = useState(false);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState({});
  const delayMs = 3000; // 固定 3 秒
  const [revealCount, setRevealCount] = useState(0); // 淡入數量

  // 9 個症狀
  const symptoms = useMemo(
    () => [
      { id: "headache", name: "頭痛或頭暈" },
      { id: "chest", name: "胸悶或心悸" },
      { id: "throat", name: "喉嚨痛" },
      { id: "neck", name: "肩頸痠痛" },
      { id: "breath", name: "容易喘" },
      { id: "fatigue", name: "容易疲倦" },
      { id: "weight", name: "體重改變" },
      { id: "sleep", name: "睡眠品質差" },
      { id: "gi", name: "腸胃不適" },
    ],
    []
  );

  // 症狀 id -> 顯示名稱
  const symptomDict = useMemo(() => Object.fromEntries(symptoms.map(s => [s.id, s.name])), [symptoms]);

  // ===== 真實資料庫（成人盛行率 < 1%） =====
  const conditions = useMemo(
    () => [
      { id: 'celiac', name: '乳糜瀉（Celiac disease）', match: ['gi','fatigue','weight','sleep'], prevalenceP: 0.007, cureRateP: 0.7, severeAnnualRiskP: null, notes: { prevalence: '全球活體切片確診盛行約 0.7%。', control: '嚴格無麩質飲食後多數症狀緩解；黏膜癒合率約 60–90%。', severe: '未診斷/未治療長期有營養不良與併發症風險。' } },
      { id: 'ms', name: '多發性硬化（Multiple sclerosis）', match: ['headache','fatigue','sleep'], prevalenceP: 0.0025, cureRateP: 0.3, severeAnnualRiskP: null, notes: { prevalence: '成人盛行約 0.16–0.38%；此處取 0.25%。', control: '疾病修飾治療可降低復發與延緩進展；「無疾病活動」比例依藥物而異。', severe: '全因死亡風險高於一般人，但較以往改善。' } },
      { id: 'ra', name: '類風濕性關節炎（RA）', match: ['neck','fatigue','sleep'], prevalenceP: 0.0046, cureRateP: 0.3, severeAnnualRiskP: null, notes: { prevalence: '全球盛行約 0.46%。', control: '臨床緩解比例依策略約 10–40%。', severe: '未治療可致失能與心血管風險上升。' } },
      { id: 'sle', name: '系統性紅斑狼瘡（SLE）', match: ['chest','breath','fatigue','sleep'], prevalenceP: 0.00061, cureRateP: 0.5, severeAnnualRiskP: null, notes: { prevalence: '成人盛行中位 ~61/10萬（0.061%）。', control: '5 年存活率 >90–95%；可達低病活/緩解。', severe: '嚴重心腎肺受累提高死亡風險。' } },
      { id: 'mg', name: '重症肌無力（MG）', match: ['fatigue','breath','throat'], prevalenceP: 0.00025, cureRateP: 0.6, severeAnnualRiskP: null, notes: { prevalence: '盛行約 25/10萬。', control: '多數可藥物控制至最小症狀或藥物緩解。', severe: '呼吸肌受累可出現危象（需加護）。' } },
      { id: 'cd', name: '克隆氏症（Crohn’s disease）', match: ['gi','fatigue','weight'], prevalenceP: 0.002, cureRateP: 0.35, severeAnnualRiskP: null, notes: { prevalence: '成人盛行多在 0.15–0.3%；取 0.2%。', control: '生物製劑/小分子維持期緩解約 20–45%。', severe: '併狹窄/瘻管需手術；癌症風險升。' } },
      { id: 'uc', name: '潰瘍性結腸炎（UC）', match: ['gi','fatigue','weight'], prevalenceP: 0.003, cureRateP: 0.35, severeAnnualRiskP: null, notes: { prevalence: '成人盛行約 0.2–0.5%；取 0.3%。', control: '維持期臨床緩解 27–42%。', severe: '嚴重發作需住院；結腸癌長期風險升。' } },
      { id: 'meniere', name: '美尼爾氏症（Ménière’s）', match: ['headache','fatigue','sleep'], prevalenceP: 0.0019, cureRateP: 0.4, severeAnnualRiskP: null, notes: { prevalence: '理賠/行政資料推估約 190/10萬。', control: '藥物+生活調整可減少發作；病程具變異。', severe: '影響生活品質，生命威脅低。' } },
      { id: 'pots', name: '姿勢性心搏過速症候群（POTS）', match: ['headache','chest','breath','fatigue','sleep'], prevalenceP: 0.006, cureRateP: 0.5, severeAnnualRiskP: null, notes: { prevalence: '估計 0.2–1%；取 0.6%。', control: '非藥物+藥物可改善功能。', severe: '直接致命風險低。' } },
      { id: 'sarcoid', name: '薩可伊德症（Sarcoidosis）', match: ['breath','chest','fatigue'], prevalenceP: 0.0014, cureRateP: 0.6, severeAnnualRiskP: null, notes: { prevalence: '多國盛行 40–230/10萬；取 140/10萬。', control: '不少病例可自行緩解或以免疫治療控制。', severe: '心肺/神經受累時風險升。' } },
      { id: 'axspa', name: '僵直性脊椎炎譜系（SpA/AS）', match: ['neck','fatigue','sleep'], prevalenceP: 0.004, cureRateP: 0.4, severeAnnualRiskP: null, notes: { prevalence: '盛行約 0.2–0.6%；取 0.4%。', control: '生物製劑改善疼痛與功能。', severe: '進展性僵硬帶來功能限制。' } },
      { id: 'ipf', name: '特發性肺纖維化（IPF）', match: ['breath','fatigue','sleep'], prevalenceP: 0.00018, cureRateP: 0.1, severeAnnualRiskP: 0.1, notes: { prevalence: '盛行約 15–52/10萬；取 18/10萬。', control: '抗纖維化藥可延緩惡化。', severe: '進展性呼吸衰竭，死亡風險高（示例以 10%/年顯示量級）。' } },
      { id: 'ssc', name: '系統性硬化症（SSc）', match: ['neck','breath','fatigue'], prevalenceP: 0.00018, cureRateP: 0.2, severeAnnualRiskP: 0.03, notes: { prevalence: '盛行約 17–26/10萬；取 18/10萬。', control: '器官導向治療可延緩進展。', severe: '死亡率高於一般人（此處以 3%/年呈現量級）。' } },
      { id: 'phpt', name: '原發性副甲狀腺機能亢進（PHPT）', match: ['fatigue','neck','gi'], prevalenceP: 0.004, cureRateP: 0.95, severeAnnualRiskP: 0.001, notes: { prevalence: '一般成人約 1–7/1000；取 4/1000。', control: '手術多可治癒。', severe: '高鈣相關併發症（此處以 0.1%/年呈現量級）。' } },
      { id: 'pbc', name: '原發性膽汁性膽管炎（PBC）', match: ['fatigue','gi'], prevalenceP: 0.00018, cureRateP: 0.6, severeAnnualRiskP: 0.02, notes: { prevalence: '全球盛行約 18/10萬。', control: 'UDCA/二線藥物可延緩進展。', severe: '進展至肝硬化/肝衰風險（示例 2%/年量級）。' } },
      { id: 'pe', name: '肺栓塞（PE，年發生）', match: ['breath','chest'], prevalenceP: 0.0008, cureRateP: 0.9, severeAnnualRiskP: 0.05, notes: { prevalence: '年發生率約 39–115/10萬（此處 80/10萬）。', control: '抗凝治療可顯著降低死亡與再發。', severe: '院內死亡率約 4–10%，取 5%。' } },
      { id: 'pericarditis', name: '急性心包膜炎（年發生）', match: ['chest','breath','throat'], prevalenceP: 0.000277, cureRateP: 0.85, severeAnnualRiskP: 0.01, notes: { prevalence: '西方年發生率約 27.7/10萬。', control: 'NSAIDs+秋水仙素大多有效；復發率 15–30%。', severe: '少數併心包填塞或縮窄性心包炎（約 1%/年量級）。' } },
      { id: 'myocarditis', name: '急性心肌炎（年發生）', match: ['chest','breath','fatigue'], prevalenceP: 0.0002, cureRateP: 0.7, severeAnnualRiskP: 0.05, notes: { prevalence: '年發生約 10–22/10萬。', control: '多數可恢復；少數轉擴張型心肌病。', severe: '事件期死亡或重症心衰（此處 5%/年量級，用於顯示）。' } },
      { id: 'addison', name: '愛迪生氏病（原發性腎上腺皮質機能低下）', match: ['fatigue','weight','gi','sleep'], prevalenceP: 0.00008, cureRateP: 0.9, severeAnnualRiskP: 0.01, notes: { prevalence: '盛行 4–15/10萬；取 8/10萬。', control: '長期替代治療可維持生活品質。', severe: '腎上腺危象風險（約 1%/年等級）。' } },
      { id: 'pa', name: '惡性貧血（Pernicious anemia）', match: ['fatigue','headache','breath'], prevalenceP: 0.001, cureRateP: 0.9, severeAnnualRiskP: 0.001, notes: { prevalence: '成人約 0.1%，高齡更常見。', control: 'B12 補充可逆轉血球/神經症狀。', severe: '未治療有神經併發與心血管風險（此處 0.1%/年示量）。' } },
      { id: 'vm', name: '前庭性偏頭痛（Vestibular migraine）', match: ['headache','fatigue','sleep'], prevalenceP: 0.009, cureRateP: 0.5, severeAnnualRiskP: 0.0001, notes: { prevalence: '流病估計接近 1%（此處 0.9%）。', control: '預防性藥物與生活調整可減少發作。', severe: '生命威脅極低（此處 0.01%/年作為顯示量級）。' } },
    ],
    []
  );

  function analyze() {
    if (selected.length === 0) {
      alert('請先勾選至少 1 個症狀。');
      return;
    }
    setPhase('thinking');

    const scored = conditions
      .map((c) => {
        const hits = c.match.filter((m) => selected.includes(m));
        const ratio = c.match.length > 0 ? hits.length / c.match.length : 0;
        return { ...c, hits, ratio };
      })
      // 依命中比例排序，並以盛行率作次序
      .sort((a, b) => b.ratio - a.ratio || (b.prevalenceP || 0) - (a.prevalenceP || 0))
      .slice(0, 5);

    setResults(scored);
    setRevealCount(0);
    setShowProb(false);
    window.setTimeout(() => {
      setShowProb(true);
      // 估算完成後，依序淡入
      let i = 0;
      const t = setInterval(() => {
        i += 1;
        setRevealCount((prev) => Math.min(scored.length, prev + 1));
        if (i >= scored.length) clearInterval(t);
      }, 220);
    }, delayMs);
  }

  function resetAll() {
    setSelected([]);
    setResults([]);
    setOpen({});
    setRevealCount(0);
    setPhase('select');
    setShowProb(false);
  }

  function toggle(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">網路自診模擬</h1>
        </header>

        {phase === 'select' && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold mb-3">請勾選最近出現過的症狀</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {symptoms.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer select-none transition ${
                    selected.includes(s.id)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggle(s.id)}
                    className="accent-gray-900 w-4 h-4"
                  />
                  <span className="text-sm font-medium">{s.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={resetAll}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-sm bg-white hover:bg-gray-50"
              >
                重設
              </button>
              <button
                onClick={analyze}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm shadow hover:opacity-90"
              >
                開始診斷
              </button>
            </div>
          </section>
        )}

        {phase !== 'select' && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">你可能確診了...</h2>
              {phase === 'thinking' && !showProb && (
                <span className="text-xs text-gray-500">正在估算機率…</span>
              )}
            </div>

            {phase === 'thinking' && !showProb && <Progress ms={delayMs} />}

            <ul className="mt-3 space-y-2">
              {results.map((r, i) => (
                <li
                  key={r.id}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                  style={{ opacity: i < revealCount ? 1 : 0, transition: 'opacity 500ms ease' }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-medium">{i + 1}. {r.name}</div>
                    <div className="text-xs text-gray-500">
                      命中症狀：{r.hits.length} / {r.match.length}（{r.hits.map(id => symptomDict[id]).join('、')}）
                    </div>
                  </div>

                  {showProb ? (
                    <div className="mt-2">
                      <button
                        className="w-full text-left text-sm flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                        onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                        aria-expanded={!!open[r.id]}
                      >
                        <span className="font-medium">詳細機率與說明</span>
                        <span className={`transition-transform ${open[r.id] ? 'rotate-180' : ''}`}>▾</span>
                      </button>

                      {open[r.id] && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                          <ProbBlock label="成年人盛行率" value={r.prevalenceP} />
                          <ProbBlock label="痊癒/良好控制率" value={r.cureRateP} />
                          <ProbBlock label="重症/死亡風險" value={r.severeAnnualRiskP} />
                          <div className="md:col-span-3 p-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 leading-relaxed">
                            <div>說明：</div>
                            <ul className="list-disc list-inside space-y-1">
                              <li>{r.notes?.prevalence}</li>
                              <li>{r.notes?.control}</li>
                              <li>{r.notes?.severe}</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">即將顯示數值…</div>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setPhase('select')}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-sm bg-white hover:bg-gray-50"
              >
                回到症狀選擇
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ProbBlock({ label, value }) {
  const { pct, oneIn } = toPretty(value);
  return (
    <div className="p-2 rounded-lg bg-white border border-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-base font-semibold">{value == null ? '—' : `${pct}%（約 1/${oneIn}）`}</div>
    </div>
  );
}

function toPretty(v) {
  if (v == null || v <= 0) return { pct: '\u2014', oneIn: '\u2014' };
  const pct = Math.round(v * 1000) / 10; // 1 位小數
  const oneIn = Math.max(1, Math.round(1 / v));
  return { pct, oneIn };
}

function Progress({ ms }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => setElapsed(Math.min(Date.now() - start, ms)), 50);
    return () => clearInterval(t);
  }, [ms]);
  const w = `${Math.round((elapsed / ms) * 100)}%`;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-xl overflow-hidden">
      <div className="h-2 bg-gray-600" style={{ width: w }} />
    </div>
  );
}
