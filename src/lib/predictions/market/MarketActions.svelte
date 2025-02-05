<script lang="ts">
	import { fetchMarketData, fetchUserStake, ResolutionState, type MarketData, type PredictionMarketCreateEvent, type Sip10Data, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import { getStxAddress } from '$lib/stacks/stacks-connect';
	import { fmtMicroToStx, truncate } from '$lib/utils';
	import MarketStakeGraphs from '../graphs/MarketStakeGraphs.svelte';
	import MakePrediction from '../staking/MakePrediction.svelte';
	import MarketResolving from './resolve/MarketResolving.svelte';
	import ResolutionBanner from './resolve/ResolutionBanner.svelte';
	import { getConfig } from '$stores/store_helpers';
	import { getMarketToken } from '../predictions';
	import { Icon, InformationCircle } from 'svelte-hero-icons';

	export let market: PredictionMarketCreateEvent;
	let marketData: MarketData | undefined;
	let userStake: UserStake | undefined;
	let currentBurnHeight: number;
	let inited = false;
	let successMessage: string | undefined;
	let errorMessage: string | undefined;
	let sip10Data: Sip10Data;
	let votingPowerUstx: number;

	const handleStakeUpdate = async (data: any) => {
		if (data.error) {
			errorMessage = data.message;
		} else {
			successMessage = 'Prediction saved the stx will be saved in the contract until the market is resolved';
		}
	};

	const handleTxChange = async (data: any) => {
		if (data.error) {
			errorMessage = data.message;
		} else {
			successMessage = 'Prediction saved the stx will be saved in the contract until the market is resolved';
		}
	};

	onMount(async () => {
		sip10Data = getMarketToken(market.token);
		currentBurnHeight = $sessionStore.stacksInfo.burn_block_height;
		marketData = await fetchMarketData(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], market.votingContract.split('.')[1]);
		userStake = await fetchUserStake(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], market.votingContract.split('.')[1], getStxAddress());
		inited = true;
	});
</script>

{#if marketData}
	<div class="">
		<div class="flex flex-col">
			<div><ResolutionBanner {market} {marketData} /></div>
			<!-- Market Details Section -->
			<div class="my-6 flex w-full flex-col rounded-lg bg-gray-100 p-6 shadow-lg">
				<!-- Market Header -->
				<div class="mb-6 flex items-center">
					<img src={market.unhashedData.logo} alt="Market Logo" class="h-20 w-20 rounded-full object-cover shadow-md" />
					<div class="ml-4">
						<h2 class="flex w-full justify-between text-2xl font-semibold text-gray-800">
							<a href={`/market/${market.marketId}`} class="text-primary-600 hover:underline">
								{market.unhashedData.name}
							</a>
							<a href={`/market/analysis/${market.marketId}`} class="text-primary-600 hover:underline">
								<Icon
									src={InformationCircle}
									mini
									class="ml-2 inline h-5 w-5 shrink-0  text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50"
									aria-hidden="true"
									id={'trigger'}
								/>
							</a>
						</h2>
						<p class="text-sm text-gray-600">{market.unhashedData.description}</p>
					</div>
				</div>

				<!-- Market Metadata -->
				<div class="mb-6 grid grid-cols-2 gap-4">
					<div>
						<p class="text-sm font-medium text-gray-900">Creator</p>
						<p class="text-lg text-gray-800">{truncate(marketData.creator)}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-900">Status</p>
						<p class="text-lg">
							{#if marketData.concluded}
								<span class="font-medium text-success-700">Concluded - Outcome {marketData.categories[market.outcome!]}</span>
							{:else}
								<span class="font-medium text-success-700">Live</span>
							{/if}
						</p>
					</div>
				</div>
				<h3 class="mb- text-xl font-semibold text-gray-800">All Stakes</h3>
				<div class="mb-6 grid grid-cols-2 gap-4">
					{#each marketData.categories as category, index}
						<div>
							<p class="text-sm font-medium text-gray-900">{category}</p>
							<p class="text-lg font-medium text-success-700">
								{fmtMicroToStx(marketData.stakes[index], sip10Data.decimals)}
								{sip10Data.symbol}
							</p>
						</div>
					{/each}
				</div>

				<!-- User Stake -->
				<h3 class="mb-4 text-xl font-semibold text-gray-800">Your Stakes</h3>
				<div class="mb-6 grid grid-cols-2 gap-4">
					{#if userStake && userStake.stakes && userStake.stakes.length >= marketData.categories.length}
						{#each marketData.categories as category, index}
							<div>
								<p class="text-sm font-medium text-gray-900">{category}</p>
								<p class="text-lg text-success-700">{fmtMicroToStx(userStake?.stakes[index] || 0, sip10Data.decimals)} {sip10Data.symbol}</p>
							</div>
						{/each}
					{:else}
						<p class="text-sm text-gray-900">You have not staked anything in this market.</p>
					{/if}
				</div>
			</div>

			<!-- Market Stake Graph Section -->
			{#if market.resolutionState === ResolutionState.RESOLUTION_OPEN}
				<div class="col-span-6 text-start">
					<MakePrediction {market} {marketData} userStake={userStake!} bind:votingPowerUstx onTxChange={handleTxChange} />
				</div>
			{:else}
				<div class="col-span-6 text-start">
					<MarketResolving {market} {marketData} {userStake} />
				</div>
			{/if}
			<div class="my-6 flex w-full rounded-lg bg-gray-100 p-6 shadow-lg">
				<MarketStakeGraphs {market} {marketData} />
			</div>
		</div>
	</div>
{:else}
	<div class="flex justify-center p-6">
		<p class="text-gray-900">No market data available</p>
	</div>
{/if}
