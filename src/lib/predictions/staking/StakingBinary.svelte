<script lang="ts">
	import { onMount } from 'svelte';

	export let castVote: (index: number) => void;

	let selectedCategory: number | null = null;

	function handleVote(index: number) {
		selectedCategory = index;
		castVote(index);
	}
</script>

<div class="my-4 flex w-full flex-wrap gap-x-2">
	<button
		on:click={() => {
			castVote(1);
		}}
		class="w-full flex-1 rounded px-4 py-2 text-white transition-all duration-300 sm:w-auto
			{selectedCategory === 1 ? 'bg-success-600' : 'bg-success-700 hover:bg-success-500'}"
	>
		I AGREE
	</button>
	<button
		on:click={() => {
			castVote(0);
		}}
		class="w-full flex-1 rounded px-4 py-2 text-white transition-all duration-300 sm:w-auto
			{selectedCategory === 1 ? 'bg-success-600' : 'bg-success-700 hover:bg-success-500'}"
	>
		I DISAGREE
	</button>
</div>
