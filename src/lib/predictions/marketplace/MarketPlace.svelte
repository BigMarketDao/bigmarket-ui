<script lang="ts">
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import MarketStall from './MarketStall.svelte';
	import { onMount } from 'svelte';
	import FeaturedMarketStall from './FeaturedMarketStall.svelte';
	import { fetchMarkets } from '../predictions';
	import CategoryFilter from './CategoryFilter.svelte';

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

	let featuredMarkets: Array<PredictionMarketCreateEvent>;
	let unfeaturedMarkets: Array<PredictionMarketCreateEvent>;
	$: {
		featuredMarkets = filteredMarkets.filter((market) => market.featured);
		unfeaturedMarkets = filteredMarkets.filter((market) => !market.featured);
	}
	onMount(async () => {
		filteredMarkets = markets;
	});
</script>

<div class="flex min-h-screen flex-col items-center p-6 text-gray-800">
	<!-- Featured Markets -->
	<CategoryFilter onSelectCategory={handleSelectCategory} />
	<div class="w-full max-w-6xl space-y-6">
		{#each featuredMarkets as m1}
			<FeaturedMarketStall market={m1} admin={false} />
		{/each}
	</div>

	<!-- Unfeatured Markets Grid -->
	<div class="mt-10 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each unfeaturedMarkets as m2}
			<MarketStall market={m2} admin={false} />
		{/each}
	</div>
</div>
