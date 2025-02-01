<script lang="ts">
	import { type MarketCategory } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { getMarketCategories } from '../predictions';

	export let onSelectCategory: any;

	function addCategory(event: any) {
		if (!event || !event.target || !event.target.value) return;
		const token = event.target.value;
		onSelectCategory(token);
	}

	let categories: Array<MarketCategory>;

	onMount(async () => {
		categories = await getMarketCategories();
	});
</script>

<div class="">
	<label for="poll-description" class="mb-1 block text-sm font-medium text-gray-700">Market category</label>
	{#if categories}
		<select id="popular-contracts" on:change={(e) => addCategory(e)} class="h-10 w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500">
			<option value="" disabled selected>-- Select a Market Category --</option>
			{#each categories as category}
				{#if category.active}
					<option value={category.name}>{category.displayName}</option>
				{/if}
			{/each}
		</select>
	{/if}
</div>
