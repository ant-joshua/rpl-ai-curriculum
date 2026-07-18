<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button, Card, CardHeader, CardContent, Modal, Input, Textarea, Select, Alert, EmptyState, Loading } from '$lib/components/ui';

  let { data }: { data: { offeringId?: string } } = $props();

  let offeringId = $state('');
  let schedules = $state<any[]>([]);
  let loading = $state(true);
  let error = $state('');

  // Form modal
  let showModal = $state(false);
  let editingSchedule = $state<any>(null);
  let sTitle = $state('');
  let sDescription = $state('');
  let sStartTime = $state('');
  let sEndTime = $state('');
  let sLocation = $state('');
  let sMeetingLink = $state('');
  let sSaving = $state(false);
  let sError = $state('');

  let offeringName = $state('');

  onMount(() => {
    if (browser) {
      const pathParts = window.location.pathname.split('/');
      offeringId = pathParts[pathParts.length - 1] || '';
      loadSchedules();
    }
  });

  async function loadSchedules() {
    if (!offeringId || offeringId === 'schedules') {
      loading = false;
      return;
    }
    loading = true;
    error = '';
    try {
      const res = await fetch(`/api/admin/schedules?offering_id=${offeringId}`);
      const json = await res.json();
      if (json.success) {
        schedules = json.data || [];
        if (schedules.length > 0) {
          offeringName = schedules[0].offering_name;
        } else {
          // Fetch offering name
          const offRes = await fetch(`/api/admin/course-offerings`);
          const offJson = await offRes.json();
          const off = (offJson.data || []).find((o: any) => o.id === offeringId);
          if (off) offeringName = off.name;
        }
      } else {
        error = json.error || 'Gagal memuat jadwal';
      }
    } catch {
      error = 'Gagal terhubung ke server';
    } finally {
      loading = false;
    }
  }

  function openCreate() {
    editingSchedule = null;
    sTitle = '';
    sDescription = '';
    sStartTime = '';
    sEndTime = '';
    sLocation = '';
    sMeetingLink = '';
    sError = '';
    showModal = true;
  }

  function openEdit(s: any) {
    editingSchedule = s;
    sTitle = s.title || '';
    sDescription = s.description || '';
    sStartTime = s.start_time ? s.start_time.slice(0, 16) : '';
    sEndTime = s.end_time ? s.end_time.slice(0, 16) : '';
    sLocation = s.location || '';
    sMeetingLink = s.meeting_link || '';
    sError = '';
    showModal = true;
  }

  async function saveSchedule() {
    if (!sTitle.trim() || !sStartTime.trim()) {
      sError = 'Judul dan waktu mulai wajib diisi';
      return;
    }
    sSaving = true;
    sError = '';
    try {
      const body = {
        course_offering_id: offeringId,
        title: sTitle.trim(),
        description: sDescription.trim(),
        start_time: sStartTime,
        end_time: sEndTime || null,
        location: sLocation.trim(),
        meeting_link: sMeetingLink.trim(),
      };

      let res;
      if (editingSchedule) {
        res = await fetch(`/api/admin/schedules/${editingSchedule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/admin/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      const json = await res.json();
      if (json.success) {
        loadSchedules();
        showModal = false;
      } else {
        sError = json.error || 'Gagal menyimpan';
      }
    } catch {
      sError = 'Gagal terhubung';
    } finally {
      sSaving = false;
    }
  }

  async function deleteSchedule(id: string) {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      const res = await fetch(`/api/admin/schedules/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        schedules = schedules.filter((s: any) => s.id !== id);
      }
    } catch {
      alert('Gagal terhubung');
    }
  }

  function formatDateTime(dt: string): string {
    if (!dt) return '';
    const d = new Date(dt + (dt.endsWith('Z') ? '' : 'Z'));
    return d.toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function formatDateOnly(dt: string): string {
    if (!dt) return '';
    const d = new Date(dt + (dt.endsWith('Z') ? '' : 'Z'));
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatTimeOnly(dt: string): string {
    if (!dt) return '';
    const d = new Date(dt + (dt.endsWith('Z') ? '' : 'Z'));
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
  <title>{t('admin.title')}</title>
</svelte:head>

<div class="schedules-page">
  <div class="breadcrumb">
    <a href="/admin/courses">📚 Kursus</a>
    {#if offeringName}
      / <span>{offeringName}</span>
    {/if}
    / <span>{t('mahasiswa.col_schedule')}</span>
  </div>

  {#if loading}
    <Loading />
  {:else if !offeringId}
    <EmptyState icon="📅" title="Pilih Offering" description="Kunjungi halaman ini dari halaman detail kursus" />
  {:else}
    <div class="page-header">
      <h1>📅 Jadwal {offeringName}</h1>
      <Button onclick={openCreate}>+ Jadwal Baru</Button>
    </div>

    {#if error}
      <Alert variant="danger">{error}</Alert>
    {/if}

    {#if schedules.length === 0}
      <EmptyState icon="📅" title="Belum ada jadwal" description="Tambahkan jadwal untuk kursus ini" />
    {:else}
      <div class="schedule-list">
        {#each schedules as s}
          <div class="schedule-card">
            <div class="schedule-time">
              <div class="schedule-date">{formatDateOnly(s.start_time)}</div>
              <div class="schedule-clock">{formatTimeOnly(s.start_time)}{#if s.end_time} - {formatTimeOnly(s.end_time)}{/if}</div>
            </div>
            <div class="schedule-body">
              <h3 class="schedule-title">{s.title}</h3>
              {#if s.description}
                <p class="schedule-desc">{s.description}</p>
              {/if}
              <div class="schedule-meta">
                {#if s.location}
                  <span class="meta-item">📍 {s.location}</span>
                {/if}
                {#if s.meeting_link}
                  <a href={s.meeting_link} target="_blank" class="meta-item meta-link">🔗 Meeting Link</a>
                {/if}
              </div>
            </div>
            <div class="schedule-actions">
              <Button size="sm" variant="ghost" onclick={() => openEdit(s)}>✏️</Button>
              <Button size="sm" variant="danger" onclick={() => deleteSchedule(s.id)}>🗑️</Button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

{#if showModal}
  <Modal
    open={showModal}
    title={editingSchedule ? '✏️ Edit Jadwal' : '+ Jadwal Baru'}
    onclose={() => { if (!sSaving) showModal = false; }}
  >
    {#if sError}
      <Alert variant="danger">{sError}</Alert>
    {/if}
    <Input label="Judul" bind:value={sTitle} placeholder="e.g. Pertemuan 1 - Intro" />
    <Textarea label="Deskripsi" bind:value={sDescription} placeholder="Deskripsi pertemuan" />
    <Input label="Waktu Mulai" type="datetime-local" bind:value={sStartTime} />
    <Input label="Waktu Selesai" type="datetime-local" bind:value={sEndTime} />
    <Input label="Lokasi" bind:value={sLocation} placeholder="e.g. Ruang 201" />
    <Input label="Meeting Link" bind:value={sMeetingLink} placeholder="https://meet.google.com/..." />
    {#snippet footer()}
      <Button variant="secondary" onclick={() => showModal = false} disabled={sSaving}>{t('common.cancel')}</Button>
      <Button onclick={saveSchedule} loading={sSaving}>{editingSchedule ? 'Simpan' : 'Buat'}</Button>
    {/snippet}
  </Modal>
{/if}

<style>
  .schedules-page { max-width: 900px; }
  .breadcrumb { font-size: 13px; color: #8a8f98; margin-bottom: 16px; }
  .breadcrumb a { color: #7170ff; text-decoration: none; }
  .breadcrumb a:hover { text-decoration: underline; }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .page-header h1 { font-size: 22px; font-weight: 700; margin: 0; }
  .schedule-list { display: flex; flex-direction: column; gap: 10px; }
  .schedule-card {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    transition: border-color 0.15s;
  }
  .schedule-card:hover { border-color: rgba(255,255,255,0.12); }
  .schedule-time {
    min-width: 140px;
    text-align: center;
    padding: 8px;
    background: rgba(94,106,210,0.08);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .schedule-date { font-size: 12px; color: #8a8f98; font-weight: 500; }
  .schedule-clock { font-size: 13px; color: #f7f8f8; font-weight: 600; margin-top: 2px; }
  .schedule-body { flex: 1; min-width: 0; }
  .schedule-title { font-size: 15px; font-weight: 600; color: #f7f8f8; margin: 0 0 4px; }
  .schedule-desc { font-size: 13px; color: #8a8f98; margin: 0 0 8px; }
  .schedule-meta { display: flex; gap: 10px; flex-wrap: wrap; }
  .meta-item { font-size: 12px; color: #62666d; }
  .meta-link { color: #7170ff; text-decoration: none; }
  .meta-link:hover { text-decoration: underline; }
  .schedule-actions { display: flex; gap: 4px; flex-shrink: 0; align-items: flex-start; }
</style>
