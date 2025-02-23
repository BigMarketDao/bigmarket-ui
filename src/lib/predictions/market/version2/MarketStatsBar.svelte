<script lang="ts">
	import { getMarketToken } from '$lib/predictions/predictions';
	import { fmtMicroToStx } from '$lib/utils';
	import type { Sip10Data } from '@mijoco/stx_helpers';
	import { Users, TrendingUp, Wallet } from 'lucide-svelte';

	export let totalUsers = 1234;
	export let totalStaked: number;
	export let resolutionDate = '2024-04-01';
	export let token: string;
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
		<div class="stat-value text-secondary">{fmtMicroToStx(totalStaked, sip10Data.decimals)} {sip10Data.symbol}</div>
	</div>

	<div class="stat">
		<div class="stat-figure text-accent">
			<TrendingUp class="h-8 w-8" />
		</div>
		<div class="stat-title">Resolution Date</div>
		<div class="stat-value text-accent">{resolutionDate}</div>
	</div>
</div>
