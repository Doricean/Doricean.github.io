const { useMemo, useState, useEffect } = React;

// 網路自診模擬（20種<1%版 v1.5）— 可直接部署到 GitHub Pages
// 變更點：
// 1) 僅顯示命中 >=1 的疾病；
// 2) 「詳細機率」→「詳細說明」，並先顯示加長版重症描述；
// 3) 三個機率卡改成再按一次「顯示機率」才展開；
// 4) 疾病中英名稱修正；
// 5) 排序規則維持：命中比例 → 命中個數 → 成年人盛行率。

function App() {
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState("select");
  const [showProb, setShowProb] = useState(false);
  const [results, setResults] = useState([]);
  const [openDetail, setOpenDetail] = useState({});   // 詳細說明展開狀態
  const [openProbs, setOpenProbs] = useState({});     // 機率卡展開狀態
  const delayMs = 2000; // 固定 2 秒
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
    () => Object.fromEntries(symptoms.map((s) => [s.id, s.name])),
    [symptoms]
  );

  // 20 種（成人盛行率 < 1%）
  // shortDesc / longDesc 文字根據權威醫療來源整理濃縮（見文末引用）
  const conditions = useMemo(
    () => [
      {
        id: "celiac",
        name: "乳糜瀉（Celiac disease）",
        match: ["gi", "fatigue", "weight", "sleep"],
        prevalenceP: 0.007,
        cureRateP: 0.7,
        severeAnnualRiskP: 0,
        shortDesc:
          "麩質引發的小腸免疫性損傷，影響吸收、體重與多系統症狀。",
        longDesc:
          "若長期未診斷，腸絨毛持續受損造成營養嚴重缺乏、骨質疏鬆與反覆腹痛腹瀉；極少數難治型可能演變為重度腸病變、反覆住院與危及生命的併發症。"
      },
      {
        id: "ms",
        name: "多發性硬化症（Multiple sclerosis）",
        match: ["headache", "fatigue", "sleep"],
        prevalenceP: 0.0025,
        cureRateP: 0.3,
        severeAnnualRiskP: 0,
        shortDesc:
          "中樞神經脫髓鞘疾病，易反覆復發與逐步進展，影響多種神經功能。",
        longDesc:
          "急性發作時可能突然視力模糊、四肢無力與步態失衡；若反覆累積損害，患者可能出現失禁、吞嚥困難與行動不便，長期依賴他人照護而擔憂下一次失能何時降臨。"
      },
      {
        id: "ra",
        name: "類風濕性關節炎（Rheumatoid arthritis）",
        match: ["neck", "fatigue", "sleep"],
        prevalenceP: 0.0046,
        cureRateP: 0.3,
        severeAnnualRiskP: 0,
        shortDesc:
          "自體免疫多關節炎，亦可累及心、肺、眼與血管。",
        longDesc:
          "未控制的慢性發炎會侵蝕關節、造成永久畸形與劇痛；當合併肺部與心血管併發時，患者可能害怕每一次胸悶或喘促都預示著更嚴重的惡化。"
      },
      {
        id: "sle",
        name: "紅斑性狼瘡（Systemic lupus erythematosus）",
        match: ["chest", "breath", "fatigue", "sleep"],
        prevalenceP: 0.00061,
        cureRateP: 0.5,
        severeAnnualRiskP: 0,
        shortDesc:
          "多器官自體免疫病，表現多變，可能侵犯腎、肺、心臟與中樞神經。",
        longDesc:
          "嚴重時可出現狼瘡腎炎導致腎衰竭、肺出血造成窒息感、心包炎胸痛與中樞神經症狀；患者可能在夜深時驚醒，擔心下一次發作會奪走視力、呼吸或記憶。"
      },
      {
        id: "mg",
        name: "重症肌無力（Myasthenia gravis）",
        match: ["fatigue", "breath", "throat"],
        prevalenceP: 0.00025,
        cureRateP: 0.6,
        severeAnnualRiskP: 0.005,
        shortDesc:
          "神經肌肉接頭傳導受阻，出現易疲勞的肌力無力。",
        longDesc:
          "危象時呼吸肌癱軟，患者在幾分鐘內感到吸不到氣、無法吞嚥與說話，需要插管與加護監護；每次感冒或壓力來臨，都可能引發下一次呼吸衰竭的恐懼。"
      },
      {
        id: "cd",
        name: "克隆氏症（Crohn’s disease）",
        match: ["gi", "fatigue", "weight"],
        prevalenceP: 0.002,
        cureRateP: 0.35,
        severeAnnualRiskP: 0.005,
        shortDesc:
          "可影響全消化道的慢性發炎性腸病。",
        longDesc:
          "重症時腸狹窄阻塞、穿孔、膿瘍或瘻管迫使反覆住院與手術；腹痛讓人不敢進食、體重日益下滑，對「下一次急診」的焦慮成為日常。"
      },
      {
        id: "uc",
        name: "潰瘍性結腸炎（Ulcerative colitis）",
        match: ["gi", "fatigue", "weight"],
        prevalenceP: 0.003,
        cureRateP: 0.35,
        severeAnnualRiskP: 0.003,
        shortDesc:
          "侷限於大腸黏膜的慢性發炎性腸病。",
        longDesc:
          "暴發型可能一日十多次血便、發燒與急速貧血；毒性巨結腸與穿孔可致命。患者常害怕遠離洗手間，每次腹鳴都像倒數到下一次劇痛。"
      },
      {
        id: "meniere",
        name: "梅尼爾氏症（Ménière’s disease）",
        match: ["headache", "fatigue", "sleep"],
        prevalenceP: 0.0019,
        cureRateP: 0.4,
        severeAnnualRiskP: 0,
        shortDesc:
          "內耳液體調節異常，眩暈、耳鳴與波動性聽力損失。",
        longDesc:
          "突如其來的旋轉性眩暈讓房間天旋地轉，伴隨嘔吐與耳鳴；每一次發作都像被奪走重心，擔心聽力會一點一滴不再回來。"
      },
      {
        id: "pots",
        name: "Postural orthostatic tachycardia syndrome（POTS）",
        match: ["headache", "chest", "breath", "fatigue", "sleep"],
        prevalenceP: 0.006,
        cureRateP: 0.5,
        severeAnnualRiskP: 0,
        shortDesc:
          "站立時心跳顯著上升的自主神經失調，影響日常功能。",
        longDesc:
          "雖少致命，但反覆暈眩、腦霧與極度疲倦使人不敢久站、不敢搭車；每次起身都像抽獎，擔心下一秒就會在街頭昏厥。"
      },
      {
        id: "sarcoid",
        name: "結節病（Sarcoidosis）",
        match: ["breath", "chest", "fatigue"],
        prevalenceP: 0.0014,
        cureRateP: 0.6,
        severeAnnualRiskP: 0.004,
        shortDesc:
          "多系統肉芽腫病變，常見於肺與淋巴結，亦可侵犯心臟。",
        longDesc:
          "進展時肺纖維化讓人走幾步就喘；若心臟受累，致命心律不整與猝死風險令人對每一次心悸都心驚膽跳。"
      },
      {
        id: "as",
        name: "僵直性脊椎炎（Ankylosing spondylitis）",
        match: ["neck", "fatigue", "sleep"],
        prevalenceP: 0.004,
        cureRateP: 0.4,
        severeAnnualRiskP: 0.002,
        shortDesc:
          "以脊柱與薦髂關節為主的慢性發炎性關節病。",
        longDesc:
          "未控制者脊柱骨橋連結、胸廓僵硬，彎不下腰也抬不起胸；夜間疼痛把人從睡夢中驚醒，擔心身體正被一點點「鎖死」。"
      },
      {
        id: "ipf",
        name: "特發性肺纖維化（Idiopathic pulmonary fibrosis）",
        match: ["breath", "fatigue", "sleep"],
        prevalenceP: 0.00018,
        cureRateP: 0.1,
        severeAnnualRiskP: 0.1,
        shortDesc:
          "原因不明的進行性肺部纖維化與缺氧。",
        longDesc:
          "呼吸像透過塑膠袋吸氣，行走幾步就胸悶發紫；急性惡化時數週內可陷入致命性低氧，患者害怕每一次咳嗽都是最後的預告。"
      },
      {
        id: "ssc",
        name: "硬皮病（Systemic sclerosis）",
        match: ["neck", "breath", "fatigue"],
        prevalenceP: 0.00018,
        cureRateP: 0.2,
        severeAnnualRiskP: 0.03,
        shortDesc:
          "血管病變與皮膚／內臟纖維化的自體免疫病。",
        longDesc:
          "肺動脈高壓使人稍走即喘；腎危象可在幾天內出現暴走血壓與腎衰竭；手指端壞死讓人不敢碰冷水，每一次刺痛都像提醒身體正被慢慢收緊。"
      },
      {
        id: "phpt",
        name: "原發性副甲狀腺機能亢進（Primary hyperparathyroidism）",
        match: ["fatigue", "neck", "gi"],
        prevalenceP: 0.004,
        cureRateP: 0.95,
        severeAnnualRiskP: 0.001,
        shortDesc:
          "PTH 過多導致高血鈣與骨質流失，腎結石風險上升。",
        longDesc:
          "少數人會出現高鈣危象：極度脫水、心律不整與意識改變；在急診室等待抽血與補液時，患者擔心每一次心悸都可能是最後一次。"
      },
      {
        id: "pbc",
        name: "原發性膽汁性膽管炎（Primary biliary cholangitis）",
        match: ["fatigue", "gi"],
        prevalenceP: 0.00018,
        cureRateP: 0.6,
        severeAnnualRiskP: 0.02,
        shortDesc:
          "膽管自體免疫破壞導致慢性膽汁鬱積與肝臟發炎。",
        longDesc:
          "未控制時逐步進展至肝硬化、門脈高壓與肝衰竭；皮膚癢到夜不能寐，病人擔心每次黃疸加深都意味著離移植更近一步。"
      },
      {
        id: "pe",
        name: "肺栓塞（Pulmonary embolism）",
        match: ["breath", "chest"],
        prevalenceP: 0.0008,
        cureRateP: 0.9,
        severeAnnualRiskP: 0.05,
        shortDesc:
          "血栓阻塞肺動脈的急症，可致命並有長期併發風險。",
        longDesc:
          "大片血栓可在數分鐘內導致致命性低氧與右心衰竭；即使存活，也可能罹患慢性血栓栓塞性肺高壓，日後走幾步就喘。"
      },
      {
        id: "pericarditis",
        name: "急性心包膜炎（Acute pericarditis）",
        match: ["chest", "breath", "throat"],
        prevalenceP: 0.000277,
        cureRateP: 0.85,
        severeAnnualRiskP: 0.01,
        shortDesc:
          "心包發炎引起胸痛；少數併心包填塞或縮窄。",
        longDesc:
          "若出現心包填塞，心臟被液體壓迫無法充盈，血壓驟降、四肢冰冷；患者在救護車上盯著監視器，害怕每一下心跳都比上一下更弱。"
      },
      {
        id: "myocarditis",
        name: "急性心肌炎（Acute myocarditis）",
        match: ["chest", "breath", "fatigue"],
        prevalenceP: 0.0002,
        cureRateP: 0.7,
        severeAnnualRiskP: 0.05,
        shortDesc:
          "心肌發炎導致泵血功能下降與心律不整。",
        longDesc:
          "暴發型可迅速進展為心源性休克、惡性心律不整，需體外循環支持；患者常在夜裡聽著自己的心跳，擔心下一次失拍就是終點。"
      },
      {
        id: "addison",
        name: "愛迪生氏病（Addison’s disease）",
        match: ["fatigue", "weight", "gi", "sleep"],
        prevalenceP: 0.00008,
        cureRateP: 0.9,
        severeAnnualRiskP: 0.01,
        shortDesc:
          "腎上腺皮質荷爾蒙不足的內分泌危症。",
        longDesc:
          "在感染或手術等壓力下可能發生腎上腺危象：極度低血壓、電解質紊亂與休克；病人外出必帶急救針，害怕錯過黃金時間便難以挽回。"
      },
      {
        id: "pa",
        name: "惡性貧血（Pernicious anemia）",
        match: ["fatigue", "headache", "breath"],
        prevalenceP: 0.001,
        cureRateP: 0.9,
        severeAnnualRiskP: 0.001,
        shortDesc:
          "自體免疫造成維生素 B12 吸收不良的巨球性貧血。",
        longDesc:
          "延誤治療可出現周邊神經病變與脊髓變性，走路發飄、麻木刺痛甚至記憶混亂；部分神經傷害可能無法完全逆轉。"
      },
      {
        id: "vm",
        name: "前庭性偏頭痛（Vestibular migraine）",
        match: ["headache", "fatigue", "sleep"],
        prevalenceP: 0.009,
        cureRateP: 0.5,
        severeAnnualRiskP: 0.0001,
        shortDesc:
          "以眩暈／不穩為主的偏頭痛譜系疾患。",
        longDesc:
          "發作時強烈旋轉感、畏光畏聲與步態不穩，患者不敢獨自外出，擔心在樓梯或捷運上失去平衡而跌倒。"
      }
    ],
    []
  );

  function analyze() {
    if (selected.length === 0) {
      alert("請先勾選至少 1 個症狀。");
      return;
    }
    setPhase("thinking");
    setOpenDetail({});
    setOpenProbs({});

    const scoredAll = conditions
      .map((c) => {
        const hits = c.match.filter((m) => selected.includes(m));
        const ratio = c.match.length > 0 ? hits.length / c.match.length : 0;
        return { ...c, hits, ratio };
      })
      // 只保留至少命中 1 個症狀
      .filter((c) => c.hits.length >= 1)
      // 排序：命中比例 → 命中個數 → 成年人盛行率
      .sort(
        (a, b) =>
          b.ratio - a.ratio ||
          b.hits.length - a.hits.length ||
          (b.prevalenceP || 0) - (a.prevalenceP || 0)
      )
      .slice(0, 5);

    setResults(scoredAll);
    setRevealCount(0);
    setShowProb(false);

    window.setTimeout(() => {
      setShowProb(true);
      let i = 0;
      const t = setInterval(() => {
        i += 1;
        setRevealCount((prev) => Math.min(scoredAll.length, prev + 1));
        if (i >= scoredAll.length) clearInterval(t);
      }, 220);
    }, delayMs);
  }

  function resetAll() {
    setSelected([]);
    setResults([]);
    setOpenDetail({});
    setOpenProbs({});
    setRevealCount(0);
    setPhase("select");
    setShowProb(false);
  }

  function toggleSymptom(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            網路自診模擬
          </h1>
        </header>

        {phase === "select" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold mb-3">
              請勾選最近出現過的症狀
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {symptoms.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer select-none transition ${
                    selected.includes(s.id)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggleSymptom(s.id)}
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

        {phase !== "select" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">你可能確診了...</h2>
              {phase === "thinking" && !showProb && (
                <span className="text-xs text-gray-500">正在估算機率…</span>
              )}
            </div>

            {phase === "thinking" && !showProb && <Progress ms={delayMs} />}

            <ul className="mt-3 space-y-2">
              {results.map((r, i) => (
                <li
                  key={r.id}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                  style={{
                    opacity: i < revealCount ? 1 : 0,
                    transition: "opacity 500ms ease",
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-medium">
                      {i + 1}. {r.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      命中症狀：{r.hits.length} / {r.match.length}（
                      {r.hits.map((id) => symptomDict[id]).join("、")}）
                    </div>
                  </div>

                  {/* 簡短說明 */}
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                    {r.shortDesc}
                  </p>

                  {showProb ? (
                    <div className="mt-2">
                      {/* 詳細說明切換 */}
                      <button
                        className="w-full text-left text-sm flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                        onClick={() =>
                          setOpenDetail((o) => ({ ...o, [r.id]: !o[r.id] }))
                        }
                        aria-expanded={!!openDetail[r.id]}
                      >
                        <span className="font-medium">詳細說明</span>
                        <span
                          className={`transition-transform ${
                            openDetail[r.id] ? "rotate-180" : ""
                          }`}
                        >
                          ▾
                        </span>
                      </button>

                      {openDetail[r.id] && (
                        <div className="mt-2">
                          {/* 長說明（強化重症病程的文字） */}
                          <div className="p-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 leading-relaxed">
                            {r.longDesc}
                          </div>

                          {/* 機率卡再按一次才展開 */}
                          <div className="mt-2">
                            <button
                              className="w-full text-left text-sm flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                              onClick={() =>
                                setOpenProbs((o) => ({
                                  ...o,
                                  [r.id]: !o[r.id],
                                }))
                              }
                              aria-expanded={!!openProbs[r.id]}
                            >
                              <span className="font-medium">顯示機率</span>
                              <span
                                className={`transition-transform ${
                                  openProbs[r.id] ? "rotate-180" : ""
                                }`}
                              >
                                ▾
                              </span>
                            </button>

                            {openProbs[r.id] && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                <ProbBox label="成年人盛行率" value={r.prevalenceP} />
                                <ProbBox label="痊癒/良好控制率" value={r.cureRateP} />
                                <ProbBox label="重症/死亡風險" value={r.severeAnnualRiskP} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      即將顯示數值…
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setPhase("select");
                  setOpenDetail({});
                  setOpenProbs({});
                }}
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
  const showOneIn = !(label && label.includes("痊癒"));
  return (
    <div className="p-2 rounded-lg bg-white border border-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-base font-semibold">
        {pctStr}
        {showOneIn && oneInStr ? `（1/${oneInStr}）` : ""}
      </div>
    </div>
  );
}

// 小機率以第一位有效數字；整數百分比移除 .0 → 顯示為 50%
function toPretty(v) {
  if (v == null) return { pctStr: "—", oneInStr: "" };
  if (v === 0) return { pctStr: "≈0", oneInStr: "" };
  if (v < 0) return { pctStr: "—", oneInStr: "" };
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
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(
      () => setElapsed(Math.min(Date.now() - start, ms)),
      50
    );
    return () => clearInterval(t);
  }, [ms]);
  const w = `${Math.round((elapsed / ms) * 100)}%`;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-xl overflow-hidden">
      <div className="h-2 bg-gray-600" style={{ width: w }} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
