<script lang="ts">
	import { type MarketData, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import { fmtNumber } from '$lib/utils';
	import MarketStallView from './MarketStallView.svelte';
	import { fetchMarketData } from '../voter';
	import { getConfig } from '$stores/store_helpers';

	export let market: PredictionMarketCreateEvent;
	export let admin: boolean;
	let startBurnHeight = 0;
	let stopBurnHeight = 0;
	let inited = false;
	let errorMessage: string | undefined;
	let successMessage: string | undefined;
	let showTimeline = false;

	let placeholderImage = 'https://bitcoinfaces.xyz/api/get-image?name=SP1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28GBQA1W0F'; // Path to your standard placeholder image
	let isPlaceholder = false;

	onMount(async () => {
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
		<div class="flex h-full flex-col">
			<MarketStallView {market} {admin} />
		</div>

		<!-- Market Timeline -->
		{#if showTimeline}
			<div class="mt-4">
				<BlockHeightProgressBar {startBurnHeight} {stopBurnHeight} />
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
