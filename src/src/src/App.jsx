import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjhjVO67ogZzTOSfQ6dh_UU2OlTbhZV3HFB6HEUmLkPHIL05YyTlckKjn5Vcv1vConLQ/exec";

export default function App() {
  const [page, setPage] = useState("home");
  const [form, setForm] = useState({
    tanggal: "",
    namaRelawan: "",
    jumlahInfaq: "",
    keterangan: "",
    buktiTransfer: "",
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (page === "rekap") fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(SCRIPT_URL);
      const json = await res.json();
      if (json.status === "success") setData(json.data);
    } catch (e) {
      setMessage("Gagal memuat data.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.tanggal || !form.namaRelawan || !form.jumlahInfaq) {
      setMessage("Tanggal, Nama, dan Jumlah wajib diisi!");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("✅ Infaq berhasil dicatat!");
      setForm({ tanggal: "", namaRelawan: "", jumlahInfaq: "", keterangan: "", buktiTransfer: "" });
    } catch (e) {
      setMessage("❌ Gagal menyimpan. Coba lagi.");
    }
    setLoading(false);
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Infaq");
    XLSX.writeFile(wb, "Laporan_Infaq_Squad.xlsx");
  };

  const shareWhatsApp = () => {
    const total = data.reduce((sum, row) => sum + Number(row["Jumlah Infaq"] || 0), 0);
    const text = `*Rekap Infaq Muslimah Swimming Squad*\n\nTotal Infaq: Rp ${total.toLocaleString("id-ID")}\nJumlah Transaksi: ${data.length}\n\nSemoga berkah! 🤲`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const styles = {
    container: { padding: "20px" },
    header: { background: "#2d6a4f", color: "white", padding: "16px 20px", textAlign: "center" },
    title: { fontSize: "18px", fontWeight: "bold" },
    subtitle: { fontSize: "12px", opacity: 0.8 },
    nav: { display: "flex", borderBottom: "2px solid #2d6a4f" },
    navBtn: (active) => ({ flex: 1, padding: "12px", border: "none", background: active ? "#2d6a4f" : "white", color: active ? "white" : "#2d6a4f", fontWeight: "bold", cursor: "pointer" }),
    label: { display: "block", marginBottom: "6px", fontWeight: "600", color: "#2d6a4f", fontSize: "14px" },
    input: { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "14px", marginBottom: "14px" },
    btn: (color) => ({ width: "100%", padding: "12px", background: color, color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", marginBottom: "10px" }),
    card: { background: "#f9f9f9", borderRadius: "8px", padding: "12px", marginBottom: "10px", borderLeft: "4px solid #2d6a4f" },
    message: { textAlign: "center", padding: "10px", color: "#2d6a4f", fontWeight: "bold" },
  };

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.title}>🏊‍♀️ Infaq Squad</div>
        <div style={styles.subtitle}>Muslimah Swimming Squad Yogyakarta</div>
      </div>

      <div style={styles.nav}>
        <button style={styles.navBtn(page === "home")} onClick={() => setPage("home")}>📋 Input</button>
        <button style={styles.navBtn(page === "rekap")} onClick={() => setPage("rekap")}>📊 Rekap</button>
      </div>

      <div style={styles.container}>
        {page === "home" && (
          <div>
            <label style={styles.label}>Tanggal *</label>
            <input style={styles.input} type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />

            <label style={styles.label}>Nama Relawan *</label>
            <input style={styles.input} type="text" placeholder="Nama lengkap" value={form.namaRelawan} onChange={(e) => setForm({ ...form, namaRelawan: e.target.value })} />

            <label style={styles.label}>Jumlah Infaq (Rp) *</label>
            <input style={styles.input} type="number" placeholder="Contoh: 50000" value={form.jumlahInfaq} onChange={(e) => setForm({ ...form, jumlahInfaq: e.target.value })} />

            <label style={styles.label}>Keterangan</label>
            <input style={styles.input} type="text" placeholder="Opsional" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />

            <label style={styles.label}>Link Bukti Transfer</label>
            <input style={styles.input} type="text" placeholder="Link Google Drive / foto" value={form.buktiTransfer} onChange={(e) => setForm({ ...form, buktiTransfer: e.target.value })} />

            {message && <div style={styles.message}>{message}</div>}
            <button style={styles.btn("#2d6a4f")} onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : "💾 Simpan Infaq"}
            </button>
          </div>
        )}

        {page === "rekap" && (
          <div>
            <button style={styles.btn("#2d6a4f")} onClick={downloadExcel}>📥 Unduh Excel</button>
            <button style={styles.btn("#25d366")} onClick={shareWhatsApp}>📤 Bagikan via WhatsApp</button>

            {loading && <div style={styles.message}>Memuat data...</div>}
            {message && <div style={styles.message}>{message}</div>}

            {data.map((row, i) => (
              <div key={i} style={styles.card}>
                <div style={{ fontWeight: "bold" }}>{row["Nama Relawan"]}</div>
                <div style={{ color: "#2d6a4f", fontWeight: "bold" }}>Rp {Number(row["Jumlah Infaq"]).toLocaleString("id-ID")}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{row["Tanggal"]} • {row["Keterangan"] || "-"}</div>
              </div>
            ))}

            {!loading && data.length === 0 && (
              <div style={{ textAlign: "center", color: "#888", marginTop: "30px" }}>Belum ada data infaq</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
