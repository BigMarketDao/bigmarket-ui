import { generateMerkleProof, generateMerkleRoot } from './merkle_utils';
import { hex } from '@scure/base';

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

export type SegwitData = {
	txId: string;
	txIdReversed: string;
	height: number;
	txHex: string;
	wtxHex: string;
	header: string;
	txIndex: number;
	treeDepth: number;
	wproof: Array<string>;
	witnessMerkleRoot: string;
	witnessReservedValue: string;
	wctxHex: string;
	ctxHex: string;
	cproof: Array<string>;
};
export type SegwitProof = { proof: Array<string>; merkleRoot: string };
export type TxMinedParameters = {
	merkleRoot: string;
	wproof: Array<string>;
	cproof: Array<string>;
	height: number;
	txIndex: number;
	headerHex: string;
	txIdR: string;
	treeDepth: number;
};

export function extractProofInfo(tx: any): SegwitData {
	let segwitData: SegwitData = {} as SegwitData;
	try {
		const txs = tx.block.txs;
		const reversedTxIds = tx.block.reversedTxIds;
		const txIndex = txs.findIndex((t: string) => t === tx.txid);
		if (txIndex === -1) throw new Error('Transaction not found in block!');

		// Generate Merkle proof
		console.log('Generating Merkle proof...');
		// const parameters = getParametersForProof(tx.txid, block);

		const wproof = generateMerkleProof(reversedTxIds[txIndex], reversedTxIds)?.map((o) => o.hash) || [];
		wproof.splice(0, 1);

		const cproof = generateMerkleProof(reversedTxIds[0], reversedTxIds)?.map((o) => o.hash) || [];
		cproof.splice(0, 1);

		const merkleRoot = generateMerkleRoot(reversedTxIds);
		const merkleRootLE = hex.encode(hex.decode(tx.block.merkle_root).reverse());

		if (merkleRootLE !== merkleRoot) throw new Error('extractProofInfo: merkleRoot: ' + merkleRootLE);

		//const { proof, merkleRoot } = constructMerkleProof(txs, txId);
		const treeDepth = wproof.length;

		// Fetch the coinbase transaction
		console.log('Fetching coinbase transaction...');
		// const cproof = constructMerkleProof(txs, ctx.txid).proof;

		// Get witness reserved value (extracted from coinbase script)
		const witnessReservedValue = extractWitnessReservedValue(tx.ctx);

		// Prepare the final JSON data
		console.log(tx.hex);
		console.log(hex.decode(tx.hex).length);

		segwitData = {
			txId: tx.txid,
			txIdReversed: tx.block.reversedTxIds[txIndex],
			height: tx.block.height,
			txHex: tx.hex,
			wtxHex: tx.whex,
			header: tx.block.header,
			txIndex: txIndex,
			treeDepth: treeDepth,
			wproof: wproof,
			witnessMerkleRoot: merkleRoot,
			witnessReservedValue: witnessReservedValue,
			wctxHex: tx.wctx,
			ctxHex: tx.ctx,
			cproof: cproof
		};
		console.log('Test data generated successfully:', segwitData);
	} catch (error) {
		console.error('Error generating test data:', error);
	}
	return segwitData;
}

/**
 * Constructs a Merkle proof for a given transaction
 */
// function constructMerkleProof(txids: string[], targetTxId: string): SegwitProof {
// 	let index = txids.indexOf(targetTxId);
// 	if (index === -1) throw new Error('Transaction ID not found in block');

// 	let proof: string[] = [];
// 	let level = txids.map((txid) => txid); // Copy txids

// 	while (level.length > 1) {
// 		let nextLevel: string[] = [];
// 		for (let i = 0; i < level.length; i += 2) {
// 			let left = level[i];
// 			let right = level[i + 1] || left; // If odd number, duplicate last

// 			if (left === targetTxId || right === targetTxId) {
// 				proof.push(right === targetTxId ? left : right);
// 			}

// 			nextLevel.push(hash(left + right)); // Combine and hash
// 		}
// 		level = nextLevel;
// 		index = Math.floor(index / 2);
// 	}

// 	return { proof, merkleRoot: level[0] };
// }

/**
 * Extract witness reserved value from coinbase transaction scriptPubKey
 */
function extractWitnessReservedValue(coinbaseTx: any) {
	const opReturnOutput = coinbaseTx.vout.find((output: any) => output.scriptpubkey_type === 'op_return');
	if (opReturnOutput) {
		const opReturnHex = opReturnOutput.scriptpubkey; // Full OP_RETURN script
		return opReturnHex.slice(4, 36); // Extract witness-reserved value (after OP_RETURN prefix)
	}

	return '00000000000000000000000000000000'; // Default empty value
}

/**
 * Dummy hash function (replace with real Bitcoin double SHA-256)
 */
function hash(input: string): string {
	return input.split('').reverse().join(''); // Simulating hashing for now
}
