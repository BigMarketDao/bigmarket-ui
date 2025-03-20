<script lang="ts">
	import { onMount } from 'svelte';
	import { Cl, Pc, PostConditionMode, uintCV } from '@stacks/transactions';
	import { showContractCall } from '@stacks/connect';
	import { sessionStore } from '$stores/stores';
	import type { MarketData, PredictionMarketCreateEvent, Sip10Data, UserStake } from '@mijoco/stx_helpers/dist/index';
	import { getStacksNetwork, getTransaction } from '@mijoco/stx_helpers/dist/stacks-node';
	import { getConfig } from '$stores/store_helpers';
	import { explorerTxUrl, getStxAddress } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { fmtMicroToStx } from '$lib/utils';
	import { getMarketToken, isSTX, totalPoolSum, userStakeSum } from '$lib/predictions/predictions';
	import { canUserClaim, getOutcomeMessage } from '$lib/predictions/market-states';
	import ClaimWinnings from './do-claim/ClaimWinnings.svelte';
	import TransferLosingAmount from './do-claim/TransferLosingAmount.svelte';

	export let market: PredictionMarketCreateEvent;
	export let userStake: UserStake;
	let sip10Data: Sip10Data;

	let errorMessage: string | undefined;
	let txId: string;
	let staked: number;
	let userShareNet: number;
	let daoFee: number;
	let devFee: number;
	let totalPool: number;
	let winningPool: number;

	const claimWinnings = async () => {
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = market.votingContract.split('.')[1];
		let functionName = 'claim-winnings';
		const postConditions = [];
		let postConditionMode = PostConditionMode.Deny;
		const address = getStxAddress();
		const amount = daoFee + userShareNet || 0;
		if (!daoFee || !userShareNet) {
			postConditionMode = PostConditionMode.Allow;
		} else {
			if (!isSTX(market.marketData.token)) {
				const formattedToken = (market.marketData.token.split('.')[0] + '.' + market.marketData.token.split('.')[1]) as `${string}.${string}`;
				const postConditionFt = Pc.principal(`${contractAddress}.${contractName}`).willSendLte(amount).ft(formattedToken, sip10Data.symbol);
				postConditions.push(postConditionFt);
			} else {
				postConditions.push(Pc.principal(`${contractAddress}.${contractName}`).willSendLte(amount).ustx());
			}
		}
		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions,
			postConditionMode,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [uintCV(market.marketId), Cl.principal(market.marketData.token)],
			onFinish: (data) => {
				txId = data.txId;
				localStorage.setItem('resolve-market-' + market.marketId, JSON.stringify({ txId }));
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	const lookupTransaction = async (txId: string) => {
		return await getTransaction(getConfig().VITE_STACKS_API, txId);
	};

	onMount(async () => {
		sip10Data = getMarketToken(market.marketData.token);
		console.log('CW: marketData.outcome: ' + market.marketData.outcome);
		console.log('CW: marketData: ', market.marketData);
		staked = userStake?.stakes[market.marketData.outcome!] || 0;
		const princ = Math.floor((10000 * staked) / 9800);
		devFee = princ - staked;
		totalPool = totalPoolSum(market.marketData.stakes);
		winningPool = market.marketData.stakes[market.marketData.outcome!];
		const userShare = Math.floor((staked * totalPool) / winningPool);
		daoFee = Math.floor((userShare * 200) / 10000);
		userShareNet = userShare - daoFee;

		if (localStorage.getItem('claim-winnings-' + market.marketId)) {
			const txIdObj = localStorage.getItem('claim-winnings-' + market.marketId);
			if (txIdObj) {
				const potentialTxId = JSON.parse(txIdObj).txId;
				const tx = await lookupTransaction(potentialTxId);
				if (tx && tx.tx_status === 'pending' && tx.sender_address === $sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress) {
					txId = potentialTxId;
				} else {
					if (tx.sender_address === $sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress) {
						localStorage.removeItem('claim-winnings-' + market.marketId);
					}
				}
			}
		}
	});
</script>

<div class="card bg-neutral shadow-xl">
	<div class="card-body">
		{#if userStake && canUserClaim(market, userStake)}
			<ClaimWinnings {market} {userStake} />
		{/if}
		{#if market.marketData.stakes[market.marketData.outcome!] === 0 && !market.transferLosingStakes}
			<TransferLosingAmount {market} />
		{/if}
	</div>
</div>
