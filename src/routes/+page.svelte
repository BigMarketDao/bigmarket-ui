<script lang="ts">
	import MarketPlace from '$lib/predictions/marketplace/MarketPlace.svelte';
	import { fetchMarkets } from '$lib/predictions/predictions';
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	let markets: Array<PredictionMarketCreateEvent>;

	onMount(async () => {
		markets = await fetchMarkets();
	});
</script>

<svelte:head>
	<title>Z-KYC ME</title>
	<meta name="description" content="Prove who you are without handing over the keys" />
</svelte:head>

<div class="w-full">
	<div class=" flex w-full flex-col">
		{#if markets && markets.length > 0}
			<MarketPlace {markets} />
		{/if}
	</div>
</div>
