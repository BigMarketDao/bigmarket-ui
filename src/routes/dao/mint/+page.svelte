<script lang="ts">
	import DaoMintingInput from '$lib/predictions/market/version2/do-vote/DaoMintingInput.svelte';
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
	<title>BigMarket Token Sale</title>
	<meta name="description" content="DAO Governance tokens to participate in BigMarket prediction markets on Bitcoin" />
</svelte:head>

<div class="w-full">
	<div class=" flex w-full flex-col">
		<DaoMintingInput />
	</div>
</div>
