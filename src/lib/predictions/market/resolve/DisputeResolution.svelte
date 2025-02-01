<script lang="ts">
	import { onMount } from 'svelte';
	import { bufferCV, Cl, noneCV, PostConditionMode, someCV, tupleCV, uintCV } from '@stacks/transactions';
	import { showContractCall } from '@stacks/connect';
	import { sessionStore } from '$stores/stores';
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { getStacksNetwork, getTransaction } from '@mijoco/stx_helpers/dist/stacks-node';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import { explorerTxUrl, isLoggedIn } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { hexToBytes } from '@stacks/common';

	export let market: PredictionMarketCreateEvent;
	export let onDispute;
	let merkelRoot: string | undefined;

	let errorMessage: string | undefined;
	let txId: string;

	const disputeResolution = async (outcome: boolean) => {
		if (!isLoggedIn()) {
			errorMessage = 'Please connect your wallet to vote';
			return;
		}
		// 	(market-data-hash (buff 32))               ;; market metadata hash
		// (data {market-id: uint, start-burn-height: uint, end-burn-height: uint})
		// (merkle-root (optional (buff 32)))      ;; Optional Merkle root for gating
		const metadataHash = bufferCV(hexToBytes(market.metadataHash)); // Assumes the hash is a string of 32 bytes in hex format
		const merkle = merkelRoot ? someCV(bufferCV(hexToBytes(merkelRoot))) : noneCV();
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = getDaoConfig().VITE_DAO_MARKET_VOTING;
		let functionName = 'create-market-vote';
		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions: [],
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [Cl.uint(market.marketId), metadataHash],
			onFinish: (data) => {
				txId = data.txId;
				localStorage.setItem('resolve-market-' + market.marketId, JSON.stringify({ txId }));
				onDispute({ txId, error: false, message: 'vote sent to contract' });
			},
			onCancel: () => {
				console.log('popup closed!');
				onDispute({ error: true, message: 'user cancelled operation' });
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
		<div class="flex w-full justify-start gap-x-4">
			<button
				on:click={() => {
					errorMessage = undefined;
					disputeResolution(true);
				}}
				class="bg-red-600 hover:bg-red-700 mt-4 rounded px-4 py-2 text-white"
			>
				DISPUTE OUTCOME
			</button>
		</div>
	</div>
</div>
