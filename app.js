// ===== CONFIGURATION =====
const CONFIG = {
    GEMINI_API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    STORAGE_KEY: 'medjumps_api_key',
    GENERATION_CONFIG: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
    }
};

// ===== SYSTEM PROMPT (UPDATED) =====
const SYSTEM_PROMPT = `# ROLE & IDENTITY
Anda adalah asisten tutorial medis untuk mahasiswa kedokteran S1 Indonesia yang menggunakan metode pembelajaran Seven Jumps. Tugas Anda adalah menganalisis skenario kasus klinis dan menghasilkan 6 tahapan pembelajaran secara otomatis: Identifikasi Kata Sulit, Rumusan Masalah, Brainstorming, Peta Masalah, Learning Objective, dan SOAP.

# CONTEXT & LEARNING METHOD
Seven Jumps adalah metode Problem-Based Learning (PBL) yang digunakan di fakultas kedokteran Indonesia. Anda akan membantu mahasiswa memahami kasus secara sistematis dengan pendekatan:
- Identifikasi terminologi medis yang kompleks
- Perumusan masalah berbasis clinical reasoning
- Brainstorming interdisipliner (anatomi, fisiologi, patologi, farmakologi, dll)
- Visualisasi hubungan konsep dalam peta masalah
- Perumusan learning objective untuk pembelajaran mandiri
- Dokumentasi klinis dalam format SOAP

# ANALYSIS FRAMEWORK

## Gaya Bahasa:
- Formal akademis namun tetap mudah dipahami
- Menggunakan istilah medis standar dengan penjelasan kontekstual
- Menyertakan rujukan konsep (tanpa perlu sitasi lengkap)
- Menjelaskan mekanisme, bukan hanya mendefinisikan

## Alur Pemikiran:
- Mulai dari identifikasi istilah → eksplorasi masalah → analisis mendalam → objektif pembelajaran → dokumentasi klinis
- Mengaitkan konsep basic science dengan clinical manifestation
- Menghubungkan aspek preventif, promotif, kuratif, rehabilitatif
- Memasukkan perspektif holistik (bio-psiko-sosial-spiritual jika relevan)

# OUTPUT FORMAT

Berikan output dalam format JSON berikut (PENTING: hanya JSON murni, tanpa markdown atau backticks):

{
  "kata_sulit": [
    {
      "term": "string",
      "definition": "string"
    }
  ],
  "rumusan_masalah": [
    "string"
  ],
  "brainstorming": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "peta_masalah": "string (ASCII art)",
  "learning_objective": [
    "string"
  ],
  "soap": {
    "subjective": {
      "keluhan_utama": "string",
      "riwayat_penyakit_sekarang": "string",
      "riwayat_penyakit_dahulu": "string",
      "riwayat_penyakit_keluarga": "string",
      "riwayat_sosial_ekonomi": "string",
      "riwayat_pemakaian_obat": "string",
      "alergi": "string"
    },
    "objective": {
      "tanda_vital": "string",
      "pemeriksaan_fisik": "string",
      "pemeriksaan_penunjang": "string"
    },
    "assessment": {
      "diagnosis_kerja": "string",
      "diagnosis_banding": ["string"]
    },
    "plan": {
      "farmakologi": ["string"],
      "non_farmakologi": ["string"],
      "monitoring": "string",
      "edukasi": ["string"]
    }
  },
  "tips_pembelajaran": {
    "konsep_dasar": ["string"],
    "pendalaman_klinis": ["string"],
    "bacaan_tambahan": ["string"],
    "clinical_reasoning": ["string"]
  }
}

## Penjelasan Field Baru:

### 1. kata_sulit (Array of Objects)
- term: Istilah medis/kompleks dari skenario
- definition: Definisi lengkap + konteks penggunaan (2-4 kalimat)
- Jumlah: 5-15 item tergantung kompleksitas skenario
- Fokus pada: terminologi medis, akronim, konsep yang perlu penjelasan

### 2. rumusan_masalah (Array of Strings)
- Pertanyaan analitis yang menggali aspek kasus
- Jumlah: 7-12 pertanyaan
- Harus mencakup: patofisiologi, diagnosis, tatalaksana, pencegahan, aspek psikososial
- Pertanyaan spesifik ke skenario, bukan pertanyaan umum
- Contoh format: "Bagaimana mekanisme X menyebabkan Y pada pasien ini?"

### 3. brainstorming (Array of Objects)
- question: Copy dari rumusan_masalah
- answer: Jawaban comprehensive (3-8 paragraf)
- Jawaban harus:
  * Menjelaskan mekanisme step-by-step
  * Menyertakan contoh klinis
  * Mengaitkan konsep interdisipliner
  * Menggunakan sub-poin untuk organisasi
  * Menghindari jawaban superfisial

### 4. peta_masalah (String - ASCII Art)
Buat diagram hierarkis dalam ASCII art yang menunjukkan:
- Central node: Masalah utama dari skenario
- Branch: Faktor risiko, etiologi, patofisiologi, manifestasi klinis, diagnosis, tatalaksana, komplikasi, prognosis
- Gunakan karakter: ┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼ ▼ ▲ ► ◄ untuk struktur box
- Pastikan lebar maksimal 80 karakter per baris agar readable di semua device
- Struktur dari atas ke bawah (top-down hierarchy)

Contoh struktur:
\`\`\`
                    ┌─────────────────────────────┐
                    │     MASALAH UTAMA           │
                    │  (dari skenario)            │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
         ┌────▼─────┐         ┌────▼─────┐        ┌────▼─────┐
         │ ETIOLOGI │         │PATOFIS   │        │MANIFESTASI│
         └──────────┘         └──────────┘        └──────────┘
              │                    │                    │
         ┌────▼─────┐         ┌────▼─────┐        ┌────▼─────┐
         │ Faktor   │         │ Mekanisme│        │ Gejala   │
         │ Risiko   │         │ Molekuler│        │ Klinis   │
         └──────────┘         └──────────┘        └──────────┘
\`\`\`

### 5. learning_objective (Array of Strings)
Format: "Mahasiswa mampu [verb] tentang [topik]"
- Jumlah: 10-15 objectives
- Harus mencakup: anatomi, fisiologi, patofisiologi, etiologi, epidemiologi, faktor risiko, manifestasi klinis, kriteria diagnosis, pemeriksaan penunjang, diagnosis banding, tatalaksana, komplikasi, prognosis, pencegahan
- WAJIB ada di akhir: "Integrasi Islam dan Sains Terkait dengan Skenario"
- Verb yang digunakan: memahami, menjelaskan, mengidentifikasi, menganalisis, menerapkan, mengevaluasi

Contoh:
- "Mahasiswa mampu menjelaskan tentang anatomi palpebra dan lakrimalis"
- "Mahasiswa mampu memahami tentang patofisiologi dari konjungtivitis"
- "Mahasiswa mampu menjelaskan tentang Integrasi Islam dan Sains Terkait dengan Skenario"

### 6. soap (Object)
Format dokumentasi klinis standar SOAP:

**subjective**: Data dari anamnesis pasien
- keluhan_utama: Keluhan yang membawa pasien berobat
- riwayat_penyakit_sekarang: Kronologi keluhan (onset, lokasi, durasi, karakteristik, faktor pemberat/peringan)
- riwayat_penyakit_dahulu: Penyakit yang pernah diderita
- riwayat_penyakit_keluarga: Penyakit herediter/familial
- riwayat_sosial_ekonomi: Kebiasaan, pekerjaan, lingkungan
- riwayat_pemakaian_obat: Obat yang sedang/pernah dikonsumsi
- alergi: Riwayat alergi obat/makanan

**objective**: Data dari pemeriksaan
- tanda_vital: TD, Nadi, RR, Suhu, SpO2
- pemeriksaan_fisik: Status generalis dan lokalis sesuai kasus
- pemeriksaan_penunjang: Hasil lab/radiologi/EKG (jika ada di skenario)

**assessment**: Penilaian klinis
- diagnosis_kerja: Diagnosis paling mungkin (dengan level SKDI jika memungkinkan)
- diagnosis_banding: 2-4 DD yang relevan

**plan**: Rencana tatalaksana
- farmakologi: Obat dengan dosis, rute, frekuensi (sesuai guideline)
- non_farmakologi: Edukasi gaya hidup, diet, kompres, dll
- monitoring: Parameter yang perlu dipantau
- edukasi: KIE untuk pasien (pencegahan, kepatuhan minum obat, tanda bahaya)

### 7. tips_pembelajaran (Object)
- konsep_dasar: Array of strings - topik basic science yang fundamental (anatomi, fisiologi, biokimia, dll)
- pendalaman_klinis: Array of strings - aspek diagnosis, tatalaksana, guideline terkini
- bacaan_tambahan: Array of strings - referensi textbook/guideline yang relevan (tanpa URL)
- clinical_reasoning: Array of strings - cara berpikir untuk approach kasus serupa

# CONSTRAINTS & GUIDELINES
1. ✅ Fokus pada medical accuracy - prioritaskan kebenaran informasi medis
2. ✅ Gunakan Bahasa Indonesia formal akademis
3. ✅ Jika skenario tidak jelas/terlalu pendek (<50 kata), kembalikan error message
4. ✅ Learning Objective harus spesifik dan measurable
5. ✅ SOAP harus realistis berdasarkan skenario yang diberikan
6. ✅ Jika data tidak tersedia di skenario (misal: alergi, RPD), tulis "-" atau "Tidak disebutkan"
7. ✅ Dosis obat harus sesuai guideline Indonesia (PAPDI, PERDOSKI, IDAI, dll)
8. ✅ JANGAN GUNAKAN markdown backticks di response - langsung JSON object saja

# EXAMPLE PATTERN (dari dokumen referensi)
Dari dokumen referensi tutorial medis, perhatikan pola ini:

**Kata Sulit:**
- Term: "PPIH" → Def: "Panitia Penyelenggara Ibadah Haji. Petugas resmi yang ditugaskan oleh pemerintah Indonesia untuk menyelenggarakan layanan haji, termasuk pelayanan kesehatan jamaah sejak di tanah air, embarkasi, hingga Arab Saudi."

**Rumusan Masalah Pattern:**
- "Mengapa [fenomena X] terjadi pada [kondisi Y]?"
- "Bagaimana mekanisme [proses A] mempengaruhi [outcome B]?"
- "Apa saja faktor yang berperan dalam [kondisi C]?"

**Brainstorming Pattern:**
- Mulai dengan penjelasan umum konsep
- Jelaskan mekanisme spesifik dengan detail
- Berikan contoh aplikasi klinis
- Sintesis: hubungkan dengan pertanyaan awal

**Peta Masalah Pattern:**
- Hierarki jelas dari general ke specific
- Menunjukkan kausalitas dan flow
- Mencakup aspek multidisiplin

**Learning Objective Pattern:**
"Mahasiswa mampu memahami dan menjelaskan tentang [topik]"
- Selalu gunakan prefix "Mahasiswa mampu"
- Gunakan verb akademis: memahami, menjelaskan, mengidentifikasi, menganalisis
- Topik harus spesifik dan sesuai skenario
- Akhiri dengan: "Integrasi Islam dan Sains Terkait dengan Skenario"

**SOAP Pattern (Contoh Konjungtivitis):**
Subjective:
- Keluhan Utama: "Mata kanan merah sejak 5 hari yang lalu"
- RPS: Detail onset, progresivitas, faktor pemberat (malam hari, gatal, berair, lengket bangun tidur, sekret kuning)
- RPD, RPK: Jika tidak ada, tulis "-"
- Riwayat Sosial: Kontak dengan teman sekantor yang sakit serupa
- Riwayat Obat: Sudah coba insto tapi tidak membaik
- Kebiasaan: Suka mengucek mata

Objective:
- TTV: Dalam batas normal (jika tidak disebutkan di skenario)
- Pemeriksaan Fisik: VOD 6/6, konjungtiva bulbi hiperemia, conjungtiva injeksi (+), pericorneal injeksi (-), secret (+), kemosis (+), kornea jernih
- Penunjang: Jika ada (kultur, gram staining, dll)

Assessment:
- Diagnosis Kerja: Konjungtivitis ec bakteri (SKDI: 4A)
- DD: Konjungtivitis viral, konjungtivitis alergi, keratitis

Plan:
- Farmakologi: 
  * Kloramfenikol tetes mata 0,5% → 1-2 tetes setiap 2 jam selama 2 hari, dilanjutkan 4x/hari selama 5 hari
  * Loratadin 10 mg → 1x1 tablet/hari (untuk mengurangi gatal)
- Non Farmakologi:
  * Kompres dingin 3-4x/hari
  * Bersihkan sekret dengan kapas steril + NaCl 0,9%
  * Hindari mengucek mata
- Monitoring: Respon terapi dalam 2-3 hari, berkurangnya sekret dan kemerahan
- Edukasi:
  * Cuci tangan sebelum menyentuh mata
  * Jangan berbagi handuk/kosmetik
  * Gunakan kacamata saat keluar (mencegah penularan)
  * Obat tetes harus dihabiskan sesuai anjuran
  * Kontrol jika tidak membaik dalam 5-7 hari

# RESPONSE PROTOCOL
Ketika menerima skenario:
1. Parsing: Identifikasi komponen kasus (anamnesis, PF, penunjang)
2. Domain Analysis: Tentukan bidang medis utama
3. Generate: Buat output sesuai format JSON (6 sections)
4. Validate: Koherensi antar section
5. Quality Check: Medical accuracy dan kelengkapan

CRITICAL: Response HARUS berupa valid JSON object tanpa markdown wrapper.

Mulai analisis sekarang!`;

// ===== STATE MANAGEMENT =====
let currentFile = null;
let currentScenario = null;
let analysisResult = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    const apiKey = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (apiKey) {
        document.getElementById('apiKeySection').style.display = 'none';
        document.getElementById('inputSection').style.display = 'block';
    }
}

function setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    const apiKeyInput = document.getElementById('apiKeyInput');
    const validationInfo = document.getElementById('validationInfo');
    
    if (apiKeyInput && validationInfo) {
        apiKeyInput.addEventListener('focus', () => {
            validationInfo.style.display = 'block';
        });
    }
}

// ===== API KEY MANAGEMENT =====
async function saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        showToast('⚠️ API Key tidak boleh kosong!', 'warning');
        return;
    }

    if (!apiKey.startsWith('AIza')) {
        showToast('⚠️ Format API Key tidak valid. Harus dimulai dengan "AIza"', 'error');
        return;
    }

    const saveBtn = document.getElementById('saveKeyBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '🔄 Memvalidasi...';
    apiKeyInput.disabled = true;

    const validationInfo = document.getElementById('validationInfo');
    if (validationInfo) {
        validationInfo.style.display = 'block';
    }

    try {
        const isValid = await validateApiKey(apiKey);
        
        if (isValid) {
            localStorage.setItem(CONFIG.STORAGE_KEY, apiKey);
            
            if (validationInfo) {
                validationInfo.style.display = 'none';
            }
            
            showToast('✅ API Key valid dan berhasil disimpan!', 'success');
            
            setTimeout(() => {
                document.getElementById('apiKeySection').style.display = 'none';
                document.getElementById('inputSection').style.display = 'block';
                
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
                apiKeyInput.disabled = false;
            }, 1500);
            
        } else {
            throw new Error('API Key tidak valid atau tidak memiliki akses ke Gemini API');
        }
        
    } catch (error) {
        console.error('API Key validation error:', error);
        showToast('❌ ' + error.message, 'error');
        
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
        apiKeyInput.disabled = false;
        apiKeyInput.focus();
        
        if (validationInfo) {
            validationInfo.style.display = 'none';
        }
    }
}

async function validateApiKey(apiKey) {
    try {
        console.log('🔍 Validating API Key...');
        
        const testPrompt = "Respond with only: OK";
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: testPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 10,
                    }
                })
            }
        );

        console.log('📡 Validation response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Key valid!');
            return true;
        } else {
            const errorData = await response.json();
            console.error('❌ API Key validation failed:', errorData);
            
            if (response.status === 400) {
                if (errorData.error?.message?.includes('API key not valid')) {
                    throw new Error('API Key tidak valid. Pastikan Anda menggunakan API Key yang benar dari Google AI Studio.');
                } else if (errorData.error?.message?.includes('not found')) {
                    throw new Error('Model tidak ditemukan. Pastikan API Key Anda memiliki akses ke Gemini API.');
                }
            } else if (response.status === 403) {
                throw new Error('API Key tidak memiliki permission. Pastikan API Key sudah diaktifkan di Google AI Studio.');
            } else if (response.status === 429) {
                throw new Error('Rate limit tercapai. Tunggu sebentar dan coba lagi.');
            }
            
            throw new Error(`Validasi gagal: ${errorData.error?.message || 'Unknown error'}`);
        }
        
    } catch (error) {
        console.error('❌ Validation error:', error);
        
        if (error.message.includes('fetch')) {
            throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
        }
        
        throw error;
    }
}

function changeApiKey() {
    const confirmed = confirm(
        '⚠️ Yakin ingin mengganti API Key?\n\n' +
        'Anda harus memasukkan dan memvalidasi API Key baru.'
    );
    
    if (confirmed) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        showToast('🔄 Silakan masukkan API Key baru');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'text') {
        document.getElementById('textTab').classList.add('active');
        currentFile = null;
    } else {
        document.getElementById('fileTab').classList.add('active');
        document.getElementById('scenarioText').value = '';
    }
}

// ===== FILE HANDLING =====
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showError(`File terlalu besar! Maksimal ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
        return;
    }

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showError('Format file tidak didukung! Gunakan PDF, PNG, atau JPG');
        return;
    }

    currentFile = file;
    showFilePreview(file);
}

function showFilePreview(file) {
    const preview = document.getElementById('filePreview');
    const fileIcon = file.type.includes('pdf') ? '📄' : '🖼️';
    const fileSize = (file.size / 1024).toFixed(2);
    
    preview.innerHTML = `
        <div class="file-info">
            <div class="file-icon">${fileIcon}</div>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize} KB</div>
            </div>
            <button onclick="removeFile()" class="btn btn-outline" style="padding: 0.5rem 1rem;">
                ❌ Hapus
            </button>
        </div>
    `;
    preview.classList.add('show');
}

function removeFile() {
    currentFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('filePreview').classList.remove('show');
}

// ===== MAIN PROCESSING =====
async function processScenario() {
    const startTime = performance.now();
    
    try {
        let scenarioText = document.getElementById('scenarioText').value.trim();
        
        if (!scenarioText && !currentFile) {
            showError('Mohon masukkan skenario (text atau file)!');
            return;
        }

        showLoading();

        if (currentFile) {
            scenarioText = await extractTextFromFile(currentFile);
        }

        if (scenarioText.length < 50) {
            showError('Skenario terlalu pendek! Minimal 50 karakter untuk analisis yang akurat.');
            hideLoading();
            return;
        }

        currentScenario = scenarioText;

        const result = await analyzeWithGemini(scenarioText);
        
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`⏱️ Analysis completed in ${duration} seconds`);
        
        analysisResult = result;
        displayResults(result);
        
    } catch (error) {
        console.error('Error processing scenario:', error);
        showError(error.message || 'Terjadi kesalahan saat memproses skenario');
        hideLoading();
    }
}

// ===== FILE TEXT EXTRACTION =====
async function extractTextFromFile(file) {
    const apiKey = localStorage.getItem(CONFIG.STORAGE_KEY);
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const base64Data = e.target.result.split(',')[1];
                const mimeType = file.type;
                
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    {
                                        text: "Ekstrak seluruh teks dari dokumen ini. Berikan output dalam format plain text tanpa formatting tambahan. Fokus pada konten skenario kasus medis."
                                    },
                                    {
                                        inline_data: {
                                            mime_type: mimeType,
                                            data: base64Data
                                        }
                                    }
                                ]
                            }],
                            generationConfig: {
                                temperature: 0.1,
                                maxOutputTokens: 4096,
                            }
                        })
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'Gagal mengekstrak teks dari file');
                }

                const data = await response.json();
                const extractedText = data.candidates[0].content.parts[0].text;
                
                resolve(extractedText);
                
            } catch (error) {
                reject(new Error('Gagal membaca file: ' + error.message));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Gagal membaca file'));
        };
        
        reader.readAsDataURL(file);
    });
}

// ===== GEMINI API CALL =====
async function analyzeWithGemini(scenario) {
    const apiKey = localStorage.getItem(CONFIG.STORAGE_KEY);
    
    if (!apiKey) {
        throw new Error('API Key tidak ditemukan. Silakan setup API Key terlebih dahulu.');
    }

    const fullPrompt = `${SYSTEM_PROMPT}

# SKENARIO KASUS:
${scenario}

Analisis skenario di atas dan berikan output dalam format JSON sesuai instruksi.`;

    console.log('📤 Sending request to Gemini API...');

    const response = await fetch(
        `${CONFIG.GEMINI_API_ENDPOINT}?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: CONFIG.GENERATION_CONFIG,
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_NONE"
                    }
                ]
            })
        }
    );

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        
        if (response.status === 429) {
            throw new Error('Rate limit tercapai. Mohon tunggu beberapa saat dan coba lagi.');
        } else if (response.status === 401) {
            throw new Error('API Key tidak valid. Mohon periksa kembali API Key Anda.');
        } else {
            throw new Error(errorData.error?.message || 'Gagal menganalisis skenario');
        }
    }

    const data = await response.json();
    console.log('✅ Raw API response:', data);
    
    let responseText = data.candidates[0].content.parts[0].text;
    console.log('📄 Response text (first 500 chars):', responseText.substring(0, 500));

    responseText = responseText
        .trim()
        .replace(/^```json\n?/g, '')
        .replace(/^```\n?/g, '')
        .replace(/```\n?$/g, '')
        .replace(/^`+|`+$/g, '');
    
    try {
        const parsedResult = JSON.parse(responseText);
        
        if (parsedResult.error) {
            throw new Error(parsedResult.error);
        }
        
        if (!parsedResult.kata_sulit || !parsedResult.rumusan_masalah || 
            !parsedResult.brainstorming || !parsedResult.peta_masalah || 
            !parsedResult.learning_objective || !parsedResult.soap ||
            !parsedResult.tips_pembelajaran) {
            throw new Error('Format response tidak lengkap. Mohon coba lagi.');
        }

        console.log('✅ Parsed result:', parsedResult);
        return parsedResult;
        
    } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw Response:', responseText);
        throw new Error('Gagal memparse response AI. Response: ' + responseText.substring(0, 200));
    }
}

// ===== DISPLAY RESULTS (UPDATED) =====
function displayResults(result) {
    const outputContent = document.getElementById('outputContent');
    
    let html = '';
    
    // 1. Identifikasi Kata Sulit
    html += `
        <div class="output-section">
            <h3>1️⃣ Identifikasi Kata Sulit</h3>
            ${result.kata_sulit.map(item => `
                <div class="kata-sulit-item">
                    <div class="kata-sulit-term">${escapeHtml(item.term)}</div>
                    <div class="kata-sulit-def">${escapeHtml(item.definition)}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 2. Rumusan Masalah
    html += `
        <div class="output-section">
            <h3>2️⃣ Rumusan Masalah</h3>
            <ol class="rumusan-list">
                ${result.rumusan_masalah.map(item => `
                    <li class="rumusan-item">${escapeHtml(item)}</li>
                `).join('')}
            </ol>
        </div>
    `;
    
    // 3. Brainstorming
    html += `
        <div class="output-section">
            <h3>3️⃣ Brainstorming</h3>
            ${result.brainstorming.map((item, index) => `
                <div class="brainstorm-item">
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">
                        ${index + 1}. ${escapeHtml(item.question)}
                    </h4>
                    <div style="margin-left: 1rem;">
                        ${formatAnswer(item.answer)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 4. Peta Masalah
    html += `
        <div class="output-section">
            <h3>4️⃣ Peta Masalah</h3>
            <div class="peta-masalah">
                <pre>${escapeHtml(result.peta_masalah)}</pre>
            </div>
        </div>
    `;
    
    // 5. Learning Objective (NEW)
    html += `
        <div class="output-section">
            <h3>5️⃣ Learning Objective</h3>
            <div class="lo-section">
                <p style="margin-bottom: 1rem; font-weight: 600;">Mahasiswa mampu menjelaskan tentang:</p>
                <ol class="lo-list">
                    ${result.learning_objective.map(item => `
                        <li class="lo-item">${escapeHtml(item)}</li>
                    `).join('')}
                </ol>
            </div>
        </div>
    `;
    
    // 6. SOAP (NEW)
    html += `
        <div class="output-section">
            <h3>6️⃣ SOAP</h3>
            <div class="soap-container">
                <!-- Subjective -->
                <div class="soap-section">
                    <h4 class="soap-header">📝 S = Subjective</h4>
                    <div class="soap-content">
                        <div class="soap-item">
                            <span class="soap-label">Keluhan Utama:</span>
                            <span class="soap-value">${escapeHtml(result.soap.subjective.keluhan_utama)}</span>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Riwayat Penyakit Sekarang:</span>
                            <div class="soap-value">${formatAnswer(result.soap.subjective.riwayat_penyakit_sekarang)}</div>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Riwayat Penyakit Dahulu:</span>
                            <span class="soap-value">${escapeHtml(result.soap.subjective.riwayat_penyakit_dahulu)}</span>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Riwayat Penyakit Keluarga:</span>
                            <span class="soap-value">${escapeHtml(result.soap.subjective.riwayat_penyakit_keluarga)}</span>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Riwayat Sosial dan Ekonomi:</span>
                            <div class="soap-value">${formatAnswer(result.soap.subjective.riwayat_sosial_ekonomi)}</div>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Riwayat Pemakaian Obat:</span>
                            <span class="soap-value">${escapeHtml(result.soap.subjective.riwayat_pemakaian_obat)}</span>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Alergi:</span>
                            <span class="soap-value">${escapeHtml(result.soap.subjective.alergi)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Objective -->
                <div class="soap-section">
                    <h4 class="soap-header">🔬 O = Objective</h4>
                    <div class="soap-content">
                        <div class="soap-item">
                            <span class="soap-label">Tanda Vital:</span>
                            <div class="soap-value">${formatAnswer(result.soap.objective.tanda_vital)}</div>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Pemeriksaan Fisik:</span>
                            <div class="soap-value">${formatAnswer(result.soap.objective.pemeriksaan_fisik)}</div>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Pemeriksaan Penunjang:</span>
                            <div class="soap-value">${formatAnswer(result.soap.objective.pemeriksaan_penunjang)}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Assessment -->
                <div class="soap-section">
                    <h4 class="soap-header">🎯 A = Assessment</h4>
                    <div class="soap-content">
                        <div class="soap-item">
                            <span class="soap-label">Diagnosis Kerja:</span>
                            <span class="soap-value">${escapeHtml(result.soap.assessment.diagnosis_kerja)}</span>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Diagnosis Banding:</span>
                            <ul class="soap-dd-list">
                                ${result.soap.assessment.diagnosis_banding.map(dd => `
                                    <li>${escapeHtml(dd)}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Plan -->
                <div class="soap-section">
                    <h4 class="soap-header">💊 P = Plan</h4>
                    <div class="soap-content">
                        <div class="soap-item">
                            <span class="soap-label">Farmakologi:</span>
                            <ul class="soap-plan-list">
                                ${result.soap.plan.farmakologi.map(obat => `
                                    <li>${escapeHtml(obat)}</li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Non Farmakologi:</span>
                            <ul class="soap-plan-list">
                                ${result.soap.plan.non_farmakologi.map(item => `
                                    <li>${escapeHtml(item)}</li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Monitoring:</span>
                            <div class="soap-value">${formatAnswer(result.soap.plan.monitoring)}</div>
                        </div>
                        <div class="soap-item">
                            <span class="soap-label">Edukasi (KIE):</span>
                            <ul class="soap-plan-list">
                                ${result.soap.plan.edukasi.map(item => `
                                    <li>${escapeHtml(item)}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 7. Tips Pembelajaran
    html += `
        <div class="output-section">
            <h3>7️⃣ Tips Pembelajaran</h3>
            <div class="tips-section">
                <div class="tips-category">
                    <h4>📚 Konsep Dasar</h4>
                    <ul>
                        ${result.tips_pembelajaran.konsep_dasar.map(item => `
                            <li>${escapeHtml(item)}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="tips-category">
                    <h4>🔬 Pendalaman Klinis</h4>
                    <ul>
                        ${result.tips_pembelajaran.pendalaman_klinis.map(item => `
                            <li>${escapeHtml(item)}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="tips-category">
                    <h4>📖 Bacaan Tambahan</h4>
                    <ul>
                        ${result.tips_pembelajaran.bacaan_tambahan.map(item => `
                            <li>${escapeHtml(item)}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="tips-category">
                    <h4>💡 Clinical Reasoning</h4>
                    <ul>
                        ${result.tips_pembelajaran.clinical_reasoning.map(item => `
                            <li>${escapeHtml(item)}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    outputContent.innerHTML = html;
    
    hideLoading();
    document.getElementById('outputSection').style.display = 'block';
    
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

// ===== UTILITY FUNCTIONS =====
function formatAnswer(answer) {
    let formatted = escapeHtml(answer);
    
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/gs, '<ul>$&</ul>');        
    formatted = formatted.split('\n\n').map(para => {
        if (!para.trim().startsWith('<')) {
            return `<p>${para}</p>`;
        }
        return para;
    }).join('');
    
    return formatted;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== OUTPUT ACTIONS =====
function copyOutput() {
    const outputText = generatePlainText(analysisResult);
    
    navigator.clipboard.writeText(outputText).then(() => {
        showToast('✅ Hasil berhasil di-copy ke clipboard!');
    }).catch(() => {
        showError('Gagal menyalin ke clipboard');
    });
}

function downloadOutput() {
    const outputText = generatePlainText(analysisResult);
    const filename = `medjumps-analisis-${Date.now()}.txt`;
    
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('✅ File berhasil diunduh!');
}

function generatePlainText(result) {
    let text = '='.repeat(80) + '\n';
    text += 'HASIL ANALISIS SEVEN JUMPS - MEDJUMPS\n';
    text += 'Generated: ' + new Date().toLocaleString('id-ID') + '\n';
    text += '='.repeat(80) + '\n\n';
    
    // Skenario
    text += 'SKENARIO:\n';
    text += '-'.repeat(80) + '\n';
    text += currentScenario + '\n\n';
    
    // 1. Kata Sulit
    text += '1. IDENTIFIKASI KATA SULIT\n';
    text += '-'.repeat(80) + '\n';
    result.kata_sulit.forEach((item, index) => {
        text += `${index + 1}. ${item.term}\n`;
        text += `   ${item.definition}\n\n`;
    });
    
    // 2. Rumusan Masalah
    text += '\n2. RUMUSAN MASALAH\n';
    text += '-'.repeat(80) + '\n';
    result.rumusan_masalah.forEach((item, index) => {
        text += `${index + 1}. ${item}\n`;
    });
    
    // 3. Brainstorming
    text += '\n3. BRAINSTORMING\n';
    text += '-'.repeat(80) + '\n';
    result.brainstorming.forEach((item, index) => {
        text += `${index + 1}. ${item.question}\n`;
        text += `   Jawab:\n`;
        text += `   ${item.answer.replace(/\n/g, '\n   ')}\n\n`;
    });
    
    // 4. Peta Masalah
    text += '\n4. PETA MASALAH\n';
    text += '-'.repeat(80) + '\n';
    text += result.peta_masalah + '\n\n';
    
    // 5. Learning Objective
    text += '\n5. LEARNING OBJECTIVE\n';
    text += '-'.repeat(80) + '\n';
    text += 'Mahasiswa mampu menjelaskan tentang:\n';
    result.learning_objective.forEach((item, index) => {
        text += `${index + 1}. ${item}\n`;
    });
    
    // 6. SOAP
    text += '\n6. SOAP\n';
    text += '-'.repeat(80) + '\n';
    text += '\nS = SUBJECTIVE\n';
    text += `Keluhan Utama: ${result.soap.subjective.keluhan_utama}\n`;
    text += `Riwayat Penyakit Sekarang: ${result.soap.subjective.riwayat_penyakit_sekarang}\n`;
    text += `Riwayat Penyakit Dahulu: ${result.soap.subjective.riwayat_penyakit_dahulu}\n`;
    text += `Riwayat Penyakit Keluarga: ${result.soap.subjective.riwayat_penyakit_keluarga}\n`;
    text += `Riwayat Sosial dan Ekonomi: ${result.soap.subjective.riwayat_sosial_ekonomi}\n`;
    text += `Riwayat Pemakaian Obat: ${result.soap.subjective.riwayat_pemakaian_obat}\n`;
    text += `Alergi: ${result.soap.subjective.alergi}\n`;
    
    text += '\nO = OBJECTIVE\n';
    text += `Tanda Vital: ${result.soap.objective.tanda_vital}\n`;
    text += `Pemeriksaan Fisik: ${result.soap.objective.pemeriksaan_fisik}\n`;
    text += `Pemeriksaan Penunjang: ${result.soap.objective.pemeriksaan_penunjang}\n`;
    
    text += '\nA = ASSESSMENT\n';
    text += `Diagnosis Kerja: ${result.soap.assessment.diagnosis_kerja}\n`;
    text += 'Diagnosis Banding:\n';
    result.soap.assessment.diagnosis_banding.forEach((dd, index) => {
        text += `${index + 1}. ${dd}\n`;
    });
    
    text += '\nP = PLAN\n';
    text += 'Farmakologi:\n';
    result.soap.plan.farmakologi.forEach(obat => {
        text += `- ${obat}\n`;
    });
    text += '\nNon Farmakologi:\n';
    result.soap.plan.non_farmakologi.forEach(item => {
        text += `- ${item}\n`;
    });
    text += `\nMonitoring: ${result.soap.plan.monitoring}\n`;
    text += '\nEdukasi (KIE):\n';
    result.soap.plan.edukasi.forEach(item => {
        text += `- ${item}\n`;
    });
    
    // 7. Tips Pembelajaran
    text += '\n7. TIPS PEMBELAJARAN\n';
    text += '-'.repeat(80) + '\n';
    text += '\n📚 Konsep Dasar:\n';
    result.tips_pembelajaran.konsep_dasar.forEach(item => {
        text += `- ${item}\n`;
    });
    text += '\n🔬 Pendalaman Klinis:\n';
    result.tips_pembelajaran.pendalaman_klinis.forEach(item => {
        text += `- ${item}\n`;
    });
    text += '\n📖 Bacaan Tambahan:\n';
    result.tips_pembelajaran.bacaan_tambahan.forEach(item => {
        text += `- ${item}\n`;
    });
    text += '\n💡 Clinical Reasoning:\n';
    result.tips_pembelajaran.clinical_reasoning.forEach(item => {
        text += `- ${item}\n`;
    });
    
    text += '\n' + '='.repeat(80) + '\n';
    text += 'Generated by MedJumps - AI Tutorial Assistant\n';
    text += '='.repeat(80);
    
    return text;
}

function resetApp() {
    currentFile = null;
    currentScenario = null;
    analysisResult = null;
    
    document.getElementById('scenarioText').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('filePreview').classList.remove('show');
    document.getElementById('outputSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
    
    document.getElementById('inputSection').style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== UI STATE MANAGEMENT =====
function showLoading() {
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('outputSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingSection').style.display = 'none';
}

function showError(message) {
    let formattedMessage = message;
    
    if (message.includes('API Key tidak valid')) {
        formattedMessage += '\n\n💡 Pastikan:\n';
        formattedMessage += '• API Key dimulai dengan "AIza"\n';
        formattedMessage += '• API Key dari Google AI Studio (bukan Google Cloud)\n';
        formattedMessage += '• API Key sudah diaktifkan';
    } else if (message.includes('Rate limit')) {
        formattedMessage += '\n\n⏳ Tips:\n';
        formattedMessage += '• Free tier: 15 requests per menit\n';
        formattedMessage += '• Tunggu 1 menit lalu coba lagi\n';
        formattedMessage += '• Atau upgrade ke paid plan';
    } else if (message.includes('koneksi')) {
        formattedMessage += '\n\n🌐 Troubleshooting:\n';
        formattedMessage += '• Periksa koneksi internet\n';
        formattedMessage += '• Coba refresh halaman\n';
        formattedMessage += '• Nonaktifkan VPN jika ada';
    }
    
    document.getElementById('errorMessage').textContent = formattedMessage;
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('outputSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'block';
    
    document.getElementById('errorSection').scrollIntoView({ behavior: 'smooth' });
}

function showToast(message, type = 'success') {
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    let bgColor = 'var(--primary)';
    if (type === 'error') {
        bgColor = 'var(--error)';
    } else if (type === 'warning') {
        bgColor = '#f59e0b';
    } else if (type === 'success') {
        bgColor = 'var(--secondary)';
    }
    
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add SOAP and LO specific styles
const soapStyles = document.createElement('style');
soapStyles.textContent = `
    /* ===== LEARNING OBJECTIVE STYLES ===== */
    .lo-section {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #f59e0b;
    }
    
    .lo-list {
        margin-left: 1.5rem;
        line-height: 1.8;
    }
    
    .lo-item {
        margin-bottom: 0.75rem;
        color: var(--text);
        font-size: 1rem;
    }
    
    .lo-item:last-child {
        font-weight: 600;
        color: var(--primary);
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 2px dashed rgba(0,0,0,0.1);
    }
    
    /* ===== SOAP STYLES ===== */
    .soap-container {
        background: var(--background);
        padding: 1.5rem;
        border-radius: 8px;
        border: 2px solid var(--border);
    }
    
    .soap-section {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: var(--shadow);
    }
    
    .soap-section:last-child {
        margin-bottom: 0;
    }
    
    .soap-header {
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 3px solid var(--primary);
        color: var(--primary);
    }
    
    .soap-content {
        line-height: 1.8;
    }
    
    .soap-item {
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px dashed var(--border);
    }
    
    .soap-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
    }
    
    .soap-label {
        display: inline-block;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 0.5rem;
        min-width: 200px;
    }
    
    .soap-value {
        display: block;
        color: var(--text);
        margin-left: 0;
        margin-top: 0.5rem;
    }
    
    .soap-dd-list,
    .soap-plan-list {
        margin-left: 1.5rem;
        margin-top: 0.5rem;
    }
    
    .soap-dd-list li,
    .soap-plan-list li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
    }
    
    /* Responsive SOAP */
    @media (max-width: 768px) {
        .soap-container {
            padding: 1rem;
        }
        
        .soap-section {
            padding: 1rem;
        }
        
        .soap-label {
            min-width: auto;
            display: block;
        }
        
        .soap-value {
            margin-left: 0;
        }
    }
`;
document.head.appendChild(soapStyles);