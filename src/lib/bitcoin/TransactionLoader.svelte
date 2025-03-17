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
	import { explorerAddressUrl } from '$lib/stacks/stacks-connect';
	import { bitcoinTxid, isLocalhost } from '$stores/stores';
	import AgentProxyStaking from './AgentProxyStaking.svelte';
	import { page } from '$app/state';

	let tx: ProofGenerationData;
	let proof: TransactionProofSet;
	let recentTransaction: RpcTransaction;

	let txId: string = '7b82f879ce99cb862e95239e4c2c88aece36dbe62c1b027c82d659bd513430a9'; // '28f1031eecb34a7be957e8f0d0ceeaa7d25a745edb2d3952727926b464f38bf5';
	let errorMessage: string | undefined;
	let ready = false;
	let showPredicitionContract = false;

	function toggleContract() {
		showPredicitionContract = !showPredicitionContract;
	}

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

	const getProofFromCore = async () => {
		try {
			if (!txId) {
				errorMessage = `Recent mainnet transactions only - check <a href="${getConfig().VITE_MEMPOOL_API}" target="_blank">mempool</a>`;
				return;
			}
			errorMessage = undefined;
			//return recentTxFromFile();
			ready = false;
			//const result = await getProofDataRecent(2);
			const result = await getProofData(txId, false);
			proof = result.proof;
			proof.contract = getConfig().VITE_CLARITY_BITCOIN;
			txId = result.data.txid;
			console.log(result.proof);
			//getBtcProofInner(result);
		} catch (error: any) {
			errorMessage = `Recent mainnet transactions only - check <a href="https://mempool.space/tx/7b82f879ce99cb862e95239e4c2c88aece36dbe62c1b027c82d659bd513430a9" target="_blank">mempool</a>`;
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
		// if ($bitcoinTxid) {
		// 	txId = $bitcoinTxid.txid || $bitcoinTxid;
		// 	await getProofFromCore();
		// }
		ready = true;
	});
</script>

<div class="min:h-screen flex w-full flex-col gap-y-1">
	<div class="mb-5 flex flex-col gap-y-5">
		<p class="flex text-2xl">
			Merklise transaction
			<Bulletin message={'Enter a bitcoin txid for merkle proof information'} trigger={'marketCounter'}>
				<span slot="title">{''}</span>
			</Bulletin>
		</p>
		<div>
			<p>Bitcoin mainnet only - the node is pruned (currently to 500 blocks).</p>
			<p>Works with the <a class="text-bloodorange hover:underline" href={explorerAddressUrl('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.clarity-bitcoin-lib-v5')} target="_blank">clarity-bitcoin-v5</a> contract</p>
		</div>
	</div>

	<div class="flex gap-x-5">
		<div class="grow">
			<input type="text" placeholder="Enter recent bitcoin mainnet transaction id" class="block w-full rounded-md border p-3 text-black" bind:value={txId} />
		</div>
		<div class="">
			{#if ready}
				<Button class="btn btn-primary text-black" target={''} on:click={() => getProofFromCore()}>Load Transaction</Button>
			{:else}
				<RefreshCwIcon className="animate-spin" />
			{/if}
		</div>
	</div>
	{#if $isLocalhost && proof}
		<div class="mt-4 flex items-start justify-start gap-x-5">
			<label class="relative inline-flex cursor-pointer items-center">
				<input type="checkbox" class="peer sr-only" on:change={toggleContract} />
				<div class="peer h-5 w-9 rounded-full bg-blue-600 after:absolute after:start-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-gray-600 peer-checked:after:translate-x-4"></div>
			</label>
			<span class="ps-2 font-inter font-medium"
				>{#if !showPredicitionContract}Clarity-Bitcoin Contract{:else}Prediction Market Contract{/if}</span
			>
		</div>
	{/if}
	{#if errorMessage}
		<div class="my-5"><Banner bannerType="info" message={errorMessage}></Banner></div>
	{/if}

	<div class="">
		{#if proof}
			{#if showPredicitionContract}
				<div class="my-5">
					<AgentProxyStaking {proof} />
				</div>
			{/if}
			<ClarityBitcoin {proof} />
		{/if}
	</div>
</div>
