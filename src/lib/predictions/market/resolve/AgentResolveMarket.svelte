<script lang="ts">
	import { onMount } from 'svelte';
	import { boolCV, Pc, PostConditionMode, uintCV } from '@stacks/transactions';
	import { showContractCall } from '@stacks/connect';
	import { sessionStore } from '$stores/stores';
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { getStacksNetwork, getTransaction } from '@mijoco/stx_helpers/dist/stacks-node';
	import { getConfig } from '$stores/store_helpers';
	import { explorerTxUrl, isLoggedIn } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';

	export let market: PredictionMarketCreateEvent;
	export let onResolved;

	let errorMessage: string | undefined;
	let txId: string;

	const resolveMarket = async (outcome: boolean) => {
		if (!isLoggedIn()) {
			errorMessage = 'Please connect your wallet to vote';
			return;
		}
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = market.votingContract.split('.')[1];
		let functionName = 'resolve-market';
		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions: [],
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [uintCV(market.marketId), boolCV(outcome)],
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
		if (localStorage.getItem('resolve-market-' + market.marketId)) {
			const txIdObj = localStorage.getItem('resolve-market-' + market.marketId);
			if (txIdObj) {
				const potentialTxId = JSON.parse(txIdObj).txId;
				const tx = await lookupTransaction(potentialTxId);
				if (
					tx &&
					tx.tx_status === 'pending' &&
					tx.sender_address === $sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress
				) {
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
				<Banner
					bannerType={'warning'}
					message={'your request is being processed. See <a href="' +
						explorerTxUrl(txId) +
						'" target="_blank">explorer!</a>'}
				/>
			</div>
		{/if}
		{#if errorMessage}
			<div class="flex w-full justify-start gap-x-4">
				{errorMessage}
			</div>
		{/if}
		<div><p>Connected wallet is resolution agent</p></div>
		<div class="flex w-full justify-start gap-x-4">
			<button
				on:click={() => {
					errorMessage = undefined;
					resolveMarket(true);
				}}
				class="bg-red-600 hover:bg-red-700 mt-4 rounded px-4 py-2 text-white"
			>
				RESOLVE TRUE
			</button>
			<button
				on:click={() => {
					errorMessage = undefined;
					resolveMarket(false);
				}}
				class="bg-red-600 hover:bg-red-700 mt-4 rounded px-4 py-2 text-white"
			>
				RESOLVE FALSE
			</button>
		</div>
	</div>
</div>
