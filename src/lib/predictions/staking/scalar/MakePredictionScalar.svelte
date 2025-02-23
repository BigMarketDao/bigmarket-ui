<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchUserStake, fullBalanceInSip10Token, ResolutionState, type MarketData, type PredictionMarketCreateEvent, type Sip10Data, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import { getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { fmtMicroToStx } from '$lib/utils';
	import { sessionStore, stakeAmount } from '$stores/stores';
	import { getConfig } from '$stores/store_helpers';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import VotingPowerInput from '../VotingPowerInput.svelte';
	import { getMarketToken, userStakeSum } from '$lib/predictions/predictions';
	import PredictUsingTransaction from '../PredictUsingTransaction.svelte';
	import AgentResolveMarket from '$lib/predictions/market/version2/do-resolve/AgentResolveMarket.svelte';
	import InfoOnPollingMessage from '../InfoOnPollingMessage.svelte';
	import { isCooling, isDisputable, isDisputeRunning, isPostCooling, isStaking } from '$lib/predictions/market-states';

	export let market: PredictionMarketCreateEvent;
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
	$: coolDownEnd = (market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0) + (market.marketData.coolDownPeriod || 0) - $sessionStore.stacksInfo.burn_block_height;
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
	}

	function closeModal() {
		errorMessage = undefined;
	}

	onMount(async () => {
		sip10Data = getMarketToken(market.marketData.token);
		if (isLoggedIn()) {
			const userStake = await fetchUserStake(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], market.votingContract.split('.')[1], getStxAddress());
			totalBalanceUstx = await fullBalanceInSip10Token(getConfig().VITE_STACKS_API, getStxAddress(), market.marketData.token);
			const sum = userStake ? userStakeSum(userStake) : 0;
			if (userStake) totalBalanceUstx = totalBalanceUstx - sum;
			resolutionAgent = getStxAddress() === $sessionStore.daoOverview.contractData.resolutionAgent;
		} else {
			totalBalanceUstx = 0;
		}
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
		{#if isStaking(market)}
			<div class="w-full space-y-1">
				<!-- Voting Power Input -->
				<div class="flex w-full flex-col gap-x-5 rounded-lg bg-gray-100 md:flex-row">
					<div>
						<VotingPowerInput sip10Data={getMarketToken(market.marketData.token)} {totalBalanceUstx} bind:votingPowerUstx {txVoting} onVotingPowerChange={handleVotingPowerChange} />
					</div>
				</div>

				{#if errorMessage}
					<div class="my-3">
						<Banner bannerType={'danger'} message={errorMessage} />
					</div>
				{/if}

				<!-- Voting Options -->
				<PredictUsingTransaction {market} {votingPowerUstx} onTxPollVote={handleTxPollVote} />
			</div>
		{/if}
	{/if}

	<!-- Scalar data -->
	{#if isCooling(market)}
		<div class="mt-0">
			<div class="flex flex-col items-start space-y-3 text-sm">
				<BlockHeightProgressBar
					startBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0)}
					stopBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0) + (market.marketData.coolDownPeriod || 0)}
				/>
			</div>
			<div class="flex flex-col items-start space-y-3 text-sm">
				Cool down period ends in = {coolDownEnd} blocks
			</div>
		</div>
	{/if}
	{#if isStaking(market)}
		<div class="mt-0">
			<div class="flex flex-col items-start space-y-3 text-sm">
				<BlockHeightProgressBar startBurnHeight={market.marketData.marketStart} stopBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0)} />
			</div>
			<div class="flex flex-col items-start space-y-3 text-sm">
				Staking ends in = {(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0) - $sessionStore.stacksInfo.burn_block_height} blocks
			</div>
		</div>
	{/if}
	{#if isDisputable(market, $sessionStore)}
		<div class="mt-0">
			<div class="flex flex-col items-start space-y-3 text-sm">
				<BlockHeightProgressBar startBurnHeight={market.marketData.marketStart} stopBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0)} />
			</div>
			<div class="flex flex-col items-start space-y-3 text-sm">Dispute window open</div>
		</div>
	{/if}
	{#if isDisputeRunning(market)}
		<div class="mt-0">
			<div class="flex flex-col items-start space-y-3 text-sm">
				<BlockHeightProgressBar startBurnHeight={market.marketData.marketStart} stopBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0)} />
			</div>
			<div class="flex flex-col items-start space-y-3 text-sm">Dispute running</div>
		</div>
	{/if}
	{#if isPostCooling(market)}
		<div class="mt-0">
			<div class="flex flex-col items-start space-y-3 text-sm">
				<BlockHeightProgressBar startBurnHeight={market.marketData.marketStart} stopBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0)} />
			</div>
			<div class="flex flex-col items-start space-y-3 text-sm">Post cooling</div>
		</div>
	{/if}
	<div>{market.marketData.resolutionState}</div>

	<!-- Voting Info Toggle -->
	<div class="mt-10">
		<div class="flex flex-col items-start space-y-3 text-sm">
			{#if isLoggedIn()}
				<button on:click|preventDefault={() => (showVotingInfo = !showVotingInfo)} class="text-blue-500 underline hover:text-blue-600"> How does voting work? </button>
			{/if}
			{#if showVotingInfo || !isLoggedIn()}
				<InfoOnPollingMessage />
			{/if}
		</div>
	</div>

	{#if isPostCooling(market) && resolutionAgent && market.marketData.resolutionState === ResolutionState.RESOLUTION_OPEN}
		<div class="my-4">
			<AgentResolveMarket {market} onResolved={handleResolution} />
		</div>
	{/if}
</div>
