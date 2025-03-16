import { getConfig } from '$stores/store_helpers';
import type { ProofGenerationData, ProofRequest, RpcBlock, RpcTransaction, TransactionProofSet } from './proof-types';
import type { TxProofResult } from 'bitcoin-tx-proof';

export async function getProofGenDataRecent(index: number): Promise<ProofGenerationData> {
	let path = `${getConfig().VITE_BIGMARKET_API}/clarity-bitcoin/tx-recent/${index}/proof-data`;
	//let path = `http://localhost:3020/bigmarket-api/clarity-bitcoin/tx-recent/${index}/proof-data`;
	const response = await fetch(path);
	const res = await response.json();
	return res;
}
export async function getProofDataRecent(index: number): Promise<{ proof: TransactionProofSet; data: ProofRequest }> {
	let path = `${getConfig().VITE_BIGMARKET_API}/clarity-bitcoin/tx-recent/${index}/proof`;
	const response = await fetch(path);
	const res = await response.json();
	return res;
}
export async function getProofData(txid: string): Promise<{ proof: TransactionProofSet; data: ProofRequest }> {
	let path = `https://api.bigmarket.ai/bigmarket-api/clarity-bitcoin/tx/${txid}/proof`;
	if (getConfig().VITE_NETWORK === 'devnet') {
		path = `${getConfig().VITE_BIGMARKET_API}/clarity-bitcoin/tx/${txid}/proof`;
	}
	const response = await fetch(path);
	if (response.ok) {
		return await response.json();
	}
	throw new Error(await response.text());
}
export async function getRecentTransaction(index: number): Promise<{ tx: RpcTransaction; block: RpcBlock }> {
	let path = `${getConfig().VITE_BIGMARKET_API}/clarity-bitcoin/tx-recent/${index}`;
	const response = await fetch(path);
	const res = await response.json();
	return res;
}
export async function getBtcProof(txId: string, height: number): Promise<TxProofResult> {
	let path = `${getConfig().VITE_BIGMARKET_API}/clarity-bitcoin/btc-proof/${txId}/${height}`;
	const response = await fetch(path);
	const res = await response.json();
	return res;
}
export async function buildAndSendTx(marketId: number, outcomeIndex: number, stxAddress: string, amountSats: number): Promise<any> {
	let path = `${getConfig().VITE_BIGMARKET_API}/clarity-bitcoin/send-prediction/${marketId}/${outcomeIndex}/${stxAddress}/${amountSats}`;
	const response = await fetch(path);
	const res = await response.json();
	return res;
}
('/send-prediction/:marketId/:outcomeIndex/:stxAddress/:amountSats');
