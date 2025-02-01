<script lang="ts">
	import { onMount } from 'svelte';
	import { configStore } from '$stores/stores_config';
	import { bufferCV, contractPrincipalCV, listCV, PostConditionMode, someCV, uintCV, type ClarityValue, type ListCV } from '@stacks/transactions';
	import { dataHashSip18, getStacksNetwork, opinionPollToTupleCV, proofToClarityValue, type OpinionPoll, type StoredOpinionPoll } from '@mijoco/stx_helpers/dist/index';
	import { openContractCall, type SignatureData } from '@stacks/connect';
	import { getClarityProofForCreateMarket, postCreatePollMessage, signNewPoll } from '$lib/predictions/predictions';
	import { domain, explorerTxUrl, getStxAddress, isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import { hexToBytes } from '@stacks/common';
	import Banner from '$lib/components/ui/Banner.svelte';
	import Gating from './Gating.svelte';
	import TokenSelection from './TokenSelection.svelte';
	import { Cl, Pc } from '@stacks/transactions-v6';
	import { sessionStore } from '$stores/stores';
	import CategorySelection from './CategorySelection.svelte';
	import MarkdownCreator from '$lib/components/ui/MarkdownCreator.svelte';

	export let examplePoll: OpinionPoll;
	export let onPollSubmit;
	let inited = false;
	let merkelRoot: string | undefined;
	let contractIds: Array<string> | undefined;
	let token: string;
	let category: string;

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

	const getSignature = async () => {
		examplePoll.createdAt = new Date().getTime();
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
		if (!examplePoll.description) {
			errorMessage = 'Please enter a description';
			return;
		}
		if (!examplePoll.name) {
			errorMessage = 'Please enter a name';
			return;
		}
		if (!examplePoll.criteria) {
			errorMessage = 'Please enter a criteria';
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
		pollMessage = opinionPollToTupleCV(examplePoll.name, examplePoll.category, examplePoll.createdAt, examplePoll.proposer, examplePoll.token);
		const dataHash = dataHashSip18(getConfig().VITE_NETWORK, getConfig().VITE_PUBLIC_APP_NAME, getConfig().VITE_PUBLIC_APP_VERSION, pollMessage);
		console.log('dataHash: ' + dataHash);
		await signNewPoll(pollMessage, async function (signature: SignatureData) {
			const poll: StoredOpinionPoll = {
				...examplePoll,
				objectHash: dataHash,
				processed: false,
				signature: signature.signature,
				publicKey: signature.publicKey,
				merkelRoot: merkelRoot,
				contractIds: contractIds,
				featured: false
			};
			console.log('signature: ' + signature.signature);
			console.log('publicKey: ' + signature.publicKey);
			console.log('domain: ', domain);
			const result = await postCreatePollMessage(poll);
			if (typeof result === 'string') {
				errorMessage = result;
			} else {
				confirmPoll(dataHash);
			}
		});
	};

	const confirmPoll = async (dataHash: string) => {
		const metadataHash = bufferCV(hexToBytes(dataHash)); // Assumes the hash is a string of 32 bytes in hex format
		let proof = $sessionStore.daoOverview.contractData.creationGated ? await getClarityProofForCreateMarket() : Cl.list([]);
		const postConditions = [];
		postConditions.push(Pc.principal(getStxAddress()).willSendEq($sessionStore.daoOverview.contractData.marketCreateFee).ustx());
		await openContractCall({
			network: getStacksNetwork($configStore.VITE_NETWORK),
			postConditions,
			postConditionMode: PostConditionMode.Deny,
			contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
			contractName: getDaoConfig().VITE_DAO_MARKET_PREDICTING,
			functionName: 'create-market',
			functionArgs: [uintCV(0), someCV(uintCV(200)), contractPrincipalCV(examplePoll.token.split('.')[0], examplePoll.token.split('.')[1]), metadataHash, proof],
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
					<p class="mb-4 text-gray-700">Markets are run on Bitcoin Layer 2 smart contract-enabled chains.</p>
					<p class="mb-4 text-gray-700">Version 1 of BigMarket enables simple yes/no prediction markets.</p>
					<p class="mb-4 text-gray-700">Markets are resolved, in the first instance, by the DAO core team. Anyone with a stake in the market can dispute the resolution which triggers a Community Oracle DAO vote to resolve the market.</p>
				</div>
			</div>
			<div class="rounded-md border shadow-md">
				<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#poll-info"> Market Information </button>
				<div id="poll-info" class="px-4 py-4">
					<div class="space-y-4">
						<div>
							<label for="poll-name" class="mb-1 block text-sm font-medium text-gray-700">Market Title</label>
							<input id="poll-name" type="text" bind:value={template.name} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						<div>
							<label for="poll-description" class="mb-1 block text-sm font-medium text-gray-700">Market Description</label>
							<div class=""><MarkdownCreator bind:value={template.description} /></div>
						</div>
						<div>
							<label for="poll-description" class="mb-1 block text-sm font-medium text-gray-700">Resolution Criteria</label>
							<div class=""><MarkdownCreator bind:value={template.criteria} /></div>
						</div>
						<CategorySelection onSelectCategory={handleSelectCategory} />
						<div>
							<label for="poll-logo" class="mb-1 block text-sm font-medium text-gray-700">Market Image (URL)</label>
							<input id="poll-logo" type="text" bind:value={template.logo} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						{#if template.logo}
							<div>
								<img src={template.logo} alt="Poll Logo" class="h-20 rounded-md shadow-md" />
							</div>
						{/if}
					</div>
				</div>
			</div>
			<TokenSelection onSelectToken={handleSelectToken} />

			<!-- <div class="rounded-md border shadow-md">
				<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#vote-gating"> Vote Gating </button>
				<div id="markets-info" class="px-4 py-4">
					<p class="mb-0 text-gray-700">Token contracts with which to gate the resolution voting - only holders of the specified tokens will be elligible to vote</p>
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
							<label for="twitter-handle" class="mb-1 block text-sm font-medium text-gray-700">Twitter Market Handle</label>
							<input id="twitter-handle" type="text" bind:value={template.social.twitter.projectHandle} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						<div>
							<label for="discord-id" class="mb-1 block text-sm font-medium text-gray-700">Discord Server ID</label>
							<input id="discord-id" type="text" bind:value={template.social.discord.serverId} class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
						</div>
						<div>
							<label for="website-url" class="mb-1 block text-sm font-medium text-gray-700">External Market Link (Optional)</label>
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
						class="bg-green-500 hover:bg-green-600 rounded-md px-4 py-2 font-medium text-white shadow-sm"
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
