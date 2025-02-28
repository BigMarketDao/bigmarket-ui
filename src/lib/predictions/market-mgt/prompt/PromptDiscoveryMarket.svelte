<script lang="ts">
	import { onMount } from 'svelte';
	import { explorerTxUrl, getStxAddress, isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { createMarketAIDiscovery } from '$lib/predictions/predictions';

	let inited = false;
	let source: string;

	let errorMessage: string = '';

	let txId: string;

	const login = async () => {
		loginStacksFromHeader(document);
		txId = '';
	};

	const promptMarketCreation = async () => {
		await createMarketAIDiscovery(getStxAddress(), source);
	};

	onMount(async () => {
		inited = true;
	});
</script>

<div class="py-6">
	<!-- Page Heading -->
	<h1 class="mb-6 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-800">Create a New Prediction Market</h1>

	{#if inited}
		<div class="mx-auto max-w-3xl space-y-6">
			{#if txId}
				<div class="mb-3">
					<Banner bannerType={'warning'} message={`Market is being set up on chain - <a href=${explorerTxUrl(txId)} target="_blank">see transaction</a>!`} />
				</div>
			{/if}
			{#if errorMessage}
				<div class="mb-3">
					<Banner bannerType={'danger'} message={errorMessage} />
				</div>
			{/if}
			<!-- Accordion: Markets Info -->
			<div class="rounded-md border shadow-md">
				<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#markets-info"> Prompt a Market </button>
				<div id="markets-info" class="px-4 py-4">
					<p class="mb-4">Enter the url of a news story you want to create a market for.</p>
				</div>
				<div id="poll-info" class="px-4 py-4">
					<div class="space-y-4">
						<div>
							<label for="discovery-source" class="mb-1 block text-sm font-medium">Source (url)</label>
							<input id="discovery-source" type="text" bind:value={source} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						<button on:click={() => promptMarketCreation()} class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#poll-info"> send </button>
					</div>
				</div>
			</div>
			<!-- <CriteriaSelection bind:criteria marketType={1} /> -->

			<!-- Submit Section -->
			{#if txId}
				<div class="mb-3">
					<Banner bannerType={'warning'} message={`Market is being set up on chain - <a href=${explorerTxUrl(txId)} target="_blank">see transaction</a>!`} />
				</div>
			{/if}
			{#if errorMessage}
				<div class="mb-3">
					<Banner bannerType={'danger'} message={errorMessage} />
				</div>
			{/if}
			<div class="flex justify-end space-x-4">
				{#if isLoggedIn()}
					<button
						class="bg-green-500 rounded-md px-4 py-2 font-medium text-white shadow-sm hover:bg-green-600"
						on:click={() => {
							errorMessage = '';
							promptMarketCreation();
						}}
					>
						Create Market
					</button>
				{:else}
					<button
						class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-600"
						on:click={() => {
							errorMessage = '';
							loginStacksFromHeader(document);
						}}
					>
						Connect Wallet
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
