document.addEventListener('DOMContentLoaded', () => {
  const messageEl = document.getElementById('message');
  const btn = document.getElementById('btn');

  messageEl.textContent = 'Hello from vanilla JS!';

  btn.addEventListener('click', () => {
    messageEl.textContent = `Clicked at ${new Date().toLocaleTimeString()}`;
  });
});
