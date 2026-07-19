<script lang="ts">
  let {
    active = false,
    duration = 3000,
    density = 'low',
  }: {
    active?: boolean;
    duration?: number;
    density?: 'low' | 'high';
  } = $props();

  const colors = ['#4F46E5', '#22C55E', '#FF9600', '#EC4899', '#3B82F6'];
  const particleCount = density === 'high' ? 100 : 50;

  interface Particle {
    id: number;
    color: string;
    left: string;
    size: number;
    delay: number;
    rotation: number;
    shape: 'rect' | 'circle';
  }

  let particles: Particle[] = $state([]);
  let show = $state(false);

  $effect(() => {
    if (active) {
      const p: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        p.push({
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          left: `${Math.random() * 100}%`,
          size: Math.random() * 6 + 6, // 6-12px
          delay: Math.random() * 0.5,
          rotation: Math.random() * 720 - 360,
          shape: Math.random() > 0.5 ? 'rect' : 'circle',
        });
      }
      particles = p;
      show = true;

      const timer = setTimeout(() => {
        show = false;
        particles = [];
      }, duration);

      return () => {
        clearTimeout(timer);
        show = false;
        particles = [];
      };
    } else {
      show = false;
      particles = [];
    }
  });
</script>

{#if show}
  <div class="confetti-container" aria-hidden="true">
    {#each particles as particle (particle.id)}
      <div
        class="confetti-particle"
        class:rect={particle.shape === 'rect'}
        class:circle={particle.shape === 'circle'}
        style="
          left: {particle.left};
          width: {particle.size}px;
          height: {particle.size}px;
          background: {particle.color};
          animation-delay: {particle.delay}s;
          --rotation: {particle.rotation}deg;
        "
      ></div>
    {/each}
  </div>
{/if}

<style>
  .confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  }

  .confetti-particle {
    position: absolute;
    top: -12px;
    opacity: 0;
    animation: confetti-fall 3s ease-in forwards;
  }

  .confetti-particle.rect {
    border-radius: 2px;
  }

  .confetti-particle.circle {
    border-radius: 50%;
  }

  @keyframes confetti-fall {
    0% {
      opacity: 1;
      transform: translateY(0) rotate(0deg) scale(1);
    }
    25% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(100vh) rotate(var(--rotation, 360deg)) scale(0.5);
    }
  }
</style>
