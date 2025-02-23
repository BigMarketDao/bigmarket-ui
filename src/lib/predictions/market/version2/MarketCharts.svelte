<script lang="ts">
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers';
	import StakeChart from './do-charts/StakeChart.svelte';
	import TvlChart from './do-charts/TVLChart.svelte';

	export let market: PredictionMarketCreateEvent;
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	<!-- Total Staked Chart -->
	<div class="card bg-neutral shadow-xl">
		<div class="card-body">
			<StakeChart {market} title={'Stake History'} />
		</div>
	</div>

	<!-- Probability Chart -->
	<div class="card bg-neutral shadow-xl">
		<div class="card-body">
			<TvlChart {market} title={'TVL'} />
		</div>
	</div>
</div>
