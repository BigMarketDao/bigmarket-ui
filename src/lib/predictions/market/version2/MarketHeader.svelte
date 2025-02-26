<script lang="ts">
	import { getMarketStatus } from '$lib/predictions/market-states';
	import LogoContainer from '$lib/predictions/marketplace/LogoContainer.svelte';
	import LogoContainerSmall from '$lib/predictions/marketplace/LogoContainerSmall.svelte';
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers';
	import { Rocket } from 'lucide-svelte';

	export let market: PredictionMarketCreateEvent;
</script>

<!-- Market Header -->
<div class="card bg-neutral shadow-xl">
	<div class="card-body">
		<div class="flex flex-col items-start gap-6 sm:flex-row">
			<!-- Avatar Container -->
			<div class="avatar">
				<div>
					<!-- <div class="max-w-18 h-18 flex rounded-xl bg-primary/10 p-4 text-center"> -->
					<!-- <Rocket class="text-primary h-12 w-12 text-center" /> -->
					<LogoContainerSmall logo={market.unhashedData.logo} width={150} height={150} />
				</div>
			</div>

			<!-- Market Info Container -->
			<div class="flex-1">
				<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 class="card-title mb-2 text-3xl">{market.unhashedData.name}</h1>
						<p class="mb-4 text-lg text-base-content/70">{market.unhashedData.description}</p>
					</div>
					<div class="badge badge-success gap-2 p-4 sm:ml-4 sm:self-start">
						{getMarketStatus(market.marketData.resolutionState)}
					</div>
				</div>

				<!-- Divider & Resolution Criteria -->
				<div class="divider">Resolution Criteria</div>

				<ul class="list-inside list-disc space-y-2 text-base-content/70">
					{market.unhashedData.criterion?.criteria || 'Resolution criteria coming soon'}
				</ul>
			</div>
		</div>
	</div>
</div>
