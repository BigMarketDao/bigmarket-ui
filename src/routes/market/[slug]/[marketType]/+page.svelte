<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchMarketStakes, getPredictionMarket } from '$lib/predictions/predictions';
	import { fetchUserStake, ResolutionState, type PredictionMarketCreateEvent, type PredictionMarketStakeEvent, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import MarketStatsBar from '$lib/predictions/market/version2/MarketStatsBar.svelte';
	import MarketHeader from '$lib/predictions/market/version2/MarketHeader.svelte';
	import MarketStaking from '$lib/predictions/market/version2/MarketStaking.svelte';
	import MarketCharts from '$lib/predictions/market/version2/MarketCharts.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import MarketResolving from '$lib/predictions/market/version2/MarketResolving.svelte';
	import { getConfig } from '$stores/store_helpers';
	import MarketVoting from '$lib/predictions/market/version2/MarketVoting.svelte';
	import MarketClaiming from '$lib/predictions/market/version2/MarketClaiming.svelte';
	import { getStxAddress } from '$lib/stacks/stacks-connect';
	import { bitcoinMode } from '$stores/stores';

	let market: PredictionMarketCreateEvent;
	let marketStakes: Array<PredictionMarketStakeEvent> = [];
	let userStake: UserStake;

	onMount(async () => {
		const marketId = Number(page.params.slug);
		const marketType = Number(page.params.marketType);
		if (marketType === 3) {
			bitcoinMode.set(true);
		} else {
			bitcoinMode.set(false);
		}
		if (marketId >= 0) {
			market = await getPredictionMarket(marketId, marketType);
			if (!market) {
				goto('/');
				return;
			}
			marketStakes = await fetchMarketStakes(marketId, marketType);
			userStake = (await fetchUserStake(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], market.votingContract.split('.')[1], getStxAddress())) || ({} as UserStake);
			console.log('getPredictionMarket: ', market);
		} else {
			goto('/market-mgt');
		}
	});
</script>

<svelte:head>
	<title>Market Volumes</title>
	<meta name="description" content="Create an opinion poll" />
</svelte:head>

<div class="min-h-screen bg-base-100 p-6 text-base-content">
	<div class="mx-auto max-w-7xl space-y-6">
		<!-- Market Stats Bar -->
		{#if market}
			<MarketStatsBar {market} totalUsers={marketStakes.length} />
			<MarketHeader {market} />
			{#if market.marketData.resolutionState === ResolutionState.RESOLUTION_OPEN}
				<MarketStaking {market} {userStake} />
			{:else if market.marketData.resolutionState === ResolutionState.RESOLUTION_RESOLVING}
				<MarketResolving {market} {userStake} />
			{:else if market.marketData.resolutionState === ResolutionState.RESOLUTION_DISPUTED}
				<MarketVoting {market} />
			{:else if market.marketData.resolutionState === ResolutionState.RESOLUTION_RESOLVED}
				<MarketClaiming {market} {userStake} />
			{/if}
			<MarketCharts {market} />
		{/if}
	</div>
</div>
