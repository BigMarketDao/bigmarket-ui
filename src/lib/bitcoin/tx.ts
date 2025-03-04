import { getConfig } from '$stores/store_helpers';
import { fetchTransactionHex } from '@mijoco/btc_helpers';
import type { PayloadType } from '@mijoco/stx_helpers/dist/index';
import { parsePayloadFromTransaction } from '@mijoco/btc_helpers/sbtc/payload_utils';

export async function payloadParseTransaction(txid: string): Promise<any> {
	const txHex = await fetchTransactionHex(getConfig().VITE_MEMPOOL_API, txid);
	if (!txHex) throw new Error('Unable to find transaction from txid: ' + txid);
	let payload: PayloadType = await parsePayloadFromTransaction(getConfig().VITE_NETWORK, txHex);
	return payload;
}
