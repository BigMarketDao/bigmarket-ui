<script lang="ts">
	import { onMount } from 'svelte';
	import { bufferCV, Cl, noneCV, Pc, PostConditionMode, trueCV, uintCV } from '@stacks/transactions';
	import { showContractCall } from '@stacks/connect';
	import { sessionStore } from '$stores/stores';
	import { fetchResolutionVote, fullBalanceInSip10Token, type MarketData, type PollVoteEvent, type PredictionMarketCreateEvent, type ResolutionVote, type Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { getStacksNetwork, getTransaction } from '@mijoco/stx_helpers/dist/stacks-node';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import { explorerTxUrl, getStxAddress, isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { hexToBytes } from '@stacks/common';
	import { fetchMarketsVotes, getGovernanceToken, getMarketToken, isSTX } from '$lib/predictions/predictions';
	import BlockHeightProgressBar from '$lib/components/common/BlockHeightProgressBar.svelte';
	import DaoVotingPowerInput from './do-vote/DaoVotingPowerInput.svelte';
	import { fmtMicroToStx } from '$lib/utils';
	import { getVotesByVoterAndMarket } from '$lib/predictions/voter';

	export let market: PredictionMarketCreateEvent;
	let resolutionVote: ResolutionVote;
	let marketVotes: Array<PollVoteEvent>;
	let myVotes: Array<PollVoteEvent>;
	let myVotesAmount: number;
	let currentBurnHeight = $sessionStore.stacksInfo.burn_block_height;
	let totalBalanceUstx = 0;
	let votingPower = 0;
	let votedPower = 0;
	let txVoting = false;
	let showTable = false;
	let sip10Data: Sip10Data;

	let errorMessage: string | undefined;
	let txId: string;

	function handleVotingTypeChange(newTxVoting: boolean) {
		txVoting = newTxVoting;
	}

	function handleVotingPowerChange(amount: number) {
		if (amount > totalBalanceUstx) {
			errorMessage = 'Maximum voting power is ' + fmtMicroToStx(totalBalanceUstx) + ' STX';
			return;
		}
		votingPower = amount;
	}

	const castVote = async (vfor: number, amount: number) => {
		if (amount === 0) {
			errorMessage = 'please indicate how much governance token you wish to vote with';
			return;
		}
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = getDaoConfig().VITE_DAO_MARKET_VOTING;
		let functionName = 'vote';

		const mult = isSTX(market.marketData.token) ? 1_000_000 : Number(`1e${sip10Data.decimals}`);
		const microStxAmount = Math.round(parseFloat(String(amount)) * mult);
		const postConditions = [];
		const formattedToken = (getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DAO_GOVERNANCE_TOKEN) as `${string}.${string}`;
		const postConditionFt = Pc.principal(getStxAddress()).willSendEq(microStxAmount).ft(formattedToken, 'bmg-token');
		postConditions.push(postConditionFt);

		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions,
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [
				uintCV(market.marketId),
				bufferCV(hexToBytes(market.marketData.metadataHash)),
				uintCV(vfor),
				uintCV(microStxAmount),
				noneCV() //reclaim gov. tokens from this vote
			],
			onFinish: (data) => {
				txId = data.txId;
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	const concludeVote = async () => {
		if (!isLoggedIn()) {
			loginStacksFromHeader(document);
			return;
		}
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = getDaoConfig().VITE_DAO_MARKET_VOTING;
		let functionName = 'conclude-market-vote';

		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions: [],
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [Cl.contractPrincipal(getDaoConfig().VITE_DOA_DEPLOYER, getDaoConfig().VITE_DAO_MARKET_PREDICTING), uintCV(market.marketId)],
			onFinish: (data) => {
				txId = data.txId;
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	const lookupTransaction = async (txId: string) => {
		return await getTransaction(getConfig().VITE_STACKS_API, txId);
	};

	onMount(async () => {
		resolutionVote = await fetchResolutionVote(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], getDaoConfig().VITE_DAO_MARKET_VOTING);
		marketVotes = await fetchMarketsVotes(market.marketId, market.marketType, market.votingContract);
		sip10Data = getGovernanceToken($sessionStore.tokens);

		if (isLoggedIn()) {
			const voter = getStxAddress();
			const index = marketVotes.findIndex((o) => o.voter === voter);
			myVotes = marketVotes.filter((o) => o.voter === voter);
			if (myVotes) myVotesAmount = myVotes.reduce((sum, vote) => sum + vote.amount, 0);
			const daoVotes = await getVotesByVoterAndMarket(market.votingContract, voter, market.marketId);
			totalBalanceUstx = await fullBalanceInSip10Token(getConfig().VITE_STACKS_API, getStxAddress(), `${getDaoConfig().VITE_DOA_DEPLOYER}.${getDaoConfig().VITE_DAO_GOVERNANCE_TOKEN}`);
			votingPower = 0;
		}
		if (localStorage.getItem('resolve-market-' + market.marketId)) {
			const txIdObj = localStorage.getItem('resolve-market-' + market.marketId);
			if (txIdObj) {
				const potentialTxId = JSON.parse(txIdObj).txId;
				const tx = await lookupTransaction(potentialTxId);
				if (tx && tx.tx_status === 'pending' && tx.sender_address === $sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress) {
					txId = potentialTxId;
				} else {
					if (tx.sender_address === $sessionStore.keySets[getConfig().VITE_NETWORK].stxAddress) {
						localStorage.removeItem('resolve-market-' + market.marketId);
					}
				}
			}
		}
	});
</script>

<div class="card bg-neutral shadow-xl">
	<div class="card-body">
		{#if resolutionVote && market.marketData}
			<div class="flex flex-col gap-y-4">
				{#if txId}
					<div class="my-4">
						<Banner bannerType={'warning'} message={'your request is being processed. See <a href="' + explorerTxUrl(txId) + '" target="_blank">explorer!</a>'} />
					</div>
				{/if}
				{#if errorMessage}
					<div class="my-4">
						{errorMessage}
					</div>
				{/if}
				<div class="">
					{#if !resolutionVote.concluded && resolutionVote.endBurnHeight < currentBurnHeight}
						<h2 class="mb-4 text-lg font-semibold text-gray-800">Voting window closed</h2>
						<p class="mb-4 font-semibold text-gray-800">Cast your vote to resolve this market.</p>
					{:else if resolutionVote.concluded}
						<h2>Voting Concluded</h2>
						<p class="mb-4 font-semibold text-gray-800">Market resolved {market.marketData.outcome}.</p>
					{:else}
						<h2>Voting in Progress</h2>
						<p class="mb-4 font-semibold text-gray-800">Cast your vote to resolve this market.</p>
					{/if}
					{#if showTable}
						<table class="w-full table-auto border-collapse border border-gray-300">
							<thead>
								<tr class="bg-gray-200">
									<th class="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Label</th>
									<th class="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Value</th>
								</tr>
							</thead>
							<tbody>
								<tr class="bg-white">
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">proposer</td>
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
										{resolutionVote.proposer}
									</td>
								</tr>
								<tr class="bg-gray-50">
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">End Height</td>
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
										{resolutionVote.endBurnHeight}
									</td>
								</tr>
								<tr class="bg-gray-50">
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Concluded</td>
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
										{resolutionVote.concluded}
									</td>
								</tr>
								{#if resolutionVote.concluded}
									<tr class="bg-gray-50">
										<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Winner</td>
										<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
											{resolutionVote.winningCategory}
										</td>
									</tr>
								{/if}
								<tr class="bg-gray-50">
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Votes For</td>
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
										{resolutionVote.votes[1]}
									</td>
								</tr>
								<tr class="bg-gray-50">
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">Votes Against</td>
									<td class="border border-gray-300 px-4 py-2 text-sm text-gray-800">
										{resolutionVote.votes[0]}
									</td>
								</tr>
							</tbody>
						</table>
					{/if}
					{#if totalBalanceUstx === 0}
						<div class="my-5">
							<p>
								You have no governacne tokens - they may be locked on other proposals. <br />Visit <a class="font-semibold text-blue-700 hover:text-blue-800" href="/dao/mint">bdg mint page</a> to unlock or mint some more.
							</p>
						</div>
					{:else if resolutionVote.endBurnHeight >= currentBurnHeight}
						<div>
							<DaoVotingPowerInput {sip10Data} {totalBalanceUstx} {votingPower} {txVoting} onVotingPowerChange={handleVotingPowerChange} onVotingTypeChange={handleVotingTypeChange} />
						</div>

						{#if errorMessage}
							<div class="my-4">
								<Banner bannerType={'danger'} message={errorMessage} />
							</div>
						{/if}
						{#if txId}
							<div class="my-5">
								<Banner bannerType={'warning'} message={'your request is being processed. See <a href="' + explorerTxUrl(txId) + '" target="_blank">explorer!</a>'} />
							</div>
						{/if}
						<div class="flex w-full gap-2">
							{#each market.marketData.categories as category, index}
								<button
									on:click={() => {
										errorMessage = undefined;
										castVote(index, votingPower);
									}}
									class="btn btn-primary w-1/2"
								>
									{category}
								</button>
							{/each}
						</div>

						<div class="mt-4">
							<BlockHeightProgressBar startBurnHeight={market.marketData.resolutionBurnHeight} stopBurnHeight={resolutionVote.endBurnHeight} />
						</div>
						{#if myVotes && myVotes.length > 0}
							<div>Voted {myVotes.length} times with {fmtMicroToStx(myVotesAmount, sip10Data.decimals)} governance tokens</div>
						{/if}
					{:else}
						<p class="my-5">Thank you for your vote.</p>
					{/if}

					{#if !resolutionVote.concluded && resolutionVote.endBurnHeight < currentBurnHeight}
						<p class="my-5">The vote needs to be concluded before claims can be made.</p>
						<button
							on:click={() => {
								errorMessage = undefined;
								concludeVote();
							}}
							class="mt-4 rounded bg-green-700 px-4 py-2 text-white hover:bg-green-600"
						>
							CONCLUDE VOTE
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
