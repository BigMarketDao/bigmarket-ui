<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { fetchMarketClaims, fetchMarketStakes, getPredictionMarket } from '$lib/predictions/predictions';
	import { ResolutionState, type PredictionMarketClaimEvent, type PredictionMarketCreateEvent, type PredictionMarketStakeEvent } from '@mijoco/stx_helpers/dist/index';
	import MarketActions from '$lib/predictions/market/MarketActions.svelte';
	import { sessionStore } from '$stores/stores';

	let market: PredictionMarketCreateEvent;
	let stakes: Array<PredictionMarketStakeEvent>;
	let claims: Array<PredictionMarketClaimEvent>;

	onMount(async () => {
		const marketId = Number(page.params.slug);
		if (marketId >= 0) {
			market = await getPredictionMarket(marketId);
			stakes = await fetchMarketStakes(marketId);
			claims = await fetchMarketClaims(marketId);
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

<div class="mx-auto max-w-4xl md:px-6">
	<div class="flex w-full flex-col">
		<h1 class="mb-6 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-300">Market Claims</h1>
		<div class="mb-8 flex flex-col gap-y-5 overflow-x-auto text-[11px]">
			<table class="min-w-full table-auto border-collapse border border-gray-300 shadow-lg">
				<thead>
					<tr class="bg-gray-200 text-left">
						<th class="border border-gray-300 px-4 py-2 text-gray-800">claimer</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Staked</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Share</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Dao Fee</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Market Fee</th>
					</tr>
				</thead>
				<tbody>
					{#each claims as { claimer, userStake, userShare, daoFee, marketFee }}
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">{claimer}</td>
							<td class="border border-gray-300 px-4 py-2">{userStake}</td>
							<td class="border border-gray-300 px-4 py-2">{userShare}</td>
							<td class="border border-gray-300 px-4 py-2">{daoFee} </td>
							<td class="border border-gray-300 px-4 py-2">{marketFee} </td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<h1 class="mb-6 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-300">Market Stakes</h1>
		<div class="mb-8 flex flex-col gap-y-5 overflow-x-auto text-[11px]">
			<table class="min-w-full table-auto border-collapse border border-gray-300 shadow-lg">
				<thead>
					<tr class="bg-gray-200 text-left">
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Staker</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Amount</th>
						<th class="border border-gray-300 px-4 py-2 text-gray-800">Yay/Nay</th>
					</tr>
				</thead>
				<tbody>
					{#each stakes as { voter, yes, amount }}
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">{voter}</td>
							<td class="border border-gray-300 px-4 py-2">{amount}</td>
							<td class="border border-gray-300 px-4 py-2">{yes} </td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
