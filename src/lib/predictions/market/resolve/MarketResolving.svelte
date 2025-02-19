<script lang="ts">
	import { ResolutionState, type MarketData, type PredictionMarketCreateEvent, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import DisputeResolution from './DisputeResolution.svelte';
	import ResolveMarket from './ResolveMarket.svelte';
	import ClaimWinnings from './ClaimWinnings.svelte';
	import MarketVoting from './market-vote/MarketVoting.svelte';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import TransferLosingAmount from './TransferLosingAmount.svelte';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { blocksLeftForDispute, canUserClaim, getOutcomeMessage, hasUserStaked, isDisputable, startBlockForDispute, stopBlockForDispute } from '$lib/predictions/market-states';

	export let market: PredictionMarketCreateEvent = {} as PredictionMarketCreateEvent;
	export let userStake: UserStake | undefined;

	let successMessage: string | undefined;
	let errorMessage: string | undefined;
	let resolutionState = market.marketData.resolutionState;
	$: disputable = isDisputable(market, $sessionStore);

	// Simulated functions for actions
	const startDispute = () => {
		console.log('Dispute started!');
	};

	const handleDispute = async (data: any) => {
		if (data.error) {
			errorMessage = data.message;
		} else {
			successMessage = 'Market resolution dispute begun';
		}
	};

	const resolveMarketUndisputed = () => {
		console.log('Market resolved as undisputed!');
	};

	const voteOnDao = () => {
		console.log('Voting in the DAO started!');
	};

	onMount(() => {});
</script>

<!-- Resolution States -->
{#if resolutionState === ResolutionState.RESOLUTION_RESOLVING}
	<div class="mb-4 rounded bg-yellow-100 p-4 text-yellow-800">
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
{:else if resolutionState === ResolutionState.RESOLUTION_DISPUTED}
	<div class="mb-4 rounded bg-blue-100 p-4 text-black">
		<MarketVoting {market} />
	</div>
{:else if resolutionState === ResolutionState.RESOLUTION_RESOLVED}
	<div class="mb-4 rounded bg-gray-200 p-4 text-gray-800">
		<Banner bannerType={'info'} message={getOutcomeMessage(market)} />
		{#if userStake && canUserClaim(market, userStake)}
			<ClaimWinnings {market} {userStake} />
		{/if}
		{#if market.marketData.stakes[market.marketData.outcome!] === 0 && !market.transferLosingStakes}
			<TransferLosingAmount {market} />
		{/if}
	</div>
{/if}
