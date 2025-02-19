<script lang="ts">
	import { getAllowedTokens, getGovernanceToken, getMarketToken, getStxToken } from '$lib/predictions/predictions';
	import { explorerTxUrl, getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import { fmtMicroToStx } from '$lib/utils';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import { getStacksNetwork, type DaoOverview, type Sip10Data, type TokenSalePurchase, type TokenSaleStage } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { fetchTokenSalePurchases } from '../token-sale';
	import { showContractCall } from '@stacks/connect';
	import { Pc, PostConditionMode, uintCV } from '@stacks/transactions';
	import { ArrowsPointingOut, Icon } from 'svelte-hero-icons';
	import Banner from '$lib/components/ui/Banner.svelte';
	import Stages from './Stages.svelte';
	import { sessionStore, stakeAmount } from '$stores/stores';
	import ExchangeRate from '$lib/components/common/ExchangeRate.svelte';

	$: daoOverview = $sessionStore.daoOverview;
	let tokenSalePurchases: Array<TokenSalePurchase>;
	let stage: TokenSaleStage;
	let tokens: any;
	let govToken: Sip10Data;
	let totalSold: number;
	let amount: number;
	let txId: string;
	let errorMessage: string | undefined;
	let sip10Data: Sip10Data;
	let stacksLeading = true;
	let stageBalance = '0';
	$: stage = daoOverview.tokenSale?.stages[daoOverview.tokenSale?.currentStage] || ({} as TokenSaleStage);
	$: totalSold = daoOverview.tokenSale?.stages.reduce((sum, stage) => sum + stage.tokensSold, 0) || 0;
	$: tokens = Object.keys(daoOverview.treasuryBalances.fungible_tokens || {}).map((token) => ({
		contract: getDaoConfig().VITE_DAO_TREASURY,
		token: token.split('::')[1],
		balance: daoOverview.treasuryBalances.fungible_tokens[token].balance,
		decimals: getMarketToken(token.split('::')[0]).decimals
	}));
	$: tokenAmount = stacksLeading ? (amount * stage?.price || 0).toFixed(6) : (amount / stage?.price || 0).toFixed(6);
	$: sip10Data = getStxToken($sessionStore.tokens);
	$: govToken = getGovernanceToken($sessionStore.tokens);

	const switcheroo = () => {
		stacksLeading = !stacksLeading;
	};

	const handleChange = () => {
		stakeAmount.set(amount);
	};

	const buyTokens = async () => {
		errorMessage = undefined;
		if (!isLoggedIn()) {
			errorMessage = 'Please connect your wallet';
			return;
		}
		console.log(amount);
		if (!amount || amount <= 0) {
			errorMessage = `Amount must be greater than 0 ${sip10Data.symbol}`;
			return;
		}
		const mult = Number(`1e${govToken.decimals}`);
		const actual = stacksLeading ? amount : tokenAmount;
		const microStxAmount = Math.round(parseFloat(String(actual)) * mult);
		const contractAddress = getDaoConfig().VITE_DOA_DEPLOYER;
		const contractName = getDaoConfig().VITE_DAO_TOKEN_SALE;
		let functionName = 'buy-ido-tokens';
		const address = getStxAddress();
		const postConditions = [];
		postConditions.push(Pc.principal(address).willSendEq(microStxAmount).ustx());
		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions,
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [uintCV(microStxAmount)],
			onFinish: (data) => {
				txId = data.txId;
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	onMount(async () => {
		if (getStxAddress()) {
			tokenSalePurchases = await fetchTokenSalePurchases(getStxAddress());
			const stageMicro = (tokenSalePurchases[(daoOverview.tokenSale?.currentStage || 1) - 1].amount || 0, govToken.decimals);
			stakeAmount.set(stageMicro);
			stageBalance = fmtMicroToStx(stageMicro);
			console.log(tokenSalePurchases);
		}
	});
</script>

{#if stage && tokens}
	<div class="flex min-h-screen flex-col items-center p-6 text-gray-800">
		<h1 class="mb-6 self-start pb-2 text-2xl font-bold text-gray-300">Token Sale: <span class="text-warning-700 hover:text-warning-800">{daoOverview.contractData.tokenName}</span></h1>
		<Stages currentStage={daoOverview.tokenSale?.currentStage || 1} currentStageStart={daoOverview.tokenSale?.currentStageStart || 0} />

		<div class="mb-8 flex w-full flex-col gap-y-5 overflow-x-auto">
			<table class="min-w-full table-auto border-collapse border border-gray-300 text-white shadow-lg">
				<thead>
					<tr class="bg-gray-200 text-left text-black">
						<th class="border border-gray-300 px-4 py-2">Token</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Price</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Supply</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Sold</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Total Raised</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b transition hover:bg-gray-700">
						<td class="border border-gray-300 px-4 py-2">{daoOverview.contractData.tokenSymbol}</td>
						<td class="border border-gray-300 px-4 py-2">{(1 / stage.price).toFixed(6)}</td>
						<td class="border border-gray-300 px-4 py-2">{fmtMicroToStx(stage.maxSupply, 6)}</td>
						<td class="border border-gray-300 px-4 py-2">{stage.tokensSold} {daoOverview.contractData.tokenSymbol}</td>
						<td class="border border-gray-300 px-4 py-2"
							>{#each tokens as token}
								{fmtMicroToStx(totalSold, token.decimal)} {daoOverview.contractData.tokenSymbol}
							{/each}</td
						>
					</tr>
				</tbody>
			</table>
		</div>

		<div class="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg">
			<h2 class="text-2xl font-bold text-gray-900">Token Sale</h2>
			{#if stage && tokens}
				<div class="mt-4">
					<p class="text-gray-700"></p>
				</div>
			{/if}

			<div class="mt-4">
				<p class="text-gray-700">
					{#if tokenSalePurchases}
						<strong>Your Wallet:</strong>
						{getStxAddress() || 'Not connected'} <br />
						<strong>Your Balance:</strong>
						{stageBalance}
						{daoOverview.contractData.tokenSymbol}
						<br />
					{/if}
					<strong>Your Currency:</strong>
					<ExchangeRate {sip10Data} />
				</p>
			</div>
			<div class="mt-10">
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

			<div class="mt-10">
				<div class="flex w-full gap-x-2">
					<div class="w-[95%]">
						<div class="w-full">
							<input type="number" min="1" placeholder="Enter amount" class="w-full rounded border border-gray-300 px-3 py-2" bind:value={amount} on:keyup={() => handleChange()} />
							<span class="left=10 relative ms-[-70px]"
								>{#if stacksLeading}STX{:else}{govToken.symbol}{/if}</span
							>
						</div>
					</div>
					<div class="w-[10%] text-center">
						<a href="/" on:click|preventDefault={() => switcheroo()} class="text-blue-1000"><Icon src={ArrowsPointingOut} class="inline" width="30" /></a>
					</div>
					<div class="w-[95%]">
						<div class="w-full">
							<input type="number" readonly min="1" placeholder="" class="w-full rounded border border-gray-300 bg-gray-800 px-3 py-2 text-gray-100" bind:value={tokenAmount} />
							<span class="left=10 relative ms-[-70px] text-white"
								>{#if stacksLeading}{govToken.symbol}{:else}STX{/if}</span
							>
						</div>
					</div>
				</div>
				<button on:click={() => buyTokens()} class="mt-3 w-full rounded bg-success-700 px-4 py-2 font-bold text-white hover:bg-success-600"> Buy Tokens </button>
			</div>

			<p class="mt-4 text-sm text-gray-500">The purchased tokens will be credited to your wallet straight away for use in governance votes. Transferability will be locked for the duration of the token sale to protect participants.</p>
		</div>
	</div>
{/if}
