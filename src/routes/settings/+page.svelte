<script lang="ts">
	import { onMount } from 'svelte';
	import { readPredictionContractData, type ContractBalances, type PredictionContractData } from '@mijoco/stx_helpers/dist/index';
	import { ArrowUpOnSquare, ArrowUpRight, Icon } from 'svelte-hero-icons';
	import { Spinner } from 'flowbite-svelte';
	import { sessionStore } from '$stores/stores';
	import ContractBalanceTable from '$lib/predictions/settings/ContractBalanceTable.svelte';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import Bulletin from '$lib/components/ui/Bulletin.svelte';
	import { fmtMicroToStx } from '$lib/utils';
	import DaoHero from '$lib/components/common/DaoHero.svelte';
	import { ArrowUpRightFromSquareOutline, ArrowUpRightFromSquareSolid, LinkBreakOutline } from 'flowbite-svelte-icons';
	import { explorerAddressUrl } from '$lib/stacks/stacks-connect';
	import { fetchExchangeRates } from '$lib/stacks/rates';
	import { resolveMarkets } from '$lib/predictions/predictions';

	let data: PredictionContractData;
	let contractBalances: ContractBalances;
	let scalarBalances: ContractBalances;
	let treasuryBalances: ContractBalances;

	onMount(async () => {
		data = $sessionStore.daoOverview.contractData;
		contractBalances = $sessionStore.daoOverview.contractBalances;
		scalarBalances = $sessionStore.daoOverview.scalarBalances;
		treasuryBalances = $sessionStore.daoOverview.treasuryBalances;

		const t = await readPredictionContractData(getConfig().VITE_STACKS_API, getDaoConfig().VITE_DOA_DEPLOYER, getDaoConfig().VITE_DAO_MARKET_PREDICTING);
		console.log('readPredictionContractData: ', t);
	});
</script>

<svelte:head>
	<title>BigMarket Settings</title>
	<meta name="description" content="BigMarket DAO and prediction market settings" />
</svelte:head>

<div class="">
	<DaoHero title={'Settings and Balances'} subtitle={'Up to date market fees and treasury balances are displayed here'} />
	<div class="mx-auto max-w-4xl rounded-lg p-6 shadow-lg">
		<h1 class="my-6 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-300">Prediction Market Settings</h1>
		{#if !data}
			<div class="place-content-start self-start align-top">
				<Icon src={Spinner} /> Loading settings from contracts
			</div>
		{:else}
			<div class="mb-8 flex flex-col gap-y-5 overflow-x-auto">
				<table class="min-w-full table-auto border-collapse border border-gray-300 shadow-lg">
					<thead>
						<tr class="bg-gray-200 text-left">
							<th class="border border-gray-300 px-4 py-2 text-gray-800">Field</th>
							<th class="border border-gray-300 px-4 py-2 text-gray-800">Value</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2"># Markets</td>
							<td class="border border-gray-300 px-4 py-2">
								<Bulletin message={'The total number of markets created on BigMarket'} trigger={'marketCounter'}>
									<span slot="title">{data.marketCounter}</span>
								</Bulletin>
							</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Market gating</td>
							<td class="border border-gray-300 px-4 py-2">
								<Bulletin message={'If gating is on, markets can only be created by known accounts.'} trigger={'creationGated'}>
									<span slot="title">{data.creationGated}</span>
								</Bulletin>
							</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Dispute Window</td>
							<td class="border border-gray-300 px-4 py-2">
								<Bulletin
									message={'The period (in Bitcoin blocks) after a market is resolved when anyone (with a stake in that market) can challenge the outcome. If a challenge is made, the market is resolved by DAO voting.'}
									trigger={'disputeWindowLength'}
								>
									<span slot="title">{data.disputeWindowLength}</span>
								</Bulletin>
							</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Voting Window</td>
							<td class="border border-gray-300 px-4 py-2">
								<Bulletin
									message={'The voting window (in bitcoin blocks) afforded to voting on market resolution - the DAO voting can overturn or agree with the original outcome. Claims can be made after this window closes.'}
									trigger={'marketVotingDuration'}
								>
									<span slot="title">{data.marketVotingDuration}</span>
								</Bulletin>
							</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Dispute voting majority</td>
							<td class="border border-gray-300 px-4 py-2">
								<Bulletin message={'voting to resolve disputes must be carried by at least this majority of votes'} trigger={'customMajority'}>
									<span slot="title">{String(data.customMajority || '50%')}</span>
								</Bulletin>
							</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Resolution</td>
							<td class="border border-gray-300 px-4 py-2">
								<Bulletin message={'the account that is able to resolve a market. this account will be controlled by an automated process such as an on chain oracle, ai agent etc'} trigger={'resolutionAgent'}>
									<span slot="title"
										>{data.resolutionAgent}
										<a href={explorerAddressUrl(data.resolutionAgent)} target="_blank"><Icon src={ArrowUpRight} width={'20px'} height={'20px'} class="inline-block rounded-[50%] border border-blue-800 p-1 text-blue-800" /></a>
									</span>
								</Bulletin>
							</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Dev Fund</td>
							<td class="border border-gray-300 px-4 py-2">
								<Bulletin message={'account controlling the development fund'} trigger={'devFund'}>
									<span slot="title"
										>{data.devFund}
										<a href={explorerAddressUrl(data.devFund)} target="_blank"><Icon src={ArrowUpRight} width={'20px'} height={'20px'} class="inline-block rounded-[50%] border border-blue-800 p-1 text-blue-800" /></a>
									</span>
								</Bulletin>
							</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">DAO Treasury</td>
							<td class="border border-gray-300 px-4 py-2">
								<Bulletin message={'The DAO treasury contract - see below for balance info'} trigger={'daoTreasury'}>
									<span slot="title"
										>{data.daoTreasury}
										<a href={explorerAddressUrl(data.daoTreasury)} target="_blank"><Icon src={ArrowUpRight} width={'20px'} height={'20px'} class="inline-block rounded-[50%] border border-blue-800 p-1 text-blue-800" /></a>
									</span>
								</Bulletin>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<h1 class="my-6 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-300">Fee Structure</h1>
			<div class="mb-8 flex flex-col gap-y-5 overflow-x-auto">
				<table class="min-w-full table-auto border-collapse border border-gray-300 shadow-lg">
					<thead>
						<tr class="bg-gray-200 text-left">
							<th class="border border-gray-300 px-4 py-2 text-gray-800">Fee</th>
							<th class="border border-gray-300 px-4 py-2 text-gray-800">Amount</th>
							<th class="border border-gray-300 px-4 py-2 text-gray-800">Notes</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Dev Fees</td>
							<td class="border border-gray-300 px-4 py-2">{data.devFeeBips / 100} %</td>
							<td class="border border-gray-300 px-4 py-2">Taken up front and used to build BigMarket</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Dao Fees</td>
							<td class="border border-gray-300 px-4 py-2">{data.daoFeeBips / 100} %</td>
							<td class="border border-gray-300 px-4 py-2">Fee charged by the DAO. Paid by winners</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Market Fees Max</td>
							<td class="border border-gray-300 px-4 py-2">{data.marketFeeBipsMax / 100} %</td>
							<td class="border border-gray-300 px-4 py-2">Discretionary Fee charged by market. Paid by winners.</td>
						</tr>
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">Market creation</td>
							<td class="border border-gray-300 px-4 py-2">{fmtMicroToStx(data.marketCreateFee)} STX</td>
							<td class="border border-gray-300 px-4 py-2">Fee for creating markets. Paid to DAO treasury</td>
						</tr>
					</tbody>
				</table>
			</div>
			<h1 class="mb-6 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-300">Contracts & Balances</h1>
			<div class="mb-8 flex flex-col gap-y-5 overflow-x-auto">
				<ContractBalanceTable
					contracts={[
						{ contract: getDaoConfig().VITE_DAO_TREASURY, balances: treasuryBalances },
						{ contract: getDaoConfig().VITE_DAO_MARKET_SCALAR, balances: scalarBalances },
						{ contract: getDaoConfig().VITE_DAO_MARKET_PREDICTING, balances: contractBalances }
					]}
				/>
			</div>
		{/if}
		<div class="flex justify-end text-primary"><a href="/" on:click|preventDefault={() => resolveMarkets()}>resolve markets</a></div>
	</div>
</div>
