import { getConfig } from '$stores/store_helpers';
import type { PollVoteEvent } from '@mijoco/stx_helpers/dist/index';

export async function getVotesByVoterAndMarket(votingContract: string, voter: string, marketId: number): Promise<Array<PollVoteEvent> | []> {
	const path = `${getConfig().VITE_BIGMARKET_API}/dao/voter/${votingContract}/${voter}/${marketId}`;
	const response = await fetch(path);
	if (response.status === 404) return [];
	const res = await response.json();
	return res;
}

export async function getVotesByVoter(votingContract: string, voter: string): Promise<Array<PollVoteEvent> | []> {
	const path = `${getConfig().VITE_BIGMARKET_API}/dao/voter/${votingContract}/${voter}`;
	const response = await fetch(path);
	if (response.status === 404) return [];
	const res = await response.json();
	return res;
}
