<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PredictionMarketCreateEvent, PredictionMarketStakeEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { calculatePayoutCategorical, convertFiatToNative, fetchMarketStakes, getMarketToken, totalPoolSum } from '../predictions';
	import ExchangeRateHome from '$lib/components/common/ExchangeRateHome.svelte';
	import { selectedCurrency, stakeAmountHome } from '$stores/stores';
	import LogoContainerSmall from './LogoContainerSmall.svelte';
	import type { Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { Users, TrendingUp } from 'lucide-svelte';
	import StakeChart from '../market/version2/do-charts/StakeChart.svelte';

	export let market: PredictionMarketCreateEvent;
	let marketStakes: PredictionMarketStakeEvent[];
	let totalPoolMicro = 0;
	let inited = false;
	let sip10Data: Sip10Data;
	let payouts: any;

	onMount(async () => {
		marketStakes = await fetchMarketStakes(market.marketId, market.marketType);
		sip10Data = getMarketToken(market.marketData.token);
		totalPoolMicro = totalPoolSum(market.marketData.stakes);
		stakeAmountHome.set(totalPoolMicro);
		const amount = convertFiatToNative(sip10Data, 100, $selectedCurrency.code);
		payouts = calculatePayoutCategorical(amount, sip10Data.decimals, undefined, market.marketData);
		inited = true;
	});
</script>

<div class=" rounded-xl border border-purple-900/20 bg-[#0F1225] p-8 shadow-lg">
	<div class=" inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>

	<div class=" z-10">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-5">
			<!-- Left Column: Content (3/5 width) -->
			<div class="flex flex-col space-y-6 lg:col-span-3">
				<!-- Market Stats Icons - Positioned above title -->
				<div class="flex items-center justify-start gap-4">
					<div class="flex items-center gap-2 rounded-full bg-[#151B2D]/80 px-4 py-2">
						<TrendingUp class="h-4 w-4 text-purple-400" />
						<div>
							<p class="text-xs text-white">
								{#if sip10Data}
									<ExchangeRateHome {sip10Data} />
								{/if}
							</p>
						</div>
					</div>

					<div class="flex items-center gap-2 rounded-full bg-[#151B2D]/80 px-4 py-2">
						<Users class="h-4 w-4 text-purple-400" />
						<p class="text-xs text-white">{marketStakes?.length || 0} users</p>
					</div>
				</div>

				<!-- Header with Logo and Title -->
				<div class="flex items-center gap-5">
					<div class="h-[150px] w-[150px] overflow-hidden rounded-lg border border-purple-900/20 bg-[#151B2D]">
						<LogoContainerSmall logo={market.unhashedData.logo} />
					</div>
					<div class="flex flex-col justify-center">
						<h2 class="text-3xl font-bold leading-tight text-white lg:text-4xl">
							{market.unhashedData.name}
						</h2>
						<p class="text-indigo-200/70 mt-2 line-clamp-2 text-lg">
							{market.unhashedData.description}
						</p>
					</div>
				</div>

				<!-- Trading Actions -->
				<div class="grid grid-cols-2 gap-6">
					<div class="space-y-2">
						<button
							on:click={() => goto(`/market/${market.marketId}/${market.marketType}`)}
							class="border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500 w-full rounded-lg border-2 px-6 py-3 font-semibold transition-all duration-300 hover:text-white"
						>
							Yes
						</button>
						{#if payouts}
							<div class="text-green-400 text-center text-sm">
								Potential Return: {payouts[0].fiat}
							</div>
						{/if}
					</div>

					<div class="space-y-2">
						<button
							on:click={() => goto(`/market/${market.marketId}/${market.marketType}`)}
							class="border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500 w-full rounded-lg border-2 px-6 py-3 font-semibold transition-all duration-300 hover:text-white"
						>
							No
						</button>
						{#if payouts}
							<div class="text-red-400 text-center text-sm">
								Potential Return: {payouts[1].fiat}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Right Panel (2/5 width) - Chart -->
			<div class="w-full lg:col-span-2">
				<div class="scale-85 h-auto origin-top-right transform">
					<StakeChart {market} title={''} />
				</div>
			</div>
		</div>
	</div>
</div>
