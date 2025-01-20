<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Pc,
		PostConditionMode,
		boolCV,
		bufferCV,
		falseCV,
		listCV,
		noneCV,
		trueCV,
		uintCV
	} from '@stacks/transactions';
	import { showContractCall } from '@stacks/connect';
	import { sessionStore } from '$stores/stores';
	import type {
		PollCreateEvent,
		PredictionMarketCreateEvent
	} from '@mijoco/stx_helpers/dist/index';
	import { getStacksNetwork, getTransaction } from '@mijoco/stx_helpers/dist/stacks-node';
	import { getConfig } from '$stores/store_helpers';
	import {
		explorerTxUrl,
		getAddressId,
		getStxAddress,
		isLoggedIn
	} from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { hexToBytes } from '@stacks/common';

	export let market: PredictionMarketCreateEvent;
	export let votingPowerUstx: number;
	export let onTxPollVote;

	let errorMessage: string | undefined;
	let txId: string;
	let canVote = true;
	$: explorerUrl = explorerTxUrl(txId);

	const castVote = async (vfor: boolean) => {
		if (!isLoggedIn()) {
			errorMessage = 'Please connect your wallet to vote';
			return;
		}
		const microStxAmount = Math.round(parseFloat(String(votingPowerUstx)) * 1_000_000);
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = market.votingContract.split('.')[1];
		let functionName = 'predict-yes-stake';
		if (!vfor) functionName = 'predict-no-stake';
		const address = getStxAddress();
		const postCondition = Pc.principal(address).willSendLte(microStxAmount).ustx();

		// const postConditionAddress = 'SP2ZD731ANQZT6J4K3F5N8A40ZXWXC1XFXHVVQFKE';
		// const postConditionCode = FungibleConditionCode.GreaterEqual;
		// const postConditionAmount = 12345n;

		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions: [postCondition],
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [uintCV(market.marketId), uintCV(microStxAmount)],
			onFinish: (data) => {
				txId = data.txId;
				localStorage.setItem('VOTED_FLAG' + getAddressId(), JSON.stringify(market.votingContract));
				localStorage.setItem('VOTED_TXID_3' + getAddressId(), JSON.stringify({ txId }));
				onTxPollVote({ txId, error: false, message: 'vote sent to contract' });
			},
			onCancel: () => {
				console.log('popup closed!');
				onTxPollVote({ error: true, message: 'user cancelled operation' });
			}
		});
	};

	const lookupTransaction = async (txId: string) => {
		return await getTransaction(getConfig().VITE_STACKS_API, txId);
	};

	onMount(async () => {
		if (localStorage.getItem('VOTED_TXID_3' + getAddressId())) {
			const txIdObj = localStorage.getItem('VOTED_TXID_3' + getAddressId());
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
						localStorage.removeItem('VOTED_TXID_3' + getAddressId());
					}
				}
			}
		}
	});
</script>

<div>
	<div class="flex flex-col gap-y-4">
		{#if txId}
			<div class="mb-3 max-w-xl">
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
		<div class="flex w-full justify-start gap-x-4">
			<button
				on:click={() => {
					errorMessage = undefined;
					castVote(true);
				}}
				class="w-[150px] items-center justify-center gap-x-1.5 rounded-xl border border-bitcoinorange bg-black px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50 md:inline-flex"
			>
				I AGREE
			</button>
			<button
				on:click={() => {
					errorMessage = undefined;
					castVote(false);
				}}
				class="w-[150px] items-center justify-center gap-x-1.5 rounded-xl border border-bitcoinorange bg-black px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50 md:inline-flex"
			>
				I DISAGREE
			</button>
		</div>
	</div>
</div>
