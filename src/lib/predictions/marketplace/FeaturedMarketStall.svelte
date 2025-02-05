<script lang="ts">
	import { type MarketData, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import { fmtNumber } from '$lib/utils';
	import MarketStallView from './MarketStallView.svelte';
	import MarketStakeGraphs from '../graphs/MarketStakeGraphs.svelte';
	import { fetchMarketData } from '../voter';
	import { getConfig } from '$stores/store_helpers';

	export let market: PredictionMarketCreateEvent;
	export let admin: boolean;
	let marketData: MarketData | undefined;
	let currentBurnHeight = 0;
	let startBurnHeight = 0;
	let stopBurnHeight = 0;
	let inited = false;
	let errorMessage: string | undefined;
	let successMessage: string | undefined;
	let showTimeline = false;

	onMount(async () => {
		currentBurnHeight = $sessionStore.stacksInfo.burn_block_height;
		startBurnHeight = market.unhashedData.startBurnHeight;
		marketData = await fetchMarketData(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], market.votingContract.split('.')[1]);
		stopBurnHeight = market.unhashedData.endBurnHeight;
		inited = true;
	});
</script>

<!-- {#if showModal}
	<SlotModal onClose={() => closeModal()}>
		<div class="" slot="modalBody"><PollVote {market} onSubmitPollVote={handleSubmitPollVote} /></div>
	</SlotModal>
{/if} -->

{#if market}
	<div class="flex flex-col rounded-lg border-4 border-primary-500 bg-white p-6 shadow-lg md:flex-row">
		<!-- Market Logo -->
		<div class="flex w-full flex-col justify-between md:w-full">
			<MarketStallView {market} {admin} />
		</div>
		<div class="mt-0 w-full md:ml-6 md:mt-0 md:w-full">
			{#if marketData}
				<div><MarketStakeGraphs {market} {marketData} /></div>
			{/if}
		</div>

		<!-- Market Timeline -->
		{#if showTimeline}
			<div class="mt-4">
				<BlockHeightProgressBar {startBurnHeight} {stopBurnHeight} />
			</div>
		{/if}

		<!-- Messages -->
		<div class="mt-2">
			{#if errorMessage}
				<p class="text-red-600 text-sm">{errorMessage}</p>
			{/if}
			{#if successMessage}
				<p class="text-green-600 text-sm">{successMessage}</p>
			{/if}
		</div>
	</div>
{/if}
