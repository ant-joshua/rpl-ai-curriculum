<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PageHeader, Button, Spinner, EmptyState, Alert } from '$lib/components/ui';
	import { parseMarkdown } from '$lib/utils/markdown';

	let threads = $state<any[]>([]);
	let loading = $state(true);
	let error = $state('');
	let activeThread = $state<any>(null);
	let messages = $state<any[]>([]);
	let sending = $state(false);
	let draft = $state('');
	let showNew = $state(false);
	let newSubject = $state('');
	let newGrade = $state('');
	let newCurriculum = $state('');
	let curricula = $state<any[]>([]);
	let chatRef = $state<any>(null);

	async function loadThreads() {
		try {
			const res = await fetch('/api/aiedu/chat');
			const json = await res.json();
			if (json.success) threads = json.data || [];
			else error = json.error || '';
		} catch { error = 'Gagal load thread'; } finally { loading = false; }
	}

	async function loadMessages(id: string) {
		try {
			const res = await fetch(`/api/aiedu/chat/${id}`);
			const json = await res.json();
			if (json.success) {
				activeThread = json.data.thread;
				messages = json.data.messages || [];
			}
		} catch { error = 'Gagal load chat'; }
	}

	onMount(() => {
		if (!browser) return;
		loadThreads();
		fetch('/api/curricula').then((r) => r.json()).then((j) => { if (j.success) curricula = j.data || []; }).catch(() => {});
	});

	async function createThread() {
		sending = true;
		try {
			const res = await fetch('/api/aiedu/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subject: newSubject.trim(), grade: newGrade, curriculum_id: newCurriculum || undefined }),
			});
			const json = await res.json();
			if (json.success) {
				showNew = false;
				newSubject = ''; newGrade = ''; newCurriculum = '';
				await loadThreads();
				await loadMessages(json.data.id);
			} else error = json.error || 'Gagal buat chat';
		} catch { error = 'Gagal buat chat'; } finally { sending = false; }
	}

	async function send() {
		if (!draft.trim() || !activeThread || sending) return;
		sending = true;
		const text = draft.trim();
		draft = '';
		messages = [...messages, { role: 'user', content: text, optimistic: true }];
		try {
			const res = await fetch(`/api/aiedu/chat/${activeThread.id}/messages`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: text }),
			});
			const json = await res.json();
			if (json.success) {
				await loadMessages(activeThread.id);
			} else {
				messages = messages.filter((m) => !(m.optimistic && m.content === text));
				error = json.error || 'Gagal kirim';
			}
		} catch {
			messages = messages.filter((m) => !(m.optimistic && m.content === text));
			error = 'Gagal kirim';
		} finally { sending = false; }
	}

	async function deleteThread(id: string) {
		if (!confirm('Hapus thread ini?')) return;
		try {
			await fetch(`/api/aiedu/chat/${id}`, { method: 'DELETE' });
			if (activeThread?.id === id) { activeThread = null; messages = []; }
			loadThreads();
		} catch { /* ignore */ }
	}

	function scrollBottom() {
		setTimeout(() => {
			if (chatRef) chatRef.scrollTop = chatRef.scrollHeight;
		}, 50);
	}

	$effect(() => { if (messages.length) scrollBottom(); });
</script>

<PageHeader title="AI Chat Guru" subtitle="Asisten AI untuk guru — tanya strategi mengajar, perangkat ajar, penilaian" />

{#if error}
	<Alert variant="danger" class="mb">{error}</Alert>
{/if}

<div class="chat-layout">
	<!-- Left: threads -->
	<aside class="thread-panel">
		<Button variant="primary" size="sm" class="new-btn" onclick={() => (showNew = !showNew)}>
			{showNew ? 'Batal' : '+ Chat Baru'}
		</Button>

		{#if showNew}
			<div class="new-form">
				<label class="field"><span>Mapel</span><input type="text" bind:value={newSubject} placeholder="Informatika" /></label>
				<label class="field"><span>Kelas</span><input type="text" bind:value={newGrade} placeholder="X" /></label>
				<label class="field">
					<span>Kurikulum</span>
					<select bind:value={newCurriculum}>
						<option value="">Default (Merdeka)</option>
						{#each curricula as c}<option value={c.id}>{c.name}</option>{/each}
					</select>
				</label>
				<Button variant="primary" size="sm" onclick={createThread} loading={sending}>Mulai</Button>
			</div>
		{/if}

		<div class="thread-list">
			{#if loading}
				<div class="center"><Spinner /></div>
			{:else if threads.length === 0}
				<EmptyState icon="message-square" title="Belum ada chat" />
			{:else}
				{#each threads as t (t.id)}
					<div class="thread-item" class:active={activeThread?.id === t.id}>
						<button class="thread-main" onclick={() => loadMessages(t.id)}>
							<span class="thread-title">{t.title}</span>
							<span class="thread-meta">{t.subject || '—'} · {t.message_count} pesan</span>
							{#if t.curriculum_name}<span class="thread-cur">{t.curriculum_name}</span>{/if}
						</button>
						<button class="thread-del" onclick={() => deleteThread(t.id)} title="Hapus">🗑</button>
					</div>
				{/each}
			{/if}
		</div>
	</aside>

	<!-- Right: messages -->
	<section class="chat-panel">
		{#if !activeThread}
			<EmptyState icon="message-square" title="Pilih atau buat chat" desc="Chat dengan AI untuk bantuan mengajar" />
		{:else}
			<div class="chat-head">
				<div>
					<strong>{activeThread.title}</strong>
					{#if activeThread.curriculum_name}<span class="cur-chip">{activeThread.curriculum_name}</span>{/if}
				</div>
			</div>
			<div class="chat-body" bind:this={chatRef}>
				{#if messages.length === 0}
					<div class="center"><EmptyState icon="message-square" title="Mulai percakapan" desc="Tanya apa saja tentang mengajar" /></div>
				{/if}
				{#each messages as m (m.id || m.content)}
					<div class="msg" class:user={m.role === 'user'} class:assistant={m.role !== 'user'}>
						<div class="msg-avatar">{m.role === 'user' ? '👤' : '🤖'}</div>
						<div class="msg-body">
							{#if m.role === 'user'}
								<p class="msg-text">{m.content}</p>
							{:else}
								<div class="md">{@html parseMarkdown(m.content)}</div>
							{/if}
						</div>
					</div>
				{/each}
				{#if sending}<div class="typing"><Spinner size="sm" /> <span>AI menulis...</span></div>{/if}
			</div>
			<div class="chat-input">
				<textarea bind:value={draft} rows={2} placeholder="Tulis pertanyaan untuk AI Guru..." onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}></textarea>
				<Button variant="primary" onclick={send} loading={sending} disabled={!draft.trim()}>Kirim</Button>
			</div>
		{/if}
	</section>
</div>

<style>
	.mb { margin-bottom: 16px; }
	.chat-layout { display: grid; grid-template-columns: 280px 1fr; gap: 16px; height: calc(100vh - 220px); min-height: 420px; }
	.thread-panel { display: flex; flex-direction: column; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px; overflow: hidden; }
	.new-btn { width: 100%; }
	.new-form { display: flex; flex-direction: column; gap: 8px; padding: 10px; background: white; border: 1px solid var(--border); border-radius: 10px; }
	.field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
	.field input, .field select { padding: 6px 8px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
	.thread-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
	.thread-item { position: relative; text-align: left; padding: 0; border: 1px solid var(--border); border-radius: 10px; background: white; }
	.thread-item.active { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 8%, white); }
	.thread-main { display: block; width: 100%; text-align: left; background: none; border: none; padding: 10px 30px 10px 10px; cursor: pointer; font: inherit; }
	.thread-title { display: block; font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 22px; }
	.thread-meta { display: block; font-size: 11px; color: var(--text-muted); margin-top: 2px; }
	.thread-cur { display: inline-block; font-size: 10px; background: var(--surface); border: 1px solid var(--border); padding: 1px 6px; border-radius: 6px; color: var(--text-secondary); margin-top: 4px; }
	.thread-del { position: absolute; top: 6px; right: 6px; background: none; border: none; cursor: pointer; opacity: 0.4; font-size: 12px; }
	.thread-del:hover { opacity: 1; }
	.center { display: flex; justify-content: center; padding: 24px; }
	.chat-panel { display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.chat-head { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
	.cur-chip { display: inline-block; margin-left: 8px; font-size: 10px; background: color-mix(in srgb, var(--primary) 10%, white); color: var(--primary); padding: 2px 8px; border-radius: 8px; }
	.chat-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
	.msg { display: flex; gap: 10px; max-width: 85%; }
	.msg.user { align-self: flex-end; flex-direction: row-reverse; }
	.msg-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--surface-2, #f0f2f5); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
	.msg-body { padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.55; }
	.msg.assistant .msg-body { background: white; border: 1px solid var(--border); border-top-left-radius: 4px; }
	.msg.user .msg-body { background: var(--primary); color: white; border-top-right-radius: 4px; }
	.msg.user .msg-text { margin: 0; white-space: pre-wrap; }
	.md { overflow-wrap: break-word; }
	.md :global(p) { margin: 0 0 8px; }
	.md :global(p:last-child) { margin-bottom: 0; }
	.md :global(pre) { background: #0f1115; color: #e6e6e6; padding: 10px; border-radius: 8px; overflow-x: auto; font-size: 12px; }
	.md :global(code) { font-family: ui-monospace, monospace; font-size: 12px; }
	.md :global(ul), .md :global(ol) { padding-left: 18px; margin: 6px 0; }
	.md :global(table) { border-collapse: collapse; margin: 8px 0; font-size: 12px; }
	.md :global(th), .md :global(td) { border: 1px solid var(--border); padding: 4px 8px; }
	.typing { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); padding: 4px 0; }
	.chat-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--border); }
	.chat-input textarea { flex: 1; resize: none; padding: 10px; border: 1px solid var(--border); border-radius: 10px; font-size: 13px; font-family: inherit; }
</style>
