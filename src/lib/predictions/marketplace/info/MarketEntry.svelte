<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowRightAltOutline } from 'flowbite-svelte-icons';
	import { type MarketData, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import LogoContainer from '../LogoContainer.svelte';
	import { calculatePayoutCategorical, convertCryptoToFiat, convertFiatToNative, getMarketToken, totalPoolSum } from '../../predictions';
	import { selectedCurrency } from '$stores/stores';
	import type { Payout } from '../../predictions';
	import { Users, TrendingUp, Clock } from 'lucide-svelte';
	import { fmtMicroToStx, fmtMicroToStxNumber } from '$lib/utils';

	export let market: PredictionMarketCreateEvent;
	let payouts: Array<Payout>;
	let sip10Data: any;
	let totalPool: number;
	let totalPoolMicro: string;

	onMount(async () => {
		sip10Data = getMarketToken(market.marketData.token);
		const amount = convertFiatToNative(sip10Data, 100, $selectedCurrency.code);
		payouts = calculatePayoutCategorical(amount, sip10Data.decimals, undefined, market.marketData);
		totalPool = totalPoolSum(market.marketData.stakes);
		totalPoolMicro = convertCryptoToFiat(sip10Data.decimals === 6, fmtMicroToStxNumber(totalPoolSum(market.marketData.stakes), sip10Data.decimals));
	});
</script>

<div class="group relative overflow-hidden rounded-lg border border-purple-800/30 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
	<!-- Background Effects -->
	<div class="bg-gradient-to-r absolute inset-0 from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

	<div class="relative flex items-center gap-6">
		<!-- Logo -->
		<div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-purple-800/30 bg-gray-800/50">
			<LogoContainer logo={market.unhashedData.logo} />
		</div>

		<!-- Content -->
		<div class="flex flex-1 items-center justify-between gap-6">
			<!-- Market Info -->
			<div class="space-y-2">
				<h3 class="text-lg font-bold text-white">
					{market.unhashedData.name}
				</h3>
				<p class="line-clamp-2 text-sm text-gray-400">
					{market.unhashedData.description}
				</p>
			</div>

			<!-- Stats -->

			<!-- Trade Button -->
			<div class="flex shrink-0 items-center gap-6 text-sm">
				<button class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700" on:click={() => goto(`/market/${market.marketId}/${market.marketType}`)}>
					Trade
					<ArrowRightAltOutline class="h-4 w-4" />
				</button>
			</div>
		</div>
	</div>
	<div class="flex shrink-0 items-center justify-between gap-6 pt-2 text-sm">
		<!-- TVL -->
		<div class="flex items-center gap-2">
			<TrendingUp class="h-4 w-4 text-purple-400" />
			<span class="font-medium text-white">{totalPoolMicro?.toLocaleString()}</span>
		</div>

		<!-- Users -->
		<!-- <div class="flex items-center gap-2">
			<Users class="h-4 w-4 text-purple-400" />
			<span class="font-medium text-white">{fmtMicroToStxNumber(totalPool, sip10Data?.decimals || 6)}</span>
		</div> -->

		<!-- Potential Return -->
		{#if payouts}
			<div class="bg-green-500/20 text-green-400 rounded-full px-3 py-1 text-xs font-medium">
				Up to {payouts[0].fiat} return
			</div>
		{/if}
	</div>
</div>
