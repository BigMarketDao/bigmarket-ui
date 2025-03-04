<script lang="ts">
	import { tupleCV, uintCV, listCV, bufferCV, serializeCV, Cl } from '@stacks/transactions';
	import { hex } from '@scure/base';
	import { onMount } from 'svelte';
	import { sha256 } from '@noble/hashes/sha256';
	import { bitcoinToSats } from '$lib/utils';
	import { sessionStore } from '$stores/stores';
	import { getConfig } from '$stores/store_helpers';
	import { generateMerkleRoot, generateMerkleTree, getParametersForProof } from '$lib/merkle_utils';
	import { callContractReadOnly, type PayloadType, type TxMinedParameters } from '@mijoco/stx_helpers/dist/index';
	import { isCoordinator, isLoggedIn } from '$lib/stacks/stacks-connect';
	/**
proofs = (
0x268c873b99d12a8ea0c87e05de4ac98b16398217abc97f79b94bd9bea35a5ce6 
0xa26c0adbdd5400d76e12dfc5412d08df244085f538fee7c5c5a2e419caf0450a 
0x45cc4022c36723ff1e4f9ee1a1529b5ffff1cf1121f326145505f52ae6b6ea19 
0xe6b607cb87927805a43058e0d5ddfd61249c40b622037a074ec3c76eb48a6416 
0xcba219199a82ffedd0f4582b11e05e4940cf7873c655f4225e7a88e98d883479 
0xc8409d8249608a85ce79705d7df877b12079dd6b28ad416b801844bfa9cf810a 
0xf5d5ea2d88e8f71b5e34256cc206c44e93258b301b8d94f5bed4f601377e6e36
block_header = 
0x00600120d2119865b5b567cec541f80c7657e0d956cb5934e203ade332000000000000005fe61766d52c5452bfe45ffcf0536fe7f94a84c4a1c20f300e714c9385956b0364861165c0ff3f1911761e93
  00600120d2119865b5b567cec541f80c7657e0d956cb5934e203ade332000000000000005fe61766d52c5452bfe45ffcf0536fe7f94a84c4a1c20f300e714c9385956b0364861165c0ff3f1911761e93
tx-index=40
tree-depth=7
txid=01d8467b25e1d415bf53427d4db86fe001590b280b604204f794c5ecfc923ed3
**/

	export let tx: any;
	export let block: any;
	let data: PayloadType;
	let deposit = true;
	let showTree = false;
	let allowMint = false;
	let allowBurn = false;
	let amount = 0;
	let contractParameters: any;
	let contract = 'ST1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28G8HXK9G5.clarity-bitcoin-mini-1';
	if (getConfig().VITE_NETWORK === 'devnet') contract = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin-mini-1';
	let stxAddress: string | undefined;
	let merkleTree: Array<Array<string>>;
	let parameters: TxMinedParameters;
	let proofString: string | undefined;
	let proofs: Array<any>;
	let error: string | undefined;
	let answer: any;
	let blockHashCheck = false;
	let merkleRootCheck = false;
	let mrT: string;
	let inited = false;
	let functionName: string;

	const coordinator = isLoggedIn() && $sessionStore.keySets[getConfig().VITE_NETWORK] ? isCoordinator($sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress) : undefined;

	const getProofTuple = function () {
		const entryList = [];
		const merkleProofs = proofString ? proofString.split(' ') : parameters.proofElements.map(({ hash }) => hash);
		for (let i = 0; i < merkleProofs.length; i++) {
			const entry = merkleProofs[i];
			const buffProof = bufferCV(hex.decode(entry));
			entryList.push(buffProof);
		}
		const datum = tupleCV({
			'tx-index': uintCV(parameters.txIndex),
			hashes: listCV(entryList)
		});

		return datum;
	};

	const getProofsAsCV = function () {
		const entryList = [];
		const merkleProofs = proofString ? proofString.split(' ') : parameters.proofElements.map(({ hash }) => hash);
		for (let i = 0; i < merkleProofs.length; i++) {
			const entry = merkleProofs[i];
			const buffProof = bufferCV(hex.decode(entry));
			entryList.push(buffProof);
		}
		return listCV(entryList);
	};

	const wasTxMined = async () => {
		const proofData = getProofTuple();
		const functionArgs = [`0x${serializeCV(uintCV(parameters.height))}`, `0x${serializeCV(bufferCV(hex.decode(tx.txid)))}`, `0x${serializeCV(bufferCV(hex.decode(parameters.headerHex)))}`, `0x${serializeCV(proofData)}`];
		contractParameters = {
			name: parameters.height,
			txid: tx.txid,
			header: parameters.headerHex,
			proofs: proofString ? proofString.split(' ').join('<br/>') : parameters.proofElements.map(({ hash }) => hash).join('<br/>'),
			'tx-index': parameters.txIndex
		};

		functionName = 'was-txid-mined';
		const params = {
			contractAddress: contract.split('.')[0],
			contractName: contract.split('.')[1],
			functionName: 'was-txid-mined',
			functionArgs
		};

		const res = await callContractReadOnly(getConfig().VITE_STACKS_API, params);
		if (res && res.success) {
			answer = 'Result: ' + res.value.value;
		} else {
			answer = 'Result error: u' + res.value.value;
		}
		console.log(answer);
	};

	const verifyBlockHeader = async () => {
		console.log('parameters.headerHex: ' + parameters.headerHex.length);
		console.log('parameters.headerHex: ' + hex.decode(parameters.headerHex).length);
		const txid = tx.txid;
		const functionArgs = [`0x${serializeCV(Cl.bufferFromHex(parameters.headerHex))}`, `0x${serializeCV(uintCV(parameters.height))}`];

		functionName = 'verify-block-header';
		const params = {
			contractAddress: contract.split('.')[0],
			contractName: contract.split('.')[1],
			functionName: 'verify-block-header',
			functionArgs
		};
		contractParameters = {
			name: parameters.height,
			header: parameters.headerHex
		};

		const res = await callContractReadOnly(getConfig().VITE_STACKS_API, params);
		if (res && res.success) {
			answer = 'Result: ' + res.value.value;
		} else {
			answer = 'Result: ' + res.value;
		}
		console.log(answer);
	};

	const verifyMerkleProof = async () => {
		const txid = tx.txid;
		const functionArgs = [`0x${serializeCV(bufferCV(hex.decode(tx.txid).reverse()))}`, `0x${serializeCV(bufferCV(hex.decode(block.merkle_root).reverse()))}`, `0x${serializeCV(getProofTuple())}`];

		functionName = 'verify-merkle-proof';
		const params = {
			contractAddress: contract.split('.')[0],
			contractName: contract.split('.')[1],
			functionName: 'verify-merkle-proof',
			functionArgs
		};
		contractParameters = {
			'txid-reversed': hex.encode(hex.decode(tx.txid).reverse()),
			'root-reversed': hex.encode(hex.decode(block.merkle_root).reverse()),
			proofs: proofString ? proofString.split(' ').join('<br/>') : parameters.proofElements.map(({ hash }) => hash).join('<br/>'),
			'tx-index': parameters.txIndex
		};

		const res = await callContractReadOnly(getConfig().VITE_STACKS_API, params);
		if (res && res.success) {
			answer = 'Result: ' + res.value.value;
		} else {
			answer = 'Result: ' + res.value;
		}

		console.log(answer);
	};

	// const mintTo = async () => {
	// 	let prin = data.stacksAddress;
	// 	if (typeof data.lengthOfCname === 'number' && data.lengthOfCname > 0) prin += '.' + data.cname;
	// 	contractParameters = {
	// 		amount: tx.vout[1].amount,
	// 		txid: hex.encode(hex.decode(tx.txid)),
	// 		stxAddress: prin,
	// 		proofs: proofString ? proofString.split(' ').join('<br/>') : parameters.proofElements.map(({ hash }) => hash).join('<br/>'),
	// 		'tx-index': parameters.txIndex
	// 	};

	// 	const res = await romeoMintTo($sessionStore.sbtcInfo.sbtcContractData.contractId, amount, prin!, tx.txid, parameters.height, getProofsAsCV(), parameters.txIndex, parameters.headerHex);
	// 	console.log(res);
	// };

	// const withdrawTo = async () => {
	// 	let prin = data.stacksAddress;
	// 	if (typeof data.lengthOfCname === 'number' && data.lengthOfCname > 0) prin += '.' + data.cname;
	// 	contractParameters = {
	// 		amount: tx.vout[1].amount,
	// 		txid: hex.encode(hex.decode(tx.txid)),
	// 		stxAddress: prin,
	// 		proofs: proofString ? proofString.split(' ').join('<br/>') : parameters.proofElements.map(({ hash }) => hash).join('<br/>'),
	// 		'tx-index': parameters.txIndex
	// 	};

	// 	const res = await romeoWithdrawTo($sessionStore.sbtcInfo.sbtcContractData.contractId, amount, prin!, tx.txid, parameters.height, getProofsAsCV(), parameters.txIndex, parameters.headerHex);
	// 	console.log(res);
	// };

	onMount(async () => {
		const txIds = block.txs.map(function (tx: any) {
			//return hex.encode(hex.decode(tx.txid).reverse()) //hexReverse(tx.txid)
			return hex.encode(hex.decode(tx).reverse()); //hexReverse(tx.txid)
		});
		answer = undefined;
		console.log('tx0-r: ' + txIds[0]);

		try {
			data = await payloadParseTransaction(tx.txid);
			deposit = data.opcode === '3C';
		} catch (err: any) {
			console.log(err);
		}

		mrT = generateMerkleRoot(txIds);
		mrT = hex.encode(hex.decode(mrT).reverse());
		//if (hex.encode(hex.decode(mrT).reverse()) !== block.merkle_root) throw new Error('Merkle root error')
		merkleTree = generateMerkleTree(txIds);
		console.log('mr0: ' + block.merkle_root);
		console.log('mrT: ' + mrT);
		parameters = getParametersForProof(tx.txid, tx.hex, block);
		proofs = parameters.proofElements;
		blockHashCheck = block.hash === hex.encode(sha256(sha256(hex.decode(parameters.headerHex))).reverse());
		merkleRootCheck = block.merkle_root === mrT;

		proofString = parameters.proofElements.map(({ hash }) => hash).join(' ');
		amount = bitcoinToSats(tx.vout[1].value);
		stxAddress = $sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress;
		answer = undefined;
		inited = true;
	});
</script>

{#if inited}
	<div class=" w-full">
		{#if error}<p class="text-danger">{error}</p>{/if}
		<div class="pb-5">
			<label for="transact-path">Merkle root (block.merkle_root === calcMerkleRoot(txs))</label>
			<div class={merkleRootCheck ? 'bg-success-500 border-success-500 rounded px-4 py-2 text-white' : 'bg-error-600 rounded border-white px-4 py-2 text-white'}>
				{block.merkle_root}
			</div>
		</div>

		<div class="pb-5">
			<label for="transact-path">Block hash = reverse(sha(sha(header)))</label>
			<div class={blockHashCheck ? 'bg-success-500 border-success-500 rounded px-4 py-2 text-white' : 'bg-error-600 rounded border-white px-4 py-2 text-white'}>
				{block.hash}
			</div>
		</div>
		<div class="pb-5">
			<label for="transact-path">header</label>
			<input type="text" class="block w-full rounded-md border p-3 text-black" bind:value={parameters.headerHex} />
		</div>
		<div class="pb-5">
			<label for="transact-path">height</label>
			<input type="number" class="block w-full rounded-md border p-3 text-black" bind:value={parameters.height} />
		</div>

		<div class="pb-5">
			<label for="transact-path">txIndex</label>
			<input type="text" class="block w-full rounded-md border p-3 text-black" bind:value={parameters.txIndex} />
		</div>

		<div class="rounded-lg border-gray-700 bg-gray-200 p-5 text-black">
			<div class="text-2xl">Proof (space separated):</div>
			<!--
    {#each parameters.proofElements as node}
    <div class="">{node.direction} : {node.hash}</div>
    {/each}-->
			<textarea rows="8" class="block w-full rounded-md border p-3 text-black" bind:value={proofString} />
		</div>

		<div class="my-5 flex justify-end">
			<div class="text-xs">
				{#if coordinator}
					<span class="me-4 border-e pe-4"
						><a
							href="/"
							on:click|preventDefault={() => {
								allowMint = !allowMint;
								showTree = false;
								answer = undefined;
							}}
							target="_blank">allow mint</a
						></span
					>
				{/if}

				<span class="me-4 border-e pe-4"><a href="/" on:click|preventDefault={() => (showTree = !showTree)} target="_blank">show full merkle tree</a></span>
				<span class=""><a href={explorerAddressUrl(contract)} target="_blank">contract</a></span>
			</div>
		</div>

		<div class="my-5 flex items-baseline gap-x-5">
			<div class="">
				<Button darkScheme={false} label={'Was Tx Mined'} target={''} on:clicked={() => wasTxMined()} />
			</div>
			<div class="">
				<Button darkScheme={false} label={'Verify Block Header'} target={''} on:clicked={() => verifyBlockHeader()} />
			</div>
			<div class="">
				<Button darkScheme={false} label={'Verify Merkle Proof'} target={''} on:clicked={() => verifyMerkleProof()} />
			</div>
		</div>
		{#if answer}
			<div class="mb-5">{functionName}</div>
			<div class="mb-5">{@html answer}</div>
			<div class="flex flex-col">
				{#each Object.entries(contractParameters) as [name, value]}
					<div class="mb-3 flex justify-start border-b">
						<div class="w-1/5">{name}:</div>
						<div>{@html value}</div>
					</div>
				{/each}
			</div>
			{#if deposit}
				<div class="my-5 flex items-baseline gap-x-5">
					<div class="">
						<Button darkScheme={false} label={'Mint'} target={''} on:clicked={() => mintTo()} />
					</div>
				</div>
			{:else}
				<div class="my-5 flex items-baseline gap-x-5">
					<div class="">
						<Button darkScheme={false} label={'Withdraw'} target={''} on:clicked={() => withdrawTo()} />
					</div>
				</div>
			{/if}
		{/if}

		{#if allowMint}
			<div class="my-5">
				<label for="transact-path">Mint: stacks address</label>
				<input type="text" class="block w-full rounded-md border p-3 text-black" bind:value={stxAddress} />
			</div>

			<div class="mb-5">
				<label for="transact-path">Amount (sats)</label>
				<input type="number" class="block w-full rounded-md border p-3 text-black" bind:value={amount} />
			</div>
		{/if}

		{#if showTree}
			<div class="rounded-lg border-gray-700 bg-gray-200 p-5 text-black">
				<div class="text-2xl">Tree:</div>
				{#each merkleTree.reverse() as nodes, index}
					{#each nodes as node}
						<div>{index} : {node}</div>
					{/each}
				{/each}
			</div>
		{/if}
	</div>
{/if}
