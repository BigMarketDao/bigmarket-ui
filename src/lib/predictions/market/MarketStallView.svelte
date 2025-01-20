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

	export let market: PredictionMarketCreateEvent;
	export let admin: boolean;
	let currentBurnHeight = 0;
	let startBurnHeight = 0;
	let stopBurnHeight = 0;
	let inited = false;

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

{#if market}
	<!-- Market Logo -->
	<div class="mb-4">
		<img
			src={market.unhashedData.logo || placeholderImage}
			alt="Market Logo"
			on:error={handleError}
			class="mx-auto h-24 w-24 rounded-full object-cover"
		/>
	</div>

	<!-- Market Details -->
	<div class="flex flex-col items-center">
		<h2 class="text-xl font-semibold text-gray-800">
			<a href={`/predictions/market/${market.marketId}`} class="hover:underline"
				>{market.unhashedData.name}</a
			>
		</h2>
		<p class="text-sm text-gray-500">{market.unhashedData.description}</p>
	</div>

	<!-- Market Actions -->
	<div class="mt-4 flex items-center justify-between">
		<button
			on:click|preventDefault={() => openVoting()}
			class="hover:bg-bitcoinorange-dark w-full rounded bg-bitcoinorange px-4 py-2 text-sm font-medium text-black"
		>
			{#if !market.concluded}Your View?{:else}Poll Closed{/if}
		</button>
		{#if admin}
			<a
				href="/"
				on:click|preventDefault={() => manageVoting()}
				class="text-sm text-primary-500 hover:underline"
			>
				Manage
			</a>
		{/if}
	</div>
{/if}
