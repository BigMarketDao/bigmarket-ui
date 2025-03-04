<script lang="ts">
	import { onMount } from 'svelte';
	import { PostConditionMode, stringAsciiCV, uintCV } from '@stacks/transactions';
	import { showContractCall } from '@stacks/connect';
	import { sessionStore } from '$stores/stores';
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { getFirstStacksBlock, getStacksNetwork, getTransaction } from '@mijoco/stx_helpers/dist/stacks-node';
	import { getConfig } from '$stores/store_helpers';
	import { explorerTxUrl, isLoggedIn } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { mapToMinMaxStrings } from '$lib/utils';
	import { resolveMarketAI } from '$lib/predictions/predictions';

	export let market: PredictionMarketCreateEvent;
	export let onResolved;

	let errorMessage: string | undefined;
	let txId: string;
	let stacksHeight = 0;
	let resolverAI = false;

	const resolveMarket = async (outcome: string | number) => {
		if (!isLoggedIn()) {
			errorMessage = 'Please connect your wallet';
			return;
		}
		if (resolverAI) {
			const result = await resolveMarketAI(market.marketId, market.marketType);
			console.log('resolveMarket: ', result);
			return;
		}
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = market.votingContract.split('.')[1];
		let functionName = 'resolve-market';
		let functionArgs = [uintCV(market.marketId), stringAsciiCV(outcome as string)];
		if (market.marketType === 2) {
			functionArgs = [uintCV(market.marketId), uintCV(stacksHeight)];
		}

		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions: [],
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs,
			onFinish: (data) => {
				txId = data.txId;
				localStorage.setItem('resolve-market-' + market.marketId, JSON.stringify({ txId }));
				onResolved({ txId, error: false, message: 'vote sent to contract' });
			},
			onCancel: () => {
				console.log('popup closed!');
				onResolved({ error: true, message: 'user cancelled operation' });
			}
		});
	};

	const lookupTransaction = async (txId: string) => {
		return await getTransaction(getConfig().VITE_STACKS_API, txId);
	};

	onMount(async () => {
		if (market.marketType === 2) {
			const burnHeight = (market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0) + (market.marketData.coolDownPeriod || 0);
			const stacksBlock = await getFirstStacksBlock(getConfig().VITE_STACKS_API, burnHeight);
			stacksHeight = stacksBlock?.stacksHeight;
		}

		if (localStorage.getItem('resolve-market-' + market.marketId)) {
			const txIdObj = localStorage.getItem('resolve-market-' + market.marketId);
			if (txIdObj) {
				const potentialTxId = JSON.parse(txIdObj).txId;
				const tx = await lookupTransaction(potentialTxId);
				if (tx && tx.tx_status === 'pending' && tx.sender_address === $sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress) {
					txId = potentialTxId;
				} else {
					if (tx.sender_address === $sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress) {
						localStorage.removeItem('resolve-market-' + market.marketId);
					}
				}
			}
		}
	});
</script>

<div>
	<div class="flex flex-col gap-y-4">
		{#if txId}
			<div class="">
				<Banner bannerType={'warning'} message={'your request is being processed. See <a href="' + explorerTxUrl(txId) + '" target="_blank">explorer!</a>'} />
			</div>
		{/if}
		{#if errorMessage}
			<div class="flex w-full justify-start gap-x-4">
				{errorMessage}
			</div>
		{/if}
		{#if market.marketType === 1}
			<div class="flex w-full gap-x-2">
				{#each mapToMinMaxStrings(market.marketData.categories) as category, index}
					<button
						on:click={() => {
							errorMessage = undefined;
							resolveMarket(category);
						}}
						class="hover:bg-red-500 w-full flex-1 rounded bg-red-700 px-4 py-2 text-white transition-all duration-300 sm:w-auto"
					>
						RESOLVE <span class="uppercase">{category}</span>
					</button>
				{/each}
			</div>
		{:else}
			<button
				on:click={() => {
					errorMessage = undefined;
					resolveMarket(stacksHeight);
				}}
				class="hover:bg-red-500 w-full flex-1 rounded bg-red-700 px-4 py-2 text-white transition-all duration-300 sm:w-auto"
			>
				RESOLVE <span class="uppercase">{stacksHeight}</span>
			</button>
		{/if}
	</div>
</div>
