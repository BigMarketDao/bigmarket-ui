<script lang="ts">
	import { dateOfResolution, isResolved, isResolving } from '$lib/predictions/market-states';
	import { btcToken, convertSip10ToBtc, getMarketToken, totalPoolSum } from '$lib/predictions/predictions';
	import { fmtMicroToStx, fmtMicroToStxNumber, trimTrailingZeros } from '$lib/utils';
	import { bitcoinMode } from '$stores/stores';
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
		<div class="stat-value text-primary"><a href={`/market/analysis/${market.marketId}/${market.marketType}`}>{totalUsers}</a></div>
	</div>

	<div class="stat">
		<div class="stat-figure text-secondary">
			<Wallet class="h-8 w-8" />
		</div>
		<div class="stat-title">Total Staked</div>
		{#if $bitcoinMode}
			<div class="stat-value text-secondary">{trimTrailingZeros(convertSip10ToBtc(sip10Data, fmtMicroToStxNumber(totalStaked, btcToken.decimals)))} {btcToken.symbol}</div>
		{:else}
			<div class="stat-value text-secondary">{trimTrailingZeros(fmtMicroToStx(totalStaked, sip10Data.decimals))} {sip10Data.symbol}</div>
		{/if}
	</div>

	<div class="stat">
		<div class="stat-figure text-accent">
			<TrendingUp class="h-8 w-8" />
		</div>
		{#if market.marketType === 2}
			<div class="stat-title">Resolves</div>
			<div class="stat-value mt-[-5px] text-sm leading-snug text-secondary">BTC {resolutionDate.onChain}<br />~ {resolutionDate.offChain}</div>
		{:else if isResolving(market) || isResolved(market)}
			<div class="stat-title">Resolved</div>
			<div class={'stat-value text-gray-900 '}>{resolutionDate.offChain}</div>
		{:else}
			<div class="stat-title">Resolves</div>
			<div class={'stat-value text-secondary'}>{resolutionDate.offChain}</div>
		{/if}
	</div>
</div>
