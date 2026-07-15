<script lang="ts">
  let {
    class: className = '',
  }: {
    class?: string;
  } = $props();
</script>

<div class="skeleton-card {className}" role="status" aria-label="Loading">
  <div class="sc-top"></div>
  <div class="sc-middle">
    <div class="sc-line sc-line--short"></div>
    <div class="sc-line sc-line--long"></div>
  </div>
  <div class="sc-bottom">
    <div class="sc-line sc-line--thumb"></div>
    <div class="sc-line sc-line--button"></div>
  </div>
</div>

<style>
  .skeleton-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 200px;
    overflow: hidden;
  }

  .sc-top {
    width: 60px;
    height: 20px;
    border-radius: 4px;
    background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .sc-middle {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sc-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }

  .sc-line {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .sc-line--short {
    width: 60%;
  }

  .sc-line--long {
    width: 90%;
  }

  .sc-line--thumb {
    width: 100px;
  }

  .sc-line--button {
    width: 80px;
    height: 32px;
    border-radius: 6px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
