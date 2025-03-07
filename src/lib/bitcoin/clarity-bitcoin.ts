import { bufferCV, Cl, listCV, serializeCV, tupleCV, uintCV } from '@stacks/transactions';
import type { SegwitData } from './generate_segwit_proofs';
import { callContractReadOnly } from '@mijoco/stx_helpers/dist/index';
import { getConfig } from '$stores/store_helpers';
import { sha256 } from '@noble/hashes/sha256';
import { hex } from '@scure/base';

export async function fetch80ByteBlockHeader(mempoolUrl: string, hash: string): Promise<string | undefined> {
	try {
		const url = `${mempoolUrl}/block/${hash}/raw`;
		// raw binary block data
		const response = await fetch(url);
		const rawData = new Uint8Array(await response.arrayBuffer()); // Correctly handle binary data
		// Extract the first 80 bytes (block header)
		const blockHeader = rawData.slice(0, 80);
		return hex.encode(blockHeader);
	} catch (error) {
		console.error('Error: fetch80ByteBlockHeader:', error);
	}
}

export const contract = 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.clarity-bitcoin-lib-v5';

const getStacksApi = () => {
	return getConfig().VITE_STACKS_API;
};

export const verifyMerkleProof = async (proof: SegwitData) => {
	const functionArgs = [
		`0x${serializeCV(Cl.bufferFromHex(proof.txIdReversed))}`,
		`0x${serializeCV(Cl.bufferFromHex(proof.witnessMerkleRoot))}`,
		`0x${serializeCV(Cl.tuple({ 'tx-index': Cl.uint(proof.txIndex), hashes: Cl.list(proof.wproof.map((o) => Cl.bufferFromHex(o))), 'tree-depth': Cl.uint(proof.treeDepth) }))}`
	];
	const params = {
		contractAddress: contract.split('.')[0],
		contractName: contract.split('.')[1],
		functionName: 'verify-merkle-proof',
		functionArgs
	};
	const result = await callContractReadOnly(getStacksApi(), params);
	return result.value.value;
};

export const wasSegwitTxMinedCompact = async (proof: SegwitData) => {
	const functionArgs = [
		`0x${serializeCV(Cl.uint(proof.height))}`,
		`0x${serializeCV(Cl.bufferFromHex(proof.wtxHex))}`,
		`0x${serializeCV(Cl.bufferFromHex(proof.header))}`,
		`0x${serializeCV(Cl.uint(proof.txIndex))}`,
		`0x${serializeCV(Cl.uint(proof.treeDepth))}`,
		`0x${serializeCV(Cl.list(proof.wproof.map((o) => Cl.bufferFromHex(o))))}`,
		`0x${serializeCV(Cl.bufferFromHex(proof.witnessMerkleRoot))}`,
		`0x${serializeCV(Cl.bufferFromHex(proof.witnessReservedValue))}`,
		`0x${serializeCV(Cl.bufferFromHex(proof.wctxHex))}`,
		`0x${serializeCV(Cl.list(proof.cproof.map((o) => Cl.bufferFromHex(o))))}`
	];
	const params = {
		contractAddress: contract.split('.')[0],
		contractName: contract.split('.')[1],
		functionName: 'was-segwit-tx-mined-compact',
		functionArgs
	};

	const result = await callContractReadOnly(getStacksApi(), params);
	console.log('wasTxMinedCompact: ', result);
	return result.value?.value || result.value;
};

export const wasTxMinedCompact = async (proof: SegwitData) => {
	console.log('Header Before Sending to Contract:', proof.header);
	console.log('Double SHA256:', sha256(sha256(hex.decode(proof.header))));
	console.log('Expected Hash from API:', proof.header);

	const functionArgs = [
		`0x${serializeCV(Cl.uint(proof.height))}`,
		`0x${serializeCV(Cl.bufferFromHex(proof.txHex))}`,
		`0x${serializeCV(bufferCV(hex.decode(proof.header)))}`,
		`0x${serializeCV(Cl.tuple({ 'tx-index': Cl.uint(proof.txIndex), 'tree-depth': Cl.uint(proof.treeDepth), hashes: Cl.list(proof.wproof.map((o) => Cl.bufferFromHex(o))) }))}`
	];

	const params = {
		contractAddress: contract.split('.')[0],
		contractName: contract.split('.')[1],
		functionName: 'was-tx-mined-compact',
		functionArgs
	};

	const result = await callContractReadOnly(getStacksApi(), params);
	console.log('wasTxMinedCompact: ', result);
	let contractTxid = (result.value?.value || result.value) as string;
	contractTxid = contractTxid.substring(2);
	return { mined: contractTxid === proof.txId, 'Contract txid': contractTxid, success: result.success };
};

export const verifyBlockHeader = async (proof: SegwitData) => {
	const functionArgs = [`0x${serializeCV(bufferCV(hex.decode(proof.header)))}`, `0x${serializeCV(Cl.uint(proof.height))}`];
	const params = {
		contractAddress: contract.split('.')[0],
		contractName: contract.split('.')[1],
		functionName: 'verify-block-header',
		functionArgs
	};
	const result = await callContractReadOnly(getStacksApi(), params);
	console.log('verify-block-header: ', result);
	return result.value?.value || result.value;
};
export const getBcHHash = async (proof: SegwitData) => {
	const functionArgs = [`0x${serializeCV(Cl.uint(proof.height))}`];
	const params = {
		contractAddress: contract.split('.')[0],
		contractName: contract.split('.')[1],
		functionName: 'get-bc-h-hash',
		functionArgs
	};
	const result = await callContractReadOnly(getStacksApi(), params);
	return result.value?.value || result.value;
};
export const parseBlockHeader = async (proof: SegwitData) => {
	const functionArgs = [`0x${serializeCV(Cl.bufferFromHex(proof.header))}`];
	const params = {
		contractAddress: contract.split('.')[0],
		contractName: contract.split('.')[1],
		functionName: 'parse-block-header',
		functionArgs
	};
	const result = await callContractReadOnly(getStacksApi(), params);
	return result.value?.value || result.value;
};
export const parseTx = async (proof: SegwitData) => {
	const functionArgs = [`0x${serializeCV(Cl.bufferFromHex(proof.txHex))}`];
	const params = {
		contractAddress: contract.split('.')[0],
		contractName: contract.split('.')[1],
		functionName: 'parse-tx',
		functionArgs
	};
	const result = await callContractReadOnly(getStacksApi(), params);
	return result.value?.value || result.value;
};
export const parseWTx = async (proof: SegwitData) => {
	const functionArgs = [`0x${serializeCV(Cl.bufferFromHex(proof.wtxHex))}`, `0x${serializeCV(Cl.bool(true))}`];
	const params = {
		contractAddress: contract.split('.')[0],
		contractName: contract.split('.')[1],
		functionName: 'parse-wtx',
		functionArgs
	};
	const result = await callContractReadOnly(getStacksApi(), params);
	return result.value?.value || result.value;
};
