<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Card, CardContent, Alert } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');

	let activeTab = $state('overview');

	// Date range
	function defaultStart(): string {
		const d = new Date(); d.setMonth(d.getMonth() - 1);
		return d.toISOString().slice(0, 10);
	}
	function defaultEnd(): string {
		return new Date().toISOString().slice(0, 10);
	}
	let startDate = $state(defaultStart());
	let endDate = $state(defaultEnd());

	// Overview data
	let overview: any = $state(null);
	// Enrollment trend data
	let enrollments: any[] = $state([]);
	// Completion data
	let completion: any[] = $state([]);
	// Module analytics
	let attendanceData: any = $state(null);
	let paymentsData: any = $state(null);
	let gradesData: any = $state(null);
	// New: distribution
	let distributionData: any = $state(null);
	// New: course comparison
	let courseComparison: any[] = $state([]);

	function dateParam(): string {
		return `?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`;
	}

	async function loadModuleAnalytics() {
		try {
			const [attRes, payRes, grdRes] = await Promise.all([
				fetch(`/api/admin/analytics/attendance${dateParam()}`),
				fetch(`/api/admin/analytics/payments${dateParam()}`),
				fetch(`/api/admin/analytics/grades${dateParam()}`),
			]);
			const att = await attRes.json();
			const pay = await payRes.json();
			const grd = await grdRes.json();
			if (att.success) attendanceData = att.data;
			if (pay.success) paymentsData = pay.data;
			if (grd.success) gradesData = grd.data;
		} catch {}
	}

	async function loadDistribution() {
		try {
			const res = await fetch(`/api/admin/analytics/distribution${dateParam()}`);
			const d = await res.json();
			if (d.success) distributionData = d.data;
		} catch {}
	}

	async function loadCourseComparison() {
		try {
			const res = await fetch(`/api/admin/analytics/course-comparison`);
			const d = await res.json();
			if (d.success) courseComparison = d.data || [];
		} catch {}
	}

	onMount(() => {
		if (!browser) return;
		loadAll();
	});

	async function loadAll() {
		loading = true;
		error = '';
		try {
			const [ovRes, enRes, coRes] = await Promise.all([
				fetch(`/api/admin/analytics/overview${dateParam()}`),
				fetch(`/api/admin/analytics/enrollments${dateParam()}`),
				fetch(`/api/admin/analytics/completion${dateParam()}`),
			]);
			const ov = await ovRes.json();
			const en = await enRes.json();
			const co = await coRes.json();
			if (ov.success) overview = ov.data;
			else { error = ov.error || 'Failed'; loading = false; return; }
			if (en.success) enrollments = en.data || [];
			if (co.success) completion = co.data || [];
			await Promise.all([loadModuleAnalytics(), loadDistribution(), loadCourseComparison()]);
		} catch { error = 'Failed to load'; }
		finally { loading = false; }
	}

	function exportCSV(format: string) {
		if (!browser) return;
		window.open(`/api/admin/analytics/export?format=${format}&start=${startDate}&end=${endDate}`, '_blank');
	}

	function timeAgo(dateStr: string) {
		const d = new Date(dateStr + 'Z');
		const now = new Date();
		const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
		if (sec < 60) return 'baru saja';
		if (sec < 3600) return `${Math.floor(sec / 60)}m lalu`;
		if (sec < 86400) return `${Math.floor(sec / 3600)}j lalu`;
		if (sec < 604800) return `${Math.floor(sec / 86400)}h lalu`;
		return d.toLocaleDateString('id-ID');
	}

	function actionIcon(action: string) {
		if (action.includes('lesson') || action.includes('view')) return '👁️';
		if (action.includes('complete')) return '✅';
		if (action.includes('thread') || action.includes('discuss')) return '💬';
		if (action.includes('reply')) return '↩️';
		if (action.includes('assess') || action.includes('submit')) return '📝';
		if (action.includes('enroll')) return '📋';
		return '🔔';
	}

	const tabs = [
		{ id: 'overview', label: 'Overview', icon: '📊' },
		{ id: 'enrollments', label: 'Enrollments', icon: '📈' },
		{ id: 'completion', label: 'Completion', icon: '✅' },
		{ id: 'attendance', label: 'Attendance', icon: '📅' },
		{ id: 'payments', label: 'Payments', icon: '💰' },
		{ id: 'grades', label: 'Grades', icon: '🎓' },
		{ id: 'distribution', label: 'Distribution', icon: '📊' },
		{ id: 'course-compare', label: 'Course Compare', icon: '🔍' },
		{ id: 'activity', label: 'Activity', icon: '🕐' },
	];
</script>

<svelte:head>
	<title>📈 Analytics — Admin</title>
</svelte:head>

<div class="analytics-page">
	<div class="header-row">
		<h1>📈 Analytics</h1>
		<div class="header-actions">
			<div class="date-range">
				<label class="date-label">Dari</label>
				<input type="date" class="date-input" bind:value={startDate} />
				<label class="date-label">Ke</label>
				<input type="date" class="date-input" bind:value={endDate} />
			</div>
			<Button size="sm" onclick={loadAll}>🔄 Refresh</Button>
			{#if activeTab !== 'overview' && activeTab !== 'activity' && activeTab !== 'distribution' && activeTab !== 'course-compare'}
				<Button size="sm" variant="secondary" onclick={() => exportCSV(activeTab)}>
					📥 CSV
				</Button>
			{/if}
			{#if activeTab === 'distribution'}
				<Button size="sm" variant="secondary" onclick={() => exportCSV('grades')}>
					📥 Export Grades CSV
				</Button>
			{/if}
			{#if activeTab === 'course-compare'}
				<Button size="sm" variant="secondary" onclick={() => exportCSV('overview')}>
					📥 Export Overview CSV
				</Button>
			{/if}
		</div>
	</div>

	<!-- Tabs -->
	<div class="tabs">
		{#each tabs as tab}
			<button
				class="tab"
				class:tab--active={activeTab === tab.id}
				onclick={() => activeTab = tab.id}
			>
				<span class="tab-icon">{tab.icon}</span>
				<span>{tab.label}</span>
			</button>
		{/each}
	</div>

	{#if loading}
		<div class="loading">Memuat analytics...</div>
	{:else if error}
		<div class="error-state">
			<Alert variant="danger">{error}</Alert>
			<Button onclick={loadAll}>Coba Lagi</Button>
		</div>
	{:else}

		<!-- === OVERVIEW TAB === -->
		{#if activeTab === 'overview'}
			<div class="stats-grid">
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">👥</span>
						<span class="stat-value">{overview?.totalUsers ?? 0}</span>
						<span class="stat-label">Total Users</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📋</span>
						<span class="stat-value">{overview?.activeEnrollments ?? 0}</span>
						<span class="stat-label">Enrollments Aktif</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📚</span>
						<span class="stat-value">{overview?.totalCourses ?? 0}</span>
						<span class="stat-label">Total Kursus</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📖</span>
						<span class="stat-value">{overview?.totalLessons ?? 0}</span>
						<span class="stat-label">Pelajaran Publikasi</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">⏳</span>
						<span class="stat-value">{overview?.pendingGrades ?? 0}</span>
						<span class="stat-label">Menunggu Nilai</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">🆕</span>
						<span class="stat-value">{overview?.newUsers ?? 0}</span>
						<span class="stat-label">User Baru (7 hari)</span>
					</CardContent>
				</Card>
			</div>

			<Card class="section-card">
				<CardContent>
					<h2>Aktivitas Terbaru</h2>
					{#if overview?.recentActivity?.length}
						<div class="activity-feed">
							{#each overview.recentActivity.slice(0, 10) as act}
								<div class="activity-item">
									<span class="act-avatar">{actionIcon(act.action)}</span>
									<div class="act-body">
										<span class="act-user">{act.display_name || act.email || act.user_id?.slice(0, 12)}</span>
										<span class="act-action">{act.action}</span>
										{#if act.entity_type}
											<span class="act-entity">· {act.entity_type}</span>
										{/if}
									</div>
									<span class="act-time">{timeAgo(act.created_at)}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="empty">Belum ada aktivitas</p>
					{/if}
				</CardContent>
			</Card>

		<!-- === ENROLLMENTS TAB === -->
		{:else if activeTab === 'enrollments'}
			<Card class="section-card">
				<CardContent>
					<div class="card-header-actions">
						<h2>Enrollment Trend — {startDate} s.d. {endDate}</h2>
						<Button size="sm" variant="secondary" onclick={() => exportCSV('enrollments')}>📥 CSV</Button>
					</div>
					{#if enrollments.length > 0}
						{@const maxVal = Math.max(...enrollments.map((e: any) => e.count), 1)}
						{@const chartW = 700}
						{@const chartH = 250}
						{@const barW = Math.max(8, Math.min(20, (chartW - 40) / enrollments.length))}
						{@const gap = 2}
						<div class="svg-chart-wrap">
							<svg viewBox="0 0 {chartW} {chartH + 40}" class="bar-svg">
								<text x="10" y="15" class="chart-label">{maxVal}</text>
								<text x="10" y={chartH / 2 + 5} class="chart-label">{Math.round(maxVal / 2)}</text>
								<text x="10" y={chartH + 5} class="chart-label">0</text>
								{#each enrollments as item, i}
									{@const barH = (item.count / maxVal) * chartH}
									{@const x = 35 + i * (barW + gap)}
									{@const y = chartH - barH}
									<rect
										x={x} y={y}
										width={barW} height={barH}
										rx="2" ry="2"
										class="bar-rect"
									>
										<title>{item.date}: {item.count} enrollments</title>
									</rect>
									{#if i % 5 === 0}
										<text x={x + barW / 2} y={chartH + 16} text-anchor="middle" class="chart-label-x">
											{item.date?.slice(5)}
										</text>
									{/if}
								{/each}
							</svg>
						</div>
					{:else}
						<p class="empty">Belum ada data enrollment</p>
					{/if}
				</CardContent>
			</Card>

		<!-- === COMPLETION TAB === -->
		{:else if activeTab === 'completion'}
			<Card class="section-card">
				<CardContent>
					<div class="card-header-actions">
						<h2>Lesson Completion Rates per Offering</h2>
						<Button size="sm" variant="secondary" onclick={() => exportCSV('overview')}>📥 CSV</Button>
					</div>
					{#if completion.length > 0}
						{@const maxRate = Math.max(...completion.map((c: any) => c.completion_rate), 0.01)}
						<div class="completion-list">
							{#each completion as item}
								{@const pct = (item.completion_rate / maxRate) * 100}
								{@const pctDisplay = (item.completion_rate * 100).toFixed(1)}
								<div class="comp-row">
									<div class="comp-info">
										<span class="comp-name">{item.offering_name}</span>
										<span class="comp-students">{item.active_students} siswa</span>
									</div>
									<div class="comp-bar-track">
										<div
											class="comp-bar-fill"
											style="width: {pct}%"
											style:background={item.completion_rate >= 0.7 ? 'var(--accent)' : item.completion_rate >= 0.4 ? '#f59e0b' : '#ef4444'}
										></div>
									</div>
									<span class="comp-pct">{pctDisplay}%</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="empty">Belum ada data completion</p>
					{/if}
				</CardContent>
			</Card>

		<!-- === ATTENDANCE TAB === -->
		{:else if activeTab === 'attendance'}
			<div class="stats-grid">
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📅</span>
						<span class="stat-value">{attendanceData?.totalSessions ?? 0}</span>
						<span class="stat-label">Total Sesi</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">✅</span>
						<span class="stat-value">{attendanceData?.totalCheckIns ?? 0}</span>
						<span class="stat-label">Total Check-In</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">⚠️</span>
						<span class="stat-value">{attendanceData?.totalExceptions ?? 0}</span>
						<span class="stat-label">Eksepsi</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📊</span>
						<span class="stat-value">{(attendanceData?.avgAttendanceRate ?? 0 * 100).toFixed(1)}%</span>
						<span class="stat-label">Rata-rata Kehadiran</span>
					</CardContent>
				</Card>
			</div>
			<div class="card-header-actions" style="margin-bottom:12px">
				<Button size="sm" variant="secondary" onclick={() => exportCSV('attendance')}>📥 Export CSV</Button>
			</div>
			{#if attendanceData?.topAbsentStudents?.length}
			<Card class="section-card">
				<CardContent>
					<h2>Siswa dengan Absensi Tertinggi</h2>
					<div class="completion-list">
						{#each attendanceData.topAbsentStudents as s}
						<div class="comp-row">
							<span class="comp-name">{s.display_name || s.name || s.user_id}</span>
							<span class="comp-students">{s.absent_count} absen</span>
						</div>
						{/each}
					</div>
				</CardContent>
			</Card>
			{/if}

		<!-- === PAYMENTS TAB === -->
		{:else if activeTab === 'payments'}
			<div class="stats-grid">
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">💰</span>
						<span class="stat-value">Rp {((paymentsData?.totalRevenue ?? 0)).toLocaleString()}</span>
						<span class="stat-label">Total Pendapatan</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📄</span>
						<span class="stat-value">{paymentsData?.totalInvoices ?? 0}</span>
						<span class="stat-label">Total Invoice</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">💳</span>
						<span class="stat-value">{paymentsData?.totalPayments ?? 0}</span>
						<span class="stat-label">Pembayaran</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">⏳</span>
						<span class="stat-value">{paymentsData?.pendingInvoices ?? 0}</span>
						<span class="stat-label">Invoice Tertunda</span>
					</CardContent>
				</Card>
			</div>
			{#if paymentsData?.revenueByMethod?.length}
			<Card class="section-card">
				<CardContent>
					<h2>Pendapatan per Metode</h2>
					{@const maxRev = Math.max(...paymentsData.revenueByMethod.map((m: any) => m.total), 1)}
					<div class="completion-list">
						{#each paymentsData.revenueByMethod as m}
						{@const pct = (m.total / maxRev) * 100}
						<div class="comp-row">
							<span class="comp-name">{m.method || 'Unknown'}</span>
							<div class="comp-bar-track">
								<div class="comp-bar-fill" style="width: {pct}%"></div>
							</div>
							<span class="comp-pct">Rp {m.total.toLocaleString()}</span>
						</div>
						{/each}
					</div>
				</CardContent>
			</Card>
			{/if}

		<!-- === GRADES TAB === -->
		{:else if activeTab === 'grades'}
			<div class="stats-grid">
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📝</span>
						<span class="stat-value">{gradesData?.totalSubmissions ?? 0}</span>
						<span class="stat-label">Total Pengumpulan</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">✅</span>
						<span class="stat-value">{gradesData?.gradedCount ?? 0}</span>
						<span class="stat-label">Sudah Dinilai</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">⏳</span>
						<span class="stat-value">{gradesData?.pendingCount ?? 0}</span>
						<span class="stat-label">Menunggu</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">🎯</span>
						<span class="stat-value">{(gradesData?.avgScore ?? 0).toFixed(1)}</span>
						<span class="stat-label">Rata-rata Nilai</span>
					</CardContent>
				</Card>
			</div>
			<div class="card-header-actions" style="margin-bottom:12px">
				<Button size="sm" variant="secondary" onclick={() => exportCSV('grades')}>📥 Export CSV</Button>
			</div>
			{#if gradesData?.gradeDistribution}
			<Card class="section-card">
				<CardContent>
					<h2>Distribusi Nilai</h2>
					{@const dist = gradesData.gradeDistribution}
					{@const maxG = Math.max(dist.A ?? 0, dist.B ?? 0, dist.C ?? 0, dist.D ?? 0, dist.E ?? 0, 1)}
					<div class="completion-list">
						{#each ['A','B','C','D','E'] as g}
						{@const val = dist[g] ?? 0}
						{@const pctG = (val / maxG) * 100}
						<div class="comp-row">
							<span class="comp-name" style="min-width:30px;font-weight:700">{g}</span>
							<div class="comp-bar-track">
								<div class="comp-bar-fill" style="width: {pctG}%;background:{g === 'A' ? 'var(--accent)' : g === 'B' ? '#22c55e' : g === 'C' ? '#f59e0b' : g === 'D' ? '#f97316' : '#ef4444'}"></div>
							</div>
							<span class="comp-pct">{val}</span>
						</div>
						{/each}
					</div>
				</CardContent>
			</Card>
			{/if}

		<!-- === DISTRIBUTION TAB === -->
		{:else if activeTab === 'distribution'}
			<div class="stats-grid">
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">🎯</span>
						<span class="stat-value">{distributionData?.avgScore ?? 0}</span>
						<span class="stat-label">Rata-rata Nilai</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📝</span>
						<span class="stat-value">{distributionData?.totalSubmissions ?? 0}</span>
						<span class="stat-label">Total Pengumpulan</span>
					</CardContent>
				</Card>
			</div>

			<Card class="section-card">
				<CardContent>
					<h2>Distribusi Skor Siswa ({startDate} - {endDate})</h2>
					{#if distributionData?.distribution?.length}
						{@const maxCount = Math.max(...distributionData.distribution.map((d: any) => d.count), 1)}
						{@const barW = 600}
						{@const barH = 200}
						{@const offsetX = 60}
						{@const barAreaW = barW - 20}
						{@const barCount = distributionData.distribution.length}
						{@const bW = Math.min(60, barAreaW / barCount - 10)}
						{@const bGap = 10}
						<div class="svg-chart-wrap">
							<svg viewBox="0 0 {barW + 60} {barH + 50}" class="bar-svg">
								<text x="50" y="15" class="chart-label" text-anchor="end">{maxCount}</text>
								<text x="50" y={barH / 2 + 5} class="chart-label" text-anchor="end">{Math.round(maxCount/2)}</text>
								<text x="50" y={barH + 5} class="chart-label" text-anchor="end">0</text>
								{#each distributionData.distribution as d, i (d.range)}
									{@const h = maxCount > 0 ? (d.count / maxCount) * barH : 0}
									{@const x = offsetX + i * (bW + bGap)}
									{@const y = barH - h}
									<rect
										x={x} y={y}
										width={bW} height={h}
										rx="3" ry="3"
										fill={d.count > maxCount * 0.66 ? '#ef4444' : d.count > maxCount * 0.33 ? '#f59e0b' : '#22c55e'}
									>
										<title>{d.range}: {d.count} siswa</title>
									</rect>
									<text x={x + bW / 2} y={barH + 16} text-anchor="middle" class="chart-label-x">
										{d.range}
									</text>
									<text x={x + bW / 2} y={y - 6} text-anchor="middle" class="chart-label-x" fill="var(--accent)">
										{d.count}
									</text>
								{/each}
								<!-- Y axis -->
								<line x1={offsetX - 5} y1="0" x2={offsetX - 5} y2={barH} stroke="rgba(255,255,255,0.1)" />
							</svg>
						</div>
					{:else}
						<p class="empty">Belum ada data distribusi</p>
					{/if}
				</CardContent>
			</Card>

		<!-- === COURSE COMPARISON TAB === -->
		{:else if activeTab === 'course-compare'}
			<Card class="section-card">
				<CardContent>
					<div class="card-header-actions">
						<h2>Perbandingan Kursus (Enrollment vs Completion)</h2>
						<Button size="sm" variant="secondary" onclick={() => exportCSV('overview')}>📥 Export CSV</Button>
					</div>
					{#if courseComparison.length > 0}
						{@const maxEnroll = Math.max(...courseComparison.map((c: any) => c.totalEnrollments), 1)}
						{@const barW = 700}
						{@const barH = 25}
						{@const gap = 8}
						<div class="svg-chart-wrap" style="margin-top:10px">
							<svg viewBox="0 0 {barW + 30} {(barH + gap + 30) * courseComparison.length + 20}">
								{#each courseComparison as course, i}
									{@const y = 15 + i * (barH + gap + 30)}
									{@const enrollW = (course.totalEnrollments / maxEnroll) * (barW - 100)}
									{@const compW = course.completedEnrollments > 0 ? (course.completedEnrollments / maxEnroll) * (barW - 100) : 0}
									<text x="5" y={y + barH / 2 + 4} class="chart-label-x" text-anchor="start" font-size="10">
										{course.name?.slice(0, 20)}
									</text>
									<!-- Enrollment bar -->
									<rect x="110" y={y} width={Math.max(enrollW, 0)} height={barH} rx="3" ry="3" fill="var(--accent)" opacity="0.6">
										<title>Enrollments: {course.totalEnrollments}</title>
									</rect>
									<!-- Completed bar (overlay) -->
									<rect x="110" y={y} width={Math.max(compW, 0)} height={barH} rx="3" ry="3" fill="#22c55e" opacity="0.9">
										<title>Completed: {course.completedEnrollments}</title>
									</rect>
									<text x={110 + Math.max(enrollW, compW) + 6} y={y + barH / 2 + 4} font-size="10" fill="var(--text-secondary)">
										{course.totalEnrollments} enrolled · {course.completedEnrollments} done · {course.completionRate}%
									</text>
								{/each}
							</svg>
						</div>
						<div class="legend" style="display:flex; gap:16px; margin-top:8px; font-size:12px; color:var(--text-secondary)">
							<span><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:var(--accent);opacity:0.6;vertical-align:middle;margin-right:4px"></span> Enrollment</span>
							<span><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:#22c55e;vertical-align:middle;margin-right:4px"></span> Completed</span>
						</div>
					{:else}
						<p class="empty">Belum ada data kursus</p>
					{/if}
				</CardContent>
			</Card>

		<!-- === ACTIVITY TAB === -->
		{:else if activeTab === 'activity'}
			<Card class="section-card">
				<CardContent>
					<h2>Activity Log</h2>
					{#if overview?.recentActivity?.length}
						<div class="activity-feed activity-feed--full">
							{#each overview.recentActivity as act}
								<div class="activity-item">
									<span class="act-avatar">{actionIcon(act.action)}</span>
									<div class="act-body">
										<span class="act-user">{act.display_name || act.email || act.user_id?.slice(0, 12)}</span>
										<span class="act-action">{act.action}</span>
										{#if act.entity_type}
											<span class="act-entity">· {act.entity_type} {act.entity_id?.slice(0, 8)}</span>
										{/if}
									</div>
									<span class="act-time">{timeAgo(act.created_at)}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="empty">Belum ada aktivitas</p>
					{/if}
				</CardContent>
			</Card>
		{/if}
	{/if}
</div>

<style>
	.analytics-page { max-width: 1100px; }
	h1 { font-size: 26px; font-weight: 700; }
	h2 { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
	.loading { text-align: center; padding: 60px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 60px; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 16px; }
	.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
	.date-range { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.date-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
	.date-input {
		padding: 4px 8px;
		font-size: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--text);
		font-family: inherit;
	}

	/* Tabs */
	.tabs {
		display: flex;
		gap: 4px;
		margin-bottom: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 4px;
		overflow-x: auto;
	}
	.tab {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}
	.tab:hover { background: var(--bg-secondary); color: var(--text); }
	.tab--active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }
	.tab-icon { font-size: 15px; }

	/* Stats cards */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 14px;
		margin-bottom: 28px;
	}
	:global(.stat-card) { text-align: center; }
	:global(.stat-card) :global(.card-content) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 18px;
	}
	.stat-icon { font-size: 24px; }
	.stat-value { font-size: 22px; font-weight: 700; color: var(--accent); }
	.stat-label { font-size: 11px; color: var(--text-secondary); }

	/* Section card */
	:global(.section-card) { margin-bottom: 20px; }
	.card-header-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.card-header-actions h2 { margin-bottom: 0; }

	/* SVG bar chart */
	.svg-chart-wrap {
		width: 100%;
		overflow-x: auto;
	}
	.bar-svg {
		width: 100%;
		min-width: 300px;
		height: auto;
	}
	.bar-rect {
		fill: var(--accent);
		opacity: 0.85;
		transition: opacity 0.2s;
	}
	.bar-rect:hover { opacity: 1; }
	.chart-label {
		fill: var(--text-secondary);
		font-size: 10px;
		font-family: inherit;
	}
	.chart-label-x {
		fill: var(--text-secondary);
		font-size: 9px;
		font-family: inherit;
	}

	/* Completion bars */
	.completion-list { display: flex; flex-direction: column; gap: 10px; }
	.comp-row { display: flex; align-items: center; gap: 12px; }
	.comp-info { min-width: 180px; }
	.comp-name { display: block; font-size: 13px; font-weight: 500; }
	.comp-students { font-size: 11px; color: var(--text-secondary); }
	.comp-bar-track { flex: 1; height: 12px; background: var(--bg-secondary); border-radius: 6px; overflow: hidden; }
	.comp-bar-fill { height: 100%; border-radius: 6px; transition: width 0.3s; }
	.comp-pct { min-width: 45px; text-align: right; font-size: 13px; font-weight: 600; color: var(--accent); }

	/* Activity feed */
	.activity-feed { display: flex; flex-direction: column; gap: 2px; }
	.activity-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		border-bottom: 1px solid var(--border);
		font-size: 13px;
	}
	.activity-item:last-child { border-bottom: none; }
	.act-avatar { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; }
	.act-body { flex: 1; display: flex; flex-wrap: wrap; gap: 4px; }
	.act-user { font-weight: 600; color: var(--text); }
	.act-action { color: var(--text-secondary); }
	.act-entity { color: var(--text-secondary); font-size: 12px; }
	.act-time { font-size: 11px; color: var(--text-secondary); white-space: nowrap; }

	.empty { color: var(--text-secondary); font-size: 13px; text-align: center; padding: 30px; }

	@media (max-width: 768px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
		.comp-info { min-width: 120px; }
		.header-row { flex-direction: column; align-items: flex-start; }
	}
</style>
