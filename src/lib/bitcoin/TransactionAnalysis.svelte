<script lang="ts">
	import VerifyTransactions from './VerifyTransactions.svelte';
	import { sessionStore } from '$stores/stores';
	import { onMount } from 'svelte';
	import { fetchBlockByHash, fetchBlockByHashWithTransactionIds, fetchTransaction, fetchTransactionHex } from '@mijoco/btc_helpers/dist/index';
	import { getConfig } from '$stores/store_helpers';
	import { Button } from 'flowbite-svelte';

	let blockHash: any;
	let tx: any;
	let txs: Array<string>;
	let block: any;
	export let txId: string; // = '01d8467b25e1d415bf53427d4db86fe001590b280b604204f794c5ecfc923ed3';
	let error: string | undefined;
	let ready = false;
	let componentKey = 0;
	export let feature = 'sbtcDecode';

	const clazzOn =
		"bg-white relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-white before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]";
	const clazzOff =
		"         relative float-left -ml-[1.5rem] mr-1 mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-white before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]";

	const verify = async () => {
		tx = await fetchTransaction(getConfig().VITE_MEMPOOL_API, txId);
		$sessionStore.userSettings.testAddress = txId;
		sessionStore.update(() => $sessionStore);
		try {
			blockHash = tx.status ? tx.status.block_hash : tx.blockhash;
			if (blockHash) {
				//block = await fetchBitcoinBlock(blockHash, 2)
				block = await fetchBlockByHash(getConfig().VITE_MEMPOOL_API, blockHash);
				txs = await fetchBlockByHashWithTransactionIds(getConfig().VITE_MEMPOOL_API, blockHash);
				block.txs = txs;
				ready = true;

				console.log(block);
			}
		} catch (err: any) {
			block = true;
		}
		componentKey++;
	};

	onMount(async () => {
		if (!txId) return;
		verify();
	});
</script>

<div class="flex w-full flex-col">
	<div class="mb-5 text-2xl">Verify transactions</div>
	{#if error}<p class="text-danger">{error}</p>{/if}

	<div class="pb-5">
		<label for="transact-path">Enter txId</label>
		<input type="text" class="block w-full rounded-md border p-3 text-black" bind:value={txId} />
	</div>

	<div class="flex gap-x-5 pb-5">
		<div class="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
			<input
				class={feature === 'sbtcDecode' ? clazzOn : clazzOff}
				type="radio"
				name="sbtcDecode"
				id="radioDefault02"
				on:click={() => {
					feature = 'sbtcDecode';
					verify();
				}}
				bind:value={feature}
				checked
			/>
			<label class="mt-px inline-block pl-[0.15rem] hover:cursor-pointer" for="radioDefault02"> sBTC decode </label>
		</div>
		<div class="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
			<input
				class={feature === 'sbtcDecode' ? clazzOff : clazzOn}
				type="radio"
				name="merkleProof"
				on:click={() => {
					feature = 'merkleProof';
					verify();
				}}
				bind:value={feature}
				id="radioDefault01"
			/>
			<label class="mt-px inline-block pl-[0.15rem] hover:cursor-pointer" for="radioDefault01"> Merkle proofs </label>
		</div>
	</div>

	<div class="pb-5">
		<Button target={''} on:click={() => verify()}>{feature === 'sbtcDecode' ? 'Decode sBTC' : 'Merkle Proof'}</Button>
	</div>

	{#if block}
		<div class="">
			{#if tx}
				{#if feature === 'sbtcDecode'}
					<!-- <DecodeSbtc {tx} /> -->
				{:else if block && block.txs}
					<VerifyTransactions {tx} {block} />
				{/if}
			{/if}
		</div>
	{/if}
</div>
