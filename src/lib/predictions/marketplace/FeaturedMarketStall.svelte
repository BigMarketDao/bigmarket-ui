<script lang="ts">
	import { fetchMarketData, type MarketData, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import MarketStallView from './MarketStallView.svelte';
	import { getConfig } from '$stores/store_helpers';
	import MarketStakedBarChart from '../graphs/MarketStakedBarChart.svelte';
	import MarketStakeGraphs from '../graphs/MarketStakeGraphs.svelte';
	import StakeChart from '../market/version2/do-charts/StakeChart.svelte';

	export let market: PredictionMarketCreateEvent;
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
		console.log('FeaturedMarketStall: ', market);
		// marketData = await fetchMarketData(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], market.votingContract.split('.')[1]);
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
	<div class="flex w-full flex-col items-start gap-x-10 px-10 pt-10 md:flex-row md:px-32">
		<!-- Left Panel -->
		<div class="flex min-h-[300px] w-full flex-1 flex-col items-start justify-center md:w-1/2">
			<div class="">
				<MarketStallView {market} />
			</div>
			<div class="mt-2">
				{#if errorMessage}
					<p class="text-sm text-red-600">{errorMessage}</p>
				{/if}
				{#if successMessage}
					<p class="text-sm text-green-600">{successMessage}</p>
				{/if}
			</div>
			{#if showTimeline}
				<div class="mt-4">
					<BlockHeightProgressBar {startBurnHeight} {stopBurnHeight} />
				</div>
			{/if}
		</div>

		<!-- Right Panel -->
		<div class="w-full md:w-1/2">
			<div class="min-h-[300px h-auto text-black">
				<StakeChart {market} title={'Stake History'} />
			</div>
		</div>

		<!-- <div class="flex min-h-[300px] w-full flex-col items-start md:w-1/2">
			<div class="w-full"><MarketStakeGraphs {market} /></div>
		</div> -->
	</div>
{/if}
