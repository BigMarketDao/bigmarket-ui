import { getConfig } from '$stores/store_helpers';
import { type DaoOverview, type PollVoteEvent, type TokenSalePurchases } from '@mijoco/stx_helpers/dist/index';

export async function fetchTokenSalePurchases(address: string): Promise<TokenSalePurchases> {
	const path = `${getConfig().VITE_BIGMARKET_API}/dao/token-sale/${address}`;
	const response = await fetch(path);
	if (response.status === 404) return { amount: [] };
	const res = await response.json();
	return res;
}
