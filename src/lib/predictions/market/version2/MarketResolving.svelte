<script lang="ts">
	import { type PredictionMarketCreateEvent, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import DisputeResolution from './do-resolve/DisputeResolution.svelte';
	import ResolveMarket from './do-resolve/ResolveMarket.svelte';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import { blocksLeftForDispute, getOutcomeMessage, hasUserStaked, isDisputable, startBlockForDispute, stopBlockForDispute } from '$lib/predictions/market-states';

	export let market: PredictionMarketCreateEvent = {} as PredictionMarketCreateEvent;
	export let userStake: UserStake | undefined;

	let successMessage: string | undefined;
	let errorMessage: string | undefined;
	$: disputable = isDisputable(market, $sessionStore);

	const handleDispute = async (data: any) => {
		if (data.error) {
			errorMessage = data.message;
		} else {
			successMessage = 'Market resolution dispute begun';
		}
	};

	onMount(() => {});
</script>

<!-- Resolution States -->
<div class="card bg-neutral shadow-xl">
	<div class="card-body">
		{#if disputable}
			<p>
				Resolution is in progress. Preliminary outcome is <span class="font-medium text-red-600">{market.marketData.categories[market.marketData.outcome!]}</span>.
			</p>
			<p>
				Dispute window closes in <span class="font-bold">{blocksLeftForDispute(market, $sessionStore)}</span> blocks.
			</p>
			{#if hasUserStaked(userStake)}
				<DisputeResolution {market} onDispute={handleDispute} />
			{/if}
			<div class="mt-4">
				<BlockHeightProgressBar startBurnHeight={startBlockForDispute(market, $sessionStore)} stopBurnHeight={stopBlockForDispute(market, $sessionStore)} />
			</div>
		{:else}
			<p>
				{@html getOutcomeMessage(market)}. Market can now be concluded to start claims
			</p>
			<ResolveMarket {market} onDispute={handleDispute} />
		{/if}
	</div>
</div>
