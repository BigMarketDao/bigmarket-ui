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
	<title>Z-KYC ME</title>
	<meta name="description" content="Prove who you are without handing over the keys" />
</svelte:head>

<div class="w-full">
	<div class=" flex w-full flex-col">
		<DaoMintingInput />
	</div>
</div>
