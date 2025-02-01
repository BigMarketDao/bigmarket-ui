<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getPredictionMarket } from '$lib/predictions/predictions';
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers';
	import UpdateMarket from '$lib/predictions/market-mgt/UpdateMarket.svelte';

	let market: PredictionMarketCreateEvent;

	onMount(async () => {
		const marketId = Number(page.params.slug);
		if (marketId >= 0) {
			market = await getPredictionMarket(marketId);
		} else {
			goto('/market-mgt');
		}
	});
</script>

<svelte:head>
	<title>New Poll</title>
	<meta name="description" content="Create an opinion poll" />
</svelte:head>

<div class="mx-auto max-w-4xl py-4 md:px-6">
	<div class="my-2 flex w-full flex-col">
		<UpdateMarket {market} />
	</div>
</div>
