import { type ExchangeRate } from '@mijoco/stx_helpers/dist/index';

export async function fetchExchangeRates(): Promise<Array<ExchangeRate>> {
	//const path = `${getConfig().VITE_BRIDGE_API}/rates/v1/tx/rates`;
	const path = `https://api.stx.eco/bridge-api/rates/v1/tx/rates`;
	try {
		const response = await fetch(path);
		const res = await response.json();
		return res;
	} catch (err) {
		return [];
	}
}
