<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getPredictionMarket } from '$lib/predictions/predictions';
	import { type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import MarketActions from '$lib/predictions/market/MarketActions.svelte';
	import { page } from '$app/state';

	let market: PredictionMarketCreateEvent;

	onMount(async () => {
		const marketId = Number(page.params.slug);
		if (marketId >= 0) {
			market = await getPredictionMarket(marketId, 1);
			console.log('getPredictionMarket: ', market);
		} else {
			goto('/market-mgt');
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
			<MarketActions {market} />
		{/if}
	</div>
</div>
