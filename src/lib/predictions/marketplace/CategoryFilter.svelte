<script lang="ts">
	import { type MarketCategory } from '@mijoco/stx_helpers/dist/index';
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

<div class="mb-6 flex flex-wrap gap-2">
	<button on:click={() => filterByCategory('all')} class="rounded-full border border-gray-300 bg-success-300 px-3 py-1 text-sm font-medium transition hover:bg-success-400" class:selected={current === 'all'}> All </button>
	{#each categories as category}
		<button on:click={() => filterByCategory(category.name)} class="rounded-full border bg-success-300 px-3 py-1 text-sm font-medium transition hover:bg-success-400" class:selected={current === category.name}>
			{category.displayName}
		</button>
	{/each}
</div>

<style>
	button.selected {
		@apply border-gray-800 bg-success-600 text-white;
	}
</style>
