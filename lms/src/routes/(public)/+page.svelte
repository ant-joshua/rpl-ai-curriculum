<script lang="ts">
  const stats = [
    { value: '99+', label: 'Fitur' },
    { value: '21', label: 'Modul AI' },
    { value: '184', label: 'Test Pass' },
    { value: '100%', label: 'Open Source' },
  ];

  const features = [
    { emoji: '📚', title: 'AI Course', desc: '21 modul interaktif' },
    { emoji: '📊', title: 'Analytics', desc: 'Dashboard real-time' },
    { emoji: '🏆', title: 'Certificate', desc: 'Sertifikat otomatis' },
    { emoji: '💬', title: 'Chat', desc: 'Komunikasi 1-on-1' },
    { emoji: '📅', title: 'Attendance', desc: 'Tracking kehadiran' },
    { emoji: '🎯', title: 'Assessment', desc: 'Ujian & nilai' },
  ];
</script>

<svelte:head>
  <title>RPL AI LMS — Platform Pembelajaran AI</title>
  <meta name="description" content="Platform pembelajaran modern untuk sekolah dan bimbel. Belajar coding, AI, dan software engineering." />
</svelte:head>

<section class="hero">
  <h1>RPL AI LMS</h1>
  <p class="hero-subtitle">Platform pembelajaran modern untuk sekolah dan bimbel</p>
  <a href="/ai-course" class="cta-button">Mulai Belajar →</a>
</section>

<section class="stats-row">
  {#each stats as stat}
    <div class="stat">
      <span class="stat-value">{stat.value}</span>
      <span class="stat-label">{stat.label}</span>
    </div>
  {/each}
</section>

<section class="features-section">
  <h2>Fitur Utama</h2>
  <div class="features-grid">
    {#each features as feature}
      <div class="feature-card">
        <span class="feature-emoji">{feature.emoji}</span>
        <h3>{feature.title}</h3>
        <p>{feature.desc}</p>
      </div>
    {/each}
  </div>
</section>

<section class="cta-section">
  <h2>Siap mulai?</h2>
  <a href="/auth/login" class="cta-button">Masuk Sekarang →</a>
</section>

<style>
  /* ── Hero ── */
  .hero {
    text-align: center;
    padding: 120px 24px 80px;
    max-width: 720px;
    margin: 0 auto;
  }

  .hero h1 {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    color: var(--text);
    margin: 0 0 16px;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .hero-subtitle {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    color: var(--text-secondary);
    margin: 0 0 40px;
    line-height: 1.6;
  }

  .cta-button {
    display: inline-block;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: white;
    background: var(--accent);
    padding: 14px 32px;
    border-radius: 8px;
    text-decoration: none;
    transition: opacity 0.15s ease;
  }

  .cta-button:hover {
    opacity: 0.85;
  }

  /* ── Stats Row ── */
  .stats-row {
    display: flex;
    justify-content: center;
    gap: 64px;
    padding: 48px 24px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin: 0 auto;
    max-width: 900px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-value {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text);
  }

  .stat-label {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  /* ── Features ── */
  .features-section {
    padding: 80px 24px;
    max-width: 1180px;
    margin: 0 auto;
  }

  .features-section h2 {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text);
    text-align: center;
    margin: 0 0 48px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .feature-card {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 32px 24px;
    background: var(--surface);
    text-align: center;
  }

  .feature-emoji {
    font-size: 2rem;
    display: block;
    margin-bottom: 12px;
  }

  .feature-card h3 {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 6px;
  }

  .feature-card p {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
  }

  /* ── CTA Section ── */
  .cta-section {
    text-align: center;
    padding: 80px 24px;
    border-top: 1px solid var(--border);
  }

  .cta-section h2 {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 24px;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stats-row {
      gap: 40px;
    }
  }

  @media (max-width: 600px) {
    .hero {
      padding: 80px 16px 60px;
    }

    .features-grid {
      grid-template-columns: 1fr;
      max-width: 400px;
      margin: 0 auto;
    }

    .stats-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
  }

  @media (max-width: 480px) {
    .hero h1 {
      font-size: 2rem;
    }
    .hero-subtitle {
      font-size: 0.95rem;
    }
    .cta-button {
      display: block;
      width: 100%;
      text-align: center;
      padding: 14px 24px;
      box-sizing: border-box;
    }
    .stats-row {
      gap: 20px;
      padding: 32px 16px;
    }
    .stat-value {
      font-size: 1.5rem;
    }
    .features-section {
      padding: 48px 16px;
    }
    .features-section h2 {
      font-size: 1.4rem;
    }
    .cta-section {
      padding: 48px 16px;
    }
    .cta-section h2 {
      font-size: 1.4rem;
    }
  }
</style>
