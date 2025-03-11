<script lang="ts">
	import ClarityBitcoin from './ClarityBitcoin.svelte';
	import { onMount } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import Banner from '$lib/components/ui/Banner.svelte';
	import Bulletin from '$lib/components/ui/Bulletin.svelte';
	import { getBtcProof, getProofData, getProofDataRecent, getProofGenDataRecent } from './api';
	import { getConfig } from '$stores/store_helpers';
	import { hex } from '@scure/base';
	import { sha256 } from '@noble/hashes/sha256';
	import type { ProofGenerationData, ProofRequest, RpcBlock, RpcTransaction, TransactionProofSet } from './proof-types';
	import type { TxProofResult } from 'bitcoin-tx-proof';
	import { splitMerkleProof } from '$lib/utils';
	import { k1, m1 } from './test';
	import { RefreshCwIcon } from 'lucide-svelte';

	let tx: ProofGenerationData;
	let proof: TransactionProofSet;
	let recentTransaction: RpcTransaction;
	//0: "9fb3ab2efe81d0f7ccdbde780a857af5669d923d4479745a2e486c0dedf12f1f"
	//1: "f6f890ee8f0c4e2e139c6cb759902c7d58a607983e27c9b658d055691b996527"
	//2: "8b6c4cde19532cd65e44a06cd3fd58af71d0b42e5597e49da27247e238ae2b73

	let txId: string; //'f6f890ee8f0c4e2e139c6cb759902c7d58a607983e27c9b658d055691b996527'; // '28f1031eecb34a7be957e8f0d0ceeaa7d25a745edb2d3952727926b464f38bf5';
	let errorMessage: string | undefined;
	let ready = false;

	const convert = (proof1: TxProofResult, proof2: TransactionProofSet): TransactionProofSet => {
		return {
			contract: getConfig().VITE_CLARITY_BITCOIN,
			wproof: splitMerkleProof(proof1.witnessMerkleProof),
			cproof: splitMerkleProof(proof1.coinbaseMerkleProof),
			txId: proof2.txId,
			txIdReversed: proof2.txIdReversed,
			txId0Reversed: proof2.txId0Reversed,
			height: proof1.blockHeight,
			txHex: proof1.transaction,
			header: proof1.blockHeader,
			txIndex: proof1.txIndex,
			treeDepth: proof1.merkleProofDepth,
			merkleRoot: proof1.witnessMerkleProof.split(' ')[0],
			witnessMerkleRoot: proof1.witnessMerkleProof.split(' ')[0],
			witnessReservedValue: proof1.witnessReservedValue,
			ctxHex: proof1.coinbaseTransaction,
			segwit: proof2.segwit
		};
	};

	const fetchAndPrepare = async () => {
		if (txId) {
			errorMessage = undefined;
			ready = false;
			tx = await getProofGenDataRecent(2);
			const result = await getProofDataRecent(2);
			proof = result.proof;
			proof.contract = getConfig().VITE_CLARITY_BITCOIN;
			console.log('PROOF: ', proof);
			console.log('CB: merkle root: ' + proof.merkleRoot);
			console.log('CB: merkle root rev: ' + hex.encode(hex.decode(proof.merkleRoot).reverse()));

			console.log('CB: tx.chex: ' + tx.ctxhex);
			console.log('CB Computed TXID:', hex.encode(sha256(sha256(hex.decode(tx.ctxhex)))));

			console.log('TX: : ' + tx.txId);
			console.log('TX-R: : ' + hex.encode(hex.decode(tx.txId).reverse()));
			console.log('Computed TXID:', hex.encode(sha256(sha256(hex.decode(tx.txhex)))));
		}
		ready = true;
	};

	const getBtcProofInner = async (result: { proof: TransactionProofSet; data: ProofRequest }) => {
		const proof1: TxProofResult = await getBtcProof(result.data.txid, result.data.block.height);
		console.log(proof1);
		//proof = convert(proof1, result.proof);
		return proof1;
	};

	const recentTx = async () => {
		try {
			if (!txId) {
				errorMessage = 'please enter a recent (less than 3 days) old bitcoin txid';
				return;
			}
			errorMessage = undefined;
			//return recentTxFromFile();
			ready = false;
			//const result = await getProofDataRecent(2);
			const result = await getProofData(txId);
			proof = result.proof;
			proof.contract = getConfig().VITE_CLARITY_BITCOIN;
			txId = result.data.txid;
			console.log(result.proof);
			//getBtcProofInner(result);
		} catch (error: any) {
			errorMessage = error.message;
		}
		ready = true;
	};

	const recentTxFromFile = async () => {
		errorMessage = undefined;
		ready = false;
		txId = m1.txId;
		const proofM: TransactionProofSet = m1;
		const proofK: TxProofResult = k1;
		proof = proofM; //convert(proof1, result.proof);
		proof.contract = getConfig().VITE_CLARITY_BITCOIN;
		ready = true;
	};

	onMount(async () => {
		ready = true;
	});
</script>

<div class="flex w-full flex-col">
	<div class="mb-5 flex text-2xl">
		Lookup transaction
		<Bulletin message={'Enter a bitcoin txid for merkle proof information'} trigger={'marketCounter'}>
			<span slot="title">{''}</span>
		</Bulletin>
	</div>
	<div class="pb-5">
		<input type="text" placeholder="Enter bitcoin transaction id" class="block w-full rounded-md border p-3 text-black" bind:value={txId} />
	</div>
	<div class="flex gap-x-5">
		<!-- <div class="">
			<Button class="btn btn-primary text-black" target={''} on:click={() => fetchAndPrepare()}>Lookup Transaction</Button>
		</div> -->

		<div class="">
			{#if ready}
				<Button class="btn btn-primary text-black" target={''} on:click={() => recentTx()}>Recent Transaction</Button>
			{:else}
				<RefreshCwIcon className="animate-spin" />
			{/if}
		</div>
	</div>
	{#if errorMessage}
		<div class="my-5"><Banner bannerType="info" message={errorMessage}></Banner></div>
	{/if}

	<div class="">
		{#if ready}
			<ClarityBitcoin {proof} />
		{/if}
	</div>
</div>
