<script lang="ts">
	import type { Payout } from '$lib/predictions/predictions';
	import { bitcoinMode } from '$stores/stores';
	import { TrendingUp } from 'lucide-svelte';

	export let categories: string[] = [];
	export let doPrediction: (index: number) => void;
	export let payouts: Array<Payout>;

	let selectedCategory: number | null = null;
</script>

<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
	{#each categories as category, index}
		<div class="flex flex-col gap-2">
			<button on:click={() => doPrediction(index)} class="btn btn-primary {selectedCategory === index ? 'btn-active' : ''}">
				{category}
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
						for $100 stake is {#if $bitcoinMode}
							{payouts[index].btc}
						{:else}
							{payouts[index].crypto}
						{/if}
						/ {payouts[index].fiat}
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
