<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchUserStake, fullBalanceInSip10Token, ResolutionState, type MarketData, type PredictionMarketCreateEvent, type Sip10Data, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import { getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import PredictUsingTransaction from './PredictUsingTransaction.svelte';
	import InfoOnPollingMessage from './InfoOnPollingMessage.svelte';
	import VotingPowerInput from './VotingPowerInput.svelte';
	import { fmtMicroToStx } from '$lib/utils';
	import { sessionStore } from '$stores/stores';
	import AgentResolveMarket from '../market/resolve/AgentResolveMarket.svelte';
	import { getConfig } from '$stores/store_helpers';
	import { calculatePayoutCategorical, getMarketToken, userStakeSum } from '../predictions';
	import ProjectionsBinary from '../graphs/ProjectionsBinary.svelte';
	import ProjectionsCategorical from '../graphs/ProjectionsCategorical.svelte';

	export let market: PredictionMarketCreateEvent;
	export let marketData: MarketData;
	export let userStake: UserStake;
	export let votingPowerUstx = 0;
	export let onTxChange: any;
	let showVotingInfo = false;
	let voted = false;
	let txVoting = true;
	let totalBalanceUstx = 0;
	let errorMessage: string | undefined;
	let successMessage: string | undefined;
	let resolutionAgent = false;
	let sip10Data: Sip10Data;
	let payouts: Array<string>;

	function handleTxPollVote(data: any) {
		errorMessage = undefined;
		onTxChange(data);
	}

	const handleResolution = async (data: any) => {
		errorMessage = undefined;
		if (data.error) {
			errorMessage = data.message;
		} else {
			successMessage = 'Market resolution begun';
		}
	};

	function handleVotingPowerChange(amount: number) {
		if (amount > totalBalanceUstx) {
			errorMessage = `Maximum voting power is ${fmtMicroToStx(totalBalanceUstx, sip10Data.decimals)} ${sip10Data.symbol}`;
			return;
		}
		votingPowerUstx = amount;
		payouts = calculatePayoutCategorical(amount, sip10Data.decimals, userStake, marketData);
	}

	function closeModal() {
		errorMessage = undefined;
	}

	onMount(async () => {
		sip10Data = getMarketToken(market.token);
		const userStake = await fetchUserStake(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], market.votingContract.split('.')[1], getStxAddress());
		totalBalanceUstx = await fullBalanceInSip10Token(getConfig().VITE_STACKS_API, getStxAddress(), market.token);
		const sum = userStake ? userStakeSum(userStake) : 0;
		if (userStake) totalBalanceUstx = totalBalanceUstx - sum;

		if (isLoggedIn()) resolutionAgent = getStxAddress() === $sessionStore.daoOverview.contractData.resolutionAgent;
	});
</script>

<div class="flex w-full flex-col rounded-lg bg-gray-100 p-6 text-gray-800 shadow-lg">
	<!-- Voting Info Banner -->
	{#if isLoggedIn()}
		{#if voted}
			<div class="mb-4">
				<Banner bannerType={'warning'} message={'You have already voted in this market.'} />
			</div>
		{/if}

		<!-- Voting Form -->
		{#if !market.concluded}
			<div class="w-full space-y-1">
				<!-- Voting Power Input -->
				<div class="flex w-full flex-col gap-x-5 rounded-lg bg-gray-100 md:flex-row">
					<div>
						<VotingPowerInput sip10Data={getMarketToken(market.token)} {totalBalanceUstx} bind:votingPowerUstx {txVoting} onVotingPowerChange={handleVotingPowerChange} />
					</div>
					{#if marketData.categories.length === 2}
						<div><ProjectionsBinary {payouts} token={market.token} categories={marketData.categories} {votingPowerUstx} /></div>
						<!-- <div><WinningProjectionsBinary {market} {marketData} userStake={userStake!} {votingPowerUstx} /></div> -->
					{:else if market.marketType === 1}
						<div><ProjectionsCategorical {payouts} token={market.token} categories={marketData.categories} {votingPowerUstx} /></div>
						<!-- <div><WinningProjectionsCategorical {market} {marketData} userStake={userStake!} {votingPowerUstx} /></div> -->
					{/if}
				</div>

				{#if errorMessage}
					<div class="my-3">
						<Banner bannerType={'danger'} message={errorMessage} />
					</div>
				{/if}

				<!-- Voting Options -->
				<PredictUsingTransaction {market} {marketData} {votingPowerUstx} onTxPollVote={handleTxPollVote} />
			</div>
		{/if}
	{/if}

	<!-- Error Modal -->

	<!-- Voting Info Toggle -->
	<div class="mt-0">
		<div class="flex flex-col items-start space-y-3 text-sm">
			{#if isLoggedIn()}
				<button on:click|preventDefault={() => (showVotingInfo = !showVotingInfo)} class="text-blue-500 underline hover:text-blue-600"> How does voting work? </button>
			{/if}
			{#if showVotingInfo || !isLoggedIn()}
				<InfoOnPollingMessage />
			{/if}
		</div>
	</div>

	{#if resolutionAgent && market.resolutionState === ResolutionState.RESOLUTION_OPEN}
		<div class="my-4">
			<AgentResolveMarket {market} {marketData} onResolved={handleResolution} />
		</div>
	{/if}
</div>
