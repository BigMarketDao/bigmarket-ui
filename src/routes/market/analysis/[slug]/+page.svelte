<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { fetchMarketClaims, fetchMarketStakes, getPredictionMarket } from '$lib/predictions/predictions';
	import { type PredictionMarketClaimEvent, type PredictionMarketCreateEvent, type PredictionMarketStakeEvent } from '@mijoco/stx_helpers/dist/index';

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
		<div class="mb-8 flex flex-col gap-y-5 overflow-x-auto text-[11px]">
			{#if market}
				<h1 class="mt-6 border-gray-200 text-3xl font-bold text-gray-300">Market Information: {market.unhashedData.name}</h1>
			{/if}

			<h1 class="mb-0 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-300">Stakes</h1>
			<div class="mb-8 flex flex-col gap-y-5 overflow-x-auto text-[11px]">
				<table class="min-w-full table-auto border-collapse border border-gray-300 shadow-lg">
					<thead>
						<tr class="bg-gray-200 text-left">
							<th class="border border-gray-300 px-4 py-2 text-gray-800">Staker</th>
							<th class="border border-gray-300 px-4 py-2 text-gray-800">Amount</th>
							<th class="border border-gray-300 px-4 py-2 text-gray-800">Category</th>
						</tr>
					</thead>
					<tbody>
						{#each stakes as { voter, category, amount }}
							<tr class="border-b transition hover:bg-gray-700">
								<td class="border border-gray-300 px-4 py-2">{voter}</td>
								<td class="border border-gray-300 px-4 py-2">{amount}</td>
								<td class="border border-gray-300 px-4 py-2">{category} </td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<h1 class="mb-0 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-300">Claims</h1>
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
					{#each claims as { claimer, userStake, userShare, daoFee, marketFee, indexWon }}
						<tr class="border-b transition hover:bg-gray-700">
							<td class="border border-gray-300 px-4 py-2">{claimer + '/' + indexWon}</td>
							<td class="border border-gray-300 px-4 py-2">{userStake}</td>
							<td class="border border-gray-300 px-4 py-2">{userShare}</td>
							<td class="border border-gray-300 px-4 py-2">{daoFee} </td>
							<td class="border border-gray-300 px-4 py-2">{marketFee} </td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
