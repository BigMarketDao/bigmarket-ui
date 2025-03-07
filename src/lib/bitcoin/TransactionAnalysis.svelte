<script lang="ts">
	import VerifySegwitTransaction from './VerifySegwitTransaction.svelte';
	import { onMount } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import { fetchBlockByHash, fetchBlockByHashWithTransactionIds, fetchTransaction, fetchTransactionHex } from '@mijoco/btc_helpers/dist/index';
	import { getConfig } from '$stores/store_helpers';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { hex } from '@scure/base';
	import { ensureEven } from './merkle_utils';
	import { fetch80ByteBlockHeader } from './clarity-bitcoin';
	import * as btc from '@scure/btc-signer';

	let tx: any;
	let txId = 'f6f890ee8f0c4e2e139c6cb759902c7d58a607983e27c9b658d055691b996527'; // '28f1031eecb34a7be957e8f0d0ceeaa7d25a745edb2d3952727926b464f38bf5';
	let errorMessage: string | undefined;
	let ready = false;
	let componentKey = 0;

	function reverse(txs: Array<string>) {
		const txIds = txs.map(function (tx: any) {
			return hex.encode(hex.decode(tx).reverse());
		});
		return txIds;
	}

	const fetchAndPrepare = async () => {
		if (txId) {
			ready = false;
			const mempoolTx = (await fetchTransaction(getConfig().VITE_MEMPOOL_API, txId)) as any;
			if (!mempoolTx) {
				throw new Error('No transaction found on network ' + getConfig().VITE_NETWORK + ' for txid: ' + txId);
			}
			const blockHash = mempoolTx.status ? mempoolTx.status.block_hash : mempoolTx.blockhash;
			const block = await fetchBlockByHash(getConfig().VITE_MEMPOOL_API, blockHash);
			const header = await fetch80ByteBlockHeader(getConfig().VITE_MEMPOOL_API, blockHash);
			const txs = await fetchBlockByHashWithTransactionIds(getConfig().VITE_MEMPOOL_API, blockHash);
			block.txs = txs;
			block.header = header;
			block.reversedTxIds = ensureEven(reverse(txs));

			const txHex = await fetchTransactionHex(getConfig().VITE_MEMPOOL_API, txId);
			if (!txHex) {
				throw new Error('No transaction found on network ' + getConfig().VITE_NETWORK + ' for txid: ' + txId);
			}
			const parsedTx = btc.Transaction.fromRaw(hex.decode(txHex));

			const ctxHex = await fetchTransactionHex(getConfig().VITE_MEMPOOL_API, block.txs[0]); // Coinbase tx is always first
			if (!ctxHex) {
				throw new Error('No coinbase transaction found on network ' + getConfig().VITE_NETWORK + ' for txid: ' + block.txs[0]);
			}
			const parsedCTx = btc.Transaction.fromRaw(hex.decode(ctxHex));

			tx = {
				txId: txId,
				hex: hex.encode(parsedTx.toBytes(false, false)),
				whex: hex.encode(parsedTx.toBytes(true, true)),
				chex: hex.encode(parsedCTx.toBytes(false, false)),
				cwhex: hex.encode(parsedCTx.toBytes(true, true)),
				block
			};

			ready = true;
			componentKey++;
		}
	};

	onMount(async () => {});
</script>

<div class="flex w-full flex-col">
	<div class="mb-5 text-2xl">Lookup transaction</div>
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
