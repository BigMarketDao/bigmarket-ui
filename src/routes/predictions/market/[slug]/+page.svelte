<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getPredictionMarket } from '$lib/predictions/predictions';
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers';
	import MarketVolumes from '$lib/predictions/market/MarketVolumes.svelte';
	import MakePrediction from '$lib/predictions/voting/MakePrediction.svelte';

	let market: PredictionMarketCreateEvent;

	onMount(async () => {
		const marketId = Number(page.params.slug);
		if (marketId >= 0) {
			market = await getPredictionMarket(marketId);
			console.log('getPredictionMarket: ', market);
		} else {
			goto('/predictions/market-mgt');
		}
	});
</script>

<svelte:head>
	<title>Market Volumes</title>
	<meta name="description" content="Create an opinion poll" />
</svelte:head>

<div class="mx-auto max-w-4xl md:px-6">
	<div class="flex w-full flex-col">
		{#if market}
			<MarketVolumes {market} />
		{/if}
	</div>
</div>
