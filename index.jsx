const { useMemo, useState, useEffect } = React;

// v1.7 原文完全保留；僅在病程概述內對「嚴重片段」加上 <strong>

function App() {
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState("select");
  const [showProb, setShowProb] = useState(false);
  const [results, setResults] = useState([]);
  const [openDetail, setOpenDetail] = useState({});
  const [openProbs, setOpenProbs] = useState({});
  const delayMs = 2000;
  const [revealCount, setRevealCount] = useState(0);

  const symptoms = useMemo(() => [
    { id: "headache", name: "頭痛或頭暈" },
    { id: "chest",   name: "胸悶或心悸" },
    { id: "throat",  name: "喉嚨痛" },
    { id: "neck",    name: "肩頸痠痛" },
    { id: "breath",  name: "容易喘" },
    { id: "fatigue", name: "容易疲倦" },
    { id: "weight",  name: "體重改變" },
    { id: "sleep",   name: "睡眠品質差" },
    { id: "gi",      name: "腸胃不適" },
  ], []);

  const symptomDict = useMemo(
    () => Object.fromEntries(symptoms.map(s => [s.id, s.name])),
    [symptoms]
  );

  // === v1.7 文字 ===
  const conditions = useMemo(() => [
      { id: 'celiac', name: '乳糜瀉（Celiac disease）', match: ['gi','fatigue','weight','sleep'], prevalenceP: 0.007, cureRateP: 0.7, severeAnnualRiskP: 0, shortDesc: '麩質引發的小腸免疫性損傷，影響吸收、體重與多系統症狀。', longDescHtml: `乳糜瀉是免疫系統對「麩質」產生異常反應，吃進小麥、大麥、黑麥等穀物後，免疫攻擊會破壞小腸絨毛，造成吸收不良。輕則反覆腹瀉、腹脹、體重下降與營養缺乏；重者可能出現<strong>嚴重鐵缺乏性貧血、骨質疏鬆、電解質失衡、神經病變</strong>，長期未控制會顯著影響兒童生長與成人體力，甚至增加某些腸道惡性疾病風險。典型情境是：日常飲食看似正常，但人愈來愈虛弱、容易疲倦，餐後腹脹像被氣球撐開，肚子痛到彎腰；久而久之<strong>指甲脆裂、頭髮易斷、站起來就暈</strong>。確診仰賴血清抗體與小腸切片，治療核心是嚴格「無麩質飲食」，才可逆轉黏膜受損並降低併發症。若自覺「一吃就脹、慢性腹瀉、體重無故下降」，或合併缺鐵/骨鬆，務必就醫評估。` },
      { id: 'ms', name: '多發性硬化症（Multiple sclerosis）', match: ['headache','fatigue','sleep'], prevalenceP: 0.0025, cureRateP: 0.3, severeAnnualRiskP: 0, shortDesc: '中樞神經脫髓鞘疾病，易反覆復發與逐步進展，影響多種神經功能。', longDescHtml: `多發性硬化症為中樞神經（腦與脊髓）脫髓鞘疾病，症狀可忽好忽壞：視力模糊或視神經痛、手腳無力與麻木、步態不穩、熱會誘發疲勞與症狀惡化。疾病進展時，病灶宛如在中樞神經留下一道道「斷裂的訊號路」，讓精細動作、平衡、記憶與情緒都被牽動。部分患者呈「復發—緩解型」，但若控制不佳，可能逐漸走向<strong>殘疾累積（如步行需輔具）</strong>。現代治療強調早期疾病修飾治療（DMTs）以減少復發與新病灶，並搭配復健與症狀控制。任何<strong>突發單眼視力下降、身體半側麻木、走路像踩在棉花上的不穩</strong>，都該盡快就醫；急性期常需類固醇等治療，長期則視亞型與活動度選擇藥物以延緩惡化。` },
      { id: 'ra', name: '類風濕性關節炎（Rheumatoid arthritis）', match: ['neck','fatigue','sleep'], prevalenceP: 0.0046, cureRateP: 0.3, severeAnnualRiskP: 0, shortDesc: '自體免疫多關節炎，亦可累及心、肺、眼與血管。', longDescHtml: `類風濕性關節炎是自體免疫造成的滑膜炎，清晨僵硬與對稱性小關節腫痛最典型。未控制的慢性發炎會像「火」一樣在關節內燒，時間拉長便<strong>侵蝕軟骨與骨端，導致關節變形、力量流失</strong>；發炎介質也可波及全身，引發貧血、疲倦與心血管風險上升。嚴重時，抓握開瓶、轉門把、扣鈕扣都成挑戰，甚至夜間痛醒。治療目標是「及早緩解發炎、阻止結構破壞」：以 csDMARDs、生物製劑或標靶小分子搭配密切追蹤調整爭劑量。拖延治療會讓<strong>不可逆的結構損傷</strong>悄悄累積，因此一旦出現持續多關節腫痛、晨僵超過 30 分鐘，需及時就醫由風濕專科介入。` },
      { id: 'sle', name: '紅斑性狼瘡（Systemic lupus erythematosus）', match: ['chest','breath','fatigue','sleep'], prevalenceP: 0.00061, cureRateP: 0.5, severeAnnualRiskP: 0, shortDesc: '多器官自體免疫病，表現多變，可能侵犯腎、肺、心臟與中樞神經。', longDescHtml: `紅斑性狼瘡是多系統自體免疫病，從皮疹、關節痛、畏光到腎臟炎、血液學異常、神經精神症狀皆可能出現。病勢活化時，免疫複合體如同細小砂粒沉積於器官，掀起一波波發炎：<strong>腎臟蛋白尿與腎功能惡化、胸痛與呼吸困難、劇烈頭痛或癲癇、口鼻潰瘍與高燒</strong>。若合併狼瘡腎炎且未及時治療，可能走向<strong>腎衰竭</strong>。治療依嚴重度使用類固醇、免疫調節/抑制劑與生物製劑，並需防曬與感染風險管理。任何不明原因的發燒、皮疹合併關節痛，或尿液泡泡多、下肢水腫等腎臟警訊，都應立即評估。` },
      { id: 'mg', name: '重症肌無力（Myasthenia gravis）', match: ['fatigue','breath','throat'], prevalenceP: 0.00025, cureRateP: 0.6, severeAnnualRiskP: 0.005, shortDesc: '神經肌肉接頭傳導受阻，出現易疲勞的肌力無力。', longDescHtml: `重症肌無力的核心是「使用越多越無力」：從<strong>眼瞼下垂、複視，到說話含糊、咀嚼吞嚥困難、頸部與近端四肢無力</strong>。病程波動，午後或活動後惡化更明顯；嚴重時<strong>呼吸肌受累，可能出現「肌無力危象」，呼吸衰竭</strong>需要加護治療。常見治療包括乙醯膽鹼酯酶抑制劑、免疫治療（類固醇、免疫抑制劑、生物製劑）與胸腺手術（特定族群）。若發現喝水易嗆、講話越講越小聲、抬頭困難，或合併呼吸急促與發紺，屬立即就醫指標。` },
      { id: 'cd', name: '克隆氏症（Crohn’s disease）', match: ['gi','fatigue','weight'], prevalenceP: 0.002, cureRateP: 0.35, severeAnnualRiskP: 0.005, shortDesc: '可影響全消化道的慢性發炎性腸病。', longDescHtml: `屬於發炎性腸病的一型，可影響從口腔到肛門的任何腸段、且呈跳躍分佈，<strong>腸壁全層發炎導致狹窄、瘻管與膿瘍</strong>。臨床上，陣發性腹痛、慢性腹瀉、體重下降、發燒與肛周病灶常反覆出現；重症時因狹窄引發<strong>腸阻塞，疼痛如絞、腹部脹如鼓，甚至嘔吐膽汁樣液體</strong>。長期發炎與營養不良會拖垮體力與生活品質。治療依嚴重度與部位採用生物製劑、免疫調節劑、短期類固醇與營養治療；併發狹窄或瘻管時可能需要外科處置。若大便帶血、持續腹瀉與體重快速下降，應盡速就醫。` },
      { id: 'uc', name: '潰瘍性結腸炎（Ulcerative colitis）', match: ['gi','fatigue','weight'], prevalenceP: 0.003, cureRateP: 0.35, severeAnnualRiskP: 0.003, shortDesc: '侷限於大腸黏膜的慢性發炎性腸病。', longDescHtml: `潰瘍性結腸炎屬於發炎性腸道疾病的一種，主要累及大腸直腸黏膜，連續性發炎造成潰瘍、血便與腹痛。嚴重發作時，患者可能每天跑廁所十多次，解出<strong>帶血黏液、腹部絞痛不止</strong>，夜間也被迫起身；若發展為<strong>毒性巨結腸，腹脹加劇、發燒、脈搏快、白血球升高，需緊急處置以免穿孔與敗血</strong>。長期反覆發炎亦提高大腸癌風險。治療目標是誘導與維持緩解，常用 5-ASA、類固醇（短期）、免疫調節劑與多種生物製劑/小分子，必要時手術。出現血便、里急後重與體重下降時，及早就醫可降低併發症。` },
      { id: 'meniere', name: '梅尼爾氏症（Ménière’s disease）', match: ['headache','fatigue','sleep'], prevalenceP: 0.0019, cureRateP: 0.4, severeAnnualRiskP: 0, shortDesc: '內耳液體調節異常，眩暈、耳鳴與波動性聽力損失。', longDescHtml: `為內耳疾患，特徵是反覆且難以預測的眩暈發作，伴隨耳鳴、聽力波動與耳內悶脹感。發作來臨時，<strong>世界像被猛烈旋轉，患者需緊抓固定物、噁心嘔吐、步履蹣跚</strong>；每次可持續數分鐘到 24 小時，次數不定，長期可能導致進行性聽力損失與生活/工作中斷。治療著重減少發作頻率與控制症狀（如飲食限鹽、利尿劑、前庭復健、必要時侵入性治療）。若眩暈合併新出現的<strong>單側耳聾、神經學異常</strong>或持續不止，需排除其他急症。` },
      { id: 'pots', name: '姿勢性直立心搏過速症候群（Postural orthostatic tachycardia syndrome）', match: ['headache','chest','breath','fatigue','sleep'], prevalenceP: 0.006, cureRateP: 0.5, severeAnnualRiskP: 0, shortDesc: '站立時心跳顯著上升的自主神經失調，影響日常功能。', longDescHtml: `姿勢性心搏過速症候群的核心是「一站起來心跳飆快」：從坐/臥位起身後，短時間內心率明顯上升，常伴<strong>頭暈、眼前發黑、心悸、胸悶與疲憊，嚴重時接近暈厥</strong>。部分患者在感染、手術或壓力後發病，也與自主神經調節失衡、關節過度鬆弛等相關。病程可長期反覆，對學習與工作衝擊大。治療以非藥物為先（補水補鹽、分段起身、壓力襪、體能復健），必要時加入藥物（依個案）。若站立就<strong>心悸胸悶、伴意識模糊或跌倒風險</strong>，應就醫評估。` },
      { id: 'sarcoid', name: '結節病（Sarcoidosis）', match: ['breath','chest','fatigue'], prevalenceP: 0.0014, cureRateP: 0.6, severeAnnualRiskP: 0.004, shortDesc: '多系統肉芽腫病變，常見於肺與淋巴結，亦可侵犯心臟。', longDescHtml: `此病以<strong>全身性肉芽腫</strong>為特徵，最常影響肺與淋巴結，也可波及皮膚、眼睛、心臟與神經。多數人無症狀或僅有咳嗽、喘與倦怠，但某些人會出現胸痛、呼吸困難、夜汗與體重下降。若心臟受累，可能導致<strong>心律不整、暈厥甚至猝死</strong>；神經系統受累則出現顏面神經麻痺或其他神經缺損。影像與組織學診斷後，依受累器官與嚴重度決定觀察或治療（如類固醇與免疫抑制劑）。持續乾咳、活動後喘、視力模糊或胸悶，應儘速評估。` },
      { id: 'as', name: '僵直性脊椎炎（Ankylosing spondylitis）', match: ['neck','fatigue','sleep'], prevalenceP: 0.004, cureRateP: 0.4, severeAnnualRiskP: 0.002, shortDesc: '以脊柱與薦髂關節為主的慢性發炎性關節病。', longDescHtml: `僵直性脊椎炎以軸向骨骼（脊柱、薦髂關節）發炎為主，反覆的炎症會讓下背在清晨最僵最痛，活動後才稍緩。若長期未控制，<strong>關節可能鈣化「橋接」，脊柱逐漸失去彈性，姿勢前屈、轉頭困難</strong>，一趟公車顛簸就能引發<strong>撕裂般的痛</strong>。部分患者還有葡萄膜炎（眼紅、畏光）、腸道症狀與心肺併發症。治療包括 NSAIDs、TNF/IL-17 抑制劑與復健運動，越早介入越能保留活動度。若年輕到中年反覆下背痛、晨僵>30 分鐘且活動可緩解，應懷疑並就醫。` },
      { id: 'ipf', name: '特發性肺纖維化（Idiopathic pulmonary fibrosis）', match: ['breath','fatigue','sleep'], prevalenceP: 0.00018, cureRateP: 0.1, severeAnnualRiskP: 0.1, shortDesc: '原因不明的進行性肺部纖維化與缺氧。', longDescHtml: `特發性肺纖維化是進行性間質性肺病，<strong>肺泡壁反覆微傷後被纖維化</strong>取代，像把柔軟海綿慢慢變成硬化的疤痕網。病人會逐漸出現活動後呼吸喘、乾咳、杵狀指，後期即使走幾步也氣促，夜裡必須依賴氧氣。急性惡化（AE-IPF）時，數日內<strong>喘到說不出話、需住院高濃度氧氣甚至呼吸器</strong>。雖無法逆轉疤痕，但抗纖維化藥物可延緩惡化，並配合肺復健、氧療與移植評估。任何不明原因的漸進性喘與乾咳，都值得做肺功能與高解析電腦斷層檢查。` },
      { id: 'ssc', name: '硬皮病（Systemic sclerosis）', match: ['neck','breath','fatigue'], prevalenceP: 0.00018, cureRateP: 0.2, severeAnnualRiskP: 0.03, shortDesc: '血管病變與皮膚/內臟纖維化的自體免疫病。', longDescHtml: `此病使<strong>皮膚與內臟結締組織過度纖維化，手指遇冷變白變紫（雷諾氏現象）、手指腫脹緊繃，臉部皮膚緊縮</strong>難以做表情；消化道蠕動變差導致胃食道逆流、吞嚥困難；肺動脈高壓或間質肺病會帶來進行性喘，嚴重者心、腎也會受累。對患者而言，每個清晨像穿上愈來愈緊的盔甲，<strong>連握筆和系鞋帶都疼痛吃力</strong>。治療著重器官監測與對症控制（血管擴張、免疫調節、抗纖維化/抗發炎策略），及早辨識肺與心血管受累能改善預後。` },
      { id: 'phpt', name: '原發性副甲狀腺機能亢進（Primary hyperparathyroidism）', match: ['fatigue','neck','gi'], prevalenceP: 0.004, cureRateP: 0.95, severeAnnualRiskP: 0.001, shortDesc: 'PTH 過多導致高血鈣與骨質流失，腎結石風險上升。', longDescHtml: `由副甲狀腺過度分泌 PTH 引起高鈣血症，出現「骨痛、腎石、腹痛、精神症狀」等經典表現：<strong>反覆腎結石、骨質流失與骨折風險上升</strong>、噁心便祕、注意力不集中與情緒波動。嚴重高鈣時會<strong>嗜睡、脫水、心律異常，甚至意識改變</strong>。多數是單顆腺瘤所致，診斷靠血鈣、PTH 與腎功能/骨密評估；治療包括手術切除病變腺體與藥物/骨骼保護策略。若反覆腎結石或無明顯原因的高鈣，應排除此症。` },
      { id: 'pbc', name: '原發性膽汁性膽管炎（Primary biliary cholangitis）', match: ['fatigue','gi'], prevalenceP: 0.00018, cureRateP: 0.6, severeAnnualRiskP: 0.02, shortDesc: '膽管自體免疫破壞導致慢性膽汁鬱積與肝臟發炎。', longDescHtml: `原發性膽汁性膽管炎為自體免疫攻擊肝內小膽管，膽汁排出受阻，長年下來引發<strong>膽汁滯留性肝病與纖維化</strong>。初期常是難以忽視的「疲倦」與「瘋狂搔癢」—夜深人靜時越抓越睡不著；後期可見黃疸、脂溶性維生素缺乏、皮膚色素改變，嚴重者進展至<strong>肝硬化與門脈高壓</strong>。治療以 ursodeoxycholic acid 為基礎，對反應不佳者可加第二線藥物與併發症管理。長期追蹤肝功能與骨質密度十分重要。` },
      { id: 'pe', name: '肺栓塞（Pulmonary embolism）', match: ['breath','chest'], prevalenceP: 0.0008, cureRateP: 0.9, severeAnnualRiskP: 0.05, shortDesc: '血栓阻塞肺動脈的急症，可致命並有長期併發風險。', longDescHtml: `肺栓塞是血栓堵住肺動脈分支所致，表現從不明原因的<strong>氣促、胸痛（吸氣加劇）、心跳快，到咳血、暈厥</strong>；巨大栓塞可迅速導致<strong>休克與猝死</strong>。典型急性場景：剛長途飛行或術後臥床，突然胸口像被重物壓住，<strong>一吸氣就刺痛、喘到說不出整句話</strong>。診斷倚賴臨床評估、D-dimer、影像與風險分層；治療以抗凝為主，危重時採溶栓或介入。任何「突發胸痛＋喘＋心跳快」都不應拖延。` },
      { id: 'pericarditis', name: '急性心包膜炎（Acute pericarditis）', match: ['chest','breath','throat'], prevalenceP: 0.000277, cureRateP: 0.85, severeAnnualRiskP: 0.01, shortDesc: '心包發炎引起胸痛；少數併心包填塞或縮窄。', longDescHtml: `為心臟外層心包的發炎，<strong>胸痛常為尖銳刺痛</strong>、坐起前傾可減輕、平躺或吸氣加重；可能合併發燒、心悸與心包積液。若積液迅速累積形成<strong>心包填塞</strong>，病人會出現<strong>血壓下降、頸靜脈怒張、心音衰弱</strong>等危象，需緊急處置。常見病因為病毒感染，但也可見於自體免疫或術後。診斷依心電圖、心肌酵素、超音波與炎症指標；治療以 NSAIDs/秋水仙素為要，重症或復發需進一步策略。` },
      { id: 'myocarditis', name: '急性心肌炎（Acute myocarditis）', match: ['chest','breath','fatigue'], prevalenceP: 0.0002, cureRateP: 0.7, severeAnnualRiskP: 0.05, shortDesc: '心肌發炎導致泵血功能下降與心律不整。', longDescHtml: `心肌炎是心肌的發炎，從無症狀到<strong>劇烈胸痛、心律不整、心衰竭</strong>皆可能。部分患者在上呼吸道感染後數日到數週出現胸悶、喘與異常疲倦；嚴重時進展快速，如同心臟被「熄火」，<strong>需要強心、機械循環輔助甚至移植</strong>。診斷結合心電圖、心肌酵素、心臟超音波、心臟 MRI，必要時心內膜活檢。治療包括對症與支持（含心衰藥物、節律控制），特定病因再加免疫或抗病毒策略。胸痛伴發燒或心悸、暈厥，不可掉以輕心。` },
      { id: 'addison', name: '愛迪生氏病（Addison’s disease）', match: ['fatigue','weight','gi','sleep'], prevalenceP: 0.00008, cureRateP: 0.9, severeAnnualRiskP: 0.01, shortDesc: '腎上腺皮質荷爾蒙不足的內分泌危症。', longDescHtml: `為腎上腺皮質功能低下，皮質醇與醛固酮不足導致極度疲倦、體重下降、食慾差、低血壓與鹽分渴求；皮膚與黏膜可能出現色素沉著。最危險的是「腎上腺危象」：<strong>劇烈嘔吐、腹痛、低血壓、電解質紊亂與休克</strong>，需立即補液與類固醇救命。長期治療仰賴荷爾蒙替代並學會「壓力劑量」調整。若反覆暈眩、站起就黑朦、持續疲憊合併色素加深，應盡速檢查。` },
      { id: 'pa', name: '惡性貧血（Pernicious anemia）', match: ['fatigue','headache','breath'], prevalenceP: 0.001, cureRateP: 0.9, severeAnnualRiskP: 0.001, shortDesc: '自體免疫造成維生素 B12 吸收不良的巨球性貧血。', longDescHtml: `乃是<strong>自體免疫破壞胃壁</strong>的內在因子，導致維生素 B12 無法吸收，紅血球生成受阻。病人除了貧血引起的蒼白、心悸、氣促與頭暈，還可能出現<strong>舌炎、四肢麻木、步態不穩與認知變化</strong>（B12 缺乏的神經影響）。若長期未治療，可能導致<strong>不可逆的神經症狀</strong>。診斷結合 B12、抗內在因子抗體與血液學檢查；治療以 B12 注射/補充，並追蹤潛在胃部病變風險。` },
      { id: 'vm', name: '前庭性偏頭痛（Vestibular migraine）', match: ['headache','fatigue','sleep'], prevalenceP: 0.009, cureRateP: 0.5, severeAnnualRiskP: 0.0001, shortDesc: '以眩暈/不穩為主的偏頭痛譜系疾患。', longDescHtml: `這類偏頭痛以<strong>眩暈與平衡障礙</strong>為主，可在頭痛前、頭痛時或完全沒有頭痛的情況下出現。發作時環境旋轉、步伐虛浮、光聲刺激加劇不適，患者<strong>難以行走與工作，甚至嘔吐脫水</strong>。誘因包括睡眠不足、壓力、特定食物與荷爾蒙波動。診斷重點在排除其他中樞或內耳病因；治療含發作期止暈止吐與預防性藥物（依個體選擇），再配合前庭復健與誘因管理。若眩暈伴神經學異常（單側無力、語言困難）應急診排除中風。` },
    ]
, []);

  function analyze() {
    if (selected.length === 0) { alert("請先勾選至少 1 個症狀。"); return; }
    setPhase("thinking");
    setOpenDetail({});
    setOpenProbs({});

    const list = conditions
      .map(c => {
        const hits = c.match.filter(m => selected.includes(m));
        const ratio = c.match.length ? hits.length / c.match.length : 0;
        return { ...c, hits, ratio };
      })
      .filter(c => c.hits.length >= 1)
      .sort((a, b) =>
        b.ratio - a.ratio ||
        b.hits.length - a.hits.length ||
        (b.prevalenceP || 0) - (a.prevalenceP || 0)
      )
      .slice(0, 5);

    setResults(list);
    setRevealCount(0);
    setShowProb(false);

    setTimeout(() => {
      setShowProb(true);
      let i = 0;
      const t = setInterval(() => {
        i += 1;
        setRevealCount(prev => Math.min(list.length, prev + 1));
        if (i >= list.length) clearInterval(t);
      }, 220);
    }, delayMs);
  }

  function resetAll() {
    setSelected([]); setResults([]); setOpenDetail({}); setOpenProbs({});
    setRevealCount(0); setPhase("select"); setShowProb(false);
  }
  function toggleSymptom(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
              {symptoms.map(s => (
                <label key={s.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer select-none transition ${
                    selected.includes(s.id) ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}>
                  <input type="checkbox" checked={selected.includes(s.id)}
                         onChange={() => toggleSymptom(s.id)} className="accent-gray-900 w-4 h-4" />
                  <span className="text-sm font-medium">{s.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={resetAll}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 text-sm bg-white hover:bg-gray-50">重設</button>
              <button onClick={analyze}
                      className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm shadow hover:opacity-90">開始診斷</button>
            </div>
          </section>
        )}

        {phase !== "select" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">你很可能確診了</h2>
              {phase === "thinking" && !showProb && <span className="text-xs text-gray-500">正在估算機率…</span>}
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
                      命中症狀：{r.hits.length} / {r.match.length}（{r.hits.map(id => symptomDict[id]).join("、")}）
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">{r.shortDesc}</p>

                  {showProb ? (
                    <div className="mt-2">
                      <button
                        className="w-full text-left text-sm flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                        onClick={() => setOpenDetail(o => ({ ...o, [r.id]: !o[r.id] }))}
                        aria-expanded={!!openDetail[r.id]}
                      >
                        <span className="font-medium">病程概述</span>
                        <span className={`transition-transform ${openDetail[r.id] ? "rotate-180" : ""}`}>▾</span>
                      </button>

                      {openDetail[r.id] && (
                        <div className="mt-2">
                          <div
                            className="p-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: r.longDescHtml }}
                          />
                          <div className="mt-2">
                            <button
                              className="w-full text-left text-sm flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                              onClick={() => setOpenProbs(o => ({ ...o, [r.id]: !o[r.id] }))}
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

function toPretty(v) {
  if (v == null) return { pctStr: "—", oneInStr: "" };
  if (v === 0) return { pctStr: "≈0", oneInStr: "" };
  if (v < 0) return { pctStr: "—", oneInStr: "" };
  const oneIn = Math.max(1, Math.round(1 / v));
  const pct = v * 100;
  let decimals = 1;
  if (pct > 0 && pct < 1) {
    let t = pct; decimals = 0;
    while (t < 1) { t *= 10; decimals += 1; if (decimals > 6) break; }
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
