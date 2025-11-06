# 🎓 MedJumps - AI Tutorial Assistant

Asisten tutorial Seven Jumps berbasis AI untuk mahasiswa kedokteran Indonesia.

## 🌟 Features

- ✅ **Input Fleksibel**: Text, PDF, atau gambar
- ✅ **Analisis Otomatis**: 4 tahapan Seven Jumps (Kata Sulit, Rumusan Masalah, Brainstorming, Peta Masalah)
- ✅ **Tips Pembelajaran**: Rekomendasi topik untuk dipelajari lebih lanjut
- ✅ **Export**: Copy ke clipboard atau download sebagai file .txt
- ✅ **Gratis**: Menggunakan Gemini 2.5 Flash API (free tier)

## 🚀 Quick Start

### 1. Get API Key

1. Kunjungi [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan akun Google
3. Klik "Create API Key"
4. Copy API Key Anda

### 2. Deploy ke GitHub Pages
```bash
# Clone repository
git clone https://github.com/username/medjumps.git
cd medjumps

# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main
```
localStorage.removeItem('medjumps_api_key'); // Hapus api_key

3. Buka **Settings** → **Pages**
4. Pilih **main branch** sebagai source
5. Website akan tersedia di `https://justintimber949.github.io/medjumps/`

### 3. Cara Pakai

1. Buka website
2. Masukkan API Key (hanya sekali)
3. Paste skenario atau upload file
4. Klik "Proses Skenario"
5. Tunggu 20-40 detik
6. Hasil siap di-copy atau di-download!

## 📋 Format Input

### Text
Paste langsung skenario kasus medis (minimal 50 kata)

### PDF/Gambar
Upload file PDF, PNG, atau JPG (maksimal 10MB)

## 🎯 Output

1. **Identifikasi Kata Sulit**: Terminologi medis dengan definisi
2. **Rumusan Masalah**: 7-12 pertanyaan analitis
3. **Brainstorming**: Jawaban komprehensif
4. **Peta Masalah**: Diagram ASCII art
5. **Tips Pembelajaran**: Topik untuk dipelajari

## 🔒 Privacy

- API Key disimpan di browser (localStorage)
- Tidak ada data yang dikirim ke server selain ke Gemini API
- Skenario tidak disimpan permanen

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript
- **AI**: Google Gemini 2.5 Flash API
- **Hosting**: GitHub Pages

## ⚠️ Limitations

- **Rate Limit**: Free tier Gemini API (15 requests/minute)
- **File Size**: Maksimal 10MB
- **Response Time**: 20-40 detik tergantung kompleksitas

## 📝 License

MIT License - Free for educational use

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Made with ❤️ for Indonesian Medical Students

### Test 1: Setup API Key
1. Buka website di browser (`http://127.0.0.1:5500`)
2. **Paste API Key** di input field
3. Klik **"💾 Simpan"**
4. Seharusnya muncul section input skenario

### Test 2: Test dengan Text Input
**Skenario Simple:**
```
Seorang laki-laki 55 tahun datang ke IGD dengan keluhan nyeri dada seperti tertindih benda berat sejak 3 jam yang lalu. Nyeri menjalar ke lengan kiri dan rahang. Pasien tampak pucat, berkeringat dingin, dan sesak napas. Riwayat hipertensi sejak 10 tahun yang lalu, tidak rutin minum obat. Riwayat merokok 2 bungkus/hari selama 30 tahun.

Pemeriksaan Fisik:
- Kesadaran: Compos mentis
- TD: 160/100 mmHg
- Nadi: 110x/menit, reguler
- RR: 28x/menit
- Suhu: 36.8°C
- Akral dingin, CRT >2 detik
- Auskultasi paru: ronki basah basal bilateral
- Auskultasi jantung: S1 S2 reguler, gallop (+)

Pemeriksaan Penunjang:
- EKG: ST elevasi di lead II, III, aVF
- Troponin I: 5.2 ng/mL (normal <0.04)
- CK-MB: 180 U/L (normal <25)