<script lang="ts">
	import MarketPlace from '$lib/predictions/marketplace/MarketPlace.svelte';
	import { fetchMarkets, getLeaderBoard } from '$lib/predictions/predictions';
	import type { LeaderBoard, PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	let markets: Array<PredictionMarketCreateEvent>;
	let leaderBoard: LeaderBoard;

	onMount(async () => {
		markets = await fetchMarkets();
		leaderBoard = await getLeaderBoard();
	});
</script>

<svelte:head>
	<title>Bitcoin Prediction Markets</title>
	<meta name="description" content="BigMarketDAO and AI powered prediction markets built on Bitcoin" />
</svelte:head>

<div class="w-full">
	<div class="flex w-full flex-col">
		{#if markets && markets.length > 0}
			<MarketPlace {markets} {leaderBoard} />
		{/if}
	</div>
</div>
