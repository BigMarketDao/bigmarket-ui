import { getConfig, getSession } from '$stores/store_helpers';
import { fetchTransactionHex, fetchUtxoSet, addInputs, type UTXO, inputAmt, REGTEST_NETWORK } from '@mijoco/btc_helpers/dist/index';
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { getBtcAddress, getBtcBalance, getStxAddress } from '$lib/stacks/stacks-connect';
import { Cl } from '@stacks/transactions';
import axios from 'axios';
import { buildAndSendTx } from './api';

export const MAGIC_BYTES_TESTNET = '5462';
export const MAGIC_BYTES_MAINNET = '5862';
export const STAKE_OPCODE = '3C';
export const CLAIM_OPCODE = '3E';
export const FEE = 1000;

export async function buildAndSend(marketId: number, outcomeIndex: number, amountBtc: number, broadcast: boolean): Promise<{ failed: boolean; message: string; transaction?: btc.Transaction }> {
	if (getConfig().VITE_NETWORK === 'devnet') return await buildAndSendDevnet(marketId, outcomeIndex, amountBtc);
	const mult = 100_000_000;
	const microStxAmount = Math.round(parseFloat(String(amountBtc)) * mult);
	const balance = getBtcBalance();
	if (balance - FEE < microStxAmount) {
		return { failed: true, message: 'Amount exceeds your balance' };
	}
	const userPublicKey = getSession().keySets[getConfig().VITE_NETWORK].btcPubkeySegwit0!;
	const { transaction, txFee } = await buildOpReturnStakeTransaction(marketId, outcomeIndex, getConfig().VITE_MEMPOOL_API, getConfig().VITE_NETWORK, getStxAddress(), microStxAmount, userPublicKey, getBtcAddress());
	const txId = await signPSBT(transaction, broadcast);
	return { failed: false, message: txId, transaction };
}

export async function buildAndSendDevnet(marketId: number, outcomeIndex: number, amountBtc: number): Promise<{ failed: boolean; message: string; transaction?: btc.Transaction }> {
	const mult = 100_000_000;
	const microStxAmount = Math.round(parseFloat(String(amountBtc)) * mult);
	// const balance = getBtcBalance();
	// if (balance - FEE < microStxAmount) {
	// 	return { failed: true, message: 'Amount exceeds your balance' };
	// }
	// const userPublicKey = getSession().keySets[getConfig().VITE_NETWORK].btcPubkeySegwit0!;
	//const transaction = await buildRegtestBitcoinSegwitTransaction(marketId, outcomeIndex, getStxAddress(), amount);

	const txid = await buildAndSendTx(marketId, outcomeIndex, getStxAddress(), amountBtc);

	//const txId = await signPSBT(transaction, broadcast);
	return { failed: false, message: txid }; //{ failed: false, message: txId, transaction };
}

export async function payloadParseTransaction(txid: string): Promise<any> {
	const txHex = await fetchTransactionHex(getConfig().VITE_MEMPOOL_API, txid);
	if (!txHex) throw new Error('Unable to find transaction from txid: ' + txid);
	// let payload: PayloadType = await parsePayloadFromTransaction(getConfig().VITE_NETWORK, txHex);
	return; //payload;
}

export const sendBitcoin = async (amount: number): Promise<{ failed: boolean; message: string; transaction?: btc.Transaction }> => {
	const response = await (window as any).LeatherProvider.request('sendTransfer', {
		network: 'sbtcTestnet',
		recipients: [
			{
				address: getConfig().VITE_BITCOIN_WALLET,
				amount: amount.toString()
			}
		]
	});

	// Storing txid in local storage
	// We'll get back the transaction IF, which we can then use to do whatever we want
	if (typeof window !== 'undefined') {
		localStorage.setItem('txid', JSON.stringify(response.result.txid));
	}

	// We may want to do something once this transaction has confirmed, so we can set it to pending here and then use an API like mempool.space to query the Bitcoin chain for information about this transaction
	localStorage.setItem('txStatus', 'pending');
	return { failed: false, message: response.result.txid };
};

export const signPSBT = async (transaction: btc.Transaction, broadcast: boolean) => {
	const requestParams = {
		hex: hex.encode(transaction.toPSBT()),
		//signAtIndex: [0],
		allowedSighash: [btc.SigHash.ALL],
		network: 'sbtcTestnet',
		// account?: number;
		broadcast
	};
	console.log('Unsigned PSBT:', transaction.toPSBT());

	const response = await (window as any).LeatherProvider.request('signPsbt', requestParams);
	console.log('Unsigned response:', response.result.hex);
	const signedTx = btc.Transaction.fromPSBT(hex.decode(response.result.hex));
	signedTx.finalize();
	signedTx.toBytes();
	const rawTxHex = hex.encode(signedTx.toBytes());
	// We'll get back the transaction IF, which we can then use to do whatever we want
	if (typeof window !== 'undefined') {
		localStorage.setItem('txid', JSON.stringify(response.result.txid));
	}

	// We may want to do something once this transaction has confirmed, so we can set it to pending here and then use an API like mempool.space to query the Bitcoin chain for information about this transaction
	localStorage.setItem('txStatus', 'pending');
	return response.result.txid;
};

export function getNet(network: string) {
	let net = REGTEST_NETWORK; //btc.TEST_NETWORK; // sbtc-testnet network !
	if (network === 'devnet') net = REGTEST_NETWORK;
	else if (network === 'mainnet') net = btc.NETWORK;
	return net;
}

export async function buildOpReturnStakeTransaction(
	marketId: number,
	outcomeIndex: number,
	mempoolApi: string,
	network: string,
	stacksRecipient: string,
	amountSats: number,
	paymentPublicKey: string,
	paymentAddress: string
): Promise<{ transaction: btc.Transaction; txFee: number }> {
	const net = getNet(network);
	let utxos: Array<UTXO> = [];
	try {
		utxos = (await fetchUtxoSet(mempoolApi, paymentAddress, true)).utxos;
	} catch (err: any) {
		console.error('=============================================================== ');
		console.error('buildOpReturnDepositTransaction: Error fetching utxos: address: ' + paymentAddress);
		console.error('buildOpReturnDepositTransaction: Error fetching utxos: ' + err.message);
		console.error('=============================================================== ');
		throw new Error('Unable to lookup UTXOs for address this could be a network failure or rate limiting by remote service: ' + paymentAddress);
	}
	//console.log('buildOpReturnDepositTransaction: utxos:', utxos)

	const transaction = new btc.Transaction({
		allowUnknownInputs: true,
		allowUnknownOutputs: true
	});
	const txFee = FEE; //estimateActualFee(transaction, fees.feeInfo) * feeMultiplier;
	// no reveal fee for op_return
	addInputs(network, amountSats, txFee, transaction, false, utxos, paymentPublicKey);

	const data = `0x${Cl.serialize(Cl.tuple({ idx: Cl.uint(outcomeIndex), amt: Cl.uint(amountSats), id: Cl.uint(marketId), addr: Cl.principal(stacksRecipient) }))}`;
	// const magicBuf = typeof net === 'object' && (net.bech32 === 'tb' || net.bech32 === 'bcrt') ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
	// const opCodeBuf = hex.decode(STAKE_OPCODE);

	console.log('buildOpReturnStakeTransaction: ', data);
	transaction.addOutput({
		// script: btc.Script.encode(['RETURN', concatBytes(opCodeBuf, hex.decode(data))]),
		script: btc.Script.encode(['RETURN', hex.decode(data)]),
		amount: BigInt(0)
	});
	transaction.addOutputAddress(getConfig().VITE_BITCOIN_WALLET, BigInt(amountSats), net);
	const changeAmount = inputAmt(transaction) - (amountSats + txFee);
	if (changeAmount > 0) transaction.addOutputAddress(paymentAddress, BigInt(changeAmount), net);
	return {
		transaction,
		txFee: txFee
	};
	// hexPSBT: hex.encode(transaction.toPSBT()),
	// b64PSBT: base64.encode(transaction.toPSBT()),
}

// async function callBitcoinRPC(method: string, params: Array<any>) {
// 	const response = await fetch(BITCOIN_RPC_URL, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			Authorization: 'Basic ' + btoa(`${RPC_USER}:${RPC_PASSWORD}`)
// 		},
// 		body: JSON.stringify({
// 			jsonrpc: '1.0',
// 			id: 'svelte',
// 			method,
// 			params
// 		})
// 	});

// 	return response.json();
// }
// export async function bitcoinRPC(method: string, params: Array<any>, rpcParams: any) {
// 	try {
// 		const response = await axios.post(
// 			`${rpcParams.rpcHost}:${rpcParams.rpcPort}`,
// 			{
// 				jsonrpc: '1.0',
// 				id: 'bitcoin-rpc',
// 				method: method,
// 				params: params
// 			},
// 			{
// 				auth: { username: rpcParams.rpcUser, password: rpcParams.rpcPass },
// 				headers: { 'Content-Type': 'application/json' }
// 			}
// 		);
// 		return response.data.result;
// 	} catch (error: any) {
// 		console.error(`RPC Error: ${method}`, error.response?.data || error.message);
// 		return null;
// 	}
// }
async function bitcoinRPC(method: string, params: Array<any>, rpcParams: any) {
	try {
		const response = await fetch('http://127.0.0.1:18445', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + btoa(`devnet:devnet`)
			},
			body: JSON.stringify({
				jsonrpc: '1.0',
				id: 'svelte',
				method: 'getblockchaininfo',
				params: []
			})
		});

		return response;
	} catch (error: any) {
		console.error('Bitcoin RPC Error:', error.message);
		return null;
	}
}

export function getRpcParams() {
	return {
		rpcHost: 'http://127.0.0.1',
		rpcPort: '18445',
		rpcPass: 'devnet',
		rpcUser: 'devnet',
		wallet: 'bcrt1q79kacjqvu8jsgggs088nsr666d7d89wsgn5uve'
	};
}

// export async function buildRegtestBitcoinSegwitTransaction(marketId: number, outcomeIndex: number, stxAddress: string, amountSats: number): Promise<string> {
// 	// Define a SegWit-compatible UTXO (mocked)
// 	const response = await bitcoinRPC('listunspent', [], getRpcParams());
// 	const utxos = response;

// 	// Create a new Bitcoin transaction (SegWit enabled)
// 	const transaction = new btc.Transaction({
// 		allowUnknownInputs: true,
// 		allowUnknownOutputs: true
// 	});
// 	// Serialize OP_RETURN Data
// 	const data = Cl.serialize(
// 		Cl.tuple({
// 			idx: Cl.uint(outcomeIndex),
// 			amt: Cl.uint(amountSats),
// 			id: Cl.uint(marketId),
// 			addr: Cl.principal(stxAddress)
// 		})
// 	);
// 	//const encodedData = hex.encode(data);
// 	console.log('buildMockBitcoinSegwitTransaction: encodedData: ' + data);

// 	// const OP_RETURN_PREFIX = new Uint8Array([0x6e]); // ✅ Correctly represents `0x6E` as a byte
// 	// const finalScript = concatBytes(OP_RETURN_PREFIX, hex.decode(encodedData));

// 	transaction.addOutput({
// 		script: btc.Script.encode(['RETURN', hex.decode(data)]),
// 		amount: BigInt(0)
// 	});

// 	// transaction.addOutputAddress(getRpcParams().wallet, BigInt(amountSats), REGTEST_NETWORK); // ✅ Market wallet address (SegWit)
// 	// const totalInput = utxos.reduce((acc: number, utxo: { amount: number }) => acc + utxo.amount, 0);
// 	// const totalOutput = amountSats + 0.0001; // Adding fees (example)
// 	// const changeAmount = totalInput - totalOutput;
// 	// if (changeAmount > 0) transaction.addOutputAddress(utxos[0].address, BigInt(changeAmount), REGTEST_NETWORK);

// 	// // const privateKey: Signer = secp256k1.utils.randomPrivateKey();
// 	// // const publicKey = secp256k1.getPublicKey(privateKey, true); // ✅ Derive compressed public key
// 	// // const pubKeyHash = ripemd160(sha256(publicKey));
// 	// // 4️⃣ Construct the SegWit `scriptPubKey` (0x00 | 0x14 | pubKeyHash)
// 	// // const scriptPubKey = hex.encode(new Uint8Array([0x00, 0x14, ...pubKeyHash]));
// 	// utxos.forEach((utxo: any) => {
// 	// 	transaction.addInput({
// 	// 		txid: utxo.txid,
// 	// 		index: utxo.vout
// 	// 	});
// 	// });

// 	// // transaction.signIdx(privateKey, 0);
// 	// // transaction.finalize();
// 	// console.log('buildMockBitcoinSegwitTransaction: signed: ' + hex.encode(transaction.toBytes(true, true)));
// 	// const signedTx = await bitcoinRPC('signrawtransactionwithwallet', [hex.encode(transaction.toBytes(true, true))], getRpcParams());
// 	// const result = await bitcoinRPC('sendrawtransaction', [signedTx], getRpcParams());
// 	// console.log('buildMockBitcoinSegwitTransaction: broadcast result: ' + result);
// 	return 'signedTx';
// }
