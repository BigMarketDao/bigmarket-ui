<script lang="ts">
	import { type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { sessionStore } from '$stores/stores';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import { fmtNumber } from '$lib/utils';
	import MarketVolumeQuickView from './MarketVolumeQuickView.svelte';
	import MakePrediction from '../voting/MakePrediction.svelte';
	import MarketStakeGraphs from './MarketStakeGraphs.svelte';
	import MarketStallView from './MarketStallView.svelte';

	export let market: PredictionMarketCreateEvent;
	export let admin: boolean;
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
		stopBurnHeight = market.unhashedData.endBurnHeight;
		inited = true;
	});
</script>

<!-- {#if showModal}
	<SlotModal onClose={() => closeModal()}>
		<div class="" slot="modalBody"><PollVote {market} onSubmitPollVote={handleSubmitPollVote} /></div>
	</SlotModal>
{/if} -->

{#if inited}
	<div class="flex flex-col rounded-lg bg-white p-6 shadow-lg md:flex-row">
		<!-- Market Logo -->
		<div class="flex w-full flex-col justify-between md:w-1/2">
			<MarketStallView {market} {admin} />
		</div>
		<div class="mt-6 w-full md:ml-6 md:mt-0 md:w-1/2">
			<MarketStakeGraphs {market} />
		</div>

		<!-- Market Timeline -->
		{#if showTimeline}
			<div class="mt-4">
				<BlockHeightProgressBar {currentBurnHeight} {startBurnHeight} {stopBurnHeight} />
				<div class="flex justify-between text-xs text-gray-500">
					<span>Starts: {fmtNumber(startBurnHeight)}</span>
					<span>Ends: {fmtNumber(stopBurnHeight)}</span>
				</div>
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
