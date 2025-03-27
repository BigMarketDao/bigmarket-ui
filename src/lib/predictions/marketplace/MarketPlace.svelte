<script lang="ts">
	import { ResolutionState, type LeaderBoard, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import FeaturedMarketStall from './FeaturedMarketStall.svelte';
	import InfoPanelContainer from './info/InfoPanelContainer.svelte';
	import MarketCard from './info/MarketCard.svelte';
	import FilteredMarketView from './FilteredMarketView.svelte';
	import LeaderBoardDisplay from '../leader-board/LeaderBoardDisplay.svelte';
	import { fmtAmount, shuffleArray } from '$lib/utils';

	export let markets: Array<PredictionMarketCreateEvent> = [];
	export let leaderBoard: LeaderBoard;
	let filteredMarkets: Array<PredictionMarketCreateEvent> = [];
	let featuredMarket: PredictionMarketCreateEvent;
	let componentKey = 0;

	const setFeaturedMarket = (market: PredictionMarketCreateEvent) => {
		featuredMarket = market;
		componentKey++;
	};

	const extractSoonest = (markets: Array<PredictionMarketCreateEvent>) => {
		endingSoonMarkets = markets.sort((a, b) => a.unhashedData.createdAt - b.unhashedData.createdAt);
		return markets.length > 3 ? endingSoonMarkets.slice(-3) : endingSoonMarkets;
	};

	let endingSoonMarkets: Array<PredictionMarketCreateEvent> = [];
	let featuredMarkets: Array<PredictionMarketCreateEvent> = [];
	let unfeaturedMarkets: Array<PredictionMarketCreateEvent>;
	$: {
		//featuredMarkets = filteredMarkets.filter((market) => market.unhashedData.featured);
		featuredMarkets = filteredMarkets.filter((market) => market.marketData.resolutionState === ResolutionState.RESOLUTION_OPEN);
		featuredMarkets = shuffleArray(featuredMarkets);

		unfeaturedMarkets = markets;
		endingSoonMarkets = extractSoonest(markets);
	}

	onMount(async () => {
		filteredMarkets = markets;
		fmtAmount(0);
	});
</script>

<div class="max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
	<!-- Featured Markets -->
	{#if featuredMarkets.length > 0}
		<div class="w-full space-y-4">
			{#key componentKey}
				<FeaturedMarketStall market={featuredMarket || featuredMarkets[0]} />
			{/key}
			<div class="mt-4 flex justify-center gap-3">
				{#each featuredMarkets as market, index}
					<button class="h-3 w-3 rounded-full transition-all duration-300 {market === featuredMarket ? 'scale-110 bg-purple-500' : 'bg-gray-600 hover:bg-purple-400'}" on:click={() => setFeaturedMarket(market)} aria-label={`View market ${index + 1}`}
					></button>
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
		<div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
			{#each endingSoonMarkets as market}
				<MarketCard {market} />
			{/each}
		</div>
	</section>

	<!-- Market List -->
	<FilteredMarketView {markets} />

	<div class="mt-2">
		<LeaderBoardDisplay {leaderBoard} {markets} />
	</div>
</div>
