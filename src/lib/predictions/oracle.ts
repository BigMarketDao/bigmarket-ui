import { getConfig } from '$stores/store_helpers';
import { callContractReadOnly, type PollVoteEvent } from '@mijoco/stx_helpers/dist/index';
import { Cl, serializeCV } from '@stacks/transactions';

export async function readPythEvents(): Promise<Array<PollVoteEvent> | []> {
	const path = `${getConfig().VITE_BIGMARKET_API}/oracle/pyth/events`;
	const response = await fetch(path);
	if (response.status === 404) return [];
	const res = await response.json();
	return res;
}

export async function readDiaPrice(stacksApi: string, contractAddress: string, contractName: string) {
	const data = {
		contractAddress,
		// contractAddress: 'ST3Q982CNNQ00E3FH6853EMTA5FPF1M3ENJTHB8PY',
		// contractAddress: 'SP1G48FZ4Y7JY8G2Z0N51QTCYGBQ6F4J43J77BQC0',
		contractName,
		functionName: 'get-value',
		functionArgs: [`0x${serializeCV(Cl.stringAscii('STX/USD'))}`]
	};
	const clarityResponse = await callContractReadOnly(stacksApi, data);
	const price = clarityResponse.value.value.value.value / 1e8;
	const ts = clarityResponse.value.value.timestamp.value;
	return { ts, price };
}
