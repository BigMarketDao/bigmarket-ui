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

<div class="font-inter mx-3 mb-6 flex flex-wrap gap-2 text-[10px] font-bold md:mx-10 md:text-[16px]">
	<button on:click={() => filterByCategory('all')} class="rounded-full border border-gray-300 bg-white px-4 py-1 text-black transition hover:bg-gray-100 md:px-16 md:py-3" class:selected={current === 'all'}> All </button>
	{#each categories as category}
		<button on:click={() => filterByCategory(category.name)} class=" rounded-full border bg-white px-4 py-1 text-black transition hover:bg-gray-100 md:px-16 md:py-3" class:selected={current === category.name}>
			{category.displayName}
		</button>
	{/each}
</div>

<style>
	button.selected {
		@apply bg-blue-500 text-white hover:bg-blue-600;
	}
</style>
