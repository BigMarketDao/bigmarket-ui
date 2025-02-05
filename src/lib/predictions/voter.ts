import { getConfig } from '$stores/store_helpers';
import { callContractReadOnly, type MarketData, type PollVoteEvent } from '@mijoco/stx_helpers/dist/index';
import { serializeCV, uintCV } from '@stacks/transactions';

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

export async function fetchMarketData(stacksApi: string, marketId: number, contractAddress: string, contractName: string): Promise<MarketData | undefined> {
	const data = {
		contractAddress,
		contractName,
		functionName: 'get-market-data',
		functionArgs: [`0x${serializeCV(uintCV(marketId))}`]
	};
	try {
		//data.functionArgs = [`0x${serializeCV(uintCV(market.marketId))}`];
		const result = await callContractReadOnly(stacksApi, data);
		const categories = result.value.value['categories'].value.map((item: any) => item.value);
		const stakes = result.value.value['stakes'].value.map((item: any) => Number(item.value));

		return {
			concluded: Boolean(result.value.value.concluded.value),
			creator: result.value.value.creator.value,
			outcome: result.value.value.outcome.value ? Number(result.value.value.outcome.value) : undefined,
			marketFeeBips: Number(result.value.value['market-fee-bips'].value),
			marketType: Number(result.value.value['market-type'].value),
			metadataHash: result.value.value['market-data-hash'].value,
			resolutionState: Number(result.value.value['resolution-state'].value),
			resolutionBurnHeight: Number(result.value.value['resolution-burn-height'].value),
			stakes: stakes,
			categories: categories
		};
	} catch (err: any) {
		return undefined;
	}
}
