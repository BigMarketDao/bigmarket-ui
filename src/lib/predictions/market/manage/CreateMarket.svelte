<script lang="ts">
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { configStore } from '$stores/stores_config';
	import {
		bufferCV,
		listCV,
		noneCV,
		Pc,
		PostConditionMode,
		someCV,
		tupleCV,
		uintCV
	} from '@stacks/transactions';
	import {
		dataHashSip18,
		getStacksNetwork,
		opinionPollToTupleCV,
		type OpinionPoll,
		type StoredOpinionPoll
	} from '@mijoco/stx_helpers/dist/index';
	import { openContractCall, type SignatureData } from '@stacks/connect';
	import { postCreatePollMessage, signNewPoll } from '$lib/predictions/predictions';
	import {
		domain,
		explorerTxUrl,
		getStxAddress,
		isLoggedIn,
		loginStacksFromHeader
	} from '$lib/stacks/stacks-connect';
	import Gating from './Gating.svelte';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import { hexToBytes } from '@stacks/common';
	import Banner from '$lib/components/ui/Banner.svelte';

	export let examplePoll: OpinionPoll;
	export let onPollSubmit;
	let inited = false;
	let startDelay = 5;
	let endDelay = 500;
	let merkelRoot: string | undefined;
	let contractIds: Array<string> | undefined;
	let gating = false;

	let errorMessage: string = '';
	let result: string | undefined = undefined;
	let pollMessage: any;
	$: explorerUrl = `${$configStore.VITE_STACKS_API}/txid/${result}?chain=${$configStore.VITE_NETWORK}`;

	let template: OpinionPoll;

	let txId: string;

	const login = async () => {
		loginStacksFromHeader(document);
	};

	const getSignature = async () => {
		examplePoll.createdAt = new Date().getTime();
		pollMessage = opinionPollToTupleCV(
			examplePoll.createdAt,
			examplePoll.name,
			examplePoll.proposer
		);
		const dataHash = dataHashSip18(
			getConfig().VITE_NETWORK,
			getConfig().VITE_PUBLIC_APP_NAME,
			getConfig().VITE_PUBLIC_APP_VERSION,
			pollMessage
		);
		console.log('dataHash: ' + dataHash);
		await signNewPoll(pollMessage, async function (signature: SignatureData) {
			const poll: StoredOpinionPoll = {
				...examplePoll,
				objectHash: dataHash,
				processed: false,
				signature: signature.signature,
				publicKey: signature.publicKey,
				merkelRoot: merkelRoot,
				contractIds: contractIds
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

	const handleGenerateRoot = (
		newMerkelRoot: string | undefined,
		newContractIds: Array<string> | undefined
	) => {
		merkelRoot = newMerkelRoot;
		contractIds = newContractIds;
	};

	const confirmPoll = async (dataHash: string) => {
		const metadataHash = bufferCV(hexToBytes(dataHash)); // Assumes the hash is a string of 32 bytes in hex format
		const pollContract = getDaoConfig().VITE_DOA_PREDICTION_MARKET;
		await openContractCall({
			network: getStacksNetwork($configStore.VITE_NETWORK),
			postConditions: [],
			postConditionMode: PostConditionMode.Deny,
			contractAddress: pollContract.split('.')[0],
			contractName: pollContract.split('.')[1],
			functionName: 'create-market',
			functionArgs: [uintCV(0), metadataHash, listCV([])],
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
	<h1 class="mb-6 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-800">
		Create a New Prediction Market
	</h1>

	{#if inited}
		<div class="mx-auto max-w-3xl space-y-6">
			{#if txId}
				<div class="mb-3">
					<Banner
						bannerType={'warning'}
						message={`Market is being set up on chain - <a href=${explorerTxUrl(txId)} target="_blank">see transaction</a>!`}
					/>
				</div>
			{/if}
			<!-- Accordion: Markets Info -->
			<div class="rounded-md border shadow-md">
				<button
					class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200"
					type="button"
					data-accordion-target="#markets-info"
				>
					General Information
				</button>
				<div id="markets-info" class="px-4 py-4">
					<h2 class="mb-2 text-xl font-bold">Markets</h2>
					<p class="mb-4 text-gray-700">
						Markets are run on Bitcoin Layer 2 smart contract-enabled chains.
					</p>
					<p class="mb-4 text-gray-700">
						Markets are resolved by AI Agents and anyone with a stake in the market can kick off a
						dispute. Disputes are resolved by community voting.
					</p>
				</div>
			</div>
			<div class="rounded-md border shadow-md">
				<button
					class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200"
					type="button"
					data-accordion-target="#poll-info"
				>
					Poll Information
				</button>
				<div id="poll-info" class="px-4 py-4">
					<h2 class="mb-4 text-xl font-bold">Poll Info</h2>
					<div class="space-y-4">
						<div>
							<label for="poll-name" class="mb-1 block text-sm font-medium text-gray-700"
								>Name of Poll</label
							>
							<input
								id="poll-name"
								type="text"
								bind:value={template.name}
								class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label for="poll-description" class="mb-1 block text-sm font-medium text-gray-700"
								>Short Description</label
							>
							<input
								id="poll-description"
								type="text"
								bind:value={template.description}
								class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label for="poll-logo" class="mb-1 block text-sm font-medium text-gray-700"
								>Logo (URL)</label
							>
							<input
								id="poll-logo"
								type="text"
								bind:value={template.logo}
								class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						{#if template.logo}
							<div>
								<img src={template.logo} alt="Poll Logo" class="h-20 rounded-md shadow-md" />
							</div>
						{/if}
					</div>
				</div>
			</div>
			<!-- <div class="rounded-md border shadow-md">
				<button
					class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200"
					type="button"
					data-accordion-target="#poll-timing"
				>
					Start and End Times
				</button>
				<div id="poll-timing" class="px-4 py-4">
					<h2 class="mb-4 text-xl font-bold">Start / End Times</h2>
					<p class="mb-4 text-sm text-gray-500">Polls run in Bitcoin block times.</p>
					<div class="space-y-4">
						<div>
							<label for="start-height" class="mb-1 block text-sm font-medium text-gray-700"
								>Start Height (Now + {startDelay})</label
							>
							<input
								id="start-height"
								type="text"
								bind:value={template.startBurnHeight}
								class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label for="end-height" class="mb-1 block text-sm font-medium text-gray-700"
								>End Height (Now + {endDelay})</label
							>
							<input
								id="end-height"
								type="text"
								bind:value={template.endBurnHeight}
								class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>
			</div> -->
			<div class="rounded-md border shadow-md">
				<button
					class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200"
					type="button"
					data-accordion-target="#vote-gating"
				>
					Vote Gating
				</button>
				<div id="markets-info" class="px-4 py-4">
					<p class="mb-0 text-gray-700">
						Token contracts with which to gate the resolution voting - only holders of the specified
						tokens will be elligible to vote
					</p>
				</div>
				<div id="vote-gating" class="py-2">
					<Gating onGenerateRoot={handleGenerateRoot} />
				</div>
			</div>
			<div class="rounded-md border shadow-md">
				<button
					class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200"
					type="button"
					data-accordion-target="#social-integrations"
				>
					Social Integrations
				</button>
				<div id="social-integrations" class="px-4 py-4">
					<h2 class="mb-4 text-xl font-bold">Social Integrations</h2>
					<div class="space-y-4">
						<div>
							<label for="twitter-handle" class="mb-1 block text-sm font-medium text-gray-700"
								>Twitter Project Handle</label
							>
							<input
								id="twitter-handle"
								type="text"
								bind:value={template.social.twitter.projectHandle}
								class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label for="discord-id" class="mb-1 block text-sm font-medium text-gray-700"
								>Discord Server ID</label
							>
							<input
								id="discord-id"
								type="text"
								bind:value={template.social.discord.serverId}
								class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label for="website-url" class="mb-1 block text-sm font-medium text-gray-700"
								>Website URL</label
							>
							<input
								id="website-url"
								type="text"
								bind:value={template.social.website.url}
								class="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Submit Section -->
			{#if txId}
				<div class="mb-3">
					<Banner
						bannerType={'warning'}
						message={`Market is being set up on chain - <a href=${explorerTxUrl(txId)} target="_blank">see transaction</a>!`}
					/>
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
						Create Poll
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
			{#if errorMessage}
				<p class="text-red-600 mt-4">{@html errorMessage}</p>
			{/if}
		</div>
	{/if}
</div>
