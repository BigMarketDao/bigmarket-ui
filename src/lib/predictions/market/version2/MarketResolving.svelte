<script lang="ts">
	import { type PredictionMarketCreateEvent, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import DisputeResolution from './do-resolve/DisputeResolution.svelte';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import { blocksLeftForDispute, getOutcomeMessage, hasUserStaked, isDisputable, isFinalisable, startBlockForDispute, stopBlockForDispute } from '$lib/predictions/market-states';
	import { isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import { estimateBitcoinBlockTime, mapToMinMaxStrings, mapToMinMaxStringsFormatted } from '$lib/utils';
	import ResolvedInRange from './do-resolve/ResolvedInRange.svelte';
	import FinaliseMarket from './do-resolve/FinaliseMarket.svelte';

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
			<!-- <p>
				Resolution is in progress. Preliminary outcome is the {(market.marketData.outcome || 0) + 1} outcome <span class="font-medium text-primary">{mapToMinMaxStringsFormatted(market.marketData.categories)[market.marketData.outcome!]}</span>.
			</p> -->
			<ResolvedInRange winningIndex={market.marketData.outcome} categories={market.marketData.categories as Array<{ min: number; max: number }>} />
			<p class="mb-5">
				<br />The dispute window closes around <span class="font-bold">{estimateBitcoinBlockTime(blocksLeftForDispute(market), $sessionStore.stacksInfo.burn_block_height)}</span>. If no challenge is made, the market will lock, and claims will be
				available.
				<br /><br />
				If someone challenges the outcome, the market will move into community voting. The final decision will be made by DAO members. Want to take part?
				<br />👉 [<a href="/dao/token-sale" class="font-medium text-primary">Get voting tokens</a>] and have your say.
				<br />👉 [<a href="/docs" class="font-medium text-primary">Read the docs</a>] for full details.
			</p>
			{#if hasUserStaked(userStake)}
				<DisputeResolution {market} onDispute={handleDispute} />
			{/if}
			<div class="mt-4">
				<BlockHeightProgressBar startBurnHeight={startBlockForDispute(market)} stopBurnHeight={stopBlockForDispute(market)} />
			</div>
		{:else if isFinalisable(market)}
			<FinaliseMarket {market} />
		{:else}
			<p>
				{@html getOutcomeMessage(market)}. Market can now be concluded to start claims
			</p>
			{#if isLoggedIn()}
				<FinaliseMarket {market} />
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
