<script lang="ts">
	import { fetchStacksInfo, ResolutionState, type MarketData, type PredictionMarketCreateEvent, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { sessionStore } from '$stores/stores';
	import DisputeResolution from './DisputeResolution.svelte';
	import ResolveMarket from './ResolveMarket.svelte';
	import { getConfig } from '$stores/store_helpers';
	import ClaimWinnings from './ClaimWinnings.svelte';
	import MarketVoting from './market-vote/MarketVoting.svelte';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import { userStakeSum } from '$lib/predictions/predictions';
	import TransferLosingAmount from './TransferLosingAmount.svelte';
	import Banner from '$lib/components/ui/Banner.svelte';

	export let market: PredictionMarketCreateEvent = {} as PredictionMarketCreateEvent;
	export let marketData: MarketData = {} as MarketData;
	export let userStake: UserStake | undefined;

	let successMessage: string | undefined;
	let errorMessage: string | undefined;
	let burnHeight: number = marketData.resolutionBurnHeight;
	let resBurnHeight: number;
	let resolutionState: number;
	let resWindow: number = $sessionStore.daoOverview.contractData.disputeWindowLength;
	$: disputable = $sessionStore.stacksInfo.burn_block_height <= resBurnHeight + resWindow;

	// Simulated functions for actions
	const startDispute = () => {
		console.log('Dispute started!');
	};

	const hasStaked = () => {
		if (userStake) {
			return userStakeSum(userStake) > 0;
		}
		return false;
	};

	const canClaim = () => {
		if (userStake && marketData.outcome) {
			return userStake.stakes[marketData.outcome] > 0;
		}
		return false;
	};

	const handleDispute = async (data: any) => {
		if (data.error) {
			errorMessage = data.message;
		} else {
			successMessage = 'Market resolution dispute begun';
		}
	};

	const resolveMarketUndisputed = () => {
		console.log('Market resolved as undisputed!');
	};

	const voteOnDao = () => {
		console.log('Voting in the DAO started!');
	};

	onMount(() => {
		resolutionState = marketData.resolutionState;
		burnHeight = $sessionStore.stacksInfo.burn_block_height;
		resBurnHeight = marketData.resolutionBurnHeight;
		resWindow = $sessionStore.daoOverview.contractData.disputeWindowLength;
		if (resolutionState === ResolutionState.RESOLUTION_RESOLVING) {
			const interval = setInterval(async () => {
				const stacksInfo = await fetchStacksInfo(getConfig().VITE_STACKS_API);
				sessionStore.update((conf) => {
					conf.stacksInfo = stacksInfo;
					return conf;
				});
			}, 3000);

			return () => clearInterval(interval);
		}
	});
</script>

<!-- Resolution States -->
{#if resolutionState === ResolutionState.RESOLUTION_RESOLVING}
	<div class="mb-4 rounded bg-yellow-100 p-4 text-yellow-800">
		{#if disputable}
			<p>
				Resolution is in progress. Preliminary outcome is <span class="text-red-600 font-medium">{marketData.categories[market.outcome!]}</span>.
			</p>
			<p>
				Dispute window closes in <span class="font-bold">{resBurnHeight + resWindow - burnHeight}</span> blocks.
			</p>
			{#if hasStaked()}
				<DisputeResolution {market} {marketData} onDispute={handleDispute} />
			{/if}
			<div class="mt-4">
				<BlockHeightProgressBar startBurnHeight={resBurnHeight} stopBurnHeight={resBurnHeight + resWindow} />
			</div>
		{:else}
			<p>
				Outcome is <span class="text-red-600 font-medium">{marketData.categories[market.outcome!]}</span>. Market can now be concluded to start claims
			</p>
			<ResolveMarket {market} onDispute={handleDispute} />
		{/if}
	</div>
{:else if resolutionState === ResolutionState.RESOLUTION_DISPUTED}
	<div class="mb-4 rounded bg-blue-100 p-4 text-black">
		<MarketVoting {market} {marketData} />
	</div>
{:else if resolutionState === ResolutionState.RESOLUTION_RESOLVED}
	<div class="mb-4 rounded bg-gray-200 p-4 text-gray-800">
		<Banner bannerType={'info'} message={`This market is resolved - the answer is ${marketData.categories[market.outcome!]}.`} />
		{#if userStake && canClaim()}
			<ClaimWinnings {market} {userStake} {marketData} />
		{/if}
		{#if marketData.stakes[marketData.outcome!] === 0 && !market.transferLosingStakes}
			<TransferLosingAmount {market} {marketData} />
		{/if}
	</div>
{/if}
