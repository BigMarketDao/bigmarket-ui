<script lang="ts">
	import { readDiaPrice } from '$lib/predictions/oracle';
	import { fetchMarkets } from '$lib/predictions/predictions';
	import { isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import { getConfig } from '$stores/store_helpers';
	import { sessionStore } from '$stores/stores';
	import { getFirstStacksBlock, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	let markets: Array<PredictionMarketCreateEvent>;
	let txId: string;
	const stxUsdFeedId = 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';
	//'ec7a775f46379b5e943c3526b1c8d54cd49749176b0b98e02dde68d1bd335c17';
	//'0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'

	const readPrice = async () => {
		const result = await readDiaPrice('https://api.hiro.so', 'SP1G48FZ4Y7JY8G2Z0N51QTCYGBQ6F4J43J77BQC0', 'dia-oracle');
		console.log('readPrice: ', result);
	};
	onMount(async () => {
		// Example usage: Find the Stacks block for Bitcoin block 810000
		const stacksBlock = await getFirstStacksBlock(getConfig().VITE_STACKS_API, $sessionStore.poxInfo.current_burnchain_block_height).then(console.log);
		console.log('stacksBlock:', stacksBlock);
		markets = await fetchMarkets();
	});
</script>

<svelte:head>
	<title>Z-KYC ME</title>
	<meta name="description" content="Prove who you are without handing over the keys" />
</svelte:head>

<div class="mx-auto my-20 max-w-4xl py-4 md:px-6">
	<div class="my-2 flex w-full flex-col gap-10">
		<div class="flex text-3xl">Testing Oracle Integration</div>
		<div class=" flex">
			<div class="flex justify-start">
				{#if isLoggedIn()}
					<button
						class="bg-green-500 rounded-md bg-green-700 px-4 py-2 font-medium text-white shadow-sm hover:bg-green-600"
						on:click={() => {
							readPrice();
						}}
					>
						Read Events
					</button>
				{:else}
					<button
						class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-600"
						on:click={() => {
							loginStacksFromHeader(document);
						}}
					>
						Connect Wallet
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
