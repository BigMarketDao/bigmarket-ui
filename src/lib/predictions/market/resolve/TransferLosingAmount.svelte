<script lang="ts">
	import { onMount } from 'svelte';
	import { Cl, Pc, PostConditionMode, uintCV } from '@stacks/transactions';
	import { showContractCall } from '@stacks/connect';
	import type { MarketData, PredictionMarketCreateEvent, Sip10Data, UserStake } from '@mijoco/stx_helpers/dist/index';
	import { getStacksNetwork } from '@mijoco/stx_helpers/dist/stacks-node';
	import { getConfig } from '$stores/store_helpers';
	import { explorerTxUrl } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { isSTX, totalPoolSum } from '$lib/predictions/predictions';

	export let market: PredictionMarketCreateEvent;
	export let marketData: MarketData;
	let sip10Data: Sip10Data;

	let errorMessage: string | undefined;
	let txId: string;
	let winningPool: number;

	const transferBalance = async () => {
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = market.votingContract.split('.')[1];
		let functionName = 'transfer-losing-stakes';
		const postConditions = [];
		const amount = totalPoolSum(marketData.stakes);
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

	onMount(async () => {
		winningPool = marketData.stakes[marketData.outcome!];
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
			{#if winningPool === 0}
				<button
					on:click={() => {
						errorMessage = undefined;
						transferBalance();
					}}
					class="bg-green-700 hover:bg-green-600 mt-4 rounded px-4 py-2 text-white"
				>
					TRANSFER BALANCE
				</button>
				<p class="my-3 text-sm">There were no winners of this market. The funds can be safely transferred to the DAO treasury</p>
			{/if}
		</div>
	</div>
</div>
