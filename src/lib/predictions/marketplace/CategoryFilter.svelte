<script lang="ts">
	import type { MarketCategory } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { getMarketCategories } from '../predictions';

	export let onSelectCategory: any;
	let categories: Array<MarketCategory>;
	let current: string | 'all' = 'all';

	function filterByCategory(category: string | 'all') {
		current = category;
		onSelectCategory(category);
	}

	onMount(async () => {
		categories = await getMarketCategories();
	});
</script>

<div class="flex flex-wrap gap-3">
	<button
		on:click={() => filterByCategory('all')}
		class="rounded-full border border-purple-900/20 bg-[#151B2D]/50 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:border-purple-500 hover:bg-purple-500/20 {current === 'all'
			? 'border-purple-500 bg-purple-500/20 text-purple-400'
			: 'text-indigo-200'}"
	>
		All Markets
	</button>

	{#each categories as category}
		<button
			on:click={() => filterByCategory(category.name)}
			class="rounded-full border border-purple-900/20 bg-[#151B2D]/50 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:border-purple-500 hover:bg-purple-500/20 {current === category.name
				? 'border-purple-500 bg-purple-500/20 text-purple-400'
				: 'text-indigo-200'}"
		>
			{category.displayName}
		</button>
	{/each}
</div>
