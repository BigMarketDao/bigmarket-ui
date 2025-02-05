<script lang="ts">
	import { onMount } from 'svelte';
	import { ResolutionState, type MarketData, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';

	export let market: PredictionMarketCreateEvent;
	export let marketData: MarketData;

	onMount(async () => {});
</script>

{#if market.resolutionState !== ResolutionState.RESOLUTION_OPEN}
	<div class="">
		<div class={market.outcome ? 'bg-green-100 flex items-start  rounded-md p-4 font-medium' : ' flex items-start rounded-md bg-yellow-200 p-4 font-medium'}>
			<svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M9 12h6m-6 4h6m-4-8h2m4 12H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z"></path>
			</svg>
			<div class="flex flex-col">
				{#if market.resolutionState === ResolutionState.RESOLUTION_RESOLVING}
					<p class="ml-4 text-sm text-yellow-800">Predictions are closed. The market is in the resolution process. Final results will be available soon.</p>
				{:else if market.resolutionState === ResolutionState.RESOLUTION_DISPUTED}
					<p class="ml-4 text-sm text-yellow-800">Market resolution is disputed. The outcome will be determined by a Community Vote.</p>
				{:else if market.resolutionState === ResolutionState.RESOLUTION_RESOLVED}
					<p class="ml-4 text-sm text-yellow-800">
						Market is resolved. The outcome is <span class="font-medium underline">{marketData.categories[market.outcome!]}</span>.
					</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
