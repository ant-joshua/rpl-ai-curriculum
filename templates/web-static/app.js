/**
 * Aplikasi JavaScript vanilla untuk static starter.
 * - Menampilkan waktu real-time
 * - Tombol interaktif
 * - Fetch data dummy
 */

document.addEventListener('DOMContentLoaded', () => {
  const messageEl = document.getElementById('message');
  const btn = document.getElementById('btn');
  const clockEl = document.getElementById('clock');

  // === Initial message ===
  messageEl.textContent = 'Selamat datang di RPL AI!';

  // === Real-time clock ===
  function updateClock() {
    const now = new Date();
    const waktu = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    if (clockEl) clockEl.textContent = `🕐 ${waktu}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // === Button click handler ===
  btn.addEventListener('click', async () => {
    btn.textContent = 'Loading...';
    btn.disabled = true;

    // Simulasi fetch data
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      const data = await response.json();
      messageEl.textContent = `📦 ${data.title} — ${data.completed ? '✅ Selesai' : '⏳ Belum'}`;
    } catch {
      messageEl.textContent = `Terakhir diklik: ${new Date().toLocaleTimeString('id-ID')}`;
    }

    btn.textContent = 'Klik Saya';
    btn.disabled = false;
  });
});
