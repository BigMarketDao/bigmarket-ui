<script lang="ts">
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import { ORACLE_MULTIPLIER, type Payout } from '$lib/predictions/predictions';
	import { formatFiat } from '$lib/utils';
	import type { PredictionMarketCreateEvent, ScalarMarketDataItem } from '@mijoco/stx_helpers';
	import { TrendingUp } from 'lucide-svelte';

	export let market: PredictionMarketCreateEvent;
	let categories = market.marketData.categories as ScalarMarketDataItem[];
	export let payouts: Array<Payout>;

	let selectedCategory: number | null = null;
</script>

<p>
	Cool down is in progress. The outcome is determined at the height of the first stacks block after the cool cool down expires <a href="/docs" class="font-medium text-red-600">see the docs</a> for more information.
</p>
<div class="mt-0">
	<BlockHeightProgressBar
		startBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0)}
		stopBurnHeight={(market.marketData.marketStart || 0) + (market.marketData.marketDuration || 0) + (market.marketData.coolDownPeriod || 0)}
	/>
</div>
<div class="mt-0 grid grid-cols-1 gap-4 md:grid-cols-3">
	{#each categories as category, index}
		<div class="flex flex-col gap-2">
			<button class="btn-gray-600 btn">
				<span class="text-bitcoinorange">{formatFiat(category.min / ORACLE_MULTIPLIER)}</span> &ge; x &lt <span class="text-bitcoinorange">{formatFiat(category.max / ORACLE_MULTIPLIER)}</span>
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
