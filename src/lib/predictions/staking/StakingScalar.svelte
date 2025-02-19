<script lang="ts">
	import type { ScalarMarketDataItem } from '@mijoco/stx_helpers';

	export let categories: Array<ScalarMarketDataItem> = [];
	export let castVote: (index: number) => void;

	let selectedCategory: number | null = null;

	function handleVote(index: number) {
		selectedCategory = index;
		castVote(index);
	}
</script>

<div class="my-4 flex w-full flex-wrap gap-x-2">
	{#each categories as category, index}
		<button
			on:click={() => handleVote(index)}
			class="w-full flex-1 rounded px-4 py-2 text-white transition-all duration-300 sm:w-auto
                {selectedCategory === index ? 'bg-success-600' : 'bg-success-700 hover:bg-success-500'}"
		>
			{category.min} &ge; x &lt {category.max}
		</button>
	{/each}
</div>
