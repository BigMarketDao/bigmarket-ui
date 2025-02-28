import axios from 'axios';
import { openStructuredDataSignatureRequestPopup, showContractCall, type SignatureData } from '@stacks/connect';
import { appDetails } from '$lib/config';
import { PostConditionMode, principalCV, serializeCV, uintCV, type ClarityValue, type ListCV, type TupleCV, type TupleData } from '@stacks/transactions';
import { domain, domainCV, getStxAddress, getStxNetwork } from '../stacks/stacks-connect';
import {
	type PollVoteMessage,
	pollVoteMessageToTupleCV,
	type StoredPollVoteMessage,
	getStacksNetwork,
	pollVotesToClarityValue,
	type PredictionMarketCreateEvent,
	type StoredOpinionPoll,
	verifyDaoSignature,
	type PredictionMarketStakeEvent,
	type PollVoteEvent,
	generateMerkleTreeUsingStandardPrincipal,
	generateMerkleProof,
	proofToClarityValue,
	type TokenPermissionEvent,
	type Sip10Data,
	type DaoOverview,
	type PredictionMarketClaimEvent,
	type MarketCategory,
	type UserStake,
	type MarketData,
	type GateKeeper,
	type LeaderBoard
} from '@mijoco/stx_helpers/dist/index';
import { getConfig, getDaoConfig, getSelectedCurrency, getSession } from '$stores/store_helpers';
import { fmtMicroToStxNumber, fmtStxMicro } from '$lib/utils';

export const devFundAddress = 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP';
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validEmail(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type ProofObject = {
	position: 'left' | 'right';
	data: Buffer;
};

export function userStakeSum(userStake: UserStake) {
	try {
		return userStake && userStake.stakes ? userStake?.stakes.reduce((accumulator, currentValue) => accumulator + currentValue, 0) : 0;
	} catch (err: any) {
		return 0;
	}
}
export function totalPoolSum(stakes: Array<number> | undefined) {
	try {
		if (!stakes) return 0;
		return stakes.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	} catch (err: any) {
		return 0;
	}
}

export type Payout = {
	fiat: string;
	cryptoMicro: number;
	crypto: string;
};
export function calculatePayoutCategorical(amount: number, decimals: number, userStake: UserStake | undefined, marketData: MarketData): Array<Payout> {
	const mult = Number(`1e${decimals}`);
	const microAmount = fmtStxMicro(amount, decimals); //Math.round(amount * mult);
	const numCategories = marketData.categories.length;

	const userStakes = [];

	for (let i = 0; i < numCategories; i++) {
		userStakes.push(userStake && userStake.stakes && userStake?.stakes.length > i ? userStake?.stakes[i] : 0);
	}
	let totalStakes = [...marketData.stakes];

	// total stake in market
	const totalMarketStake = totalStakes.reduce((sum, stake) => sum + stake, 0);
	let payouts: Payout[] = [];

	for (let i = 0; i < numCategories; i++) {
		const myTotalStake = microAmount; //userStakes[i] + microAmount; // User's total stake in category i
		const categoryPool = totalStakes[i]; // Total market stake in category i

		// Calculate total stake excluding the current category
		const totalNotI = totalMarketStake - categoryPool;

		let stakeInMicro = 0;
		if (categoryPool === 0) {
			stakeInMicro = myTotalStake;
		} else {
			//payouts.push((myTotalStake * totalNotI) / categoryPool);
			stakeInMicro = myTotalStake + (myTotalStake * totalNotI) / categoryPool;
		}
		const crypto = parseFloat(fmtMicroToStxNumber(stakeInMicro, decimals).toFixed(decimals));
		const cryptoCurr = decimals === 8 ? ' BTC' : ' STX';
		const amounts = {
			fiat: convertCryptoToFiat(decimals === 6, crypto),
			cryptoMicro: stakeInMicro,
			crypto: crypto.toString() + cryptoCurr
		};
		payouts.push(amounts);
	}

	return payouts;
}
//5_0963_0144.72421664
// my tot = 3_9200_0000
export function convertFiatToNative(sip10Data: Sip10Data, amountFiat: number, currency: string): number {
	// const microAmount = fmtStxMicro(amount, decimals); //Math.round(amount * mult);
	const sess = getSession();
	const rate = sess.exchangeRates.find((c) => c.currency === currency);
	if (!rate) return 0;
	let amountNative = 0;
	if (sip10Data.symbol === 'STX') amountNative = amountFiat / (rate.stxToBtc * rate.fifteen);
	else amountNative = amountFiat / rate.fifteen;
	return amountNative; //fmtStxMicro(amountNative, sip10Data.decimals);
}
export function convertCryptoToFiat(stacks: boolean, amountNative: number): string {
	// const microAmount = fmtStxMicro(amount, decimals); //Math.round(amount * mult);
	const sess = getSession();
	const selectedCurrency = getSelectedCurrency();
	const rate = sess.exchangeRates.find((c) => c.currency === selectedCurrency.code);
	if (!rate) return '0.00';
	let amountFiat = 0;
	if (stacks) amountFiat = rate.stxToBtc * amountNative * rate.fifteen;
	else amountFiat = amountNative * rate.fifteen;
	return selectedCurrency.symbol + parseFloat(amountFiat.toFixed(2)).toLocaleString() + ' ' + selectedCurrency.code; //fmtStxMicro(amountNative, sip10Data.decimals);
}
export function convertCryptoToFiatNumber(
	selectedCurrency: {
		code: string;
		name: string;
		flag: string;
		symbol: string;
	},
	stacks: boolean,
	amountNative: number
): number {
	// const microAmount = fmtStxMicro(amount, decimals); //Math.round(amount * mult);
	const sess = getSession();
	const rate = sess.exchangeRates.find((c) => c.currency === selectedCurrency.code);
	if (!rate) return 0.0;
	let amountFiat = 0;
	if (stacks) amountFiat = rate.stxToBtc * amountNative * rate.fifteen;
	else amountFiat = amountNative * rate.fifteen;
	return parseFloat(amountFiat.toFixed(2));
}
export async function isExecutiveTeamMember(coreExecuteContractId: string | undefined, stxAddress: string): Promise<{ executiveTeamMember: boolean }> {
	let path = `${getConfig().VITE_BIGMARKET_API}/dao/events/extensions/is-core-team-member/${stxAddress}`;
	if (coreExecuteContractId) path = `${getConfig().VITE_BIGMARKET_API}/dao/events/extensions/is-core-team-member/${coreExecuteContractId}/${stxAddress}`;
	const response = await fetch(path);
	const res = await response.json();
	return res;
}
export async function canCreateMarket(): Promise<boolean> {
	const path = `${getConfig().VITE_BIGMARKET_API}/gating/create-market`;
	const response = await fetch(path);
	const gateKeeper: GateKeeper = await response.json();
	const { tree, root } = generateMerkleTreeUsingStandardPrincipal(gateKeeper.merkleRootInput);
	const { proof, valid } = generateMerkleProof(tree, getStxAddress());
	return valid;
}

export async function getClarityProofForCreateMarket(): Promise<ListCV<ClarityValue>> {
	const path = `${getConfig().VITE_BIGMARKET_API}/gating/create-market`;
	const response = await fetch(path);
	const gateKeeper = await response.json();
	const { tree, root } = generateMerkleTreeUsingStandardPrincipal(gateKeeper.merkleRootInput);
	const { proof, valid } = generateMerkleProof(tree, getStxAddress());
	if (!valid) throw new Error('Invalid proof - user will be denied this operation in contract');
	return proofToClarityValue(proof);
}
const defToken: Sip10Data = {
	symbol: 'BIG',
	name: 'BitcoinDAO Governance Token',
	decimals: 6,
	balance: 0,
	tokenUri: '',
	totalSupply: 0
};

export async function createMarketAI(proposer: string, market: { mechanism: number; source: string; suggestion: string }): Promise<StoredOpinionPoll> {
	let path = `${getConfig().VITE_BIGMARKET_API}/agent/create/by-discovery/${proposer}/${market.source}`;
	if (market.mechanism === 1) {
		path = `${getConfig().VITE_BIGMARKET_API}/agent/create/by-suggestion/${proposer}/${market.suggestion}`;
	}
	const response = await fetch(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: '' },
		body: market.mechanism === 1 ? JSON.stringify({ proposer, suggestion: market.suggestion }) : JSON.stringify({ proposer, source: market.source })
	});
	const res = (await response.json()) || [];
	return res;
}

export async function resolveMarketAI(marketId: number, marketType: number): Promise<any> {
	const path = `${getConfig().VITE_BIGMARKET_API}/agent/resolve/${marketId}/${marketType}`;
	const response = await fetch(path);
	const res = (await response.json()) || [];
	return res;
}

export async function getLeaderBoard(): Promise<LeaderBoard> {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets/leader-board`;
	const response = await fetch(path);
	const res = (await response.json()) || [];
	return res;
}
export async function getAllowedTokens(): Promise<Array<TokenPermissionEvent>> {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets/allowed-tokens`;
	const response = await fetch(path);
	const res = (await response.json()) || [];
	return res;
}

export async function getMarketCategories(): Promise<Array<MarketCategory>> {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets/categories`;
	const response = await fetch(path);
	const res = (await response.json()) || [];
	return res;
}

export function getMarketToken(marketTokenContract: string): Sip10Data {
	const sess = getSession();
	const token = sess.tokens.find((t) => t.token === marketTokenContract);
	return token?.sip10Data || defToken;
}

export function getGovernanceToken(tokens: Array<TokenPermissionEvent>): Sip10Data {
	const token = tokens.find((t) => t.token === `${getDaoConfig().VITE_DOA_DEPLOYER}.${getDaoConfig().VITE_DAO_GOVERNANCE_TOKEN}`);
	return token?.sip10Data || defToken;
}

export function getStxToken(tokenEventss: Array<TokenPermissionEvent>): Sip10Data {
	const token = tokenEventss.find((t) => t.sip10Data?.symbol === 'STX');
	return token?.sip10Data || defToken;
}

export function isSTX(token: string) {
	return token.toLowerCase().indexOf('stx') > -1;
}

export async function getDaoOverview(): Promise<DaoOverview> {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/market-dao-data`;
	const response = await fetch(path);
	const res = await response.json();
	return res;
}

export async function getPredictionMarket(marketId: number, marketType: number) {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets/${marketId}/${marketType}`;
	const response = await fetch(path);
	if (response.status === 404) return [];
	const res = await response.json();
	return res;
}

export async function fetchMarkets() {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets`;
	const response = await fetch(path);
	if (response.status === 404) return [];
	const res = await response.json();
	return res;
}

export async function fetchSip18PollVotes(pollId: string) {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/sip18-votes/${pollId}`;
	const response = await fetch(path);
	if (response.status === 404) return 'not found';
	const res = await response.json();
	return res;
}

export function canResolveMarket() {
	return devFundAddress === getStxAddress();
}
export function myMarket(market: PredictionMarketCreateEvent) {
	return market.marketData.creator === getStxAddress();
}

export async function fetchMarketStakes(marketId: number, marketType: number): Promise<Array<PredictionMarketStakeEvent>> {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/stakes/${marketId}/${marketType}`;
	const response = await fetch(path);
	if (response.status === 404) return [] as PredictionMarketStakeEvent[];
	const res = await response.json();
	return res;
}

export async function fetchMarketClaims(marketId: number, marketType: number): Promise<Array<PredictionMarketClaimEvent>> {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/claims/${marketId}/${marketType}`;
	const response = await fetch(path);
	if (response.status === 404) return [];
	const res = await response.json();
	return res;
}

export async function fetchMarketsVotes(marketId: number): Promise<Array<PollVoteEvent>> {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets/votes/${marketId}`;
	const response = await fetch(path);
	if (response.status === 404) return [];
	const res = await response.json();
	return res || [];
}

// export async function fetchMapEntry(
// 	stacksApi: string,
// 	contractAddress: string,
// 	contractName: string,
// 	mapName: string,
// 	lookupKey: ClarityValue
// ) {
// 	try {
// 		//checkAddressForNetwork(getConfig().network, contractAddress)
// 		const url = `${stacksApi}/v2/map_entry/${contractAddress}/${contractName}/${mapName}`;
// 		const response = await fetch(url, {
// 			method: 'POST',
// 			//headers: { 'Content-Type': 'application/octet-stream' },
// 			body: serializeCV(lookupKey)
// 		});
// 		const result = await response.json();
// 		return result;
// 	} catch (err) {
// 		console.log(
// 			'fetchDataVar: ' +
// 				(err as { message: string }).message +
// 				' contractAddress: ' +
// 				contractAddress
// 		);
// 	}
// }

export async function submitSip18PollVotes(pollContract: string, votes: Array<StoredPollVoteMessage>) {
	const args = pollVotesToClarityValue(votes);
	await showContractCall({
		network: getStacksNetwork(getConfig().VITE_NETWORK),
		postConditions: [],
		postConditionMode: PostConditionMode.Deny,
		contractAddress: pollContract.split('.')[0],
		contractName: pollContract.split('.')[1],
		functionName: 'batch-vote',
		functionArgs: [args.pollVotesCV],
		onFinish: (data) => {
			console.log('finished contract call!', data);
			return data.txId;
		},
		onCancel: () => {
			console.log('popup closed!');
		}
	});
}

export function isAdministrator(market: PredictionMarketCreateEvent) {
	return market.marketData.creator === getStxAddress();
}

// export async function postCreatePollMessage(newPoll: StoredOpinionPoll) {
// 	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets`;
// 	const bodyObj = JSON.stringify({ newPoll });
// 	const response = await fetch(path, {
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/json' },
// 		body: bodyObj
// 	});
// 	if (response.status === 502) return 'Market with this question already exists';
// 	if (response.status >= 400 && response.status < 500) return 'not allowed';
// 	else if (response.status >= 500) return 'error on server';
// 	const res = await response.json();
// 	return res;
// }
export async function postCreatePollMessage(newPoll: StoredOpinionPoll) {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets`;

	try {
		const response = await axios.post(
			path,
			{ newPoll },
			{
				headers: { 'Content-Type': 'application/json' }
			}
		);
		console.log('postCreatePollMessage: response: ', response);
		// Handle success response
		return response.data;
	} catch (error) {
		// Handle different error statuses
		console.log('postCreatePollMessage: error: ', error);

		if (axios.isAxiosError(error)) {
			const status = error.response?.status;

			if (status === 502) {
				return 'Market with this question already exists';
			} else if (status && status >= 400 && status < 500) {
				return 'not allowed';
			} else if (status && status >= 500) {
				return 'error on server';
			}
		}

		// Handle unexpected errors
		return 'An unexpected error occurred';
	}
}

export async function signCreateMarketRequest(market: TupleCV<TupleData<ClarityValue>>, callback: any) {
	openStructuredDataSignatureRequestPopup({
		message: market,
		domain: domainCV(domain),
		network: getStxNetwork(),
		appDetails: {
			name: appDetails.name,
			icon: window?.location?.origin || '' + appDetails.icon
		},
		onFinish(signature) {
			let res = verifyDaoSignature(getConfig().VITE_NETWORK, getConfig().VITE_PUBLIC_APP_NAME, getConfig().VITE_PUBLIC_APP_VERSION, market, signature.publicKey, signature.signature);
			callback(signature);
		}
	});
}
export async function signPollVoteMessage(pollVoteMessage: PollVoteMessage, callback: any) {
	openStructuredDataSignatureRequestPopup({
		message: pollVoteMessageToTupleCV(pollVoteMessage),
		domain: domainCV(domain),
		network: getStxNetwork(),
		appDetails: {
			name: appDetails.name,
			icon: (window?.location?.origin || '') + appDetails.icon
		},
		onFinish(data) {
			callback(data);
		}
	});
}

export async function postPollVoteMessage(pollVoteObjectHash: string, auth: { message: PollVoteMessage; signature: SignatureData }) {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/sip18-votes/${pollVoteObjectHash}`;
	const response = await fetch(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: '' },
		body: JSON.stringify(auth)
	});
	if (response.status >= 400 && response.status < 500) return 'not allowed';
	else if (response.status >= 500) return 'error on server';
	const res = await response.json();
	return res;
}
