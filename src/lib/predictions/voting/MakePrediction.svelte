<script lang="ts">
	import { onMount } from 'svelte';
	import { type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import PredictUsingTransaction from './PredictUsingTransaction.svelte';
	import InfoOnPollingMessage from './InfoOnPollingMessage.svelte';
	import VotingPowerInput from './VotingPowerInput.svelte';
	import { fmtMicroToStx, fullBalance } from '$lib/utils';
	import SlotModal from '$lib/components/common/SlotModal.svelte';
	import { fetchUserStake } from '$lib/predictions/predictions';

	export let market: PredictionMarketCreateEvent;
	export let onSubmitPollVote: any;
	let showVotingInfo = false;
	let voted = false;
	let txVoting = true;
	let totalBalanceUstx = 0;
	let votingPowerUstx = 0;
	let errorMessage: string | undefined;

	function handleTxPollVote(data: any) {
		onSubmitPollVote(data);
	}

	function handleSip18PollVote(data: any) {
		onSubmitPollVote(data);
	}

	function handleVotingPowerChange(amount: number) {
		if (amount > totalBalanceUstx) {
			errorMessage =
				'Maximum voting power is ' +
				fmtMicroToStx(totalBalanceUstx) +
				' STX (your balance when voting opened)';
			return;
		}
		votingPowerUstx = amount;
	}

	function closeModal() {
		errorMessage = undefined;
	}

	onMount(async () => {
		const userStake = await fetchUserStake(market, getStxAddress());
		totalBalanceUstx = await fullBalance();
		if (userStake) totalBalanceUstx = totalBalanceUstx - userStake.yesAmount - userStake.noAmount;
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
			<div class="space-y-6">
				<!-- Voting Power Input -->
				<VotingPowerInput
					{totalBalanceUstx}
					{votingPowerUstx}
					{txVoting}
					onVotingPowerChange={handleVotingPowerChange}
				/>

				{#if errorMessage}
					<div class="my-5">
						<Banner bannerType={'danger'} message={errorMessage} />
					</div>
				{/if}
				<!-- Voting Options -->
				<PredictUsingTransaction {market} {votingPowerUstx} onTxPollVote={handleTxPollVote} />
			</div>
		{/if}
	{/if}

	<!-- Error Modal -->

	<!-- Voting Info Toggle -->
	<div class="mt-6">
		<div class="flex flex-col items-start space-y-3 text-sm">
			{#if isLoggedIn()}
				<button
					on:click|preventDefault={() => (showVotingInfo = !showVotingInfo)}
					class="text-blue-500 underline hover:text-blue-600"
				>
					How does voting work?
				</button>
			{/if}
			{#if showVotingInfo || !isLoggedIn()}
				<InfoOnPollingMessage />
			{/if}
		</div>
	</div>
</div>
