<script lang="ts">
	import { ORACLE_MULTIPLIER } from '$lib/predictions/predictions';
	import { formatFiat } from '$lib/utils';

	export let categories: Array<{ min: number; max: number }>;
	export let winningIndex: number | null = null;

	// Optional number formatting util
	function formatRange(min: number, max: number): string {
		return `${formatFiat(min / ORACLE_MULTIPLIER, false)} → ${formatFiat(max / ORACLE_MULTIPLIER, false)}`;
	}
</script>

<div class="space-y-2 bg-transparent py-4 shadow">
	<p class="text-2xl text-white">Resolution in progress.</p>

	{#if winningIndex !== null}
		<p class="text-sm text-white">
			Preliminary outcome is:
			<span class="font-medium text-primary">
				{formatRange(categories[winningIndex].min, categories[winningIndex].max)}
			</span>
		</p>
	{/if}

	<div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
		{#each categories as category, index}
			<div class={`rounded border p-3 text-sm transition ${index === winningIndex ? 'bg-blue-50 border-primary font-semibold text-primary' : 'border-gray-200 hover:border-gray-300'}`}>
				{formatRange(category.min, category.max)}
			</div>
		{/each}
	</div>
</div>
