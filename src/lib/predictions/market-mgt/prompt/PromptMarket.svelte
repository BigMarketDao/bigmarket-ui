<script lang="ts">
	import { onMount } from 'svelte';

	export let promptMarket;
	let source: string;
	let suggestion: string;

	const prompt = async (mechanism: number) => {
		await promptMarket({ mechanism, source, suggestion });
	};

	onMount(async () => {});
</script>

<div class="flex flex-col">
	<div class="flex flex-col gap-y-5">
		<div id="markets-info" class="">
			<p class="">Either, enter the url of a news story you want to create a market for.</p>
		</div>
		<div>
			<label for="discovery-source" class="mb-1 block text-sm font-medium">Source (url)</label>
			<input bind:value={source} id="discovery-source" type="text" class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
		</div>
		<div class="flex justify-end">
			<button
				class="cursor-auto rounded-md bg-primary px-4 py-2 font-medium text-black shadow-sm hover:bg-purple-600"
				on:click={() => {
					prompt(2);
				}}
			>
				Generate Market
			</button>
		</div>
	</div>
	<div class="flex flex-col gap-y-5">
		<div id="markets-info" class="">
			<p class="">Or, enter a suggestion you want to create a market for.</p>
		</div>
		<div class="">
			<textarea bind:value={suggestion} class="w-full rounded-md p-5 font-inter font-medium text-black" placeholder="describe criteria for resolving this market..." rows="5">{suggestion}</textarea>
		</div>
		<div class="flex justify-end">
			<button
				class="cursor-auto rounded-md bg-primary px-4 py-2 font-medium text-black shadow-sm hover:bg-purple-600"
				on:click={() => {
					prompt(1);
				}}
			>
				Generate Market
			</button>
		</div>
	</div>
</div>
