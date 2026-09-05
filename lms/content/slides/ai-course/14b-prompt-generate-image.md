# 🖼️ Panduan Lengkap: Menulis Prompt yang Baik untuk AI Image Generation

> **Materi AI Course — Modul 14B**
> **Tujuan:** Menguasai teknik menulis prompt yang efektif untuk menghasilkan gambar berkualitas tinggi menggunakan AI image generators.

---

## 📋 Daftar Isi

1. [Anatomy of a Good Image Prompt](#1-anatomy-of-a-good-image-prompt)
2. [Perbandingan Platform](#2-perbandingan-platform-image-generation)
3. [Formula Prompt: STYLE + SUBJECT + CONTEXT](#3-formula-prompt-style--subject--context)
4. [20 Contoh Prompt Image Generation](#4-20-contoh-prompt-image-generation)
5. [Cheat Sheet Style Keywords](#5-cheat-sheet-style-keywords)
6. [Negative Prompts](#6-negative-prompts)
7. [Before/After: Prompt Sederhana vs Prompt Jago](#7-beforeafter-prompt-sederhana-vs-prompt-jago)
8. [Tips Pro](#8-tips-pro)
9. [Latihan](#9-latihan)

---

## 1. 🧬 Anatomy of a Good Image Prompt

Prompt yang baik bukan sekadar satu kalimat, tapi merupakan **kombinasi terstruktur** dari beberapa elemen kunci. Bayangkan prompt seperti resep masakin — setiap bahan berpengaruh terhadap hasil akhir.

### 🔬 Elemen-elemen Prompt

| # | Elemen | Fungsi | Contoh |
|---|--------|--------|--------|
| 1 | **Subject (Subjek)** | Apa yang digambarkan? | `seorang astronaut`, `secangkir kopi`, `logo startup teknologi` |
| 2 | **Style (Gaya)** | Gaya visual/artistik | `watercolor`, `photorealistic`, `anime`, `pixel art` |
| 3 | **Composition (Komposisi)** | Sudut kamera, framing | `close-up`, `wide angle`, `bird's eye view`, `portrait` |
| 4 | **Lighting (Pencahayaan)** | Mood dan waktu | `golden hour`, `neon glow`, `studio lighting`, `dramatic shadow` |
| 5 | **Color Palette (Palet Warna)** | Tone warna | `warm tones`, `pastel`, `monochrome`, `vibrant colors` |
| 6 | **Details & Modifiers** | Penambahan detail spesifik | `intricate details`, `sharp focus`, `bokeh background` |
| 7 | **Negative Prompt** | Apa yang harus dihindari | `blurry, low quality, deformed, ugly` |

### 🗺️ Diagram: Image Prompt Anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│                    🖼️ IMAGE PROMPT ANATOMY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [STYLE]  +  [SUBJECT]  +  [CONTEXT]  +  [DETAILS]             │
│     │           │              │              │                  │
│     ▼           ▼              ▼              ▼                  │
│  "Anime      "a warrior   "in a neon-    "detailed             │
│  art style"   girl"        lit city"      armor,               │
│                                              dramatic           │
│                                              lighting"          │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │  MODIFIERS TAMBAHAN:                             │          │
│  │  • Lighting: golden hour, rim light, soft glow   │          │
│  │  • Color: warm palette, pastel tones, neon       │          │
│  │  • Composition: full body, centered, rule of 3   │          │
│  │  • Quality: 8k, detailed, sharp focus            │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │  NEGATIVE PROMPT (opsional):                     │          │
│  │  blurry, low quality, watermark, deformed        │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 💡 Tips Anatomi

- **Mulai dari subjek** → Tentukan dulu apa yang ingin digambar
- **Tambahkan style** → Pilih gaya visual yang sesuai
- **Tentukan komposisi** → Atur angle dan framing
- **Atur pencahayaan** → Ciptakan mood yang tepa
- **Tentukan warna** → Sesuaikan palet dengan tema
- **Tambahkan detail** → Perjelas elemen-elemen spesifik
- **Gunakan negative prompt** → Bersihkan hasil dari artefak

---

## 2. 🌐 Perbandingan Platform Image Generation

### Tabel Perbandingan Lengkap

| Fitur | 🟢 DALL-E 3 | 🟣 Midjourney | 🔵 Stable Diffusion | 🟠 Canva AI | 🔴 Leonardo AI | ⚪ Flux |
|-------|-------------|---------------|---------------------|-------------|----------------|---------|
| **Kekuatan** | Pemahaman teks paling akurat, natural language processing kuat | Estetika paling artistik, komposisi sempurna | Open source, highly customizable, komunitas besar | Mudah digunakan, terintegrasi desain | Game assets & character design | Realism terbaik, prompt adherence tinggi |
| **Kelemahan** | Kurang fleksibel untuk NSFW/edgy, di balik paywall OpenAI | Mahal, butuh Discord, learning curve tinggi | Butuh GPU kuat atau cloud, hasil bervariasi | Fitur AI terbatas vs dedicated tool | Beberapa fitur premium | Masih relatif baru, ekosistem lebih kecil |
| **Best For** | Presentasi, dokumentasi, deskripsi kompleks | Ilustrasi artistik, konsep art, branding | Custom workflow, batch generation, research | Quick social media, non-designer | Game dev, character design | Foto realistis, product shots |
| **Harga** | $20/bulan (ChatGPT Plus) | $10-$60/bulan | Gratis (local), ~$0.02/gambar (cloud) | Gratis + Pro $13/bulan | Gratis + Leonardo Plan $12/bulan | Gratis terbatas, Pro $12/bulan |
| **Akses** | chat.openai.com | discord.com/invite/midjourney | Local: AUTOMATIC1111 / ComfyUI | canva.com | leonardo.ai | fal.ai, replicate.com |
| **Negative Prompt** | ❌ Tidak ada (deskripsikan apa yang tidak diinginkan dalam teks) | ✅ Via `--no` parameter | ✅ Field terpisah | ❌ Tidak ada | ✅ Field terpisah | ✅ Field terpisah |

### 🎯 Rekomendasi Platform per Kebutuhan

| Kebutuhan Anda | Platform Terbaik | Alasan |
|----------------|------------------|--------|
| 📊 Slide presentasi bisnis | DALL-E 3 | Paham deskripsi kompleks, konsisten |
| 🎮 Game assets | Leonardo AI / Stable Diffusion | Spesialis character & game art |
| 📱 Social media cepat | Canva AI | Mudah, langsung desain jadi |
| 🎨 Ilustrasi artistik | Midjourney | Kualitas estetika paling tinggi |
| 📸 Foto realistis | Flux | Realisme terbaik di kelasnya |
| 🔬 Eksperimen / Research | Stable Diffusion | Open source, customizable |

---

## 3. 📐 Formula Prompt: STYLE + SUBJECT + CONTEXT

### Formula Inti

```
[STYLE] of [SUBJECT] in [CONTEXT/SETTING]
```

Formula ini adalah **kerangka dasar** yang bisa dikembangkan. Mulai dari ini, lalu tambahkan elemen lain.

### Variasi Formula

```
Variasi 1: [STYLE] [SUBJECT], [CONTEXT], [LIGHTING], [DETAILS]
Variasi 2: [SUBJECT] [ACTION], [SETTING], [STYLE], [MOOD]
Variasi 3: [COMPOSITION] of [SUBJECT], [STYLE], [COLOR PALETTE]
```

### 🗺️ Diagram Formula Breakdown

```
┌──────────────────────────────────────────────────────────────┐
│                 📐 FORMULA: STYLE + SUBJECT + CONTEXT        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  STYLE   │  │ SUBJECT  │  │ CONTEXT  │  │  MODIFIERS │  │
│  │ (Gaya)   │  │ (Subjek) │  │ (Konteks)│  │ (Detail)   │  │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├────────────┤  │
│  │ watercolor│ │ a cat    │  │ sitting  │  │ warm light │  │
│  │ anime    │  │ a logo   │  │ on desk  │  │ soft focus │  │
│  │ 3D render│  │ a city   │  │ at night │  │ 8k quality │  │
│  │ photo    │  │ a woman  │  │ in rain  │  │ detailed   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│       │              │              │              │          │
│       └──────────────┴──────────────┴──────────────┘          │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  "watercolor of a cat sitting on a desk in warm      │   │
│  │   light, soft focus, 8k quality"                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 📝 Contoh Penerapan Formula

| # | STYLE | SUBJECT | CONTEXT | Hasil Prompt |
|---|-------|---------|---------|-------------|
| 1 | Digital art | a warrior princess | in an enchanted forest at dawn | "Digital art of a warrior princess in an enchanted forest at dawn, magical particles floating, cinematic lighting" |
| 2 | Minimalist flat design | a tech startup logo | clean background | "Minimalist flat design logo for a tech startup called 'NexGen', clean white background, blue and white color scheme, vector style" |
| 3 | Photography style | steaming ramen bowl | in a Japanese restaurant | "Professional food photography of a steaming ramen bowl in a Japanese restaurant, shallow depth of field, warm lighting, close-up shot" |
| 4 | Pixel art | a game character | dungeon setting | "16-bit pixel art of a knight character in a dungeon setting, retro game aesthetic, sprite sheet style, dark atmosphere" |
| 5 | Isometric 3D | a cozy home office | warm afternoon light | "Isometric 3D render of a cozy home office with warm afternoon light streaming through window, detailed furniture, soft shadows" |

---

## 4. 🎨 20 Contoh Prompt Image Generation

### 🅰️ Logo & Branding

---

#### Contoh 1: Logo Startup Teknologi Minimalis

**Prompt:**

```
Minimalist logo design for a tech startup called "CloudNest",
abstract cloud shape combined with a bird nest motif,
clean geometric lines, monochromatic blue color palette,
flat design, vector style, white background, professional branding,
no text, scalable design
```

| Detail | Info |
|--------|------|
| **Platform** | DALL-E 3 atau Midjourney |
| **Style Keywords** | minimalist, flat design, geometric, vector, clean |
| **Hasil yang Diharapkan** | Logo bersih bentuk abstrak awak + sarang burung, monokrom biru, cocok untuk dicetak dan digital |

---

#### Contoh 2: Logo Cafe Retro

**Prompt:**

```
Retro vintage logo for a coffee shop called "Kopi Tempo Dulu",
illustration of a classic coffee cup with steam swirls,
1950s diner aesthetic, warm brown and cream color palette,
hand-drawn typography style, circular badge design,
rustic charm, high contrast, white background
```

| Detail | Info |
|--------|------|
| **Platform** | Midjourney atau DALL-E 3 |
| **Style Keywords** | retro, vintage, 1950s, hand-drawn, badge, rustic |
| **Hasil yang Diharapkan** | Logo vintage badge dengan cangkir kopi klasik, nuansa coklat krem, estetika era 1950-an |

---

#### Contoh 3: Brand Fitness Modern

**Prompt:**

```
Modern fitness brand logo for "IronWill",
bold geometric mountain peak icon,
sharp angular design, matte black and electric red color scheme,
minimalist sans-serif typography, strong masculine energy,
gym and athletic aesthetic, clean background, vector graphic
```

| Detail | Info |
|--------|------|
| **Platform** | Leonardo AI atau DALL-E 3 |
| **Style Keywords** | modern, bold, geometric, angular, minimalist, strong |
| **Hasil yang Diharapkan** | Logo modern dengan ikon puncak gunung tajam, hitam matte + merah elektrik, energi maskulin kuat |

---

#### Contoh 4: Brand Perhiasan Elegan

**Prompt:**

```
Elegant luxury jewelry brand logo for "Lumière",
delicate diamond sparkle icon with golden crescent moon,
art deco inspired design, gold and white color palette,
sophisticated serif typography, premium feel,
minimalist composition, white background, high-end branding
```

| Detail | Info |
|--------|------|
| **Platform** | Midjourney |
| **Style Keywords** | elegant, luxury, art deco, sophisticated, premium, minimalist |
| **Hasil yang Diharapkan** | Logo mewah bergaya Art Deco dengan ikon berlian dan bulan sabit emas, nuansa putih-emas |

---

#### Contoh 5: Brand Pendidikan Anak

**Prompt:**

```
Playful children education brand logo for "KiddoLearn",
cute cartoon owl character wearing graduation cap,
bright cheerful colors: orange, teal, and yellow,
rounded friendly shapes, hand-drawn illustration style,
fun and inviting energy, white background,
simple enough for stickers and app icons
```

| Detail | Info |
|--------|------|
| **Platform** | DALL-E 3 atau Canva AI |
| **Style Keywords** | playful, cute, cartoon, cheerful, rounded, hand-drawn, fun |
| **Hasil yang Diharapkan** | Logo lucu dengan karakter burung hantu kartun pakai topi wisuda, warna ceria oranye-teal-kuning |

---

### 🅱️ Social Media

---

#### Contoh 6: Instagram Post Restoran Makanan

**Prompt:**

```
Overhead flat lay food photography of an Indonesian rijsttafel
feasting table, rendang, sate ayam, gado-gado, nasi putih,
served in traditional earthenware plates on a rustic wooden table,
warm natural lighting from left side, steam rising,
shallow depth of field, vibrant food colors,
professional food styling, Instagram-worthy composition, 1:1 ratio
```

| Detail | Info |
|--------|------|
| **Platform** | DALL-E 3 atau Flux |
| **Style Keywords** | food photography, flat lay, overhead, warm lighting, rustic, professional |
| **Hasil yang Diharapkan** | Foto makanan Indonesia dari sudut atas, meja kayu rustic, tataan profesional dengan uap mengepul |

---

#### Contoh 7: Twitter/X Header Perusahaan Teknologi

**Prompt:**

```
Wide panoramic header image for a tech company Twitter profile,
futuristic cityscape at twilight with glowing digital network
connections overlay, dark navy blue sky with subtle purple gradient,
clean modern aesthetic, abstract circuit board patterns in background,
professional corporate feel, cinematic lighting, ultra-wide 3:1 ratio
```

| Detail | Info |
|--------|------|
| **Platform** | Midjourney atau DALL-E 3 |
| **Style Keywords** | panoramic, futuristic, twilight, corporate, cinematic, abstract |
| **Hasil yang Diharapkan** | Header panorama kota futuristik saat senja, jaringan digital berpendar, estetika korporat modern |

---

#### Contoh 8: YouTube Thumbnail Tutorial Coding

**Prompt:**

```
YouTube thumbnail for a coding tutorial video titled
"Belajar React.js dalam 30 Menit",
split composition: left side shows a glowing laptop with
colorful code editor on screen, right side has bold space
for text overlay, dark background with blue and green
neon accent lighting, modern tech aesthetic,
eye-catching contrast, 16:9 ratio
```

| Detail | Info |
|--------|------|
| **Platform** | DALL-E 3 atau Canva AI |
| **Style Keywords** | split composition, neon, modern, tech aesthetic, eye-catching, contrast |
| **Hasil yang Diharapkan** | Thumbnail terbagi dua: kiri laptop dengan kode berwarna, kanan kosong untuk teks, background gelap dengan aksen neon |

---

#### Contoh 9: LinkedIn Banner Profesional

**Prompt:**

```
Professional LinkedIn banner for a UX designer portfolio,
abstract flowing shapes in soft blue and white gradients,
minimalist geometric pattern, subtle grid overlay,
modern and clean corporate aesthetic,
calm and trustworthy mood, no text, 16:9 ratio,
soft gradient background from light blue to white
```

| Detail | Info |
|--------|------|
| **Platform** | Canva AI atau DALL-E 3 |
| **Style Keywords** | professional, minimalist, geometric, gradient, corporate, clean, calm |
| **Hasil yang Diharapkan** | Banner LinkedIn profesional dengan bentuk abstrak mengalir, gradient biru-lembut ke putih, bersih dan minimalis |

---

#### Contoh 10: TikTok Cover Dance Challenge

**Prompt:**

```
Dynamic TikTok cover image for a viral dance challenge,
silhouette of dancer mid-jump against vibrant gradient
background (hot pink to electric purple), motion blur trails,
energetic and fun atmosphere, retro disco ball reflections,
sticker-style decorative elements, bold dynamic pose,
high energy, vertical 9:16 ratio
```

| Detail | Info |
|--------|------|
| **Platform** | Midjourney atau Leonardo AI |
| **Style Keywords** | dynamic, silhouette, gradient, motion blur, retro, energetic, bold |
| **Hasil yang Diharapkan** | Cover TikTok dinamis dengan siluet penari melompat, gradient pink-ungu, efek blur gerak dan pantulan diskotik |

---

### 🅲️ Ilustrasi & Art

---

#### Contoh 11: Karakter Anime untuk Mascot Kursus

**Prompt:**

```
Anime-style mascot character for an online coding course,
friendly robot assistant with a graduation cap,
large expressive blue eyes, warm smile,
wearing a small hoodie with a code bracket symbol,
chibi proportions, soft cel shading,
pastel color palette with electric blue accents,
clean line art, full body pose, white background,
Studio Ghibli meets modern tech aesthetic
```

| Detail | Info |
|--------|------|
| **Platform** | Midjourney atau Leonardo AI |
| **Style Keywords** | anime, chibi, cel shading, pastel, friendly, clean line art, Studio Ghibli |
| **Hasil yang Diharapkan** | Karakter anime robot ramah dengan topi wisuda, proporsi chibi, hoodie bercoding, palet pastel dengan aksen biru elektrik |

---

#### Contoh 12: Pixel Art Game Asset

**Prompt:**

```
16-bit pixel art sprite sheet of a fantasy wizard character,
front view and side view, classic JRPG style,
purple robe with gold trim, long white beard,
glowing staff with crystal on top, idle animation pose,
dark background with subtle grid,
detailed pixel shading, 32x32 grid, retro game aesthetic
```

| Detail | Info |
|--------|------|
| **Platform** | Stable Diffusion atau Leonardo AI |
| **Style Keywords** | 16-bit, pixel art, sprite sheet, JRPG, retro, grid, classic |
| **Hasil yang Diharapkan** | Sprite sheet pixel art 16-bit karakter penyihir fantasi dengan jubah ungu, tampilan depan dan samping, gaya JRPG klasik |

---

#### Contoh 13: Pemandangan Lanskap Cat Air

**Prompt:**

```
Dreamy watercolor landscape painting of a misty mountain
village at sunrise, terraced rice paddies in foreground,
small wooden houses with thatched roofs, morning fog
rolling through valleys, soft golden light breaking through clouds,
wet-on-wet watercolor technique, paper texture visible,
muted earth tones with warm highlights,
peaceful and serene mood, fine art gallery quality
```

| Detail | Info |
|--------|------|
| **Platform** | Midjourney atau DALL-E 3 |
| **Style Keywords** | watercolor, dreamy, misty, wet-on-wet, paper texture, muted tones, serene |
| **Hasil yang Diharapkan** | Lukisan cat air pemandangan desa pegunungan berkabut saat sunrise, sawah berundak, rumah kayu jerami, cahaya emas lembut |

---

#### Contoh 14: Ruangan 3D Isometrik

**Prompt:**

```
Isometric 3D render of a cozy programmer home office,
desk with dual monitors showing code editor, mechanical keyboard,
RGB lighting under desk, floating shelves with books and plants,
warm desk lamp, cat sleeping on side chair,
detailed miniature style, soft ambient occlusion,
warm color palette with teal accents, clean render,
tilt-shift effect, miniature diorama aesthetic
```

| Detail | Info |
|--------|------|
| **Platform** | Midjourney atau Flux |
| **Style Keywords** | isometric, 3D render, miniature, tilt-shift, ambient occlusion, diorama |
| **Hasil yang Diharapkan** | Render isometrik ruangan kantor rumah programmer yang nyaman, dual monitor, RGB, kucing tidur, estetika diorama miniatur |

---

#### Contoh 15: Kota Cyberpunk

**Prompt:**

```
Cyberpunk cityscape at night, massive holographic billboards
in Japanese and Chinese characters, flying vehicles between
neon-lit skyscrapers, rain-slicked streets reflecting pink
and cyan neon lights, crowded street market at ground level,
fog and steam rising from vents, blade runner aesthetic,
cinematic wide angle shot, moody atmosphere,
8k ultra detailed, volumetric lighting
```

| Detail | Info |
|--------|------|
| **Platform** | Flux atau Midjourney |
| **Style Keywords** | cyberpunk, neon, holographic, Blade Runner, cinematic, volumetric, moody |
| **Hasil yang Diharapkan** | Kota cyberpunk malam hari dengan billboard hologram raksasa, kendaraan terbang, jalan basah memantulkan neon merah muda-sian |

---

### 🅳️ Presentasi & Dokumen

---

#### Contoh 16: Cover Slide Presentasi Bisnis

**Prompt:**

```
Elegant business presentation cover slide background,
abstract geometric shapes in navy blue and gold,
flowing ribbon-like curves connecting floating cubes,
professional corporate aesthetic, subtle grid pattern,
negative space for text placement on right side,
gradient from deep navy to soft grey, premium feel,
modern and sophisticated, 16:9 ratio, 4K quality
```

| Detail | Info |
|--------|------|
| **Platform** | DALL-E 3 atau Canva AI |
| **Style Keywords** | elegant, corporate, geometric, gradient, premium, sophisticated, 4K |
| **Hasil yang Diharapkan** | Background cover presentasi bisnis elegan dengan bentuk geometris abstrak navy-gold, ruang negatif untuk teks |

---

#### Contoh 17: Background Infografis

**Prompt:**

```
Seamless infographic background pattern, light grey with
subtle geometric dots and thin line connections,
modern data visualization aesthetic, soft gradient
from white to very light blue, clean and professional,
abstract network nodes subtly visible,
minimal design allowing content overlay, high resolution,
flat design, corporate report style
```

| Detail | Info |
|--------|------|
| **Platform** | DALL-E 3 atau Canva AI |
| **Style Keywords** | seamless, pattern, geometric, minimal, flat design, corporate, clean |
| **Hasil yang Diharapkan** | Background infografis seamless dengan pola titik geometris halus, gradient putih-biru muda, desain minimal dan profesional |

---

#### Contoh 18: Desain Sampul Buku

**Prompt:**

```
Book cover design for a science fiction novel titled
"The Last Algorithm",
a lone human figure standing before a massive glowing AI core
in a dark futuristic chamber,
volumetric light beams cutting through darkness,
cinematic composition with title space at top,
color scheme: deep black, electric blue, and white highlights,
thrilling and mysterious atmosphere, award-winning cover design,
professional book industry quality, 2:3 ratio
```

| Detail | Info |
|--------|------|
| **Platform** | Midjourney atau DALL-E 3 |
| **Style Keywords** | cinematic, volumetric, thriller, mysterious, award-winning, dark, dramatic |
| **Hasil yang Diharapkan** | Sampul novel sci-fi dengan figur manusia tunggal di depan inti AI bersinar, ruang gelap futuristik, komposisi sinematik |

---

#### Contoh 19: Desain Border Sertifikat

**Prompt:**

```
Elegant certificate border design template,
intricate gold filigree ornament frame on white background,
classical floral scrollwork corners, thin double border lines,
space for text in center, formal and prestigious look,
symmetrical design, Renaissance-inspired decorative elements,
high contrast gold on white, vector-clean edges,
professional award certificate style
```

| Detail | Info |
|--------|------|
| **Platform** | DALL-E 3 atau Leonardo AI |
| **Style Keywords** | elegant, filigree, classical, symmetrical, Renaissance, formal, prestigious |
| **Hasil yang Diharapkan** | Template border sertifikat dengan ornamen filigree emas, sudut floral scrollwork, desain simetris bergaya Renaissance |

---

#### Contoh 20: Ilustrasi Header Laporan

**Prompt:**

```
Professional header illustration for a technology company
annual report, abstract visualization of data flowing
like rivers through a stylized landscape,
soft gradient sky from dawn orange to corporate blue,
modern flat illustration style with subtle gradients,
clean and corporate, trending on Behance,
wide panoramic format, suitable for A4 landscape print
```

| Detail | Info |
|--------|------|
| **Platform** | DALL-E 3 atau Midjourney |
| **Style Keywords** | professional, abstract, flat illustration, gradient, panoramic, Behance, corporate |
| **Hasil yang Diharapkan** | Ilustrasi header laporan tahunan dengan visualisasi abstrak data mengalir seperti sungai, gradient langit oranye-biru |

---

## 5. 🎯 Cheat Sheet Style Keywords

### 📸 Photography Styles

| Keyword | Efek | Contoh Penggunaan |
|---------|------|-------------------|
| `bokeh` | Background blur dengan titik-titik cahaya | Portrait photography, product shots |
| `golden hour` | Cahaya hangat keemasan (sunrise/sunset) | Landscape, lifestyle photos |
| `studio lighting` | Pencahayaan terkontrol, bayangan bersih | Product photography, portraits |
| `macro photography` | Detail sangat close-up | Nature, texture, jewelry |
| `long exposure` | Efek blur gerak, air seperti sutera | Night cityscapes, waterfalls |
| `aerial/drone shot` | Sudut pandang dari atas | Landscape, architecture |
| `flat lay` | Sudut pandang tepat dari atas (90°) | Food, fashion, product |
| `shallow depth of field` | Subjek tajam, background blur | Portraits, product focus |
| `HDR` | High Dynamic Range, detail ekstrem | Landscape, architecture |
| `film grain` | Efek butiran film analog | Vintage, editorial photography |

### 🎨 Art Styles

| Keyword | Efek | Contoh Penggunaan |
|---------|------|-------------------|
| `watercolor` | Teknik cat air, transparan, soft edges | Illustration, landscape, portraits |
| `oil painting` | Tekstur kuas tebal, warna kaya | Classic art, portraits, landscapes |
| `pixel art` | Blok piksel retro | Game assets, icons, nostalgic |
| `line art` | Garis bersih tanpa warna | Coloring books, minimalist design |
| `stipple/crosshatch` | Teknik titik atau silang | Editorial, vintage illustration |
| `pop art` | Warna terang, kontras tinggi | Poster, merchandise, branding |
| `art nouveau` | Garis organik, dekoratif | Poster, packaging, art print |
| `impressionist` | Coretan kuas kasar, cahaya | Landscape, artistic interpretation |
| `surrealism` | Fantastis, dreamlike | Concept art, creative projects |
| `ukiyo-e` | Gaya cetak kayu Jepang | Illustration, decorative art |

### 🖥️ Render & 3D Styles

| Keyword | Efek | Contoh Penggunaan |
|---------|------|-------------------|
| `isometric` | Sudut 30°, biasa untuk maps & diorama | Game design, infographics |
| `3D render` | Visualisasi tiga dimensi realistis | Product mockup, architectural |
| `clay render` | Seperti model tanah liat | Product visualization, character |
| `low poly` | Geometris sederhana, segitiga | Game art, stylized illustration |
| `voxel art` | Blok 3D seperti Minecraft | Game art, creative illustration |
| `wireframe` | Rangka 3D tanpa surface | Technical, futuristic UI |
| `subsurface scattering` | Cahaya menembus material | Organic material, skin, food |
| `ray tracing` | Refleksi dan bayangan akurat | Architectural visualization |
| `tilt-shift` | Efek miniatur/diorama | Cityscape, landscape, toy-like |
| `photogrammetry` | 3D scan realistis | Texture, organic objects |

### 😊 Mood & Atmosphere

| Keyword | Efek | Contoh Penggunaan |
|---------|------|-------------------|
| `ethereal` | Anggun, halus, seperti mimpi | Fantasy, spiritual, elegant |
| `moody` | Gelap, dramatis, atmosferik | Editorial, thriller, noir |
| `vibrant` | Warna hidup, penuh energi | Social media, advertisement |
| `minimal` | Bersih, banyak ruang negatif | Branding, corporate, modern |
| `warm` | Nuansa kuning-oranye | Cozy scenes, food, lifestyle |
| `cool` | Nuansa biru-hijau | Tech, futuristic, medical |
| `mysterious` | Gelap dengan pencahayaan selektif | Fantasy, horror, thriller |
| `whimsical` | Lucu, fantastis, ringan | Children's books, fairy tales |
| `gritty` | Kasar, realistis, urban | Street photography, documentary |
| `serene` | Tenang, damai, terang | Wellness, nature, meditation |

### ⬆️ Quality Boosters

| Keyword | Efek |
|---------|------|
| `8k`, `ultra HD` | Resolusi tinggi, detail tajam |
| `highly detailed` | Menambah banyak detail kecil |
| `professional` | Hasil seperti buatan profesional |
| `award-winning` | Gaya penghargaan, kualitas atas |
| `trending on ArtStation` | Gaya populer di komunitas artist |
| `sharp focus` | Semua elemen fokus tajam |
| `intricate` | Detail rumit dan kompleks |
| `masterpiece` | Kualitas masterpiece |
| `best quality` | Kualitas terbaik dari model |
| `unreal engine 5` | Realisme render game engine |
| `Canon EOS R5` | Gaya kamera DSLR profesional |
| `studio quality` | Kualitas studio profesional |

---

## 6. 🚫 Negative Prompts

### Apa itu Negative Prompt?

Negative prompt adalah **instruksi yang memberitahu AI apa yang TIDAK boleh ada** dalam gambar yang dihasilkan. Sangat berguna untuk membersihkan artefak dan mengontrol kualitas.

### ⚠️ Catatan Penting per Platform

| Platform | Negative Prompt? | Cara Menggunakan |
|----------|-----------------|-------------------|
| **Stable Diffusion** | ✅ Ya | Field "Negative Prompt" terpisah di UI |
| **Midjourney** | ✅ Partly | Gunakan parameter `--no` (contoh: `--no blur, text`) |
| **DALL-E 3** | ❌ Tidak ada | Jelaskan dalam prompt utama apa yang tidak diinginkan |
| **Leonardo AI** | ✅ Ya | Field terpisah di UI |
| **Flux** | ✅ Ya | Field terpisah di API/UI |

### 🔧 Negative Prompt Umum untuk Hasil Bersih

```
blurry, low quality, low resolution, watermark, text, logo,
signature, jpeg artifacts, compression artifacts, ugly,
deformed, disfigured, bad anatomy, extra limbs,
missing limbs, floating limbs, mutated hands, poorly drawn hands,
poorly drawn face, mutation, cropped, out of frame,
worst quality, normal quality, oversaturated,
underexposed, overexposed, noise, grain
```

### 📋 Tabel: Masalah → Negative Prompt Fix

| Masalah yang Muncul | Negative Prompt Fix |
|---------------------|---------------------|
| 👤 Wajah cacat/aneh | `bad anatomy, deformed face, poorly drawn face, ugly, mutation` |
| 🖐️ Tangan berlebih/anomali | `extra fingers, mutated hands, poorly drawn hands, too many fingers` |
| 📝 Teks/acak-acakan di gambar | `text, watermark, logo, signature, writing, letters` |
| 📐 Komposisi buruk/terpotong | `cropped, out of frame, poorly composed, off-center` |
| 🔍 Buram/tidak fokus | `blurry, soft focus, motion blur, out of focus, noise` |
| 🎨 Kualitas rendah | `low quality, low resolution, jpeg artifacts, worst quality` |
| 👗 Pakaian tidak wajar | `bad clothing, poorly drawn clothes, mismatched clothes` |
| 🌈 Warna terlalu饱和 | `oversaturated, neon colors, garish, clashing colors` |
| 🏗️ Struktur tidak masuk akal | `floating objects, impossible architecture, gravity defying` |
| 🖼️ Gaya tidak konsisten | `mixed styles, inconsistent style, collage` |

---

## 7. 🔄 Before/After: Prompt Sederhana vs Prompt Jago

### Contoh 1: Pemandangan Alam

**❌ Bad Prompt:**
```
A beautiful landscape
```
> **Hasil:** Pemandangan generik, tanpa karakter unik, komposisi acak, warna membosankan.

**✅ Good Prompt:**
```
Breathtaking mountain landscape at golden hour, alpine lake
in foreground perfectly reflecting snow-capped peaks,
wildflowers in the meadow, dramatic clouds with god rays
breaking through, landscape photography, shot on Canon EOS R5,
f/11, wide angle lens, vibrant yet natural colors,
award-winning National Geographic style
```
> **Hasil:** Pemandangan alpen spektakuler danau cermin, bunga liar, cahaya Tuhan menembus awan. Kualitas majalah National Geographic.

**🔧 Yang berubah:** Ditambahkan lokasi spesifik (alpine), waktu (golden hour), komposisi (danau di foreground), detail (wildflowers, god rays), style reference (National Geographic), technical specs (Canon EOS R5, f/11).

---

### Contoh 2: Potret Manusia

**❌ Bad Prompt:**
```
A woman smiling
```
> **Hasil:** Wajah bisa cacat, latar belakang acak, pencahayaan tidak konsisten, terlihat tidak natural.

**✅ Good Prompt:**
```
Candid portrait of a young Southeast Asian woman in her 20s,
genuine warm smile, sitting in a cozy cafe by the window,
golden hour sunlight streaming through creating soft rim light on hair,
shallow depth of field with beautiful bokeh background,
wearing casual linen shirt, holding a coffee cup,
natural skin texture, editorial photography style,
warm color palette, shot on 85mm f/1.4 lens
```
> **Hasil:** Potret candid natural perempuan Asia Tenggara, senyum hangat, cahaya golden hour dari jendela, bokeh cantik, editorial kualitas tinggi.

**🔧 Yang berubah:** Ditambahkan demografi (Southeast Asian, 20s), lokasi (cafe by window), pencahayaan spesifik (rim light), teknis kamera (85mm f/1.4), pakaian, props (coffee cup), dan style reference (editorial photography).

---

### Contoh 3: Logo Desain

**❌ Bad Prompt:**
```
A coffee logo
```
> **Hasil:** Logo generik, tidak menonjol, font acak, komposisi tidak terarah.

**✅ Good Prompt:**
```
Premium handcrafted coffee brand logo for "Kopi Archipelago",
featuring a minimalist anchor intertwined with coffee beans,
navy blue and copper color scheme, clean negative space design,
inspired by maritime Indonesian heritage, vector style,
professional brand identity, scalable for business cards
and signage, centered composition on pure white background
```
> **Hasil:** Logo premium brand kopi dengan jangkar minimalis yang terjalin dengan biji kopi, scheme biru navy-tembaga, inspirasi maritim Indonesia.

**🔧 Yang berubah:** Ditambahkan brand name, elemen spesifik (anchor + coffee beans), warna (navy-copper), inspirasi (maritime heritage), format (vector, scalable), dan context penggunaan.

---

### Contoh 4: Karakter Fantasi

**❌ Bad Prompt:**
```
A fantasy character
```
> **Hasil:** Karakter tidak jelas, style bercampur, detail minim, pose tidak dinamis.

**✅ Good Prompt:**
```
Epic fantasy elven ranger character, detailed full body portrait,
silver-white flowing hair with braided sections,
ornate forest-green leather armor with gold engravings,
twin curved elven swords on back, emerald green eyes,
standing in an ancient magical forest with fireflies,
mystical fog at ground level, volumetric god rays,
dynamic contrapposto pose, concept art style,
inspired by Greg Rutkowski and ArtStation trending,
8k ultra detailed, dramatic lighting from above
```
> **Hasil:** Karakter elven ranger epik dengan armor kulit hijau hutan berukir emas, rambut perak putih terurai, pedang kembar, di hutan ajaib kuno dengan kunang-kunang.

**🔧 Yang berubah:** Race spesifik (elven), profesi (ranger), armor detail (forest-green leather, gold engravings), weapons, setting (ancient magical forest), mood (fireflies, mystical fog), style reference (Greg Rutkowski), composition (dynamic contrapposto).

---

### Contoh 5: Sajian Makanan

**❌ Bad Prompt:**
```
Delicious food
```
> **Hasil:** Makanan tidak jelas, pencahayaan rata, tidak menggugah selera, komposisi acak.

**✅ Good Prompt:**
```
Mouth-watering professional food photography of a stack of
thick American-style pancakes topped with a melting knob of
butter and maple syrup cascading down the sides, fresh
blueberries and strawberries scattered on top, served on a
ceramic plate with a linen napkin, overhead 45-degree angle,
steam rising, natural window light from left,
dark moody background with wooden table texture,
shallow depth of field, food magazine editorial style,
warm tones, appetizing and inviting
```
> **Hasil:** Foto profesional pancake Amerika tebal dengan mentega meleleh, sirup maple mengalir, blueberry segar, sudut 45°, uap mengepul, gaya editorial majalah makanan.

**🔧 Yang berubah:** Jenis makanan spesifik (American-style pancakes), topping detail, props (ceramic plate, linen napkin), angle spesifik (45-degree), lighting direction (window from left), mood (dark moody), style reference (food magazine editorial).

---

## 8. 🚀 Tips Pro

### 🔄 1. Iterasi: Generate → Refine → Generate Again

```
Ronde 1: Prompt dasar → Lihat hasil
     ↓
Ronde 2: Tambah detail spesifik → Hasil lebih baik
     ↓
Ronde 3: Fine-tune warna/lighting → Hasil hampir sempurna
     ↓
Ronde 4: Negatif prompt untuk bersihkan → Perfect!
```

> **Kunci:** Tidak ada prompt yang sempurna di percobaan pertama. Berharap 3-5 iterasi untuk hasil optimal.

### 🎨 2. Gunakan Referensi: 'Gaya seperti [Artist/Film]'

| Minta Gaya | Tambahkan ke Prompt |
|------------|---------------------|
| Gaya Makoto Shinkai | `"in the style of Makoto Shinkai anime"` |
| Gaya Wes Anderson | `"symmetrical composition, pastel color palette, Wes Anderson aesthetic"` |
| Gaya Blade Runner | `"cyberpunk atmosphere, neon noir, Blade Runner inspired"` |
| Gaya Studio Ghibli | `"Studio Ghibli style, soft cel shading, whimsical"` |
| Gaya Pixar | `"Pixar 3D render style, subsurface scattering, friendly character design"` |
| Gaya National Geographic | `"National Geographic photography, natural lighting, documentary style"` |

### 🎲 3. Seed Control untuk Konsistensi

- **Midjourney:** Gunakan `--seed [angka]` untuk konsistensi antar gambar
- **Stable Diffusion:** Set seed value di interface untuk mereproduksi hasil
- **Tujuan:** Membuat seri gambar dengan style konsisten untuk branding

```
Contoh di Midjourney:
A cozy coffee shop interior, warm lighting --seed 42
A cozy coffee shop interior, warm lighting --seed 42 --ar 16:9
A cozy coffee shop interior, warm lighting --seed 42 --zoom 2
```

### 📦 4. Batch Generation untuk Variasi

Buat banyak variasi sekaligus, lalu pilih yang terbaik:

| Platform | Cara Batch | Jumlah Default |
|----------|-----------|----------------|
| Midjourney | Bot auto-generate 4 | 4 gambar/run |
| DALL-E 3 | Minta 4 variasi dalam prompt | 1 per request |
| Stable Diffusion | Set batch_count > 1 | Bebas (tergantung GPU) |
| Leonardo AI | Generate > 4 di settings | Bebas |
| Flux | API batch parameter | Via API call |

**Tips batch:**
- Buat prompt yang sama 4-5 kali → pilih yang terbaik
- Variasikan satu elemen tiap batch (warna, angle, style)
- Simpan seed yang menghasilkan hasil terbaik

### 🖌️ 5. Inpainting untuk Memperbaiki Area Tertentu

Inpainting memungkinkan Anda **mengedit bagian tertentu** dari gambar tanpa mengubah seluruh gambar:

| Kebutuhan | Contoh Penggunaan Inpainting |
|-----------|------------------------------|
| 🔧 Fix tangan cacat | Gambar ulang area tangan saja |
| 🎨 Ganti warna objek | Ganti warna baju dari merah ke biru |
| ➕ Tambah elemen | Tambahkan objek ke background |
| 🗑️ Hapus objek | Hapus watermark atau objek tidak diinginkan |
| 🔍 Perbaiki detail | Perjelas wajah yang kurang tajam |

**Cara kerja:**
1. Generate gambar utama
2. Mask (tandai) area yang ingin diperbaiki
3. Tulis prompt spesifik untuk area tersebut
4. AI hanya mengubah area yang di-mask

---

## 9. 📝 Latihan

### Challenge 1: Logo + Social Media Kit untuk Brand Fiktif

**Tugas:** Buat identitas visual lengkap untuk brand fiktif bernama **"NusantaraCode"** — platform belajar coding untuk anak muda Indonesia.

**Yang harus dibuat:**
1. Logo utama (minimalis, bisa untuk profil social media)
2. Instagram post template (1080x1080)
3. Twitter/X header (1500x500)
4. YouTube thumbnail template (1280x720)
5. LinkedIn banner (1584x396)

**Tips:**
- Tentukan brand personality dulu (apa yang ingin dirasakan?)
- Konsisten warna dan style di semua elemen
- Buat minimal 3 variasi per elemen, pilih yang terbaik

**Contoh prompt untuk logo:**
```
Modern tech education brand logo for "NusantaraCode",
combining a stylized code bracket < / > with a batik pattern element,
vibrant teal and orange color scheme, youthful and energetic,
flat design vector style, white background, professional branding
```

---

### Challenge 2: Ilustrasi untuk Modul Presentasi

**Tugas:** Buat **5 ilustrasi** untuk modul presentasi tentang "Masa Depan AI di Indonesia".

**Yang harus dibuat:**
1. Cover slide ilustrasi
2. Ilustrasi "AI dalam Pendidikan"
3. Ilustrasi "AI dalam Kesehatan"
4. Ilustrasi "AI dalam Pertanian"
5. Ilustrasi "AI dalam Transportasi"

**Tips:**
- Gunakan style yang konsisten di semua 5 ilustrasi
- Pertimbangkan audience: profesional bisnis Indonesia
- Gunakan formula STYLE + SUBJECT + CONTEXT
- Tambahkan elemen khas Indonesia (batik, wayang, komodo, dll.)

**Contoh prompt untuk cover:**
```
Futuristic illustration of Indonesia's digital landscape,
traditional batik patterns transforming into circuit board traces,
modern Jakarta skyline with AI neural network overlay,
warm tropical color palette with tech blue accents,
corporate presentation style, professional and inspiring,
wide 16:9 format, clean composition with space for text
```

---

### Challenge 3: Thumbnail YouTube yang Menarik

**Tugas:** Buat **thumbnail YouTube** untuk video berjudul **"Saya Belajar AI Selama 30 Hari — Ini Hasilnya!"**

**Yang harus dibuat:**
- 3 variasi thumbnail dengan pendekatan berbeda:
  - **Variasi A:** Fokus pada emosi (before/after transformation)
  - **Variasi B:** Fokus pada konten (AI-generated images showcase)
  - **Variasi C:** Fokus pada challenge (kalender 30 hari visual)

**Tips:**
- Thumbnail harus terlihat jelas di ukuran kecil (HP)
- Gunakan warna kontras tinggi
- Tinggalkan ruang untuk teks overlay
- Buat thumbnail memancing rasa ingin tahu (curiosity gap)

**Contoh prompt untuk Variasi A:**
```
YouTube thumbnail split composition, left side shows a confused
person looking at a blank computer screen (desaturated colors),
right side shows the same person amazed at stunning AI-generated
artwork on screen (vibrant saturated colors),
dramatic lighting contrast, transformation concept,
eye-catching before and after, 16:9 ratio,
bold dynamic layout, dark background with highlight accents
```

---

## 📚 Ringkasan Cepat

### Checklist Menulis Prompt yang Baik

- [ ] ✅ **Subjek** jelas dan spesifik
- [ ] ✅ **Style** ditentukan (anime, photo, watercolor, dll.)
- [ ] ✅ **Komposisi** diatur (angle, framing, ratio)
- [ ] ✅ **Pencahayaan** ditambahkan
- [ ] ✅ **Warna/Warna palette** didefinisikan
- [ ] ✅ **Detail & modifiers** ditambahkan untuk kualitas
- [ ] ✅ **Negative prompt** digunakan untuk bersihkan hasil
- [ ] ✅ **Iterasi** dilakukan minimal 3 kali
- [ ] ✅ **Platform** yang tepat dipilih untuk kebutuhan

### Urutan Kerja Terbaik

```
1. 🎯 Tentukan tujuan gambar (untuk apa?)
2. 📝 Tulis prompt pertama dengan formula dasar
3. 🔄 Generate dan evaluasi hasil
4. ✏️ Refine prompt (tambah/ubah detail)
5. 🚫 Tambah negative prompt untuk perbaiki masalah
6. 🎲 Generate beberapa variasi, pilih terbaik
7. 🖌️ Gunakan inpainting untuk fine-tuning
8. ✅ Export dalam resolusi yang dibutuhkan
```

---

> **📅 Materi AI Course — Modul 14B**
> **🏆 Menguasai prompt image generation = Skill masa depan yang sangat bernilai!**
