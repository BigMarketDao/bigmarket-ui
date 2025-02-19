<script lang="ts">
	import { fetchMarketData, type MarketData, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import YesNoButtons from '../YesNoButtons.svelte';
	import LogoContainer from '../LogoContainer.svelte';
	import { getConfig } from '$stores/store_helpers';

	export let market: PredictionMarketCreateEvent;

	onMount(async () => {
		// marketData = await fetchMarketData(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], market.votingContract.split('.')[1]);
	});
</script>

<div class="h-auto flex-col rounded-lg bg-gray-100 p-4 shadow-lg transition hover:shadow-xl">
	<!-- Market Logo -->
	<div class="flex h-full w-full flex-col justify-between gap-y-2 text-center text-black">
		<div class="flex flex-col">
			<div class="mt-5 w-full text-center"><LogoContainer logo={market.unhashedData.logo} /></div>

			<h2 class="font-inter text-[10px] font-medium md:text-sm">
				<a href={`/market/${market.marketId}/${market.marketType}`} class="hover:underline">{market.unhashedData.category}</a>
			</h2>
		</div>
		<div class="flex flex-col">
			<h2 class="h-[60px] font-inter text-[30px] font-bold md:text-[20px]">
				<a href={`/market/${market.marketId}/${market.marketType}`} class="hover:underline">{market.unhashedData.name}</a>
			</h2>
			{#if market}
				<YesNoButtons {market} />
			{/if}
		</div>
	</div>
</div>
