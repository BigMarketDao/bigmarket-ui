<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { calculatePayoutCategorical, convertFiatToNative, getMarketToken, totalPoolSum } from '../predictions';
	import ExchangeRateHome from '$lib/components/common/ExchangeRateHome.svelte';
	import { selectedCurrency, stakeAmountHome } from '$stores/stores';
	import LogoContainerSmall from './LogoContainerSmall.svelte';
	import type { Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { Users, TrendingUp } from 'lucide-svelte';
	import StakeChart from '../market/version2/do-charts/StakeChart.svelte';

	export let market: PredictionMarketCreateEvent;
	let totalPoolMicro = 0;
	let inited = false;
	let sip10Data: Sip10Data;
	let payouts: any;

	onMount(async () => {
		sip10Data = getMarketToken(market.marketData.token);
		totalPoolMicro = totalPoolSum(market.marketData.stakes);
		stakeAmountHome.set(totalPoolMicro);
		const amount = convertFiatToNative(sip10Data, 100, $selectedCurrency.code);
		payouts = calculatePayoutCategorical(amount, sip10Data.decimals, undefined, market.marketData);
		inited = true;
	});
</script>

<div class="relative overflow-hidden rounded-xl border border-purple-900/20 bg-[#0F1225] p-8 shadow-lg">
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />

	<div class="relative z-10">
		<div class="mb-8 flex w-full items-center justify-between gap-8 rounded-md border border-purple-950 bg-[#151B2D] p-2">
			<div class="flex items-center gap-3">
				<TrendingUp class="h-6 w-6 text-purple-400" />
				<div>
					<p class="text-sm font-medium text-purple-300">Total Value Locked</p>
					<p class="text-lg font-bold text-white">
						{#if sip10Data}
							<ExchangeRateHome {sip10Data} />
						{/if}
					</p>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<Users class="h-6 w-6 text-purple-400" />
				<div>
					<p class="text-sm font-medium text-purple-300">Total Users</p>
					<p class="text-lg font-bold text-white">{market.marketData.stakes.length}</p>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
			<!-- Left Column: Content -->
			<div class="flex-1 space-y-6">
				<!-- Stats Bar -->

				<!-- Header with Logo and Title -->
				<div class="flex items-center gap-6">
					<div class="h-[150px] w-[150px] overflow-hidden rounded-lg border border-purple-900/20 bg-[#151B2D]">
						<LogoContainerSmall logo={market.unhashedData.logo} />
					</div>
					<div>
						<h2 class="text-3xl font-bold leading-tight text-white lg:text-4xl">
							{market.unhashedData.name}
						</h2>
					</div>
				</div>

				<!-- Description -->
				<div class="h-[72px]">
					<p class="text-indigo-200/70 line-clamp-3 text-lg">
						{market.unhashedData.description}
					</p>
				</div>

				<!-- Trading Actions -->
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<button
							on:click={() => goto(`/market/${market.marketId}/${market.marketType}`)}
							class="border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500 w-full rounded-lg border-2 px-6 py-3 font-semibold transition-all hover:text-white"
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
						<button on:click={() => goto(`/market/${market.marketId}/${market.marketType}`)} class="border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500 w-full rounded-lg border-2 px-6 py-3 font-semibold transition-all hover:text-white">
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
			<!-- Right Panel -->
			<div class="w-full md:w-1/2">
				<div class="min-h-[300px h-auto text-black">
					<StakeChart {market} title={''} />
				</div>
			</div>
		</div>
	</div>
</div>
