<script lang="ts">
	import { hex } from '@scure/base';
	import { onMount } from 'svelte';
	import { explorerAddressUrl } from '$lib/stacks/stacks-connect';
	import { Button } from 'flowbite-svelte';
	import { extractProofInfo, type SegwitData } from './generate_segwit_proofs';
	import { sha256 } from '@noble/hashes/sha256';
	import { contract, getBcHHash, parseBlockHeader, parseTx, parseWTx, verifyBlockHeader, verifyMerkleProof, wasSegwitTxMinedCompact, wasTxMinedCompact } from './clarity-bitcoin';
	import Banner from '$lib/components/ui/Banner.svelte';

	export let tx: any;
	let proof: SegwitData;
	let inited = false;
	let errorMessage: string | undefined;
	let lastCall: string | undefined;
	let showTree: boolean;
	let blockHashCheck = false;
	let result: any;

	const wasSegwitTxMined = async () => {
		result = await wasSegwitTxMinedCompact(proof);
		lastCall = 'Was Segwit Tx Mined';
	};

	const getBcH = async () => {
		result = await getBcHHash(proof);
		lastCall = 'Get Header hash';
	};

	const wasTxMined = async () => {
		result = await wasTxMinedCompact(proof);
		lastCall = 'Was Tx Mined';
	};

	const verifyBlock = async () => {
		result = await verifyBlockHeader(proof);
		lastCall = 'Verify Block Header';
	};

	const verifyMerkle = async () => {
		result = await verifyMerkleProof(proof);
		lastCall = 'Verify Merkle';
	};

	const parseT = async () => {
		result = await parseTx(proof);
		lastCall = 'Parse Tx (no witness data)';
	};

	const parseWT = async () => {
		result = await parseWTx(proof);
		lastCall = 'Parse Tx (with witness data)';
	};

	const parseBlockH = async () => {
		result = await parseBlockHeader(proof);
		lastCall = 'Parse Block Header';
	};

	onMount(async () => {
		proof = await extractProofInfo(tx);
		const blockHash = tx.block.id;
		const headerRev = hex.encode(sha256(sha256(hex.decode(proof.header))).reverse());
		blockHashCheck = blockHash === headerRev;
		inited = true;
	});
</script>

{#if inited}
	<div class=" w-full">
		<div><p>Transaction found (details below)</p></div>
		<div class="my-5 grid grid-cols-4 items-stretch gap-5 gap-x-5">
			<div class="">
				<Button class="btn btn-primary text-black" on:click={() => wasTxMined()}>Legacy Tx Mined</Button>
			</div>
			<div class="">
				<Button class="btn btn-primary text-black" on:click={() => wasSegwitTxMined()}>Segwit Tx Mined</Button>
			</div>
			<div class="">
				<Button class="btn btn-primary text-black" on:click={() => verifyBlock()}>Verify Block Header</Button>
			</div>
			<div class="">
				<Button class="btn btn-primary text-black" on:click={() => verifyMerkle()}>Verify Merkle Proof</Button>
			</div>
			<div class="">
				<Button class="btn btn-primary text-black" on:click={() => getBcH()}>Verify Height</Button>
			</div>
			<div class="">
				<Button class="btn btn-primary text-black" on:click={() => parseT()}>Parse Tx (no witness)</Button>
			</div>
			<div class="">
				<Button class="btn btn-primary text-black" on:click={() => parseWT()}>Parse WTx</Button>
			</div>
			<div class="">
				<Button class="btn btn-primary text-black" on:click={() => parseBlockH()}>Parse Header</Button>
			</div>
		</div>

		{#if errorMessage}
			<div class="my-5"><Banner bannerType="info" message={errorMessage}></Banner></div>
		{/if}

		{#if result}
			<div class="card overflow-scroll overflow-x-visible bg-purple-300 p-3 text-black">
				<div class="my-5"><h2>{lastCall}</h2></div>
				<pre>{JSON.stringify(result, null, 2)}</pre>
			</div>
		{/if}

		<!-- <div class="pb-5">
			<label for="transact-path">Merkle root (block.merkle_root === calcMerkleRoot(txs))</label>
			<div class={block.merkle_root === proof.witnessMerkleRoot ? 'bg-success-500 border-success-500 rounded px-4 py-2 text-white' : 'bg-error-600 rounded border-white px-4 py-2 text-white'}>
				{block.merkle_root}
			</div>
		</div>

		<div class="pb-5">
			<label for="transact-path">Block hash = reverse(sha(sha(header)))</label>
			<div class={blockHashCheck ? 'bg-success-500 border-success-500 rounded px-4 py-2 text-white' : 'bg-error-600 rounded border-white px-4 py-2 text-white'}>
				{block.id}
			</div>
		</div> -->
		<div class="pb-5">
			<label for="transact-path">header</label>
			<input type="text" class="block w-full rounded-md border p-3 text-black" bind:value={proof.header} />
		</div>
		<div class="pb-5">
			<label for="transact-path">height</label>
			<input type="number" class="block w-full rounded-md border p-3 text-black" bind:value={proof.height} />
		</div>

		<div class="pb-5">
			<label for="transact-path">txIndex</label>
			<input type="text" class="block w-full rounded-md border p-3 text-black" bind:value={proof.txIndex} />
		</div>

		<div class="rounded-lg border-gray-700 bg-gray-200 p-5 text-black">
			<div class="text-2xl">Proof (space separated):</div>
			<!--
    {#each proof.wproof as node}
    <div class="">{node.direction} : {node.hash}</div>
    {/each}-->
			<textarea rows="8" class="block w-full rounded-md border p-3 text-black">{proof.wproof.join(' ')}</textarea>
		</div>

		<div class="my-5 flex justify-end">
			<div class="text-xs">
				<span class="me-4 border-e pe-4"><a href="/" on:click|preventDefault={() => (showTree = !showTree)} target="_blank">show full merkle tree</a></span>
				<span class=""><a href={explorerAddressUrl(contract)} target="_blank">contract</a></span>
			</div>
		</div>

		<!-- {#if showTree}
			<div class="rounded-lg border-gray-700 bg-gray-200 p-5 text-black">
				<div class="text-2xl">Tree:</div>
				{#each merkleTree.reverse() as nodes, index}
					{#each nodes as node}
						<div>{index} : {node}</div>
					{/each}
				{/each}
			</div>
		{/if} -->
	</div>
{/if}
