const { useMemo, useState, useEffect } = React;

// 20種<1% 版 v1.7-加粗重症（部署 index.jsx）
// 變更：將「病程概述」中的嚴重/危急片段加粗（<strong>）

function App() {
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState("select");
  const [showProb, setShowProb] = useState(false);
  const [results, setResults] = useState([]);
  const [openDetail, setOpenDetail] = useState({});
  const [openProbs, setOpenProbs] = useState({});
  const delayMs = 2000;
  const [revealCount, setRevealCount] = useState(0);

  const symptoms = useMemo(
    () => [
      { id: "headache", name: "頭痛或頭暈" },
      { id: "chest",   name: "胸悶或心悸" },
      { id: "throat",  name: "喉嚨痛" },
      { id: "neck",    name: "肩頸痠痛" },
      { id: "breath",  name: "容易喘" },
      { id: "fatigue", name: "容易疲倦" },
      { id: "weight",  name: "體重改變" },
      { id: "sleep",   name: "睡眠品質差" },
      { id: "gi",      name: "腸胃不適" },
    ],
    []
  );

  const symptomDict = useMemo(
    () => Object.fromEntries(symptoms.map((s) => [s.id, s.name])),
    [symptoms]
  );

  const conditions = useMemo(
    () => [
      {
        id: 'celiac',
        name: '乳糜瀉（Celiac disease）',
        match: ['gi','fatigue','weight','sleep'],
        prevalenceP: 0.007, cureRateP: 0.7, severeAnnualRiskP: 0,
        shortDesc: '麩質引發的小腸免疫性損傷，影響吸收、體重與多系統症狀。',
        longDescHtml:
          '乳糜瀉是免疫系統對「麩質」產生異常反應，吃進小麥、大麥、黑麥等穀物後，免疫攻擊會破壞小腸絨毛，造成吸收不良。輕則反覆腹瀉、腹脹、體重下降與營養缺乏；<strong>重者可能出現嚴重鐵缺乏性貧血、骨質疏鬆、電解質失衡、神經病變</strong>，長期未控制會顯著影響兒童生長與成人體力，甚至增加某些腸道惡性疾病風險。典型情境是：日常飲食看似正常，但人愈來愈虛弱、容易疲倦，餐後腹脹像被氣球撐開，肚子痛到彎腰；久而久之<strong>指甲脆裂、頭髮易斷、站起來就暈</strong>。確診仰賴血清抗體與小腸切片，治療核心是嚴格「無麩質飲食」，才可逆轉黏膜受損並降低併發症。'
      },
      {
        id: 'ms',
        name: '多發性硬化症（Multiple sclerosis）',
        match: ['headache','fatigue','sleep'],
        prevalenceP: 0.0025, cureRateP: 0.3, severeAnnualRiskP: 0,
        shortDesc: '中樞神經脫髓鞘疾病，易反覆復發與逐步進展，影響多種神經功能。',
        longDescHtml:
          '多發性硬化症為中樞神經（腦與脊髓）脫髓鞘疾病，症狀可忽好忽壞：視力模糊或視神經痛、手腳無力與麻木、步態不穩、熱會誘發疲勞與症狀惡化。病灶宛如在中樞神經留下一道道「斷裂的訊號路」。部分患者呈「復發—緩解型」，但若控制不佳，可能<strong>逐漸累積殘疾（如步行需輔具、持續性視力/平衡障礙）</strong>。急性期常需類固醇治療，長期則以疾病修飾治療降低復發與新病灶。'
      },
      {
        id: 'ra',
        name: '類風濕性關節炎（Rheumatoid arthritis）',
        match: ['neck','fatigue','sleep'],
        prevalenceP: 0.0046, cureRateP: 0.3, severeAnnualRiskP: 0,
        shortDesc: '自體免疫多關節炎，亦可累及心、肺、眼與血管。',
        longDescHtml:
          '典型為清晨僵硬與對稱性小關節腫痛；未控制的慢性發炎會<strong>侵蝕軟骨與骨端，導致關節變形與功能喪失</strong>，並提高心血管風險。嚴重時連抓握、扣鈕扣都困難，夜間痛醒。及早以 csDMARDs/生物製劑控制，可減少不可逆損傷。'
      },
      {
        id: 'sle',
        name: '紅斑性狼瘡（Systemic lupus erythematosus）',
        match: ['chest','breath','fatigue','sleep'],
        prevalenceP: 0.00061, cureRateP: 0.5, severeAnnualRiskP: 0,
        shortDesc: '多器官自體免疫病，表現多變，可能侵犯腎、肺、心臟與中樞神經。',
        longDescHtml:
          '免疫複合體沉積於器官時，會掀起多系統發炎：<strong>狼瘡腎炎（蛋白尿、腎衰）、胸痛與呼吸困難、劇烈頭痛或癲癇、高燒</strong>。若腎炎延誤治療，可能<strong>進展至腎衰竭</strong>。治療依嚴重度用類固醇、免疫抑制/生物製劑並需防曬與感染管理。'
      },
      {
        id: 'mg',
        name: '重症肌無力（Myasthenia gravis）',
        match: ['fatigue','breath','throat'],
        prevalenceP: 0.00025, cureRateP: 0.6, severeAnnualRiskP: 0.005,
        shortDesc: '神經肌肉接頭傳導受阻，出現易疲勞的肌力無力。',
        longDescHtml:
          '症狀午後或活動後惡化，從眼瞼下垂、複視到吞嚥困難、說話含糊。最危險的是<strong>肌無力危象（呼吸肌受累→呼吸衰竭，需要加護與氣道支持）</strong>。治療含乙醯膽鹼酯酶抑制劑、免疫治療與特定族群胸腺手術。'
      },
      {
        id: 'cd',
        name: '克隆氏症（Crohn’s disease）',
        match: ['gi','fatigue','weight'],
        prevalenceP: 0.002, cureRateP: 0.35, severeAnnualRiskP: 0.005,
        shortDesc: '可影響全消化道的慢性發炎性腸病。',
        longDescHtml:
          '腸壁全層發炎可致<strong>狹窄、瘻管、膿瘍</strong>；重症時因狹窄引發<strong>腸阻塞（絞痛、嘔吐膽汁樣液體、腹脹如鼓）</strong>。反覆發炎與營養不良拖垮體力，必要時需外科處置。'
      },
      {
        id: 'uc',
        name: '潰疡性結腸炎（Ulcerative colitis）',
        match: ['gi','fatigue','weight'],
        prevalenceP: 0.003, cureRateP: 0.35, severeAnnualRiskP: 0.003,
        shortDesc: '侷限於大腸黏膜的慢性發炎性腸病。',
        longDescHtml:
          '嚴重發作時可<strong>血便、腹痛劇烈、頻繁腹瀉</strong>；若發展為<strong>毒性巨結腸（高燒、心跳快、腹脹加劇）</strong>，需緊急處置以免穿孔與敗血。長期反覆發炎也提高大腸癌風險。'
      },
      {
        id: 'meniere',
        name: '梅尼爾氏症（Ménière’s disease）',
        match: ['headache','fatigue','sleep'],
        prevalenceP: 0.0019, cureRateP: 0.4, severeAnnualRiskP: 0,
        shortDesc: '內耳液體調節異常，眩暈、耳鳴與波動性聽力損失。',
        longDescHtml:
          '眩暈發作時世界猛烈旋轉、噁心嘔吐、步履蹣跚；每次可持續數分鐘至 24 小時，長期可能<strong>進行性聽力損失</strong>與工作/生活中斷。若合併<strong>新出現單側耳聾或神經學異常</strong>，需排除其他急症。'
      },
      {
        id: 'pots',
        name: 'Postural orthostatic tachycardia syndrome（POTS）',
        match: ['headache','chest','breath','fatigue','sleep'],
        prevalenceP: 0.006, cureRateP: 0.5, severeAnnualRiskP: 0,
        shortDesc: '站立時心跳顯著上升的自主神經失調，影響日常功能。',
        longDescHtml:
          '站起來後心率顯著上升，常伴頭暈、眼前發黑、心悸、胸悶與疲憊；嚴重時<strong>接近暈厥或跌倒</strong>。雖致命風險低，但病程可長期反覆，對學習與工作衝擊大。'
      },
      {
        id: 'sarcoid',
        name: '結節病（Sarcoidosis）',
        match: ['breath','chest','fatigue'],
        prevalenceP: 0.0014, cureRateP: 0.6, severeAnnualRiskP: 0.004,
        shortDesc: '多系統肉芽腫病變，常見於肺與淋巴結，亦可侵犯心臟。',
        longDescHtml:
          '多數輕微，但若<strong>心臟受累（心律不整、暈厥、猝死）</strong>或<strong>神經系統受累（顏面神經麻痺等）</strong>則風險升高。持續乾咳、活動後喘、視力模糊或胸悶等警訊需儘速評估。'
      },
      {
        id: 'as',
        name: '僵直性脊椎炎（Ankylosing spondylitis）',
        match: ['neck','fatigue','sleep'],
        prevalenceP: 0.004, cureRateP: 0.4, severeAnnualRiskP: 0.002,
        shortDesc: '以脊柱與薦髂關節為主的慢性發炎性關節病。',
        longDescHtml:
          '若長期未控制，關節可能<strong>鈣化「橋接」→脊柱失去彈性，姿勢前屈、轉頭困難</strong>，輕微碰撞也可能引發<strong>撕裂般疼痛或脊柱骨折風險上升</strong>。及早治療可保留活動度。'
      },
      {
        id: 'ipf',
        name: '特發性肺纖維化（Idiopathic pulmonary fibrosis）',
        match: ['breath','fatigue','sleep'],
        prevalenceP: 0.00018, cureRateP: 0.1, severeAnnualRiskP: 0.1,
        shortDesc: '原因不明的進行性肺部纖維化與缺氧。',
        longDescHtml:
          '肺泡壁被纖維化取代，像把海綿變成硬疤網。後期即使走幾步也氣促、夜間需氧氣。<strong>急性惡化（AE-IPF）時可在數日內出現重度缺氧，需高濃度氧氣、可能進入加護或呼吸器支持</strong>。'
      },
      {
        id: 'ssc',
        name: '硬皮病（Systemic sclerosis）',
        match: ['neck','breath','fatigue'],
        prevalenceP: 0.00018, cureRateP: 0.2, severeAnnualRiskP: 0.03,
        shortDesc: '血管病變與皮膚/內臟纖維化的自體免疫病。',
        longDescHtml:
          '皮膚/內臟過度纖維化，<strong>肺動脈高壓或間質肺病→進行性呼吸困難</strong>；嚴重者<strong>心、腎受累</strong>，影響存活。對患者來說像穿上愈來愈緊的盔甲，連握筆、系鞋帶都疼痛吃力。'
      },
      {
        id: 'phpt',
        name: '原發性副甲狀腺機能亢進（Primary hyperparathyroidism）',
        match: ['fatigue','neck','gi'],
        prevalenceP: 0.004, cureRateP: 0.95, severeAnnualRiskP: 0.001,
        shortDesc: 'PTH 過多導致高血鈣與骨質流失，腎結石風險上升。',
        longDescHtml:
          '出現經典「骨痛、腎石、腹痛、精神症狀」。嚴重高鈣時可<strong>脫水、心律異常、意識改變</strong>，危險時需緊急處置。多屬單顆腺瘤，手術常可治癒。'
      },
      {
        id: 'pbc',
        name: '原發性膽汁性膽管炎（Primary biliary cholangitis）',
        match: ['fatigue','gi'],
        prevalenceP: 0.00018, cureRateP: 0.6, severeAnnualRiskP: 0.02,
        shortDesc: '膽管自體免疫破壞導致慢性膽汁鬱積與肝臟發炎。',
        longDescHtml:
          '早期以<strong>難以忽視的疲倦與全身性搔癢</strong>為主；後期可見<strong>黃疸、營養缺乏、進展至肝硬化與門脈高壓</strong>。需長期追蹤肝功能並早期介入治療。'
      },
      {
        id: 'pe',
        name: '肺栓塞（Pulmonary embolism）',
        match: ['breath','chest'],
        prevalenceP: 0.0008, cureRateP: 0.9, severeAnnualRiskP: 0.05,
        shortDesc: '血栓阻塞肺動脈的急症，可致命並有長期併發風險。',
        longDescHtml:
          '從不明原因的氣促、吸氣加劇的胸痛、心跳快到<strong>咳血、暈厥、休克</strong>。<strong>巨大栓塞可迅速致命</strong>，需立刻急診評估與抗凝/溶栓或介入治療。'
      },
      {
        id: 'pericarditis',
        name: '急性心包膜炎（Acute pericarditis）',
        match: ['chest','breath','throat'],
        prevalenceP: 0.000277, cureRateP: 0.85, severeAnnualRiskP: 0.01,
        shortDesc: '心包發炎引起胸痛；少數併心包填塞或縮窄。',
        longDescHtml:
          '胸痛尖銳刺痛，坐起前傾可緩解、平躺或吸氣加重。若心包積液<strong>迅速累積形成心包填塞（血壓下降、頸靜脈怒張、心音變弱）</strong>，需緊急處置以免循環崩潰。'
      },
      {
        id: 'myocarditis',
        name: '急性心肌炎（Acute myocarditis）',
        match: ['chest','breath','fatigue'],
        prevalenceP: 0.0002, cureRateP: 0.7, severeAnnualRiskP: 0.05,
        shortDesc: '心肌發炎導致泵血功能下降與心律不整。',
        longDescHtml:
          '從胸痛、心悸、氣促到<strong>惡化為心衰竭或致命性心律不整</strong>。少數病人進展快速，如同心臟被「熄火」，需<strong>強心、機械循環輔助甚至移植</strong>。'
      },
      {
        id: 'addison',
        name: '愛迪生氏病（Addison’s disease）',
        match: ['fatigue','weight','gi','sleep'],
        prevalenceP: 0.00008, cureRateP: 0.9, severeAnnualRiskP: 0.01,
        shortDesc: '腎上腺皮質荷爾蒙不足的內分泌危症。',
        longDescHtml:
          '最危險的是<strong>腎上腺危象（劇烈嘔吐、腹痛、低血壓、電解質紊亂與休克）</strong>，需即刻補液與類固醇救命。長期以荷爾蒙替代與「壓力劑量」調整避免危象。'
      },
      {
        id: 'pa',
        name: '惡性貧血（Pernicious anemia）',
        match: ['fatigue','headache','breath'],
        prevalenceP: 0.001, cureRateP: 0.9, severeAnnualRiskP: 0.001,
        shortDesc: '自體免疫造成維生素 B12 吸收不良的巨球性貧血。',
        longDescHtml:
          '除了蒼白、心悸、氣促、頭晕，還可見<strong>舌炎、四肢麻木、步態不穩、認知變化</strong>；若長期未治療，<strong>神經症狀可能不可逆</strong>。需 B12 替代並監測胃部病變風險。'
      },
      {
        id: 'vm',
        name: '前庭性偏頭痛（Vestibular migraine）',
        match: ['headache','fatigue','sleep'],
        prevalenceP: 0.009, cureRateP: 0.5, severeAnnualRiskP: 0.0001,
        shortDesc: '以眩暈/不穩為主的偏頭痛譜系疾患。',
        longDescHtml:
          '發作時環境旋轉、步伐虛浮，甚至<strong>嘔吐脫水</strong>，對工作/行走影響大。若眩暈伴<strong>單側無力、語言困難</strong>等神經缺失，應急診排除中風。'
      },
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

    const list = conditions
      .map((c) => {
        const hits = c.match.filter((m) => selected.includes(m));
        const ratio = c.match.length > 0 ? hits.length / c.match.length : 0;
        return { ...c, hits, ratio };
      })
      .filter((c) => c.hits.length >= 1)
      .sort((a, b) =>
        b.ratio - a.ratio ||
        b.hits.length - a.hits.length ||
        (b.prevalenceP || 0) - (a.prevalenceP || 0)
      )
      .slice(0, 5);

    setResults(list);
    setRevealCount(0);
    setShowProb(false);

    window.setTimeout(() => {
      setShowProb(true);
      let i = 0;
      const t = setInterval(() => {
        i += 1;
        setRevealCount((prev) => Math.min(list.length, prev + 1));
        if (i >= list.length) clearInterval(t);
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">網路自診模擬</h1>
        </header>

        {phase === "select" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold mb-3">請勾選最近出現過的症狀</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {symptoms.map((s) => (
                <label key={s.id}
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
              <h2 className="text-lg font-semibold">你很可能確診了</h2>
              {phase === "thinking" && !showProb && (
                <span className="text-xs text-gray-500">正在估算機率…</span>
              )}
            </div>

            {phase === "thinking" && !showProb && <Progress ms={delayMs} />}

            <ul className="mt-3 space-y-2">
              {results.map((r, i) => (
                <li key={r.id}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                    style={{ opacity: i < revealCount ? 1 : 0, transition: "opacity 500ms ease" }}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-medium">{i + 1}. {r.name}</div>
                    <div className="text-xs text-gray-500">
                      命中症狀：{r.hits.length} / {r.match.length}（{r.hits.map((id) => symptomDict[id]).join("、")}）
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">{r.shortDesc}</p>

                  {showProb ? (
                    <div className="mt-2">
                      <button
                        className="w-full text-left text-sm flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                        onClick={() => setOpenDetail((o) => ({ ...o, [r.id]: !o[r.id] }))}
                        aria-expanded={!!openDetail[r.id]}
                      >
                        <span className="font-medium">病程概述</span>
                        <span className={`transition-transform ${openDetail[r.id] ? "rotate-180" : ""}`}>▾</span>
                      </button>

                      {openDetail[r.id] && (
                        <div className="mt-2">
                          <div
                            className="p-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: r.longDescHtml }}
                          />
                          <div className="mt-2">
                            <button
                              className="w-full text-left text-sm flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                              onClick={() => setOpenProbs((o) => ({ ...o, [r.id]: !o[r.id] }))}
                              aria-expanded={!!openProbs[r.id]}
                            >
                              <span className="font-medium">真實機率</span>
                              <span className={`transition-transform ${openProbs[r.id] ? "rotate-180" : ""}`}>▾</span>
                            </button>
                            {openProbs[r.id] && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-600 mb-2">
                                  但其實，你罹患此疾病或導致重症的機率非常低
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <ProbBox label="成年人盛行率" value={r.prevalenceP} />
                                  <ProbBox label="痊癒/良好控制率" value={r.cureRateP} />
                                  <ProbBox label="重症/死亡風險" value={r.severeAnnualRiskP} />
                                </div>
                              </div>
                            )}
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
                onClick={() => { setPhase("select"); setOpenDetail({}); setOpenProbs({}); }}
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
        {pctStr}{showOneIn && oneInStr ? `（1/${oneInStr}）` : ""}
      </div>
    </div>
  );
}

// 小機率顯示第一位有效數字；整數百分比移除 .0
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
  if (/\.0$/.test(pctFixed)) pctFixed = pctFixed.slice(0, -2);
  const pctStr = `${pctFixed}%`;
  return { pctStr, oneInStr: `${oneIn}` };
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
