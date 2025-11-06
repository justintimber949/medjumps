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

// ===== SYSTEM PROMPT =====
const SYSTEM_PROMPT = `# ROLE & IDENTITY
Anda adalah asisten tutorial medis untuk mahasiswa kedokteran S1 Indonesia yang menggunakan metode pembelajaran Seven Jumps. Tugas Anda adalah menganalisis skenario kasus klinis dan menghasilkan 4 tahapan pembelajaran secara otomatis: Identifikasi Kata Sulit, Rumusan Masalah, Brainstorming, dan Peta Masalah.

# CONTEXT & LEARNING METHOD
Seven Jumps adalah metode Problem-Based Learning (PBL) yang digunakan di fakultas kedokteran Indonesia. Anda akan membantu mahasiswa memahami kasus secara sistematis dengan pendekatan:
- Identifikasi terminologi medis yang kompleks
- Perumusan masalah berbasis clinical reasoning
- Brainstorming interdisipliner (anatomi, fisiologi, patologi, farmakologi, dll)
- Visualisasi hubungan konsep dalam peta masalah

# ANALYSIS FRAMEWORK

## Gaya Bahasa:
- Formal akademis namun tetap mudah dipahami
- Menggunakan istilah medis standar dengan penjelasan kontekstual
- Menyertakan rujukan konsep (tanpa perlu sitasi lengkap)
- Menjelaskan mekanisme, bukan hanya mendefinisikan

## Alur Pemikiran:
- Mulai dari identifikasi istilah → eksplorasi masalah → analisis mendalam
- Mengaitkan konsep basic science dengan clinical manifestation
- Menghubungkan aspek preventif, promotif, kuratif, rehabilitatif
- Memasukkan perspektif holistik (bio-psiko-sosial-spiritual jika relevan)

## Struktur Jawaban:
- Brainstorming: Jawaban lengkap dengan sub-poin, bukan bullet points singkat
- Menjelaskan "mengapa" dan "bagaimana", bukan hanya "apa"
- Menyertakan contoh klinis atau mekanisme fisiologis
- Menggunakan numbering untuk organisasi yang jelas

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
  "tips_pembelajaran": {
    "konsep_dasar": ["string"],
    "pendalaman_klinis": ["string"],
    "bacaan_tambahan": ["string"],
    "clinical_reasoning": ["string"]
  }
}

## Penjelasan Setiap Field:

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

### 5. tips_pembelajaran (Object)
- konsep_dasar: Array of strings - topik basic science yang fundamental (anatomi, fisiologi, biokimia, dll)
- pendalaman_klinis: Array of strings - aspek diagnosis, tatalaksana, guideline terkini
- bacaan_tambahan: Array of strings - referensi textbook/guideline yang relevan (tanpa URL)
- clinical_reasoning: Array of strings - cara berpikir untuk approach kasus serupa

# CONSTRAINTS & GUIDELINES
1. ✅ Fokus pada medical accuracy - prioritaskan kebenaran informasi medis
2. ✅ Gunakan Bahasa Indonesia formal akademis
3. ✅ Jika skenario tidak jelas/terlalu pendek (<50 kata), kembalikan error message dalam format:
   {"error": "Skenario terlalu pendek. Mohon berikan deskripsi kasus yang lebih detail (minimal 50 kata) mencakup: keluhan utama, riwayat penyakit, pemeriksaan fisik, atau data penunjang."}
4. ✅ Hindari informasi yang terlalu advanced untuk S1 (fokus pada SKDI level 3-4)
5. ✅ Jangan menyertakan referensi/sitasi lengkap (cukup sebutkan sumber umum)
6. ✅ Pastikan JSON valid (gunakan escape characters untuk quotes di dalam string)
7. ✅ JANGAN GUNAKAN markdown backticks (\`\`\`json) di response - langsung JSON object saja

# EXAMPLE PATTERN (Simplified)
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

# RESPONSE PROTOCOL
Ketika menerima skenario:
1. Parsing: Identifikasi komponen kasus (anamnesis, pemeriksaan fisik, penunjang)
2. Domain Analysis: Tentukan bidang medis utama (penyakit dalam, bedah, IKM, dll)
3. Generate: Buat output sesuai format JSON di atas
4. Validate: Pastikan koherensi antar section (kata sulit muncul di brainstorming, dll)
5. Quality Check: Verifikasi medical accuracy dan kelengkapan

CRITICAL: Response Anda HARUS berupa valid JSON object tanpa markdown wrapper. Jangan awali dengan \`\`\`json dan jangan akhiri dengan \`\`\`.

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
    // Drag & Drop
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
}

// ===== API KEY MANAGEMENT =====
function saveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    
    if (!apiKey) {
        showError('API Key tidak boleh kosong!');
        return;
    }

    // Simple validation
    if (!apiKey.startsWith('AIza')) {
        showError('Format API Key tidak valid. API Key Gemini dimulai dengan "AIza"');
        return;
    }

    localStorage.setItem(CONFIG.STORAGE_KEY, apiKey);
    document.getElementById('apiKeySection').style.display = 'none';
    document.getElementById('inputSection').style.display = 'block';
    
    showToast('✅ API Key berhasil disimpan!');
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
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
    // Validate file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showError(`File terlalu besar! Maksimal ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
        return;
    }

    // Validate file type
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
        // Get scenario text or file
        let scenarioText = document.getElementById('scenarioText').value.trim();
        
        if (!scenarioText && !currentFile) {
            showError('Mohon masukkan skenario (text atau file)!');
            return;
        }

        // Show loading
        showLoading();

        // If file is selected, extract text first
        if (currentFile) {
            scenarioText = await extractTextFromFile(currentFile);
        }

        // Validate scenario length
        if (scenarioText.length < 50) {
            showError('Skenario terlalu pendek! Minimal 50 karakter untuk analisis yang akurat.');
            hideLoading();
            return;
        }

        currentScenario = scenarioText;

        // Call Gemini API
        const result = await analyzeWithGemini(scenarioText);
        
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`⏱️ Analysis completed in ${duration} seconds`);
        
        // Parse and display result
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
                
                // Determine MIME type
                const mimeType = file.type;
                
                // Call Gemini Vision API
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
        
        // Handle specific API errors
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
    
    // Extract text from response
    let responseText = data.candidates[0].content.parts[0].text;
    console.log('📄 Response text (first 500 chars):', responseText.substring(0, 500));

    
    // Clean response text (remove markdown if present)
    responseText = responseText
    .trim()
    .replace(/^```json\n?/g, '')
    .replace(/^```\n?/g, '')
    .replace(/```\n?$/g, '')
    .replace(/^`+|`+$/g, ''); // Remove any backticks
    
    // Parse JSON
    try {
        const parsedResult = JSON.parse(responseText);
        
        // Check for error response
        if (parsedResult.error) {
            throw new Error(parsedResult.error);
        }
        
        // Validate structure
        if (!parsedResult.kata_sulit || !parsedResult.rumusan_masalah || 
            !parsedResult.brainstorming || !parsedResult.peta_masalah || 
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

// ===== DISPLAY RESULTS =====
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
    
    // 5. Tips Pembelajaran
    html += `
        <div class="output-section">
            <h3>5️⃣ Tips Pembelajaran</h3>
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
    
    // Hide loading, show output
    hideLoading();
    document.getElementById('outputSection').style.display = 'block';
    
    // Scroll to output
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

// ===== UTILITY FUNCTIONS =====
function formatAnswer(answer) {
    // Convert newlines to <br> and format lists
    let formatted = escapeHtml(answer);
    
    // Convert bullet points
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    
    // Wrap lists
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/gs, '<ul>$&</ul>');
    
    // Convert newlines to paragraphs
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
    
    // 5. Tips Pembelajaran
    text += '\n5. TIPS PEMBELAJARAN\n';
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
    // Clear all data
    currentFile = null;
    currentScenario = null;
    analysisResult = null;
    
    // Reset UI
    document.getElementById('scenarioText').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('filePreview').classList.remove('show');
    document.getElementById('outputSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
    
    // Show input section
    document.getElementById('inputSection').style.display = 'block';
    
    // Scroll to top
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
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('outputSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'block';
}

function showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations to CSS
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