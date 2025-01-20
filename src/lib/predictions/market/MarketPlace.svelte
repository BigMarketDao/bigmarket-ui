<script lang="ts">
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import MarketStall from './MarketStall.svelte';
	import { onMount } from 'svelte';
	import FeaturedMarketStall from './FeaturedMarketStall.svelte';

	export let markets: Array<PredictionMarketCreateEvent> = [];

	let featuredMarkets: Array<PredictionMarketCreateEvent> = [];
	let unfeaturedMarkets: Array<PredictionMarketCreateEvent> = [];
	onMount(async () => {
		if (markets && markets.length > 0) markets[markets.length - 1].featured = true;
		featuredMarkets = markets.filter((market) => market.featured);
		unfeaturedMarkets = markets.filter((market) => !market.featured);
	});
</script>

<div class="flex min-h-screen flex-col items-center p-6 text-gray-800">
	<!-- Featured Markets -->
	<div class="w-full max-w-6xl space-y-6">
		{#each featuredMarkets as market}
			<FeaturedMarketStall {market} admin={false} />
		{/each}
	</div>

	<!-- Unfeatured Markets Grid -->
	<div class="mt-10 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each unfeaturedMarkets as market}
			<MarketStall {market} admin={false} />
		{/each}
	</div>
</div>
