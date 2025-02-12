<script lang="ts">
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import FeaturedMarketStall from './FeaturedMarketStall.svelte';
	import CategoryFilter from './CategoryFilter.svelte';
	import InfoPanelContainer from './info/InfoPanelContainer.svelte';
	import MarketCard from './info/MarketCard.svelte';
	import FilteredMarketView from './FilteredMarketView.svelte';

	export let markets: Array<PredictionMarketCreateEvent> = [];
	let filteredMarkets: Array<PredictionMarketCreateEvent> = [];
	let category: string;
	let featuredMarket: PredictionMarketCreateEvent;

	const setFeaturedMarket = (market: PredictionMarketCreateEvent) => {
		featuredMarket = market;
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
		unfeaturedMarkets = markets; // filteredMarkets.filter((market) => !market.unhashedData.featured);
		endingSoonMarkets = extractSoonest(markets); // filteredMarkets.filter((market) => !market.unhashedData.featured);
	}
	onMount(async () => {
		filteredMarkets = markets;
	});
</script>

<div class="mb-40 flex min-h-screen flex-col items-center gap-y-20">
	<!-- Featured Markets -->
	{#if featuredMarkets.length > 0}
		<div class="w-full justify-between space-y-10 bg-gray-100">
			<FeaturedMarketStall market={featuredMarket || featuredMarkets[0]} />
			<div class="relative top-[-40px] flex justify-center text-gray-800">
				<div class="flex gap-x-5">
					{#each featuredMarkets as market, index}
						<a class="cursor-pointer" href="/" on:click|preventDefault={() => setFeaturedMarket(market)}>o</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<div class="mx-20 max-h-[250px] w-full overflow-x-clip"><InfoPanelContainer /></div>

	<div class=""><span class="font-inter text-[30px] font-bold leading-tight">ENDING SOON</span></div>

	<!-- Unfeatured Markets Grid -->
	<div class="grid w-full max-w-6xl grid-cols-1 gap-6 px-10 md:grid-cols-2 lg:grid-cols-3">
		{#each endingSoonMarkets as m2}
			<MarketCard market={m2} />
		{/each}
	</div>

	<FilteredMarketView {markets} />
</div>
