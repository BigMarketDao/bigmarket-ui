<script lang="ts">
	import type { PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import CategoryFilter from './CategoryFilter.svelte';
	import MarketEntry from './info/MarketEntry.svelte';
	import { Search } from 'lucide-svelte';

	export let markets: Array<PredictionMarketCreateEvent> = [];
	let filteredMarkets: Array<PredictionMarketCreateEvent> = [];
	let category: string;
	let searchTerm = '';

	$: {
		filteredMarkets = markets.filter((market) => {
			const matchesSearch = searchTerm === '' || market.unhashedData.name.toLowerCase().includes(searchTerm.toLowerCase()) || market.unhashedData.description.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesCategory = !category || category === 'all' || market.unhashedData.category === category;

			return matchesSearch && matchesCategory;
		});
	}

	const handleSelectCategory = (newCategory: string) => {
		category = newCategory;
	};

	const handleSearch = () => {
		// Search is already reactive through the $: block above
		console.log('Searching for:', searchTerm);
	};

	onMount(async () => {
		filteredMarkets = markets;
	});
</script>

<div class="space-y-8">
	<!-- Search and Filter Section -->
	<div class="relative overflow-hidden rounded-xl border border-purple-900/20 bg-[#0F1225]/50 p-6 backdrop-blur-sm">
		<div class="relative z-10 space-y-6">
			<!-- Search Bar -->
			<div class="flex gap-4">
				<div class="relative flex-1">
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="Search markets..."
						class="placeholder-indigo-300/50 w-full rounded-lg border border-purple-900/20 bg-[#151B2D]/50 px-4 py-3 pl-12 text-white backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
					/>
					<Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400" />
				</div>
				<button on:click={handleSearch} class="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white transition-all hover:bg-purple-700"> Search </button>
			</div>

			<!-- Category Filter -->
			<CategoryFilter onSelectCategory={handleSelectCategory} />
		</div>
	</div>

	<!-- Market List -->
	<div class="space-y-4">
		<h2 class="text-2xl font-bold text-white">All Markets</h2>
		<div class="space-y-4">
			{#each filteredMarkets as market}
				<MarketEntry {market} />
			{/each}
		</div>
	</div>
</div>
