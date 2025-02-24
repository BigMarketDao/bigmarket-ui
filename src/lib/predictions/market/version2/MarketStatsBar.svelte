<script lang="ts">
	import { dateOfResolution } from '$lib/predictions/market-states';
	import { getMarketToken, totalPoolSum } from '$lib/predictions/predictions';
	import { fmtMicroToStx, trimTrailingZeros } from '$lib/utils';
	import type { PredictionMarketCreateEvent, Sip10Data } from '@mijoco/stx_helpers';
	import { Users, TrendingUp, Wallet } from 'lucide-svelte';

	export let market: PredictionMarketCreateEvent = {} as PredictionMarketCreateEvent;
	export let totalUsers: number;
	let totalStaked: number = totalPoolSum(market.marketData.stakes);
	let resolutionDate = dateOfResolution(market);
	let token: string = market.marketData.token;
	let sip10Data: Sip10Data = getMarketToken(token);
</script>

<!-- Market Stats Bar -->
<div class="stats stats-vertical w-full bg-neutral shadow lg:stats-horizontal">
	<div class="stat">
		<div class="stat-figure text-primary">
			<Users class="h-8 w-8" />
		</div>
		<div class="stat-title">Total Stakes</div>
		<div class="stat-value text-primary">{totalUsers}</div>
	</div>

	<div class="stat">
		<div class="stat-figure text-secondary">
			<Wallet class="h-8 w-8" />
		</div>
		<div class="stat-title">Total Staked</div>
		<div class="stat-value text-secondary">{trimTrailingZeros(fmtMicroToStx(totalStaked, sip10Data.decimals))} {sip10Data.symbol}</div>
	</div>

	<div class="stat">
		<div class="stat-figure text-accent">
			<TrendingUp class="h-8 w-8" />
		</div>
		<div class="stat-title pb-2">Resolution Date</div>
		<div class="stat-value mt-[-5px] text-sm leading-snug text-accent">BTC {resolutionDate.onChain}<br />~ {resolutionDate.offChain}</div>
	</div>
</div>
