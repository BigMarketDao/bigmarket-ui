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
	import { getMarketToken, isSTX } from '$lib/predictions/predictions';

	export let market: PredictionMarketCreateEvent;
	export let userStake: UserStake;
	export let marketData: MarketData;
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
		const address = getStxAddress();
		const amount = daoFee + userShareNet;
		if (!isSTX(market.token)) {
			const formattedToken = (market.token.split('.')[0] + '.' + market.token.split('.')[1]) as `${string}.${string}`;
			const postConditionFt = Pc.principal(`${contractAddress}.${contractName}`).willSendLte(amount).ft(formattedToken, sip10Data.symbol);
			postConditions.push(postConditionFt);
		} else {
			postConditions.push(Pc.principal(`${contractAddress}.${contractName}`).willSendLte(amount).ustx());
		}
		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions,
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [uintCV(market.marketId), Cl.principal(market.token)],
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
		sip10Data = getMarketToken(market.token);
		staked = market.outcome ? userStake?.yesAmount : userStake?.noAmount;
		const princ = Math.floor((10000 * staked) / 9800);
		devFee = princ - staked;
		totalPool = marketData.yesPool + marketData.noPool;
		winningPool = market.outcome ? marketData.yesPool : marketData.noPool;
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

<div>
	<div class="flex flex-col gap-y-4">
		{#if txId}
			<div class="mt-5">
				<Banner bannerType={'warning'} message={'your request is being processed. See <a href="' + explorerTxUrl(txId) + '" target="_blank">explorer!</a>'} />
			</div>
		{/if}
		{#if errorMessage}
			<div class="my-4">
				{errorMessage}
			</div>
		{/if}

		<div class="">
			<h2 class="mb-4 text-lg font-semibold text-gray-800">Claim Winnings</h2>
			{#if sip10Data}
				<table class="w-full table-auto border-collapse border border-gray-300">
					<thead>
						<tr class="bg-gray-200">
							<th class="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Label</th>
							<th class="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Value</th>
						</tr>
					</thead>
					<tbody>
						<tr class="bg-white">
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Total Pool</td>
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
								{fmtMicroToStx(totalPool, sip10Data.decimals)}
							</td>
						</tr>
						<tr class="bg-gray-50">
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Winning Pool</td>
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
								{fmtMicroToStx(winningPool, sip10Data.decimals)}
							</td>
						</tr>
						<tr class="bg-white">
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Staked</td>
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
								{fmtMicroToStx(staked + devFee, sip10Data.decimals)}
							</td>
						</tr>
						<tr class="bg-gray-50">
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Dev Fee</td>
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
								{fmtMicroToStx(devFee, sip10Data.decimals)}
							</td>
						</tr>
						<tr class="bg-white">
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Dao Fee</td>
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
								{fmtMicroToStx(daoFee, sip10Data.decimals)}
							</td>
						</tr>
						<tr class="bg-gray-50">
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Staked</td>
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
								{fmtMicroToStx(staked, sip10Data.decimals)}
							</td>
						</tr>
						<tr class="bg-white">
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Net Share</td>
							<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
								{fmtMicroToStx(userShareNet, sip10Data.decimals)}
							</td>
						</tr>
					</tbody>
				</table>
			{/if}
			<button
				on:click={() => {
					errorMessage = undefined;
					claimWinnings();
				}}
				class="bg-green-700 hover:bg-green-600 mt-4 rounded px-4 py-2 text-white"
			>
				CLAIM WINNINGS
			</button>
		</div>
	</div>
</div>
