<script lang="ts">
	import { onMount } from 'svelte';
	import { explorerAddressUrl } from '$lib/stacks/stacks-connect';
	import { Button } from 'flowbite-svelte';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { getConfig } from '$stores/store_helpers';
	import Bulletin from '$lib/components/ui/Bulletin.svelte';
	import {
		extractProofInfo,
		getBcHHash,
		parseBlockHeader,
		parseTx,
		parseWTx,
		verifyBlockHeader,
		verifyMerkleCoinbaseProof,
		verifyMerkleProof,
		wasSegwitTxMinedCompact,
		wasTxMinedCompact,
		type SegwitData,
		type TxForClarityBitcoin
	} from 'clarity-bitcoin-client';

	export let tx: TxForClarityBitcoin;
	let proof: SegwitData;
	let inited = false;
	let errorMessage: string | undefined;
	let lastCall: string | undefined;
	let showTree: boolean;
	let blockHashCheck = false;
	let result: any;

	const wasSegwitTxMined = async () => {
		result = await wasSegwitTxMinedCompact(getConfig().VITE_STACKS_API, proof);
		lastCall = 'Was Segwit Tx Mined';
	};

	const getBcH = async () => {
		result = await getBcHHash(getConfig().VITE_STACKS_API, proof);
		lastCall = 'Get Header hash';
	};

	const wasTxMined = async () => {
		result = await wasTxMinedCompact(getConfig().VITE_STACKS_API, proof);
		lastCall = 'Was Tx Mined';
	};

	const verifyBlock = async () => {
		result = await verifyBlockHeader(getConfig().VITE_STACKS_API, proof);
		lastCall = 'Verify Block Header';
	};

	const verifyMerkleCoinbase = async () => {
		result = await verifyMerkleCoinbaseProof(getConfig().VITE_STACKS_API, proof);
		lastCall = 'Verify Merkle';
	};

	const verifyMerkle = async () => {
		result = await verifyMerkleProof(getConfig().VITE_STACKS_API, proof);
		lastCall = 'Verify Merkle';
	};

	const parseT = async () => {
		result = await parseTx(getConfig().VITE_STACKS_API, proof);
		lastCall = 'Parse Tx (no witness data)';
	};

	const parseWT = async () => {
		result = await parseWTx(getConfig().VITE_STACKS_API, proof);
		lastCall = 'Parse Tx (with witness data)';
	};

	const parseBlockH = async () => {
		result = await parseBlockHeader(getConfig().VITE_STACKS_API, proof);
		lastCall = 'Parse Block Header';
	};

	onMount(async () => {
		proof = await extractProofInfo(tx, getConfig().VITE_CLARITY_BITCOIN);
		inited = true;
	});
</script>

{#if inited}
	<div class=" w-full">
		<div><p>Transaction found (details below)</p></div>
		<div class="my-5 grid grid-cols-2 items-stretch gap-5 gap-x-5 text-sm md:grid-cols-3">
			<div class="w-full">
				<Button title="Unsolved problem verifying coinbase merkle proof" class="btn btn-primary w-full text-sm text-black" on:click={() => wasTxMined()}>Legacy Tx Mined</Button>
			</div>
			<div class="flex w-[90%]">
				<Button class="btn w-full bg-red-600 text-sm text-black hover:bg-red-700" on:click={() => wasSegwitTxMined()}>Segwit Tx Mined</Button>
				<Bulletin message={'Unsolved problem verifying coinbase merkle proof'} trigger={'marketCounter'}>
					<span slot="title">{''}</span>
				</Bulletin>
			</div>
			<div class="w-full">
				<Button class="btn btn-primary w-full text-sm text-black" on:click={() => verifyBlock()}>Verify Block Header</Button>
			</div>
			<div class="w-full">
				<Button class="btn btn-primary w-full text-sm text-black" on:click={() => verifyMerkle()}>Verify Merkle Proof</Button>
			</div>
			<div class="w-full">
				<Button class="btn btn-primary w-full text-sm text-black" on:click={() => verifyMerkleCoinbase()}>Verify Coinbase Proof</Button>
			</div>
			<div class="w-full">
				<Button class="btn btn-primary w-full text-sm text-black" on:click={() => getBcH()}>Verify Height</Button>
			</div>
			<div class="w-full">
				<Button class="btn btn-primary w-full text-sm text-black" on:click={() => parseT()}>Parse Tx (no witness)</Button>
			</div>
			<div class="w-full">
				<Button class="btn btn-primary w-full text-sm text-black" on:click={() => parseWT()}>Parse WTx</Button>
			</div>
			<div class="w-full">
				<Button class="btn btn-primary w-full text-sm text-black" on:click={() => parseBlockH()}>Parse Header</Button>
			</div>
		</div>

		{#if errorMessage}
			<div class="my-5"><Banner bannerType="info" message={errorMessage}></Banner></div>
		{/if}

		{#if result}
			<div class="card overflow-scroll overflow-x-visible bg-purple-300 p-3 text-sm text-black">
				<div class="my-5"><h2>{lastCall}</h2></div>
				<pre>{JSON.stringify(result, null, 2)}</pre>
			</div>
		{/if}

		<div class="pb-5">
			<label for="transact-path">header</label>
			<input type="text" class="block w-full rounded-md border p-3 text-sm text-black" bind:value={proof.header} />
		</div>
		<div class="pb-5">
			<label for="transact-path">height</label>
			<input type="number" class="block w-full rounded-md border p-3 text-sm text-black" bind:value={proof.height} />
		</div>

		<div class="pb-5">
			<label for="transact-path">txIndex</label>
			<input type="text" class="block w-full rounded-md border p-3 text-sm text-black" bind:value={proof.txIndex} />
		</div>

		<div class="rounded-lg border-gray-700 bg-gray-200 p-5 text-sm text-black">
			<div class="text-2xl">Proof (space separated):</div>
			<!--
    {#each proof.wproof as node}
    <div class="">{node.direction} : {node.hash}</div>
    {/each}-->
			<textarea rows="8" class="block w-full rounded-md border p-3 text-sm text-black">{proof?.wproof?.join(' ')}</textarea>
		</div>

		<div class="my-5 flex justify-end">
			<div class="text-xs">
				<span class="me-4 border-e pe-4"><a href="/" on:click|preventDefault={() => (showTree = !showTree)} target="_blank">show full merkle tree</a></span>
				<span class=""><a href={explorerAddressUrl(getConfig().VITE_CLARITY_BITCOIN)} target="_blank">contract</a></span>
			</div>
		</div>

		<!-- {#if showTree}
			<div class="rounded-lg border-gray-700 bg-gray-200 p-5 text-black text-sm">
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
