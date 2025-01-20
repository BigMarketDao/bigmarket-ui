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
	let showVoting = false;
	let errorMessage: string | undefined;
	let successMessage: string | undefined;
	let showTimeline = false;

	let placeholderImage =
		'https://bitcoinfaces.xyz/api/get-image?name=SP1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28GBQA1W0F'; // Path to your standard placeholder image
	let isPlaceholder = false;

	function handleError(event: any) {
		event.target.src = placeholderImage; // Set the fallback image
		event.target.alt = 'Default placeholder image';
		isPlaceholder = true; // Update state
	}

	const openVoting = async () => {
		goto(`/predictions/market/${market.marketId}`);
	};

	const manageVoting = async () => {
		goto('/predictions/sip18/' + market.marketId);
	};

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
	<div class="flex flex-col rounded-lg bg-white p-4 shadow-lg transition hover:shadow-xl">
		<!-- Market Logo -->
		<div><MarketStallView {market} {admin} /></div>
		<!-- <div class="my-6 flex w-full rounded-lg bg-gray-100 p-6 shadow-lg">
			<MarketStakeGraphs {market} />
		</div> -->

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
