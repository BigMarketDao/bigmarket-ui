<script lang="ts">
	import { type PredictionMarketCreateEvent, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import DisputeResolution from './do-resolve/DisputeResolution.svelte';
	import ResolveMarket from './do-resolve/ResolveMarket.svelte';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import { blocksLeftForDispute, getOutcomeMessage, hasUserStaked, isDisputable, startBlockForDispute, stopBlockForDispute } from '$lib/predictions/market-states';
	import { isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import { mapToMinMaxStrings } from '$lib/utils';

	export let market: PredictionMarketCreateEvent = {} as PredictionMarketCreateEvent;
	export let userStake: UserStake | undefined;

	let successMessage: string | undefined;
	let errorMessage: string | undefined;
	$: disputable = isDisputable(market);

	const login = async () => {
		loginStacksFromHeader(document);
	};

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
				Resolution is in progress. Preliminary outcome is <span class="font-medium text-red-600">{mapToMinMaxStrings(market.marketData.categories)[market.marketData.outcome!]}</span>.
			</p>
			<p>
				Dispute window closes in <span class="font-bold">{blocksLeftForDispute(market)}</span> blocks. If no challenge is made the market will be resolvable and claims can then be made.
			</p>
			<p>
				In the event of a challenge the market will enter a DAO voting phase. The outcome will then be determined by community voting. See <a href="/docs" class="font-medium text-red-600">the docs</a> for more information or
				<a href="/dao/token-sale" class="font-medium text-red-600">purchase voting tokens</a> to take part in voting.
			</p>
			{#if hasUserStaked(userStake)}
				<DisputeResolution {market} onDispute={handleDispute} />
			{/if}
			<div class="mt-4">
				<BlockHeightProgressBar startBurnHeight={startBlockForDispute(market)} stopBurnHeight={stopBlockForDispute(market)} />
			</div>
		{:else}
			<p>
				{@html getOutcomeMessage(market)}. Market can now be concluded to start claims
			</p>
			{#if isLoggedIn()}
				<ResolveMarket {market} onDispute={handleDispute} />
			{:else}
				<button
					class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-600"
					on:click={() => {
						errorMessage = '';
						login();
					}}
				>
					Connect Wallet
				</button>
			{/if}
		{/if}
	</div>
</div>
