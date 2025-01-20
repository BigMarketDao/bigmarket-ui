<script lang="ts">
	import {
		getStacksNetwork,
		type PredictionMarketCreateEvent
	} from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import {
		canResolveMarket,
		fetchMarketData,
		fetchUserStake,
		myMarket,
		type MarketData,
		type UserStake
	} from '../predictions';
	import { explorerTxUrl, getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import { fmtMicroToStx, fmtMicroToStxFormatted } from '$lib/utils';
	import { boolCV, falseCV, Pc, PostConditionMode, trueCV, uintCV } from '@stacks/transactions';
	import { showContractCall } from '@stacks/connect';
	import { getConfig } from '$stores/store_helpers';

	export let market: PredictionMarketCreateEvent;
	let marketData: MarketData | undefined;
	let userStake: UserStake | undefined;
	let currentBurnHeight: number;
	let inited = false;
	let errorMessage: string | undefined;
	let txId: string;
	let claimAmount = 0;

	const makeClaim = async (amount: number) => {
		if (amount === 0) return;
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = market.votingContract.split('.')[1];
		let functionName = 'claim-winnings';
		const address = getStxAddress();
		const postCondition = Pc.principal(address).willSendLte(100000000).ustx();
		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions: [postCondition],
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [uintCV(market.marketId)],
			onFinish: (data) => {
				txId = data.txId;
				claimAmount = amount;
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	const resolve = async (vfor: boolean) => {
		if (!canResolveMarket()) {
			errorMessage = 'Please connect your wallet to vote';
			return;
		}
		let forCV = trueCV();
		if (!vfor) {
			forCV = falseCV();
		}
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = market.votingContract.split('.')[1];
		let functionName = 'resolve-market';
		const address = getStxAddress();
		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions: [],
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [uintCV(market.marketId), boolCV(vfor)],
			onFinish: (data) => {
				txId = data.txId;
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	onMount(async () => {
		currentBurnHeight = $sessionStore.stacksInfo.burn_block_height;
		marketData = await fetchMarketData(market);
		if (isLoggedIn()) {
			userStake = await fetchUserStake(market, getStxAddress());
		}
		inited = true;
	});
</script>

<!-- {#if showModal}
	<SlotModal onClose={() => closeModal()}>
		<div class="" slot="modalBody"><PollVote {market} onSubmitPollVote={handleSubmitPollVote} /></div>
	</SlotModal>
{/if} -->

{#if inited}
	<div class="bg-gray-50 rounded-lg p-4 shadow-sm">
		{#if marketData}
			<div class="mb-2 text-center">
				<p class="text-lg font-medium text-gray-800">
					Status: {marketData.concluded ? 'Concluded' : 'Live'}
				</p>
				{#if marketData.concluded && claimAmount > 0 && txId}
					<a href={explorerTxUrl(txId)} target="_blank" class="text-sm text-primary-500 underline">
						Claim in progress
					</a>
				{/if}
			</div>

			<div class="flex justify-between text-sm">
				<span class="text-green-600">For: {fmtMicroToStx(marketData.yesPool)}</span>
				<span class="text-red-600">Against: {fmtMicroToStx(marketData.noPool)}</span>
			</div>

			{#if userStake && (userStake.yesAmount > 0 || userStake.noAmount > 0)}
				<div class="mt-4">
					<p class="text-sm">
						You staked:
						{#if userStake.yesAmount > 0}
							{fmtMicroToStx(userStake.yesAmount)} for
							{#if market.concluded}
								<a
									href="/"
									on:click|preventDefault={() => makeClaim(userStake!.yesAmount)}
									class="text-blue-500 underline"
								>
									Claim
								</a>
							{/if}
						{/if}
						{#if userStake.noAmount > 0}
							{fmtMicroToStx(userStake.noAmount)} against
							{#if market.concluded}
								<a
									href="/"
									on:click|preventDefault={() => makeClaim(userStake!.noAmount)}
									class="text-blue-500 underline"
								>
									Claim
								</a>
							{/if}
						{/if}
					</p>
				</div>
			{:else}
				<p class="mt-4 text-sm text-gray-500">
					{isLoggedIn() ? 'You have nothing staked' : 'Connect your wallet'}
				</p>
			{/if}
		{:else}
			<p class="text-sm text-gray-500">No market data available</p>
		{/if}
	</div>
{/if}
