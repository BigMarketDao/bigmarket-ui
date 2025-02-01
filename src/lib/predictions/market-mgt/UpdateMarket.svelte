<script lang="ts">
	import { onMount } from 'svelte';
	import { dataHashSip18, opinionPollToTupleCV, type Auth, type OpinionPoll, type PredictionMarketCreateEvent, type StoredOpinionPoll } from '@mijoco/stx_helpers/dist/index';
	import { postCreatePollMessage } from '$lib/predictions/predictions';
	import { isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import { getConfig } from '$stores/store_helpers';
	import { signAdminMessage } from '../sip18';

	export let market: PredictionMarketCreateEvent;
	let inited = false;
	let startDelay = 5;
	let endDelay = 500;
	let merkelRoot: string | undefined;
	let contractIds: Array<string> | undefined;
	let gating = false;

	let errorMessage: string = '';
	let result: string | undefined = undefined;
	let pollMessage: any;

	let template: OpinionPoll;

	let txId: string;

	const login = async () => {
		loginStacksFromHeader(document);
	};

	const getSignature = async () => {
		market.unhashedData.createdAt = new Date().getTime();
		pollMessage = opinionPollToTupleCV(market.unhashedData.name, market.unhashedData.category, market.unhashedData.createdAt, market.unhashedData.proposer, market.token);
		const dataHash = dataHashSip18(getConfig().VITE_NETWORK, getConfig().VITE_PUBLIC_APP_NAME, getConfig().VITE_PUBLIC_APP_VERSION, pollMessage);
		await signAdminMessage(async function (auth: Auth) {
			const poll: StoredOpinionPoll = {
				...market.unhashedData,
				objectHash: dataHash,
				processed: false,
				signature: auth.signature.signature,
				publicKey: auth.signature.publicKey,
				merkelRoot: merkelRoot,
				contractIds: contractIds
			};
			const result = await postCreatePollMessage(poll);
			if (typeof result === 'string') {
				errorMessage = result;
			}
		});
	};

	onMount(async () => {
		inited = true;
	});
</script>

<div class=" py-6 text-white">
	{#if market}
		<div class="my-8 flex w-full flex-row gap-x-3">
			<div class="order-2 flex w-[350px] flex-col gap-y-5">
				<h1 class="text-2xl">Markets</h1>
				<p>Markets are run on Bitcoin Layer 2 smart contract enabled chains.</p>
				<ul class="ms-5">
					<li class="list-disc">Free for end users</li>
					<li class="list-disc">Free social integrations</li>
				</ul>
			</div>
			<div class="w-full rounded-lg border border-white p-2 py-10">
				<div class="mb-4">
					<h2 class="text-2xl">New Opinion Poll</h2>
				</div>
				<div class="">
					<div>
						<div class="flex flex-col gap-y-4">
							<div class="">
								<h2 class="text-1xl font-bold">Poll info</h2>
								<div class="bottom-1 mb-2 flex w-full flex-col justify-start">
									<span class="">{market.unhashedData.name}</span>
								</div>
								<div class="bottom-1 mb-2 flex w-full flex-col justify-start">
									<span class="">{market.unhashedData.description}</span>
								</div>
							</div>
							<div class="bottom-1 mb-2 flex w-full flex-col justify-start">
								<label for="project-name" class="">logo - enter a url to an image/pfp file you want to display for this market</label>
								<input id="logo-name" class="rounded-lg border-gray-800 p-2 text-black" bind:value={market.unhashedData.logo} type="text" aria-describedby="projectName" />
							</div>
							{#if market.unhashedData.logo}
								<div class="bottom-1 mb-2 flex w-full flex-col justify-start">
									<img width="100px" src={market.unhashedData.logo} alt="logo representing prediction market" />
								</div>
							{/if}
							<div class="">
								<h2 class="text-1xl font-bold">Start / end</h2>
								<p class="text-sm font-extralight">polls run in bitcoin block times</p>
								<div class="bottom-1 mb-2 flex w-full flex-col justify-start">
									<label for="project-start-height" class="">Start height (now plus {startDelay})</label>
									<input id="project-start-height" class="rounded-lg border-gray-800 p-2 text-black" bind:value={market.unhashedData.startBurnHeight} type="text" aria-describedby="project-start-height" />
								</div>
								<div class="bottom-1 mb-2 flex w-full flex-col justify-start">
									<label for="project-end-height" class="">End height (now plus {endDelay})</label>
									<input id="project-end-height" class="rounded-lg border-gray-800 p-2 text-black" bind:value={market.unhashedData.endBurnHeight} type="text" aria-describedby="project-end-height" />
								</div>
							</div>
							<div class="">
								<h2 class="text-1xl font-bold">Social Integrations</h2>
								<div class="bottom-1 mb-2 flex w-full flex-col justify-start">
									<label for="project-handle" class="">X project handle</label>
									<input id="project-handle" class="rounded-lg border-gray-800 p-2 text-black" bind:value={market.unhashedData.social.twitter.projectHandle} type="text" aria-describedby="project-handle" />
								</div>
								<div class="bottom-1 mb-2 flex w-full flex-col justify-start">
									<label for="project-name" class="">Discord server Id</label>
									<input id="project-serverId" class="rounded-lg border-gray-800 p-2 text-black" bind:value={market.unhashedData.social.discord.serverId} type="text" aria-describedby="project-serverId" />
								</div>
								<div class="bottom-1 mb-2 flex w-full flex-col justify-start">
									<label for="project-name" class="">Website Url</label>
									<input id="project-website" class="rounded-lg border-gray-800 p-2 text-black" bind:value={market.unhashedData.social.website.url} type="text" aria-describedby="project-website" />
								</div>
							</div>
							<div class="flex w-full justify-start gap-x-4">
								{#if isLoggedIn()}
									<button
										on:click={() => {
											errorMessage = '';
											getSignature();
										}}
										class="bg-success-01 w-[150px] items-center justify-center gap-x-1.5 rounded-xl border border-bitcoinorange bg-black px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50 md:inline-flex"
									>
										Update Logo
									</button>
								{:else}
									<button
										on:click={() => {
											errorMessage = '';
											login();
										}}
										class="bg-success-01 w-[150px] items-center justify-center gap-x-1.5 rounded-xl border border-bitcoinorange bg-black px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50 md:inline-flex"
									>
										Connect Wallet
									</button>
								{/if}
							</div>
							{#if errorMessage}
								<div class="flex w-full justify-start gap-x-4">
									{@html errorMessage}
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
