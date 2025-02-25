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

<div class="rounded-md border shadow-md">
	<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#vote-gating"> Market Category </button>
	<div id="markets-info" class="px-4 py-4">
		<p class="mb-0 text-gray-700">Which market sector will the market operate within?</p>
	</div>
	<div id="vote-gating" class="py-2">
		<div class="mx-auto px-4 text-white shadow-md">
			<div class="mb-6">
				{#if categories}
					<select id="popular-contracts" on:change={(e) => addCategory(e)} class="h-10 w-full rounded-md border-gray-300 px-4 py-3 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500">
						<option value="" disabled selected>-- Select a Category --</option>
						{#each categories as category}
							{#if category.active}
								<option value={category.name}>{category.displayName}</option>
							{/if}
						{/each}
					</select>
				{/if}
			</div>
		</div>
	</div>
</div>
