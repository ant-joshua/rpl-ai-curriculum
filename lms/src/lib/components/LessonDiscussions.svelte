<script lang="ts">
  import { addToast } from '$lib/stores/toast.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  interface DiscussionComment {
    id: string;
    lesson_id: string;
    course_offering_id: string;
    user_id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
    display_name: string | null;
    avatar_url: string | null;
    user_role: string | null;
    like_count?: number;
    liked_by_me?: boolean;
    replies?: DiscussionComment[];
  }

  let { lessonId, offeringId }: { lessonId: string; offeringId: string } = $props();

  let comments = $state<DiscussionComment[]>([]);
  let loading = $state(false);
  let posting = $state(false);
  let newContent = $state('');
  let replyTo = $state<{ id: string; name: string } | null>(null);
  let replyContent = $state('');
  let postingReply = $state(false);
  let currentUserId = $state<string | null>(null);
  let currentUserRole = $state<string | null>(null);
  let liking = $state<string | null>(null);

  function getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('token') || localStorage.getItem('lms-auth-token');
  }

  function authHeaders(): Record<string, string> {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async function toggleLike(comment: DiscussionComment) {
    if (liking) return;
    liking = comment.id;
    try {
      const res = await fetch(`/api/lessons/${lessonId}/discussions/${comment.id}/like`, {
        method: 'POST',
        headers: authHeaders()
      });
      const json = await res.json();
      if (json.success) {
        const liked = json.data.liked;
        const count = json.data.like_count;
        // Apply to nested reply or top-level comment
        let found = false;
        comments = comments.map(c => {
          if (c.id === comment.id) { found = true; return { ...c, liked_by_me: liked, like_count: count }; }
          if (c.replies) {
            for (let i = 0; i < c.replies.length; i++) {
              if (c.replies[i].id === comment.id) {
                found = true;
                const repl = [...c.replies];
                repl[i] = { ...repl[i], liked_by_me: liked, like_count: count };
                return { ...c, replies: repl };
              }
            }
          }
          return c;
        });
        if (!found) addToast('Komentar belum dimuat', 'warning');
      } else {
        addToast(json.error || 'Gagal like', 'error');
      }
    } catch {
      addToast('Gagal like', 'error');
    } finally {
      liking = null;
    }
  }

  $effect(() => {
    if (lessonId) {
      loadComments();
      loadCurrentUser();
    }
  });

  async function loadCurrentUser() {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          currentUserId = json.data.id;
          currentUserRole = json.data.role || null;
        }
      }
    } catch { /* ignore */ }
  }

  async function loadComments() {
    loading = true;
    try {
      const res = await fetch(`/api/lessons/${lessonId}/discussions`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success) comments = json.data || [];
      }
    } catch {
      addToast('Gagal memuat diskusi', 'error');
    } finally {
      loading = false;
    }
  }

  async function postComment() {
    if (!newContent.trim()) return;
    posting = true;
    try {
      const res = await fetch(`/api/lessons/${lessonId}/discussions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content: newContent.trim(), course_offering_id: offeringId })
      });
      const json = await res.json();
      if (json.success) {
        comments = [...comments, { ...json.data, replies: [] }];
        newContent = '';
        addToast('Komentar terkirim!', 'success');
      } else {
        addToast(json.error || 'Gagal mengirim komentar', 'error');
      }
    } catch {
      addToast('Gagal mengirim komentar', 'error');
    } finally {
      posting = false;
    }
  }

  function startReply(comment: DiscussionComment) {
    replyTo = { id: comment.id, name: comment.display_name || 'Anonymous' };
    replyContent = '';
  }

  function cancelReply() {
    replyTo = null;
    replyContent = '';
  }

  async function postReply() {
    if (!replyContent.trim() || !replyTo) return;
    postingReply = true;
    try {
      const res = await fetch(`/api/lessons/${lessonId}/discussions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          content: replyContent.trim(),
          parent_id: replyTo.id,
          course_offering_id: offeringId
        })
      });
      const json = await res.json();
      if (json.success) {
        comments = comments.map(c => {
          if (c.id === replyTo!.id) {
            return { ...c, replies: [...(c.replies || []), json.data] };
          }
          return c;
        });
        replyContent = '';
        replyTo = null;
        addToast('Balasan terkirim!', 'success');
      } else {
        addToast(json.error || 'Gagal mengirim balasan', 'error');
      }
    } catch {
      addToast('Gagal mengirim balasan', 'error');
    } finally {
      postingReply = false;
    }
  }

  async function deleteComment(commentId: string) {
    if (!confirm('Hapus komentar ini? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      const res = await fetch(`/api/lessons/${lessonId}/discussions/${commentId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (res.ok) {
        comments = comments.filter(c => c.id !== commentId);
        addToast('Komentar dihapus', 'success');
      } else {
        const json = await res.json();
        addToast(json.error || 'Gagal menghapus', 'error');
      }
    } catch {
      addToast('Gagal menghapus komentar', 'error');
    }
  }

  function canDelete(comment: DiscussionComment): boolean {
    if (currentUserRole && ['superadmin', 'admin', 'instructor'].includes(currentUserRole)) return true;
    return currentUserId !== null && comment.user_id === currentUserId;
  }

  function timeAgo(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr + 'Z').getTime();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins}m lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}j lalu`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}h lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID');
  }

  function getInitials(name: string): string {
    return name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  function userName(c: DiscussionComment): string {
    return c.display_name || 'Anonymous';
  }

  function isInstructor(c: DiscussionComment): boolean {
    return c.user_role === 'instructor' || c.user_role === 'admin' || c.user_role === 'superadmin';
  }

  function roleBadgeLabel(role: string | null): string {
    switch (role) {
      case 'instructor': return 'Instructor';
      case 'admin': return 'Admin';
      case 'superadmin': return 'Super Admin';
      case 'ta': return 'Asisten';
      case 'parent': return 'Orang Tua';
      case 'student': return 'Siswa';
      default: return '';
    }
  }

  function roleBadgeClass(role: string | null): string {
    switch (role) {
      case 'instructor': return 'badge-instructor';
      case 'admin':
      case 'superadmin': return 'badge-admin';
      case 'ta': return 'badge-ta';
      case 'parent': return 'badge-parent';
      case 'student': return 'badge-student';
      default: return '';
    }
  }

  // Render content with @mention highlight and bold
  function renderContent(content: string): string {
    return content
      .replace(/@(\w[\w\s]{1,40}?)(?=\s|$)/g, '<span class="mention">@$1</span>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
</script>

<div class="discussions-section">
  <h3 class="discussions-title">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    Diskusi ({comments.length})
  </h3>

  <!-- New comment form -->
  <div class="comment-form">
    <Textarea
      bind:value={newContent}
      placeholder="Tulis komentar atau pertanyaan..."
      rows={3}
    />
    <div class="form-actions">
      <Button
        onclick={postComment}
        disabled={posting || !newContent.trim()}
        loading={posting}
        variant="primary"
      >
        Kirim Komentar
      </Button>
    </div>
  </div>

  <!-- Comments list -->
  <div class="comments-list">
    {#if loading}
      <div class="loading-text">Memuat diskusi...</div>
    {:else if comments.length === 0}
      <div class="empty-text">
        <p>Belum ada diskusi. Jadilah yang pertama berkomentar!</p>
      </div>
    {:else}
      {#each comments as comment (comment.id)}
        <div class="comment-item">
          <div class="comment-avatar">
            <div class="avatar-circle">{getInitials(userName(comment))}</div>
          </div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-author">{userName(comment)}</span>
              {#if roleBadgeLabel(comment.user_role)}
                <span class="role-badge {roleBadgeClass(comment.user_role)}">{roleBadgeLabel(comment.user_role)}</span>
              {/if}
              <span class="comment-time">{timeAgo(comment.created_at)}</span>
            </div>
            <div class="comment-content">{@html renderContent(comment.content)}</div>
            <div class="comment-actions">
              <button class="like-btn" class:liked={comment.liked_by_me} onclick={() => toggleLike(comment)} disabled={!!liking}>
                <span class="like-icon">{comment.liked_by_me ? '👍' : '👍'}</span>
                <span class="like-count">{comment.like_count || 0}</span>
              </button>
              <button class="reply-btn" onclick={() => startReply(comment)}>Balas</button>
              {#if canDelete(comment)}
                <button class="delete-btn" onclick={() => deleteComment(comment.id)}>Hapus</button>
              {/if}
            </div>

            <!-- Replies -->
            {#if comment.replies && comment.replies.length > 0}
              <div class="replies-list">
                {#each comment.replies as reply (reply.id)}
                  <div class="reply-item">
                    <div class="comment-avatar small">
                      <div class="avatar-circle small">{getInitials(userName(reply))}</div>
                    </div>
                    <div class="comment-body">
                      <div class="comment-header">
                        <span class="comment-author">{userName(reply)}</span>
                        {#if roleBadgeLabel(reply.user_role)}
                          <span class="role-badge {roleBadgeClass(reply.user_role)}">{roleBadgeLabel(reply.user_role)}</span>
                        {/if}
                        <span class="comment-time">{timeAgo(reply.created_at)}</span>
                      </div>
                      <div class="comment-content">{@html renderContent(reply.content)}</div>
                      <div class="comment-actions">
                        <button class="like-btn" class:liked={reply.liked_by_me} onclick={() => toggleLike(reply)} disabled={!!liking}>
                          <span class="like-icon">{reply.liked_by_me ? '👍' : '👍'}</span>
                          <span class="like-count">{reply.like_count || 0}</span>
                        </button>
                        {#if canDelete(reply)}
                          <button class="delete-btn" onclick={() => deleteComment(reply.id)}>Hapus</button>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}

            <!-- Reply form inline -->
            {#if replyTo && replyTo.id === comment.id}
              <div class="reply-form-inline">
                <Textarea
                  bind:value={replyContent}
                  placeholder="Balas ke {replyTo.name}..."
                  rows={2}
                />
                <div class="form-actions">
                  <Button variant="ghost" onclick={cancelReply}>Batal</Button>
                  <Button
                    onclick={postReply}
                    disabled={postingReply || !replyContent.trim()}
                    loading={postingReply}
                  >
                    Kirim Balasan
                  </Button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .discussions-section {
    margin: 32px 0;
    padding: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .discussions-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 16px;
  }

  .comment-form {
    margin-bottom: 24px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
  }

  .loading-text {
    text-align: center;
    padding: 20px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .empty-text {
    text-align: center;
    padding: 20px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .comment-item {
    display: flex;
    gap: 12px;
  }

  .comment-avatar {
    flex-shrink: 0;
  }

  .avatar-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--accent-dim, rgba(79, 70, 229, 0.2));
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }

  .avatar-circle.small {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }

  .comment-body {
    flex: 1;
    min-width: 0;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }

  .comment-author {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  .instructor-badge,
  .role-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 8px;
    border-radius: 4px;
  }
  .role-badge.badge-instructor { background: rgba(79, 70, 229, 0.15); color: #4F46E5; }
  .role-badge.badge-admin { background: rgba(220, 38, 38, 0.12); color: #dc2626; }
  .role-badge.badge-ta { background: rgba(217, 119, 6, 0.15); color: #d97706; }
  .role-badge.badge-parent { background: rgba(16, 185, 129, 0.15); color: #0d9488; }
  .role-badge.badge-student { background: rgba(100, 116, 139, 0.15); color: #64748b; }

  .comment-content :global(.mention) {
    color: #4F46E5;
    font-weight: 600;
    background: rgba(79, 70, 229, 0.1);
    border-radius: 4px;
    padding: 0 3px;
  }

  .like-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--text-secondary);
    transition: color 0.15s;
  }
  .like-btn:hover { color: var(--accent); }
  .like-btn.liked { color: var(--accent); }
  .like-icon { font-size: 12px; }

  .comment-time {
    font-size: 11px;
    color: var(--text-secondary);
    margin-left: auto;
  }

  .comment-content {
    font-size: 14px;
    color: var(--text);
    line-height: 1.6;
    margin-bottom: 6px;
    white-space: pre-wrap;
  }

  .comment-actions {
    display: flex;
    gap: 12px;
  }

  .reply-btn, .delete-btn {
    font-size: 12px;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--text-secondary);
    transition: color 0.15s;
  }

  .reply-btn:hover { color: var(--accent); }
  .delete-btn:hover { color: var(--danger, #ef4444); }

  .replies-list {
    margin-top: 12px;
    padding-left: 16px;
    border-left: 2px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .reply-item {
    display: flex;
    gap: 10px;
  }

  .reply-form-inline {
    margin-top: 12px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    .replies-list {
      padding-left: 10px;
    }
  }
</style>
