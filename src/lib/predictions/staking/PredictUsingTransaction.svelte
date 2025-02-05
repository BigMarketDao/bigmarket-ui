<script lang="ts">
	import { onMount } from 'svelte';
	import { Cl, Pc, PostConditionMode, boolCV, bufferCV, falseCV, listCV, noneCV, stringAsciiCV, trueCV, uintCV, type FungiblePostCondition, type PostCondition } from '@stacks/transactions';
	import { isStacksWalletInstalled, showContractCall } from '@stacks/connect';
	import { sessionStore } from '$stores/stores';
	import type { MarketData, PollCreateEvent, PredictionMarketCreateEvent, Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { getStacksNetwork, getTransaction } from '@mijoco/stx_helpers/dist/stacks-node';
	import { getConfig } from '$stores/store_helpers';
	import { explorerTxUrl, getAddressId, getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { hexToBytes } from '@stacks/common';
	import { getMarketToken, isSTX } from '../predictions';
	import StakingBinary from './StakingBinary.svelte';
	import StakingCategorical from './StakingCategorical.svelte';

	export let market: PredictionMarketCreateEvent;
	export let marketData: MarketData;
	export let votingPowerUstx: number;
	export let onTxPollVote;

	let errorMessage: string | undefined;
	let txId: string;
	let sip10Data: Sip10Data;

	const castVote = async (index: number) => {
		errorMessage = undefined;
		if (!isLoggedIn()) {
			errorMessage = 'Please connect your wallet to vote';
			return;
		}
		console.log(votingPowerUstx);
		if (votingPowerUstx <= 0.0005) {
			errorMessage = `Amount must be greater than 0.0005 ${sip10Data.symbol}`;
			return;
		}
		const mult = isSTX(market.token) ? 1_000_000 : Number(`1e${sip10Data.decimals}`);
		const microStxAmount = Math.round(parseFloat(String(votingPowerUstx)) * mult);
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = market.votingContract.split('.')[1];
		let functionName = 'predict-category';
		const categorical = marketData.categories[index];
		const address = getStxAddress();
		const postConditions = [];
		if (!isSTX(market.token)) {
			const formattedToken = (market.token.split('.')[0] + '.' + market.token.split('.')[1]) as `${string}.${string}`;
			const postConditionFt = Pc.principal(address).willSendEq(microStxAmount).ft(formattedToken, sip10Data.symbol);
			postConditions.push(postConditionFt);
		} else {
			postConditions.push(Pc.principal(address).willSendEq(microStxAmount).ustx());
		}

		// const postConditionAddress = 'SP2ZD731ANQZT6J4K3F5N8A40ZXWXC1XFXHVVQFKE';
		// const postConditionCode = FungibleConditionCode.GreaterEqual;
		// const postConditionAmount = 12345n;

		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions,
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [uintCV(market.marketId), uintCV(microStxAmount), stringAsciiCV(categorical), Cl.principal(market.token)],
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
		sip10Data = getMarketToken(market.token);
		if (localStorage.getItem('VOTED_TXID_3' + getAddressId())) {
			const txIdObj = localStorage.getItem('VOTED_TXID_3' + getAddressId());
			if (txIdObj) {
				const potentialTxId = JSON.parse(txIdObj).txId;
				const tx = await lookupTransaction(potentialTxId);
				if (tx && tx.tx_status === 'pending' && tx.sender_address === $sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress) {
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
	<div class="flex w-full flex-col gap-y-4">
		{#if marketData.categories.length === 2}
			<StakingBinary {castVote} />
		{:else if market.marketType === 1}
			<StakingCategorical {castVote} categories={marketData.categories} />
		{:else if market.marketType === 2}
			<div class="flex w-full justify-start gap-x-4">Scalar markets not yet supported</div>
		{/if}
		{#if txId}
			<div class="mb-4 flex w-full justify-start gap-x-4">
				<Banner bannerType={'warning'} message={'your request is being processed. See <a href="' + explorerTxUrl(txId) + '" target="_blank">explorer!</a>'} />
			</div>
		{/if}
		{#if errorMessage}
			<div class="mb-4 flex w-full justify-start gap-x-4">
				<Banner bannerType={'warning'} message={errorMessage} />
			</div>
		{/if}
	</div>
</div>
