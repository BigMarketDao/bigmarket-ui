<script lang="ts">
	import { readPythEvents } from '$lib/predictions/oracle';
	import { fetchMarkets } from '$lib/predictions/predictions';
	import { isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import { configStore } from '$stores/stores_config';
	import { getStacksNetwork, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { openContractCall } from '@stacks/connect';
	import { Cl, PostConditionMode } from '@stacks/transactions';
	import { onMount } from 'svelte';

	let markets: Array<PredictionMarketCreateEvent>;
	let txId: string;
	const stxUsdFeedId = 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';
	//'ec7a775f46379b5e943c3526b1c8d54cd49749176b0b98e02dde68d1bd335c17';
	//'0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'

	const readEvents = async () => {
		const response = await readPythEvents();
		console.log('readPythEvents: ', response);
	};

	const readPrice = async () => {
		const feedId = Cl.bufferFromHex(stxUsdFeedId); // Assumes the hash is a string of 32 bytes in hex format
		await openContractCall({
			network: getStacksNetwork($configStore.VITE_NETWORK),
			// network: STACKS_MAINNET,
			postConditions: [],
			postConditionMode: PostConditionMode.Deny,
			contractAddress: 'ST20M5GABDT6WYJHXBT5CDH4501V1Q65242SPRMXH',
			// contractAddress: 'SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY',
			contractName: 'pyth-oracle-v3',
			functionName: 'read-price-feed',
			functionArgs: [feedId, Cl.principal('ST20M5GABDT6WYJHXBT5CDH4501V1Q65242SPRMXH.pyth-storage-v3')],
			// functionArgs: [feedId, Cl.principal('SP3R4F6C1J3JQWWCVZ3S7FRRYPMYG6ZW6RZK31FXY.pyth-storage-v3')],
			onFinish: (data: any) => {
				txId = data.txId;
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	onMount(async () => {
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
							readEvents();
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
