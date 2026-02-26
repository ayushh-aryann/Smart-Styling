import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // 1) Load categories once when page loads
  useEffect(() => {
    fetch(`${API}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setError("Could not load categories"));
  }, []);

  // 2) Load types whenever category changes
  useEffect(() => {
    if (!category) return;

    setType("");
    setResult(null);
    setError("");

    fetch(`${API}/types?category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data) => setTypes(data.types || []))
      .catch(() => setError("Could not load types"));
  }, [category]);

  // 3) Call recommend
  const recommend = async () => {
    setError("");
    setResult(null);

    if (!category || !type) {
      setError("Please select both category and type.");
      return;
    }

    const res = await fetch(`${API}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, type }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.detail || "Recommendation failed");
      return;
    }

    setResult(data);
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Smart Styling</h1>
      <p>Pick a category and type to get recommendations.</p>

      <div style={{ display: "grid", gap: 12, maxWidth: 500 }}>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={!category}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          >
            <option value="">-- Select Type --</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <button onClick={recommend} style={{ padding: 12, cursor: "pointer" }}>
          Recommend
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {result && (
          <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 10, marginTop: 10 }}>
            <h2>Best Styles ✅</h2>
            <p>{result.best_styles}</p>

            <h2>Avoid Styles ❌</h2>
            <p>{result.avoid_styles}</p>
          </div>
        )}
      </div>
    </div>
  );
}