// CDN + Babel 版本：不要 import / export；React/ReactDOM 取自全域
const { useMemo, useState, useEffect } = React;

// 單檔 React 應用：網路自診模擬（20種<1%版 v1.4.1 修正：CDN/3秒延遲/Tailwind）
function App() {
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState("select");
  const [showProb, setShowProb] = useState(false);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState({});
  const delayMs = 3000; // 固定 3 秒（依你的需求）
  const [revealCount, setRevealCount] = useState(0);

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

  const symptomDict = useMemo(
    () => Object.fromEntries(symptoms.map(s => [s.id, s.name])),
    [symptoms]
  );

  // 20 種（成人盛行率 < 1%）
  const conditions = useMemo(
    () => [
      { id: 'celiac', name: '乳糜瀉（Celiac disease）', match: ['gi','fatigue','weight','sleep'], prevalenceP: 0.007, cureRateP: 0.7, severeAnnualRiskP: 0, notes: {} },
      { id: 'ms', name: '多發性硬化（Multiple sclerosis）', match: ['headache','fatigue','sleep'], prevalenceP: 0.0025, cureRateP: 0.3, severeAnnualRiskP: 0, notes: {} },
      { id: 'ra', name: '類風濕性關節炎（RA）', match: ['neck','fatigue','sleep'], prevalenceP: 0.0046, cureRateP: 0.3, severeAnnualRiskP: 0, notes: {} },
      { id: 'sle', name: '系統性紅斑狼瘡（SLE）', match: ['chest','breath','fatigue','sleep'], prevalenceP: 0.00061, cureRateP: 0.5, severeAnnualRiskP: 0, notes: {} },
      { id: 'mg', name: '重症肌無力（MG）', match: ['fatigue','breath','throat'], prevalenceP: 0.00025, cureRateP: 0.6, severeAnnualRiskP: 0.005, notes: {} },
      { id: 'cd', name: '克隆氏症（Crohn’s disease）', match: ['gi','fatigue','weight'], prevalenceP: 0.002, cureRateP: 0.35, severeAnnualRiskP: 0.005, notes: {} },
      { id: 'uc', name: '潰瘍性結腸炎（UC）', match: ['gi','fatigue','weight'], prevalenceP: 0.003, cureRateP: 0.35, severeAnnualRiskP: 0.003, notes: {} },
      { id: 'meniere', name: '美尼爾氏症（Ménière’s）', match: ['headache','fatigue','sleep'], prevalenceP: 0.0019, cureRateP: 0.4, severeAnnualRiskP: 0, notes: {} },
      { id: 'pots', name: '姿勢性心搏過速症候群（POTS）', match: ['headache','chest','breath','fatigue','sleep'], prevalenceP: 0.006, cureRateP: 0.5, severeAnnualRiskP: 0, notes: {} },
      { id: 'sarcoid', name: '薩可伊德症（Sarcoidosis）', match: ['breath','chest','fatigue'], prevalenceP: 0.0014, cureRateP: 0.6, severeAnnualRiskP: 0.004, notes: {} },
      { id: 'axspa', name: '僵直性脊椎炎譜系（SpA/AS）', match: ['neck','fatigue','sleep'], prevalenceP: 0.004, cureRateP: 0.4, severeAnnualRiskP: 0.002, notes: {} },
      { id: 'ipf', name: '特發性肺纖維化（IPF）', match: ['breath','fatigue','sleep'], prevalenceP: 0.00018, cureRateP: 0.1, severeAnnualRiskP: 0.1, notes: {} },
      { id: 'ssc', name: '系統性硬化症（SSc）', match: ['neck','breath','fatigue'], prevalenceP: 0.00018, cureRateP: 0.2, severeAnnualRiskP: 0.03, notes: {} },
      { id: 'phpt', name: '原發性副甲狀腺機能亢進（PHPT）', match: ['fatigue','neck','gi'], prevalenceP: 0.004, cureRateP: 0.95, severeAnnualRiskP: 0.001, notes: {} },
      { id: 'pbc', name: '原發性膽汁性膽管炎（PBC）', match: ['fatigue','gi'], prevalenceP: 0.00018, cureRateP: 0.6, severeAnnualRiskP: 0.02, notes: {} },
      { id: 'pe', name: '肺栓塞（PE，年發生）', match: ['breath','chest'], prevalenceP: 0.0008, cureRateP: 0.9, severeAnnualRiskP: 0.05, notes: {} },
      { id: 'pericarditis', name: '急性心包膜炎（年發生）', match: ['chest','breath','throat'], prevalenceP: 0.000277, cureRateP: 0.85, severeAnnualRiskP: 0.01, notes: {} },
      { id: 'myocarditis', name: '急性心肌炎（年發生）', match: ['chest','breath','fatigue'], prevalenceP: 0.0002, cureRateP: 0.7, severeAnnualRiskP: 0.05, notes: {} },
      { id: 'addison', name: '愛迪生氏病', match: ['fatigue','weight','gi','sleep'], prevalenceP: 0.00008, cureRateP: 0.9, severeAnnualRiskP: 0.01, notes: {} },
      { id: 'pa', name: '惡性貧血（Pernicious anemia）', match: ['fatigue','headache','breath'], prevalenceP: 0.001, cureRateP: 0.9, severeAnnualRiskP: 0.001, notes: {} },
      { id: 'vm', name: '前庭性偏頭痛（Vestibular migraine）', match: ['headache','fatigue','sleep'], prevalenceP: 0.009, cureRateP: 0.5, severeAnnualRiskP: 0.0001, notes: {} },
    ],
    []
  );

  function analyze() {
    if (selected.length === 0) {
      alert('請先勾選至少 1 個症狀。');
      return;
    }
    setPhase('thinking');
    setOpen({});
    const scored = conditions
      .map(c => {
        const hits = c.match.filter(m => selected.includes(m));
        const ratio = c.match.length ? hits.length / c.match.length : 0;
        return { ...c, hits, ratio };
      })
      .sort((a, b) => b.ratio - a.ratio || (b.prevalenceP || 0) - (a.prevalenceP || 0))
      .slice(0, 5);

    setResults(scored);
    setRevealCount(0);
    setShowProb(false);

    window.setTimeout(() => {
      setShowProb(true);
      let i = 0;
      const t = setInterval(() => {
        i += 1;
        setRevealCount(prev => Math.min(scored.length, prev + 1));
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
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
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
              {symptoms.map(s => (
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
                        onClick={() => setOpen(o => ({ ...o, [r.id]: !o[r.id] }))}
                        aria-expanded={!!open[r.id]}
                      >
                        <span className="font-medium">詳細機率</span>
                        <span className={`transition-transform ${open[r.id] ? 'rotate-180' : ''}`}>▾</span>
                      </button>

                      {open[r.id] && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                          <ProbBox label="成年人盛行率" value={r.prevalenceP} />
                          <ProbBox label="痊癒/良好控制率" value={r.cureRateP} />
                          <ProbBox label="重症/死亡風險" value={r.severeAnnualRiskP} />
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
                onClick={() => { setPhase('select'); setOpen({}); }}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-sm bg-white hover:bg-gray-50"
              >
                重新診斷
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ProbBox({ label, value }) {
  const { pctStr, oneInStr } = toPretty(value);
  const showOneIn = !(label && label.includes('痊癒'));
  return (
    <div className="p-2 rounded-lg bg-white border border-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-base font-semibold">{pctStr}{showOneIn && oneInStr ? `（1/${oneInStr}）` : ''}</div>
    </div>
  );
}

function toPretty(v) {
  if (v == null) return { pctStr: '—', oneInStr: '' };
  if (v === 0) return { pctStr: '≈0', oneInStr: '' };
  if (v < 0) return { pctStr: '—', oneInStr: '' };
  const oneIn = Math.max(1, Math.round(1 / v));
  const pct = v * 100;
  let decimals = 1;
  if (pct > 0 && pct < 1) {
    let t = pct;
    decimals = 0;
    while (t < 1) {
      t *= 10;
      decimals += 1;
      if (decimals > 6) break;
    }
  }
  let pctFixed = pct.toFixed(Math.max(1, decimals));
  if (/\.0$/.test(pctFixed)) pctFixed = pctFixed.slice(0, -2); // 50.0 → 50
  const pctStr = `${pctFixed}%`;
  return { pctStr, oneInStr: `${oneIn}` };
}

function Progress({ ms }) {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
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

// React 18 掛載
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
