import { fetchBlockByHash, fetchTransaction, fetchTransactionHex } from '@mijoco/btc_helpers/dist/index';
import { getConfig } from '$stores/store_helpers';
import * as btc from '@scure/btc-signer';
import type { TxOpts } from '@scure/btc-signer/transaction';
import { coinbaseWitness, ensureEven } from './proof';
import { hex } from '@scure/base';
import type { TxForClarityBitcoin } from './proof-types';

function reverseAndEven(txs: Array<string>) {
	const txIds = txs.map(function (tx: any) {
		return hex.encode(hex.decode(tx).reverse());
	});
	ensureEven(txIds);
	return txIds;
}

export async function fetchApiData(txId: string): Promise<TxForClarityBitcoin> {
	const mempoolTx = (await fetchTransaction(getConfig().VITE_MEMPOOL_API, txId)) as any;
	if (!mempoolTx) {
		throw new Error('No transaction found on network ' + getConfig().VITE_NETWORK + ' for txid: ' + txId);
	}
	const blockHash = mempoolTx.status ? mempoolTx.status.block_hash : mempoolTx.blockhash;
	const block1 = await fetchBlockByHash(getConfig().VITE_MEMPOOL_API, blockHash);
	const header = await fetch80ByteBlockHeader(getConfig().VITE_MEMPOOL_API, blockHash);
	if (!header) {
		throw new Error('No header found on network ' + getConfig().VITE_NETWORK + ' for block-hash: ' + blockHash);
	}
	const txs = await fetchBlockByHashWithTransactionIds(getConfig().VITE_MEMPOOL_API, blockHash);
	const reversedTxIds = reverseAndEven(txs);

	const txHex = await fetchTransactionHex(getConfig().VITE_MEMPOOL_API, txId);
	if (!txHex) {
		throw new Error('No transaction found on network ' + getConfig().VITE_NETWORK + ' for txid: ' + txId);
	}
	const parsedTx = btc.Transaction.fromRaw(hex.decode(txHex), { allowUnknownInputs: true, allowUnknownOutputs: true });

	const ctxHex = await fetchTransactionHex(getConfig().VITE_MEMPOOL_API, txs[0]); // Coinbase tx is always first
	if (!ctxHex) {
		throw new Error('No coinbase transaction found on network ' + getConfig().VITE_NETWORK + ' for txid: ' + txs[0]);
	}
	const o: TxOpts = {} as TxOpts;
	const parsedCTx = btc.Transaction.fromRaw(hex.decode(ctxHex), { allowUnknownInputs: true, allowUnknownOutputs: true });
	const { witnessReservedValue, witnessMerkleRoot } = coinbaseWitness(parsedCTx);
	return {
		txId: txId,
		hex: hex.encode(parsedTx.toBytes(false, false)),
		whex: hex.encode(parsedTx.toBytes(true, true)),
		chex: hex.encode(parsedCTx.toBytes(false, false)),
		cwhex: hex.encode(parsedCTx.toBytes(true, true)),
		witnessReservedValue,
		witnessMerkleRoot,

		block: {
			id: block1.id,
			txs,
			header,
			reversedTxIds,
			merkle_root: block1.merkle_root,
			height: block1.height
		}
	};
}

export async function fetchBlockByHashWithTransactionsFull(mempoolUrl: string, hash: string) {
	try {
		let url = `${mempoolUrl}/block/${hash}/txs`;
		let response = await fetch(url);
		const block = await response.json();
		return block;
	} catch (error) {
		console.error('Error fetching block timestamp:', error);
	}
}

async function fetchBlockByHashWithTransactionIds(mempoolUrl: string, hash: string) {
	try {
		let url = `${mempoolUrl}/block/${hash}/txids`;
		let response = await fetch(url);
		const block = await response.json();
		return block;
	} catch (error) {
		console.error('Error fetching block timestamp:', error);
	}
}

async function fetch80ByteBlockHeader(mempoolUrl: string, hash: string): Promise<string | undefined> {
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
