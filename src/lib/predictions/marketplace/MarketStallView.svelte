<script lang="ts">
	import MarkdownRenderer from '$lib/components/ui/MarkdownRenderer.svelte';
	import { type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	export let market: PredictionMarketCreateEvent;
	export let admin: boolean;
	let inited = false;

	let placeholderImage = 'https://bitcoinfaces.xyz/api/get-image?name=SP1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28GBQA1W0F'; // Path to your standard placeholder image
	let isPlaceholder = false;

	function handleError(event: any) {
		event.target.src = placeholderImage; // Set the fallback image
		event.target.alt = 'Default placeholder image';
		isPlaceholder = true; // Update state
	}

	onMount(async () => {
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
		<img src={market.unhashedData.logo || placeholderImage} alt="Market Logo" on:error={handleError} class="mx-auto h-24 w-24 rounded-full object-cover" />
	</div>

	<!-- Market Details -->
	<div class="mb-5 flex flex-col items-center">
		<h2 class="text-xl font-semibold text-gray-800">
			<a href={`/market/${market.marketId}`} class="hover:underline">{market.unhashedData.name}</a>
		</h2>
	</div>
	<div class="mb-5"><MarkdownRenderer value={market.unhashedData.description} /></div>
	<div class=""><MarkdownRenderer value={market.unhashedData.criteria} /></div>

	<!-- Market Actions -->
	<div class="mt-4 flex items-center justify-between">
		<a href={`/market/${market.marketId}`} class="bg-green-700 hover:bg-green-600 mt-4 w-full rounded px-4 py-2 text-white">
			{#if !market.concluded}Your View?{:else}Poll Closed{/if}
		</a>
		{#if admin}
			<a href="'/sip18/' + market.marketId" class="text-sm text-primary-500 hover:underline"> Manage </a>
		{/if}
	</div>
{/if}
