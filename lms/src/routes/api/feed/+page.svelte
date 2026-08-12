<script lang="ts">
  import { t } from '$lib/stores/i18n';
  import { redirect } from '@sveltejs/kit';
  import type { PageLoad } from './$types';
  
  export function load(): PageLoad {
    redirect(302, '/api/feed');
  }
</script>
