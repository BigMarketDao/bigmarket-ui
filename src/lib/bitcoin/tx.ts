import { getConfig, getSession } from '$stores/store_helpers';
import { fetchTransactionHex, fetchUtxoSet, addInputs, type UTXO, inputAmt, type PSBTHolder, amountToBigUint64, REGTEST_NETWORK } from '@mijoco/btc_helpers/dist/index';
import * as btc from '@scure/btc-signer';
import { base64, hex } from '@scure/base';
import { c32addressDecode } from 'c32check';
import { concatBytes } from '@scure/btc-signer/utils';
import { getBtcAddress, getBtcBalance, getStxAddress } from '$lib/stacks/stacks-connect';
import { SignatureHash } from '@stacks/connect';

export const MAGIC_BYTES_TESTNET = '5462'; //
export const MAGIC_BYTES_MAINNET = '5862';
export const STAKE_OPCODE = '3C';
export const CLAIM_OPCODE = '3E';
export const FEE = 1000;

export async function buildAndSend(amount: number, broadcast: boolean): Promise<{ failed: boolean; message: string; transaction?: btc.Transaction }> {
	const mult = 100_000_000;
	const microStxAmount = Math.round(parseFloat(String(amount)) * mult);
	const balance = getBtcBalance();
	if (balance - FEE < microStxAmount) {
		return { failed: true, message: 'Amount exceeds your balance' };
	}
	const userPublicKey = getSession().keySets[getConfig().VITE_NETWORK].btcPubkeySegwit0!;
	const { transaction, txFee } = await buildOpReturnStakeTransaction(getConfig().VITE_MEMPOOL_API, getConfig().VITE_NETWORK, getStxAddress(), microStxAmount, userPublicKey, getBtcAddress());
	const txId = await signPSBT(transaction, broadcast);
	return { failed: false, message: txId, transaction };
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
	console.log('Unsigned response:', rawTxHex);
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

export async function buildOpReturnStakeTransaction(mempoolApi: string, network: string, stacksRecipient: string, amountSats: number, paymentPublicKey: string, paymentAddress: string): Promise<{ transaction: btc.Transaction; txFee: number }> {
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
	const data = buildDepositPayload(network, stacksRecipient);

	const transaction = new btc.Transaction({
		allowUnknowInput: true,
		allowUnknowOutput: true,
		allowUnknownInputs: true,
		allowUnknownOutputs: true
	});
	const txFee = FEE; //estimateActualFee(transaction, fees.feeInfo) * feeMultiplier;
	// no reveal fee for op_return
	addInputs(network, amountSats, txFee, transaction, false, utxos, paymentPublicKey);
	transaction.addOutput({
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
export function buildDepositPayload(network: string, stacksAddress: string): string {
	const net = getNet(network);
	return buildDepositPayloadInternal(net, 0, stacksAddress, false);
}
function buildDepositPayloadInternal(net: any, amountSats: number, address: string, opDrop: boolean): string {
	const magicBuf = typeof net === 'object' && (net.bech32 === 'tb' || net.bech32 === 'bcrt') ? hex.decode(MAGIC_BYTES_TESTNET) : hex.decode(MAGIC_BYTES_MAINNET);
	const opCodeBuf = hex.decode(STAKE_OPCODE);
	const addr = c32addressDecode(address.split('.')[0]);
	//const addr0Buf = hex.encode(amountToUint8(addr[0], 1));
	const addr0Buf = hex.decode(addr[0].toString(16));
	const addr1Buf = hex.decode(addr[1]);

	const cnameLength = new Uint8Array(1);
	//const memoLength = new Uint8Array(1);
	const principalType = address.indexOf('.') > -1 ? hex.decode('06') : hex.decode('05');
	let buf1 = concatBytes(opCodeBuf, principalType, addr0Buf, addr1Buf);
	if (address.indexOf('.') > -1) {
		const cnameBuf = new TextEncoder().encode(address.split('.')[1]);
		const cnameBufHex = hex.encode(cnameBuf);
		let cnameLen: any;
		try {
			cnameLen = cnameLength.fill(cnameBufHex.length);
		} catch (err: any) {
			cnameLen = hex.decode(cnameBuf.length.toString(8));
		}
		buf1 = concatBytes(buf1, cnameLen, cnameBuf);
	} else {
		cnameLength.fill(0);
		buf1 = concatBytes(buf1, cnameLength);
	}
	/**
	  if (memo) {
		  const memoBuf = new TextEncoder().encode(memo);
		  const memoLength = hex.decode(memoBuf.length.toString(8));
		  buf1 = concat(buf1, memoLength, memoBuf);
	  } else {
		  memoLength.fill(0);
		  buf1 = concat(buf1, memoLength);
	  }
	   */
	if (opDrop) {
		const feeBuf = amountToBigUint64(amountSats, 8);
		buf1 = concatBytes(buf1, feeBuf);
	}

	if (!opDrop) return hex.encode(concatBytes(magicBuf, buf1));
	return hex.encode(buf1);
}
