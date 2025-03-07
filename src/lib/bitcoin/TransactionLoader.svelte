<script lang="ts">
	import VerifySegwitTransaction from './ClarityBitcoin.svelte';
	import { onMount } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { fetchApiData } from './bitcoin';
	import Bulletin from '$lib/components/ui/Bulletin.svelte';
	import type { TxForClarityBitcoin } from './proof-types';

	let tx: TxForClarityBitcoin;
	let txId = 'f6f890ee8f0c4e2e139c6cb759902c7d58a607983e27c9b658d055691b996527'; // '28f1031eecb34a7be957e8f0d0ceeaa7d25a745edb2d3952727926b464f38bf5';
	let errorMessage: string | undefined;
	let ready = false;
	let componentKey = 0;

	const fetchAndPrepare = async () => {
		if (txId) {
			ready = false;
			tx = await fetchApiData(txId);
			ready = true;
			componentKey++;
		}
	};

	onMount(async () => {});
</script>

<div class="flex w-full flex-col">
	<div class="mb-5 flex text-2xl">
		Lookup transaction
		<Bulletin message={'Known issue if txid is the coinbase'} trigger={'marketCounter'}>
			<span slot="title">{''}</span>
		</Bulletin>
	</div>
	<div class="pb-5">
		<input type="text" placeholder="Enter bitcoin transaction id" class="block w-full rounded-md border p-3 text-black" bind:value={txId} />
	</div>
	<div class="pb-5">
		<Button class="btn btn-primary text-black" target={''} on:click={() => fetchAndPrepare()}>Lookup Transaction</Button>
	</div>

	{#if errorMessage}
		<div class="my-5"><Banner bannerType="info" message={errorMessage}></Banner></div>
	{/if}

	<div class="">
		{#if ready}
			{#key componentKey}
				<VerifySegwitTransaction {tx} />
			{/key}
		{/if}
	</div>
</div>
