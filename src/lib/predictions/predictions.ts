import axios from 'axios';
import {
	openStructuredDataSignatureRequestPopup,
	showContractCall,
	type SignatureData
} from '@stacks/connect';
import { appDetails } from '$lib/config';
import {
	bufferCV,
	Cl,
	cvToJSON,
	PostConditionMode,
	principalCV,
	serializeCV,
	serializeCVBytes,
	tupleCV,
	uintCV,
	type ClarityValue,
	type TupleCV,
	type TupleData
} from '@stacks/transactions';
import { hashSha256Sync } from '@stacks/encryption';
import { MerkleTree } from 'merkletreejs';
import { domain, domainCV, getStxAddress, getStxNetwork } from '../stacks/stacks-connect';
import {
	type Auth,
	type PollCreateEvent,
	type OpinionPoll,
	type PollVoteMessage,
	pollVoteMessageToTupleCV,
	type StoredPollVoteMessage,
	getStacksNetwork,
	pollVotesToClarityValue,
	type PredictionMarketCreateEvent,
	callContractReadOnly,
	type StoredOpinionPoll,
	verifyDaoSignature,
	type PredictionMarketStakeEvent
} from '@mijoco/stx_helpers/dist/index';
import { bytesToHex, hexToBytes } from '@stacks/common';
import { getConfig, getSession } from '$stores/store_helpers';
import { sha256 } from '@noble/hashes/sha256';

export const devFundAddress = 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP';

export type MarketData = {
	concluded: boolean;
	creator: string;
	outcome: boolean;
	marketType: number;
	metadataHash: string;
	yesPool: number;
	noPool: number;
};
export type UserStake = {
	yesAmount: number;
	noAmount: number;
};
export async function getContractData() {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/contract`;
	const response = await fetch(path);
	if (response.status === 404) return [];
	const res = await response.json();
	return res;
}

export async function getPredictionMarket(marketId: number) {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets/${marketId}`;
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
	return market.creator === getStxAddress();
}

export async function fetchMarketsStakesData(
	marketId: number
): Promise<Array<PredictionMarketStakeEvent> | undefined> {
	const path = `${getConfig().VITE_BIGMARKET_API}/pm/markets/stakes/${marketId}`;
	const response = await fetch(path);
	if (response.status === 404) return;
	const res = await response.json();
	return res;
}

export async function fetchMarketData(
	market: PredictionMarketCreateEvent
): Promise<MarketData | undefined> {
	const data = {
		contractAddress: market.votingContract.split('.')[0],
		contractName: market.votingContract.split('.')[1],
		functionName: 'get-market-data',
		functionArgs: [`0x${serializeCV(uintCV(market.marketId))}`]
	};
	try {
		//data.functionArgs = [`0x${serializeCV(uintCV(market.marketId))}`];
		const result = await callContractReadOnly(getConfig().VITE_STACKS_API, data);
		return {
			concluded: Boolean(result.value.value.concluded.value),
			creator: result.value.value.creator.value,
			outcome: Boolean(result.value.value.outcome.value),
			marketType: Number(result.value.value['market-type'].value),
			metadataHash: result.value.value['market-data-hash'].value,
			yesPool: Number(result.value.value['yes-pool'].value),
			noPool: Number(result.value.value['no-pool'].value)
		};
	} catch (err: any) {
		return undefined;
	}
}

export async function fetchUserStake(
	market: PredictionMarketCreateEvent,
	user: string
): Promise<UserStake | undefined> {
	const data = {
		contractAddress: market.votingContract.split('.')[0],
		contractName: market.votingContract.split('.')[1],
		functionName: 'get-stake-balances',
		functionArgs: [
			`0x${serializeCV(uintCV(market.marketId))}`,
			`0x${serializeCV(principalCV(user))}`
		]
	};
	try {
		const result = await callContractReadOnly(getConfig().VITE_STACKS_API, data);
		if (!result.value) return;
		return {
			yesAmount: Number(result.value.value['yes-amount'].value),
			noAmount: Number(result.value.value['no-amount'].value)
		};
	} catch (err: any) {
		return;
	}
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

export async function submitSip18PollVotes(
	pollContract: string,
	votes: Array<StoredPollVoteMessage>
) {
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
	return market.creator === getStxAddress();
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

		// Handle success response
		return response.data;
	} catch (error) {
		// Handle different error statuses
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

export async function signNewPoll(market: TupleCV<TupleData<ClarityValue>>, callback: any) {
	openStructuredDataSignatureRequestPopup({
		message: market,
		domain: domainCV(domain),
		network: getStxNetwork(),
		appDetails: {
			name: appDetails.name,
			icon: window?.location?.origin || '' + appDetails.icon
		},
		onFinish(signature) {
			let res = verifyDaoSignature(
				getConfig().VITE_NETWORK,
				getConfig().VITE_PUBLIC_APP_NAME,
				getConfig().VITE_PUBLIC_APP_VERSION,
				market,
				signature.publicKey,
				signature.signature
			);
			callback(signature);
		}
	});
}

// function sha256(contractId: string): string {
// 	const encoder = new TextEncoder(); // Creates a new TextEncoder
// 	const contractIdBytes = encoder.encode(contractId); // Encodes the string into a Uint8Array
// 	return bytesToHex(hashSha256Sync(contractIdBytes));
// }

export function generateMerkleTree(tokens: Array<string>) {
	const leaves = tokens.map((x) => sha256(x));
	const tree = new MerkleTree(leaves, hashSha256Sync);
	// const root = tree.getRoot().toString('hex');
	return tree;
}

export function generateMerkleProof(tree: MerkleTree, token: string) {
	const root = tree.getRoot().toString('hex');
	const leaf = bytesToHex(sha256(token));
	const proof = tree.getProof(leaf);
	const isValid = tree.verify(proof, leaf, root);
	console.log('Merkle Root:', root);
	console.log('Proof:', proof);
	console.log('Is valid proof:', isValid);
	return isValid;
}

export async function newStakePredictionMessage(
	market: PredictionMarketCreateEvent,
	vote: boolean,
	voter: string
): Promise<any> {
	const ts = new Date().getTime();
	return {
		attestation: vote ? 'I agree with the statement' : 'I disagree with the statement',
		'market-id': market.marketId,
		'market-data-hash': market.metadataHash,
		timestamp: ts,
		vote,
		voter,
		nftContract: undefined,
		ftContract: undefined,
		tokenId: undefined,
		proof: undefined
	};
}
// (attestation (string-ascii 100))
// (poll-id (buff 32))
// (timestamp uint)
// (vote bool)
// (voter principal)
// (nft-contract (optional <nft-trait>))
// (ft-contract (optional <ft-trait>))
// (token-id (optional uint))
// (proof (list 10 (buff 32)))),

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

export async function postPollVoteMessage(
	pollVoteObjectHash: string,
	auth: { message: PollVoteMessage; signature: SignatureData }
) {
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
