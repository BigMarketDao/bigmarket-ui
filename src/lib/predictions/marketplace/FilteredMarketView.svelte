<script lang="ts">
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import CategoryFilter from './CategoryFilter.svelte';
	import MarketEntry from './info/MarketEntry.svelte';

	export let markets: Array<PredictionMarketCreateEvent> = [];
	let filteredMarkets: Array<PredictionMarketCreateEvent> = [];
	let category: string;

	const handleSelectCategory = (newCategory: string) => {
		category = newCategory;
		if (category && category !== 'all') {
			filteredMarkets = markets.filter((o) => o.unhashedData.category === category);
		} else {
			filteredMarkets = markets;
		}
	};

	onMount(async () => {
		filteredMarkets = markets;
	});
</script>

<div class="mx-10 flex w-full flex-col items-center justify-center gap-y-5">
	<CategoryFilter onSelectCategory={handleSelectCategory} />
	<div class="font-inter flex w-3/4 text-[10px] font-bold md:text-[16px]">
		<input type="text" class="h-10 w-full rounded-md px-2 text-[16px]" placeholder="Enter search term" />
	</div>
</div>
<div class="w-full">
	{#each filteredMarkets as market}
		<MarketEntry {market} />
	{/each}
</div>
