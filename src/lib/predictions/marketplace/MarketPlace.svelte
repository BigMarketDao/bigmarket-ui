<script lang="ts">
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import FeaturedMarketStall from './FeaturedMarketStall.svelte';
	import CategoryFilter from './CategoryFilter.svelte';
	import InfoPanelContainer from './info/InfoPanelContainer.svelte';
	import MarketCard from './info/MarketCard.svelte';
	import FilteredMarketView from './FilteredMarketView.svelte';
	import GetStartedPanel from './info/GetStartedPanel.svelte';

	export let markets: Array<PredictionMarketCreateEvent> = [];
	let filteredMarkets: Array<PredictionMarketCreateEvent> = [];
	let category: string;
	let featuredMarket: PredictionMarketCreateEvent;
	let componentKey = 0;

	const setFeaturedMarket = (market: PredictionMarketCreateEvent) => {
		featuredMarket = market;
		componentKey++;
	};
	const handleSelectCategory = (newCategory: string) => {
		category = newCategory;
		if (category && category !== 'all') {
			filteredMarkets = markets.filter((o) => o.unhashedData.category === category);
		} else {
			filteredMarkets = markets;
		}
	};

	const extractSoonest = (markets: Array<PredictionMarketCreateEvent>) => {
		endingSoonMarkets = markets.sort((a, b) => a.unhashedData.createdAt - b.unhashedData.createdAt);
		return markets.length > 3 ? endingSoonMarkets.slice(-3) : endingSoonMarkets;
	};

	let endingSoonMarkets: Array<PredictionMarketCreateEvent> = [];
	let featuredMarkets: Array<PredictionMarketCreateEvent> = [];
	let unfeaturedMarkets: Array<PredictionMarketCreateEvent>;
	$: {
		featuredMarkets = filteredMarkets.filter((market) => market.unhashedData.featured);
		unfeaturedMarkets = markets;
		endingSoonMarkets = extractSoonest(markets);
	}

	onMount(async () => {
		filteredMarkets = markets;
	});
</script>

<div class="max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
	<!-- Featured Markets -->
	{#if featuredMarkets.length > 0}
		<div class="w-full space-y-4">
			{#key componentKey}
				<FeaturedMarketStall market={featuredMarket || featuredMarkets[0]} />
			{/key}
			<div class="flex justify-center gap-2">
				{#each featuredMarkets as market, index}
					<button class="h-2 w-2 rounded-full transition-all {market === featuredMarket ? 'bg-purple-500' : 'bg-gray-600 hover:bg-purple-400'}" on:click={() => setFeaturedMarket(market)} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Info Panels -->
	<div class="mt-2">
		<InfoPanelContainer />
	</div>

	<!-- Ending Soon Section -->
	<section>
		<h2 class="mb-6 text-2xl font-bold text-white">Ending Soon</h2>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each endingSoonMarkets as market}
				<MarketCard {market} />
			{/each}
		</div>
	</section>

	<!-- Market List -->
	<FilteredMarketView {markets} />

	<!-- <GetStartedPanel /> -->
</div>
