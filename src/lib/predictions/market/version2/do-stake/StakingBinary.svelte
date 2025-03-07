<script lang="ts">
	import type { Payout } from '$lib/predictions/predictions';
	import { bitcoinMode } from '$stores/stores';
	import { TrendingUp } from 'lucide-svelte';

	export let doPrediction: (index: number) => void;
	export let payouts: Array<Payout>;

	let selectedCategory: number | null = null;
</script>

<div class="mt-6 grid grid-cols-2 justify-around gap-4">
	<div class="flex flex-col gap-2">
		<button
			on:click={() => {
				doPrediction(1);
			}}
			class="btn btn-primary {selectedCategory === 1 ? 'btn-active' : ''}"
		>
			I AGREE
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
						{payouts[1].btc}
					{:else}
						{payouts[1].crypto}
					{/if}
					/ {payouts[1].fiat}
				</div>
			{/if}
		</div>
	</div>
	<div class="flex flex-col gap-2">
		<button
			on:click={() => {
				doPrediction(0);
			}}
			class="btn btn-primary {selectedCategory === 0 ? 'btn-active' : ''}"
		>
			I DISAGREE
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
						{payouts[0].btc}
					{:else}
						{payouts[0].crypto}
					{/if}
					/ {payouts[0].fiat}
				</div>
			{/if}
		</div>
	</div>
</div>
