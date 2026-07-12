<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>RSS Feed — RPL AI Curriculum</title>
	<meta name="description" content="Berlangganan update kurikulum RPL AI melalui RSS/JSON Feed" />
</svelte:head>

<div class="feed-page">
	<h1>📡 RSS / JSON Feed</h1>

	<p class="subtitle">
		Pantau pembaruan kurikulum RPL AI langsung dari pembaca RSS favoritmu.
		Setiap modul baru atau perubahan akan muncul sebagai item di feed.
	</p>

	<section class="feed-urls">
		<h2>Feed URLs</h2>

		<div class="url-card">
			<div class="url-label">RSS 2.0</div>
			<code>https://lms-syllabus.ant-joshua.my.id/feed.xml</code>
			<button
				class="feed-copy-btn"
				onclick={() => navigator.clipboard.writeText('https://lms-syllabus.ant-joshua.my.id/feed.xml')}
			>
				📋 Salin
			</button>
		</div>

		<div class="url-card">
			<div class="url-label">JSON Feed 1.1</div>
			<code>https://lms-syllabus.ant-joshua.my.id/feed.json</code>
			<button
				class="feed-copy-btn"
				onclick={() => navigator.clipboard.writeText('https://lms-syllabus.ant-joshua.my.id/feed.json')}
			>
				📋 Salin
			</button>
		</div>
	</section>

	<section class="instructions">
		<h2>Cara Berlangganan</h2>

		<div class="app-instruction">
			<h3>📱 Feedly</h3>
			<ol>
				<li>Buka <a href="https://feedly.com" target="_blank" rel="noopener">Feedly</a></li>
				<li>Klik <strong>+ Add Content</strong></li>
				<li>Tempel URL feed: <code>https://lms-syllabus.ant-joshua.my.id/feed.xml</code></li>
				<li>Klik <strong>Follow</strong></li>
			</ol>
		</div>

		<div class="app-instruction">
			<h3>📬 Inoreader</h3>
			<ol>
				<li>Buka <a href="https://inoreader.com" target="_blank" rel="noopener">Inoreader</a></li>
				<li>Klik <strong>+ Add Subscription</strong></li>
				<li>Tempel URL feed: <code>https://lms-syllabus.ant-joshua.my.id/feed.xml</code></li>
				<li>Klik <strong>Subscribe</strong></li>
			</ol>
		</div>

		<div class="app-instruction">
			<h3>🐦 NetNewsWire (macOS/iOS)</h3>
			<ol>
				<li>Buka NetNewsWire</li>
				<li>Klik <strong>File → New Feed…</strong></li>
				<li>Tempel URL feed: <code>https://lms-syllabus.ant-joshua.my.id/feed.xml</code></li>
				<li>Klik <strong>Add</strong></li>
			</ol>
		</div>

		<div class="app-instruction">
			<h3>🌐 Browser (Firefox / Edge / Vivaldi)</h3>
			<p>Browser modern punya Live Bookmarks atau Feed Reader bawaan. Cukup buka <a href="/feed.xml">/feed.xml</a> langsung di browser — icon RSS akan muncul di address bar.</p>
		</div>
	</section>

	<section class="about-feed">
		<h2>Tentang Feed Ini</h2>
		<p>
			Feed berisi 57 modul RPL AI Curriculum. Setiap item mencakup judul modul,
			deskripsi singkat, dan tautan langsung ke halaman modul.
		</p>
		<p>Tersedia dalam dua format:</p>
		<ul>
			<li><strong>RSS 2.0</strong> — format XML klasik, didukung hampir semua pembaca RSS</li>
			<li><strong>JSON Feed 1.1</strong> — format modern berbasis JSON, lebih mudah diparsing secara programatik</li>
		</ul>
	</section>
</div>

<style>
	.feed-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 20px 0;
	}

	h1 {
		font-size: 28px;
		margin-bottom: 8px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 15px;
		margin-bottom: 32px;
		line-height: 1.6;
	}

	h2 {
		font-size: 18px;
		margin-bottom: 16px;
		margin-top: 32px;
	}

	.feed-urls {
		margin-bottom: 24px;
	}

	.url-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		margin-bottom: 8px;
	}

	.url-label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--accent);
		min-width: 80px;
	}

	.url-card code {
		flex: 1;
		font-size: 13px;
		color: var(--text);
		word-break: break-all;
	}

	.feed-copy-btn {
		background: var(--accent);
		color: #fff;
		border: none;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
		transition: opacity 0.15s;
		white-space: nowrap;
	}

	.feed-copy-btn:hover {
		opacity: 0.85;
	}

	.app-instruction {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px 20px;
		margin-bottom: 12px;
	}

	.app-instruction h3 {
		font-size: 15px;
		margin-bottom: 8px;
	}

	.app-instruction ol {
		padding-left: 20px;
		font-size: 14px;
		line-height: 1.8;
		color: var(--text-secondary);
	}

	.app-instruction p {
		font-size: 14px;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.about-feed ul {
		padding-left: 20px;
		font-size: 14px;
		line-height: 1.8;
		color: var(--text-secondary);
	}
</style>
