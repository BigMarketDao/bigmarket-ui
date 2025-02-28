<script lang="ts">
	import { onMount } from 'svelte';
	import { configStore } from '$stores/stores_config';
	import { bufferCV, contractPrincipalCV, listCV, noneCV, PostConditionMode, someCV, stringAsciiCV, tupleCV, uintCV } from '@stacks/transactions';
	import { dataHashSip18, getStacksNetwork, MARKET_BINARY_OPTION, marketDataToTupleCV, type Criterion, type OpinionPoll, type ScalarMarketDataItem, type StoredOpinionPoll } from '@mijoco/stx_helpers/dist/index';
	import { openContractCall, type SignatureData } from '@stacks/connect';
	import { getClarityProofForCreateMarket, postCreatePollMessage, signCreateMarketRequest } from '$lib/predictions/predictions';
	import { domain, explorerTxUrl, getStxAddress, isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import { hexToBytes } from '@stacks/common';
	import Banner from '$lib/components/ui/Banner.svelte';
	import TokenSelection from './TokenSelection.svelte';
	import { Cl, Pc } from '@stacks/transactions-v6';
	import { aiMarket, sessionStore } from '$stores/stores';
	import CategorySelection from './CategorySelection.svelte';
	import MarkdownCreator from '$lib/components/ui/MarkdownCreator.svelte';
	import MarketTypeSelection from './MarketTypeSelection.svelte';
	import CriteriaSelection from './CriteriaSelection.svelte';
	import LogoDisplay from './LogoDisplay.svelte';

	export let examplePoll: StoredOpinionPoll;
	export let onPollSubmit;
	let inited = false;

	let merkelRoot: string | undefined;
	let contractIds: Array<string> | undefined;
	let token: string = examplePoll.token;
	let category: string = examplePoll.category;
	let priceFeedId: string = examplePoll.priceFeedId || 'STX/USD';
	let criteria: Criterion = examplePoll.criterion;
	let featured = examplePoll.featured;

	let errorMessage: string = '';
	let result: string | undefined = undefined;
	let pollMessage: any;
	$: explorerUrl = `${$configStore.VITE_STACKS_API}/txid/${result}?chain=${$configStore.VITE_NETWORK}`;

	let template: OpinionPoll;

	let txId: string;

	const handleSelectCategory = (newCategory: string) => {
		category = newCategory;
	};

	const handleGenerateRoot = (newMerkelRoot: string | undefined, newContractIds: Array<string> | undefined) => {
		merkelRoot = newMerkelRoot;
		contractIds = newContractIds;
	};

	const handleSelectToken = (newToken: string) => {
		token = newToken;
	};

	const login = async () => {
		loginStacksFromHeader(document);
	};

	const isContiguous = (data: Array<ScalarMarketDataItem>): boolean => {
		for (let i = 1; i < data.length; i++) {
			if (data[i].min !== data[i - 1].max) {
				return false;
			}
		}
		return true;
	};

	const getArgsCV = async (dataHash: string) => {
		const marketFeeCV = examplePoll.marketFee === 0 ? noneCV() : someCV(uintCV((examplePoll.marketFee || 0) * 100));
		const metadataHash = bufferCV(hexToBytes(dataHash)); // Assumes the hash is a string of 32 bytes in hex format
		let proof = $sessionStore.daoOverview.contractData.creationGated ? await getClarityProofForCreateMarket() : Cl.list([]);
		if (examplePoll.marketType === 2) {
			const cats = listCV(examplePoll.marketTypeDataScalar!.map((o) => tupleCV({ min: uintCV(o.min), max: uintCV(o.max) })));
			return [cats, marketFeeCV, contractPrincipalCV(examplePoll.token.split('.')[0], examplePoll.token.split('.')[1]), metadataHash, proof, Cl.principal(examplePoll.treasury), noneCV(), noneCV(), stringAsciiCV(examplePoll.priceFeedId!)];
		} else {
			const cats = listCV(examplePoll.marketTypeDataCategorical!.map((o) => stringAsciiCV(o.label)));
			return [cats, marketFeeCV, contractPrincipalCV(examplePoll.token.split('.')[0], examplePoll.token.split('.')[1]), metadataHash, proof, Cl.principal(examplePoll.treasury)];
		}
	};

	const getSignature = async () => {
		examplePoll.createdAt = new Date().getTime();
		if (!token) {
			errorMessage = 'Please select a token';
			return;
		}
		examplePoll.token = token;
		if (!category) {
			errorMessage = 'Please select a category';
			return;
		}
		examplePoll.category = category;
		examplePoll.priceFeedId = priceFeedId;
		examplePoll.criterion = criteria;
		if (!examplePoll.description) {
			errorMessage = 'Please enter a description';
			return;
		}
		if (!examplePoll.name) {
			errorMessage = 'Please enter a name';
			return;
		}
		if (!examplePoll.social.twitter.projectHandle) {
			errorMessage = 'Please enter a x/twitter handle';
			return;
		}
		if (!examplePoll.social.discord.serverId) {
			errorMessage = 'Please enter a discord serverId';
			return;
		}

		if (!examplePoll.criterion) {
			errorMessage = 'Please enter a discord serverId';
			return;
		}
		if (examplePoll.criterion) {
			if (!examplePoll.criterion.criteria) {
				errorMessage = 'Please enter a criteria for market resolution';
				return;
			}
			if (!examplePoll.criterion.sources || examplePoll.criterion.sources.length === 0) {
				errorMessage = 'Please enter web references for market resolution';
				return;
			}
			if (!examplePoll.criterion.resolvesAt) {
				errorMessage = 'Please enter web references for market resolution';
				return;
			}
		}
		pollMessage = marketDataToTupleCV(examplePoll.name, examplePoll.category, examplePoll.createdAt, examplePoll.proposer, examplePoll.token);
		const dataHash = dataHashSip18(getConfig().VITE_NETWORK, getConfig().VITE_PUBLIC_APP_NAME, getConfig().VITE_PUBLIC_APP_VERSION, pollMessage);
		console.log('dataHash: ' + dataHash);
		await signCreateMarketRequest(pollMessage, async function (signature: SignatureData) {
			const poll: StoredOpinionPoll = {
				...examplePoll,
				objectHash: dataHash,
				processed: false,
				signature: signature.signature,
				publicKey: signature.publicKey,
				merkelRoot: merkelRoot,
				contractIds: contractIds,
				featured
			};
			console.log('signature: ' + signature.signature);
			console.log('publicKey: ' + signature.publicKey);
			console.log('domain: ', domain);
			const result = await postCreatePollMessage(poll);
			aiMarket.set(poll);
			if (typeof result === 'string') {
				errorMessage = result;
			} else {
				confirmPoll(dataHash);
			}
		});
	};

	const confirmPoll = async (dataHash: string) => {
		let contractName = getDaoConfig().VITE_DAO_MARKET_PREDICTING;

		if (examplePoll.marketType === 0) {
			examplePoll.marketTypeDataCategorical = MARKET_BINARY_OPTION;
		} else if (examplePoll.marketType === 1) {
			if (!examplePoll.marketTypeDataCategorical || examplePoll.marketTypeDataCategorical.length < 3) {
				errorMessage = 'Categorical markets must have at least three options';
				return;
			}
		} else if (examplePoll.marketTypeDataScalar && examplePoll.marketType === 2) {
			examplePoll.priceFeedId = priceFeedId;
			if (!isContiguous(examplePoll.marketTypeDataScalar)) {
				errorMessage = 'Contiguous values only - the min must be the max of the previous ';
				return;
			}
			contractName = getDaoConfig().VITE_DAO_MARKET_SCALAR;
		}
		const ra = $sessionStore?.daoOverview?.contractData?.resolutionAgent || '';
		const postConditions = [];
		if (ra !== getStxAddress()) postConditions.push(Pc.principal(getStxAddress()).willSendEq($sessionStore.daoOverview.contractData.marketCreateFee).ustx());
		await openContractCall({
			network: getStacksNetwork($configStore.VITE_NETWORK),
			postConditions,
			postConditionMode: PostConditionMode.Deny,
			contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
			contractName,
			functionName: 'create-market',
			functionArgs: await getArgsCV(dataHash),
			onFinish: (data: any) => {
				txId = data.txId;
				console.log('finished contract call!', data);
				onPollSubmit(txId);
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	onMount(async () => {
		template = examplePoll;
		if (examplePoll.outcomes) {
			template.marketType = examplePoll.outcomes?.length === 2 ? 0 : 1;
			template.marketTypeDataCategorical = [];
			for (const o of examplePoll.outcomes) {
				template.marketTypeDataCategorical.push({ label: o });
			}
		}
		inited = true;
	});
</script>

<div class="py-6">
	<!-- Page Heading -->
	<h1 class="mb-6 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-800">Create a New Prediction Market</h1>

	{#if inited}
		<div class="mx-auto max-w-3xl space-y-6">
			{#if txId}
				<div class="mb-3">
					<Banner bannerType={'warning'} message={`Market is being set up on chain - <a href=${explorerTxUrl(txId)} target="_blank">see transaction</a>!`} />
				</div>
			{/if}
			{#if errorMessage}
				<div class="mb-3">
					<Banner bannerType={'danger'} message={errorMessage} />
				</div>
			{/if}
			<!-- Accordion: Markets Info -->
			<div class="rounded-md border shadow-md">
				<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#markets-info"> General Information </button>
				<div id="markets-info" class="px-4 py-4">
					<h2 class="mb-2 text-xl font-bold">Markets</h2>
					<p class="mb-4">Markets are run on Bitcoin Layer 2 smart contract-enabled chains.</p>
					<p class="mb-4">Version 1 of BigMarket enables simple yes/no prediction markets.</p>
					<p class="mb-4">Markets are resolved, in the first instance, by the DAO core team. Anyone with a stake in the market can dispute the resolution which triggers a Community Oracle DAO vote to resolve the market.</p>
				</div>
			</div>
			<div class="rounded-md border shadow-md">
				<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#poll-info"> Market Information </button>
				<div id="poll-info" class="px-4 py-4">
					<div class="space-y-4">
						<div>
							<label for="poll-name" class="mb-1 block text-sm font-medium">Market Title</label>
							<input id="poll-name" type="text" bind:value={template.name} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						<div>
							<label class="flex cursor-pointer items-center space-x-2">
								<input id="featured" type="checkbox" bind:checked={featured} class="h-5 w-5 rounded-md border-gray-300 text-blue-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500" />
								<span class="text-sm font-medium text-gray-200">Featured Market</span>
							</label>
						</div>
						<div>
							<label for="poll-description" class="mb-1 block text-sm font-medium">Market Description</label>
							<div class=""><MarkdownCreator bind:value={template.description} /></div>
						</div>
						<div>
							<label for="treasury" class="mb-1 block text-sm font-medium">Treasury</label>
							<input id="treasury" type="text" bind:value={template.treasury} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						<div>
							<label for="poll-logo" class="mb-1 block text-sm font-medium">Market Image (URL)</label>
							<input id="poll-logo" type="text" bind:value={template.logo} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						{#if template.logo}
							<LogoDisplay logo={template.logo} />
						{/if}
						<div>
							<label for="poll-logo" class="mb-1 block text-sm font-medium">Percentage Market Fee (maximum is {$sessionStore.daoOverview.contractData.marketFeeBipsMax / 100}%)</label>
							<input id="poll-logo" type="number" bind:value={template.marketFee} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
					</div>
				</div>
			</div>
			<MarketTypeSelection bind:priceFeedId bind:marketType={template.marketType} bind:marketTypeDataCategorical={template.marketTypeDataCategorical} bind:marketTypeDataScalar={template.marketTypeDataScalar} />
			<CriteriaSelection bind:criteria marketType={template.marketType} />
			<TokenSelection currentToken={token} onSelectToken={handleSelectToken} />
			<CategorySelection categoryName={category} onSelectCategory={handleSelectCategory} />

			<!-- <div class="rounded-md border shadow-md">
				<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#vote-gating"> Vote Gating </button>
				<div id="markets-info" class="px-4 py-4">
					<p class="mb-0 ">Token contracts with which to gate the resolution voting - only holders of the specified tokens will be elligible to vote</p>
				</div>
				<div id="vote-gating" class="py-2">
					<Gating onGenerateRoot={handleGenerateRoot} />
				</div>
			</div> -->
			<div class="rounded-md border shadow-md">
				<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#social-integrations"> Social Integrations </button>
				<div id="social-integrations" class="px-4 py-4">
					<h2 class="mb-4 text-xl font-bold">Social Integrations</h2>
					<div class="space-y-4">
						<div>
							<label for="twitter-handle" class="mb-1 block text-sm font-medium">Twitter Market Handle</label>
							<input id="twitter-handle" type="text" bind:value={template.social.twitter.projectHandle} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						<div>
							<label for="discord-id" class="mb-1 block text-sm font-medium">Discord Server ID</label>
							<input id="discord-id" type="text" bind:value={template.social.discord.serverId} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						<div>
							<label for="website-url" class="mb-1 block text-sm font-medium">External Market Link (Optional)</label>
							<input id="website-url" type="text" bind:value={template.social.website.url} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
					</div>
				</div>
			</div>

			<!-- Submit Section -->
			{#if txId}
				<div class="mb-3">
					<Banner bannerType={'warning'} message={`Market is being set up on chain - <a href=${explorerTxUrl(txId)} target="_blank">see transaction</a>!`} />
				</div>
			{/if}
			{#if errorMessage}
				<div class="mb-3">
					<Banner bannerType={'danger'} message={errorMessage} />
				</div>
			{/if}
			<div class="flex justify-end space-x-4">
				{#if isLoggedIn()}
					<button
						class="bg-green-500 rounded-md px-4 py-2 font-medium text-white shadow-sm hover:bg-green-600"
						on:click={() => {
							errorMessage = '';
							getSignature();
						}}
					>
						Create Market
					</button>
				{:else}
					<button
						class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-600"
						on:click={() => {
							errorMessage = '';
							login();
						}}
					>
						Connect Wallet
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
