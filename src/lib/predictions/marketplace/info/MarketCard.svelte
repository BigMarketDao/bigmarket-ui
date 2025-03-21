<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowRightAltOutline } from 'flowbite-svelte-icons';
	import type { PredictionMarketCreateEvent, ScalarMarketDataItem } from '@mijoco/stx_helpers/dist/index';
	import { calculatePayoutCategorical, convertFiatToNative, getMarketToken, isSTX, ORACLE_MULTIPLIER, totalPoolSum } from '../../predictions';
	import { selectedCurrency } from '$stores/stores';
	import { onMount } from 'svelte';
	import { convertCryptoToFiat, type Payout } from '../../predictions';
	import { Users, TrendingUp } from 'lucide-svelte';
	import { fmtMicroToStxNumber, formatFiat } from '$lib/utils';

	export let market: PredictionMarketCreateEvent;
	let payouts: Array<Payout>;
	let sip10Data = getMarketToken(market.marketData.token);
	let totalPool: number;
	let placeholderImage = 'https://bitcoinfaces.xyz/api/get-image?name=SP1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28GBQA1W0F';
	let totalPoolMicro: string;
	$: totalPoolMicro = convertCryptoToFiat(sip10Data.decimals === 6, fmtMicroToStxNumber(totalPoolSum(market.marketData.stakes), sip10Data.decimals), $selectedCurrency);

	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.src = placeholderImage;
	}

	const getScalarCats = (): ScalarMarketDataItem[] => {
		return market.marketData.categories as ScalarMarketDataItem[];
	};

	onMount(async () => {
		const amount = convertFiatToNative(sip10Data, 100, $selectedCurrency.code);
		payouts = calculatePayoutCategorical(amount, sip10Data.decimals, undefined, market.marketData, $selectedCurrency);
		totalPool = totalPoolSum(market.marketData.stakes);
	});
</script>

<div class="group relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
	<!-- Background Effects -->
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
	<div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(168,85,247,0.05)_10px,rgba(168,85,247,0.05)_20px)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

	<div class="relative space-y-4">
		<!-- Header: Logo and Title aligned -->
		<div class="flex items-start justify-start gap-4">
			<div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#151B2D]">
				<img src={market.unhashedData.logo || placeholderImage} alt="Market Logo" class="h-full w-full object-cover" on:error={handleImageError} />
			</div>
			<div>
				<h3 class="text-lg font-bold text-white">
					<a href={`/market/${market.marketId}/${market.marketType}`} class="hover:text-purple-400">
						{market.unhashedData.name}
					</a>
				</h3>
			</div>
		</div>

		<!-- Stats with fixed divider -->
		<div class="flex justify-between border-t border-purple-900/20 py-4 text-sm">
			<div class="flex items-center gap-2">
				<TrendingUp class="h-4 w-4 text-purple-400" />
				<span class="text-indigo-200 font-medium">{totalPoolMicro?.toLocaleString()}</span>
			</div>

			<div class="flex items-center gap-2">
				<Users class="h-4 w-4 text-purple-400" />
				<span class="text-indigo-200 font-medium">{market.marketData.stakes.length}</span>
			</div>
		</div>

		<!-- Market Type Specific Return Sections -->
		{#if payouts}
			<!-- Binary Market (Yes/No) -->
			{#if market.marketType === 1}
				{#if market.marketData.categories.length === 2}
					<div class="grid grid-cols-2 gap-4">
						<button on:click={() => goto(`/market/${market.marketId}/${market.marketType}`)} class="hover:bg-green-900/30 flex flex-col items-start justify-start rounded-lg bg-[#1A2438] p-4 transition-colors">
							<span class="text-green-400 text-lg font-bold">YES</span>
							<span class="text-green-400/80 text-sm">{payouts[1].fiat}</span>
						</button>
						<button on:click={() => goto(`/market/${market.marketId}/${market.marketType}`)} class="hover:bg-red-900/30 flex flex-col items-start justify-start rounded-lg bg-[#1A2438] p-4 transition-colors">
							<span class="text-red-400 text-lg font-bold">NO</span>
							<span class="text-red-400/80 text-sm">{payouts[0].fiat}</span>
						</button>
					</div>
				{:else}
					<!-- Categorical Market -->
					<div class="space-y-2">
						{#each market.marketData.categories as category, i}
							<button on:click={() => goto(`/market/${market.marketId}/${market.marketType}`)} class="hover:bg-indigo-900/30 flex w-full items-start justify-between rounded-lg bg-[#1A2438] p-3 transition-colors">
								<span class="text-indigo-200">{category}</span>
								<span class="font-bold text-purple-400">{payouts[i].fiat}</span>
							</button>
						{/each}
					</div>
				{/if}
			{:else if market.marketType === 2}
				<!-- Scalar Market (Number Ranges) -->
				<div class="space-y-2">
					{#each getScalarCats() as category, i}
						<button on:click={() => goto(`/market/${market.marketId}/${market.marketType}`)} class="hover:bg-indigo-900/30 text-md flex w-full justify-between rounded-lg bg-[#1A2438] px-3 py-3 text-left transition-colors">
							<span class="text-indigo-200">{formatFiat(category.min / ORACLE_MULTIPLIER)} - {formatFiat(category.max / ORACLE_MULTIPLIER)}</span>
							<span class="font-bold text-purple-400">{payouts[i].fiat}</span>
						</button>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
