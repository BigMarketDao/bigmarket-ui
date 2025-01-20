<script lang="ts">
	import { type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import { fetchMarketData, fetchUserStake, type MarketData, type UserStake } from '../predictions';
	import { getStxAddress } from '$lib/stacks/stacks-connect';
	import { fmtMicroToStx, truncate } from '$lib/utils';
	import MarketStakeGraphs from './MarketStakeGraphs.svelte';
	import MakePrediction from '../voting/MakePrediction.svelte';

	export let market: PredictionMarketCreateEvent;
	let marketData: MarketData | undefined;
	let userStake: UserStake | undefined;
	let currentBurnHeight: number;
	let inited = false;
	let successMessage: string | undefined;
	let errorMessage: string | undefined;

	const handleSubmitPollVote = async (data: any) => {
		if (data.error) {
			errorMessage = data.message;
		} else {
			successMessage =
				'Prediction saved the stx will be saved in the contract until the market is resolved';
		}
	};

	onMount(async () => {
		currentBurnHeight = $sessionStore.stacksInfo.burn_block_height;
		marketData = await fetchMarketData(market);
		userStake = await fetchUserStake(market, getStxAddress());
		inited = true;
	});
</script>

{#if marketData}
	<div class="">
		<div class="flex flex-col">
			<!-- Market Details Section -->
			<div class="my-6 flex w-full flex-col rounded-lg bg-gray-100 p-6 shadow-lg">
				<!-- Market Header -->
				<div class="mb-6 flex items-center">
					<img
						src={market.unhashedData.logo}
						alt="Market Logo"
						class="h-20 w-20 rounded-full object-cover shadow-md"
					/>
					<div class="ml-4">
						<h2 class="text-2xl font-semibold text-gray-800">
							<a
								href={`/predictions/market/${market.marketId}`}
								class="text-primary-600 hover:underline"
							>
								{market.unhashedData.name}
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
								<span class="font-medium text-success-700">Concluded - Make a claim?</span>
							{:else}
								<span class="font-medium text-success-700">Live</span>
							{/if}
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-900">For Pool</p>
						<p class="text-lg font-medium text-success-700">
							{fmtMicroToStx(marketData.yesPool)} STX
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-900">Against Pool</p>
						<p class="text-lg font-medium text-primary-600">
							{fmtMicroToStx(marketData.noPool)} STX
						</p>
					</div>
				</div>

				<!-- User Stake -->
				<div class="flex-grow">
					<h3 class="mb-4 text-xl font-semibold text-gray-800">Your Stake</h3>
					{#if userStake}
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-sm font-medium text-gray-900">For</p>
								<p class="text-lg text-success-700">{fmtMicroToStx(userStake.yesAmount)} STX</p>
							</div>
							<div>
								<p class="text-sm font-medium text-gray-900">Against</p>
								<p class="text-lg text-primary-600">{fmtMicroToStx(userStake.noAmount)} STX</p>
							</div>
						</div>
					{:else}
						<p class="text-sm text-gray-900">You have not staked anything in this market.</p>
					{/if}
				</div>
			</div>

			<!-- Market Stake Graph Section -->
			<div class="col-span-6 text-start">
				<MakePrediction {market} onSubmitPollVote={handleSubmitPollVote} />
			</div>
			<div class="my-6 flex w-full rounded-lg bg-gray-100 p-6 shadow-lg">
				<MarketStakeGraphs {market} />
			</div>
		</div>
	</div>
{:else}
	<div class="flex justify-center p-6">
		<p class="text-gray-900">No market data available</p>
	</div>
{/if}
