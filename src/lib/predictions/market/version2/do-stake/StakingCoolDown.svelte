<script lang="ts">
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import { ORACLE_MULTIPLIER, type Payout } from '$lib/predictions/predictions';
	import { fmtNumber, formatFiat } from '$lib/utils';
	import { sessionStore } from '$stores/stores';
	import type { PredictionMarketCreateEvent, ScalarMarketDataItem } from '@mijoco/stx_helpers';
	import { TrendingUp } from 'lucide-svelte';

	export let market: PredictionMarketCreateEvent;
	let categories = market.marketData.categories as ScalarMarketDataItem[];
	export let payouts: Array<Payout>;
	$: currentBlock = $sessionStore.stacksInfo.burn_block_height;
	let marketEndsBlock = (market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0);
	let coolDownBlock = (market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0) + (market.marketData.coolDownPeriod || 0);
</script>

<div class="mb-5">
	{#if currentBlock <= coolDownBlock}
		<p>Cool down is in progress (current block height {fmtNumber(currentBlock)}).</p>
		<ul class="w-1/5 text-sm">
			<li class="flex justify-between"><span>Market start:</span><span>{fmtNumber(market.marketData.marketStart || 0)}</span></li>
			<li class="flex justify-between"><span>Market end:</span><span>{fmtNumber(marketEndsBlock)}</span></li>
			<li class="flex justify-between"><span>Cool down end:</span><span>{fmtNumber(coolDownBlock)}</span></li>
		</ul>
		<div class="mt-0">
			<BlockHeightProgressBar
				startBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0)}
				stopBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0) + (market.marketData.coolDownPeriod || 0)}
			/>
		</div>
	{:else}
		<p>Market is closed and will resolve shortly.</p>
	{/if}
</div>
<div class="mt-0 grid grid-cols-1 gap-4 md:grid-cols-3">
	{#each categories as category, index}
		<div class="flex flex-col gap-2">
			<button class="btn-gray-600 btn">
				<span class="text-white">{formatFiat(category.min / ORACLE_MULTIPLIER)}</span> &ge; <span class="text-white">x</span> &lt <span class="text-white">{formatFiat(category.max / ORACLE_MULTIPLIER)}</span>
			</button>
			<div class="card bg-base-200 p-4">
				<div class="text-sm opacity-70">Potential Return</div>
				<div class="flex items-center gap-2">
					<span class="text-xl font-bold">
						<!-- ${calculateReturn(100, option.odds)} -->
					</span>
					<TrendingUp class="h-4 w-4 text-success" />
				</div>
				{#if payouts}
					<div class="text-xs opacity-50">
						for $100 stake is {payouts[index].crypto} / {payouts[index].fiat}
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
