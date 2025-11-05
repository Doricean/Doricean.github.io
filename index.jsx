// ✅ 這種寫法才適用於 CDN + Babel（無 import / export）
const { useState, useEffect, useMemo } = React;

function App() {
  // ---- UI 狀態 ----
  const [symptoms, setSymptoms] = useState({
    頭痛或頭暈: false,
    胸悶或心悸: false,
    喉嚨痛: false,
    肩頸痠痛: false,
    容易喘: false,
    容易疲倦: false,
    腸胃不適: false, // 你之前說要把「胃口或消化不適」改為「腸胃不適」
    體重改變: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ---- 勾選邏輯 ----
  function toggleSymptom(key) {
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // ---- 模擬診斷（固定延遲 3 秒）----
  async function startDiagnose() {
    setLoading(true);
    setResult(null);

    // 模擬 3 秒延遲
    await new Promise(r => setTimeout(r, 3000));

    // 很簡單的示意結果（隨便根據勾選數量做個 demo）
    const count = Object.values(symptoms).filter(Boolean).length;

    const demoFindings = [
      { name: "偏頭痛（示意）", match: ["頭痛或頭暈"], severity: "低" },
      { name: "自律神經失調（示意）", match: ["胸悶或心悸", "容易疲倦"], severity: "低~中" },
      { name: "胃食道逆流（示意）", match: ["喉嚨痛", "腸胃不適"], severity: "低" },
      { name: "肌筋膜疼痛（示意）", match: ["肩頸痠痛"], severity: "低" },
      { name: "過敏性鼻炎（示意）", match: ["喉嚨痛", "容易喘"], severity: "低" },
    ];

    // 依勾選數量簡單挑幾個（純示意）
    const candidates = demoFindings.slice(0, Math.max(1, Math.min(3, count)));
    setResult({
      summary: count === 0 ? "尚未偵測到明顯線索（示意）" : "以下為示意性結果，僅供教學模擬",
      items: candidates
    });

    setLoading(false);
  }

  const selectedCount = useMemo(
    () => Object.values(symptoms).filter(Boolean).length,
    [symptoms]
  );

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px", fontFamily: 'ui-sans-serif, system-ui, "Noto Sans TC", Arial' }}>
      <h1 style={{ marginBottom: 12 }}>網路自診模擬</h1>

      <section style={{ marginBottom: 24 }}>
        <p style={{ color: "#666", lineHeight: 1.6 }}>
          勾選你的症狀後，點「開始診斷」。此頁面僅作課堂活動用的<strong>教學模擬</strong>，
          結果與機率為示意資料，不代表真實醫療建議。
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
        {Object.keys(symptoms).map(key => (
          <label key={key} style={{
            display: "flex", alignItems: "center", gap: 8,
            border: "1px solid #ddd", borderRadius: 10, padding: "10px 12px", cursor: "pointer"
          }}>
            <input
              type="checkbox"
              checked={symptoms[key]}
              onChange={() => toggleSymptom(key)}
            />
            <span>{key}</span>
          </label>
        ))}
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={startDiagnose}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #222",
            background: loading ? "#eee" : "#111",
            color: loading ? "#666" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600
          }}
        >
          {loading ? "診斷中（約 3 秒）..." : "開始診斷"}
        </button>
        <span style={{ color: "#666" }}>
          已勾選 {selectedCount} 項
        </span>
      </div>

      {result && (
        <section style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
          <h2 style={{ margin: "0 0 8px" }}>模擬結果</h2>
          <p style={{ color: "#444", marginTop: 0 }}>{result.summary}</p>
          <ul>
            {result.items.map((it, idx) => (
              <li key={idx} style={{ margin: "8px 0" }}>
                <strong>{it.name}</strong>　匹配症狀：{it.match.join("、")}　|　嚴重度：{it.severity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!result && !loading && (
        <p style={{ color: "#888" }}>（尚未產生模擬結果）</p>
      )}
    </div>
  );
}

// ✅ React 18 掛載（無 import / export）
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
