<script lang="ts">
	import { onMount } from 'svelte';
	import type { LeaderBoard, PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { convertCryptoToFiat, isSTX } from '$lib/predictions/predictions';
	import { fmtMicroToStxFormatted, fmtMicroToStxNumber, truncate } from '$lib/utils';

	export let markets: Array<PredictionMarketCreateEvent> = [];
	export let leaderBoard: LeaderBoard;

	const getMarket = (marketId: number, marketType: number) => {
		const m = markets.find((m) => m.marketId === marketId && m.marketType === marketType);
		if (m) return m;
		return { marketData: { token: 'wrapped-stx' }, unhashedData: { name: 'Unkown market' } };
	};

	onMount(async () => {});
</script>

<div class=" overflow-hidden rounded-xl border border-purple-900/20 bg-[#0F1225] p-8 shadow-lg">
	<div class=" inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
	{#if leaderBoard}
		<div class=" z-10">
			<div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
				<!-- Left Column: Content -->
				<div class="w-full md:w-1/2">
					<div class=" flex h-auto flex-col gap-y-1 text-white">
						<h2 class="mb-5 text-2xl font-medium text-purple-300">Recent activity</h2>
						{#each leaderBoard.latestPredicitons as prediction}
							<div class="font-bold leading-tight text-gray-500">{getMarket(prediction.marketId, prediction.marketType).unhashedData.name}</div>
							<div class="flex items-center justify-between gap-6">
								<div>
									<h2 class=" font-bold leading-tight text-white">{truncate(prediction.voter)}</h2>
								</div>
								<div class="">
									<p class=" font-bold leading-tight text-white">{convertCryptoToFiat(isSTX(getMarket(prediction.marketId, prediction.marketType).marketData.token), fmtMicroToStxNumber(prediction.amount))}</p>
								</div>
							</div>
							<!-- Header with Logo and Title -->
							<!-- Description -->
						{/each}
					</div>
				</div>
				<!-- Right Panel -->
				<div class="w-full md:w-1/2">
					<div class="min-h-[300px h-auto text-black">
						<h2 class="mb-5 text-2xl font-medium text-purple-300">Top markets by volume</h2>
						{#each leaderBoard.topMarkets as topMarket}
							<div class="flex items-center gap-6">
								<div class="h-auto w-auto overflow-hidden rounded-lg border border-purple-900/20 bg-[#151B2D]">
									<div><img src={topMarket.market.unhashedData.logo} alt="Market Logo" class={'h-[70px] w-[50px] place-self-center rounded-full object-cover'} /></div>
								</div>
								<div>
									<h2 class="font-bold leading-tight text-gray-500">{topMarket.market.unhashedData.name}</h2>
									<div class="h-[72px]">
										<p class="line-clamp-3 text-lg text-white">{fmtMicroToStxFormatted(topMarket.totalStakes)}</p>
									</div>
								</div>
							</div>
							<!-- Header with Logo and Title -->
							<!-- Description -->
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
