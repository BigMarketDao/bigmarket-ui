<script lang="ts">
	import { onMount } from 'svelte';
	import type { LeaderBoard, PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { convertCryptoToFiat, isSTX } from '$lib/predictions/predictions';
	import { fmtMicroToStx, fmtMicroToStxFormatted, fmtMicroToStxNumber, truncate } from '$lib/utils';
	import { getResolutionMessage } from '../market-states';

	export let markets: Array<PredictionMarketCreateEvent> = [];
	export let leaderBoard: LeaderBoard;

	const getMarket = (marketId: number, marketType: number) => {
		const m = markets.find((m) => m.marketId === marketId && m.marketType === marketType);
		if (m) return m;
		return { marketData: { token: 'wrapped-stx' }, unhashedData: { name: 'Unkown market' } };
	};

	const getMarketResolutionState = (marketId: number, marketType: number) => {
		const m = markets.find((m) => m.marketId === marketId && m.marketType === marketType);
		if (m) return m.marketData.resolutionState;
		return 0;
	};

	onMount(async () => {});
</script>

<div class="rounded-xl border border-purple-900/20 bg-[#0F1225] p-8 shadow-lg">
	<div class=" inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
	{#if leaderBoard}
		<div class=" z-10">
			<div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
				<!-- Left Column: Recent Activity -->
				<div class="w-full md:w-1/2">
					<div class="flex h-auto flex-col gap-y-1 text-white">
						<h2 class="mb-5 text-2xl font-medium text-purple-300">Recent activity</h2>
						{#each leaderBoard.latestPredicitons as prediction}
							<div class="leading-tight text-white hover:text-purple-500">
								<a href={`/market/${prediction.marketId}/${prediction.marketType}`}>{getMarket(prediction.marketId, prediction.marketType).unhashedData.name}</a>
							</div>
							<div class="mb-1 flex items-center justify-between text-xs text-gray-600">
								<span>[{getResolutionMessage(getMarketResolutionState(prediction.marketId, prediction.marketType))}]</span>
							</div>
							<div class="mb-3 flex items-center justify-between">
								<span class="text-xs text-gray-300">{truncate(prediction.voter)}</span>
								<span class="text-xs text-white">{convertCryptoToFiat(isSTX(getMarket(prediction.marketId, prediction.marketType).marketData.token), fmtMicroToStxNumber(prediction.amount))}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Right Panel: Top Markets by Volume -->
				<div class="w-full md:w-1/2">
					<div class="h-auto min-h-[300px]">
						<h2 class="mb-5 text-2xl font-medium text-purple-300">Top markets by volume</h2>
						{#each leaderBoard.topMarkets as topMarket}
							<div class="mb-6 flex items-center gap-x-4">
								<div class="h-[50px] w-[50px] overflow-hidden rounded-lg border border-purple-900/20 bg-[#151B2D]">
									<img src={topMarket.market.unhashedData.logo} alt="Market Logo" class="h-full w-full object-cover" />
								</div>
								<div class="flex-1">
									<div class="leading-tight text-white hover:text-purple-500">
										<a href={`/market/${topMarket.market.marketId}/${topMarket.market.marketType}`}>{topMarket.market.unhashedData.name}</a>
									</div>
									<div class="flex items-center justify-between">
										<span class="text-xs text-gray-600">{getResolutionMessage(getMarketResolutionState(topMarket.market.marketId, topMarket.market.marketType))}</span>
										<div class="flex items-center gap-1">
											<span class="text-xs text-gray-300">TVL:</span>
											<span class="text-xs text-white">{fmtMicroToStxFormatted(topMarket.totalStakes)}</span>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
