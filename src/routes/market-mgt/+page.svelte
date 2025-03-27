<script lang="ts">
	import { onMount } from 'svelte';
	import CreateMarket from '$lib/predictions/market-mgt/CreateMarket.svelte';
	import { explorerTxUrl, getStxAddress } from '$lib/stacks/stacks-connect';
	import type { OpinionPoll, StoredOpinionPoll } from '@mijoco/stx_helpers/dist/index';
	import { sessionStore } from '$stores/stores';
	import { canCreateMarket } from '$lib/predictions/predictions';
	import EmailRegistration from '$lib/components/EmailRegistration.svelte';
	import { ArrowRight } from 'lucide-svelte';
	import { fmtMicroToStx } from '$lib/utils';
	import DaoHero from '$lib/components/common/DaoHero.svelte';

	let txId: string;
	$: explorerUrl = explorerTxUrl(txId);
	let startDelay = 5;
	let endDelay = 500;
	$: canCreate = false;
	$: canPrompt = false;
	let examplePoll: StoredOpinionPoll;

	const handlePollSubmission = (data: any) => {
		txId = data;
	};

	examplePoll = {
		name: 'Will Tesla publicly announce concerns about trade tariffs by 2025-04-15?',
		category: 'meme',
		description: "This market predicts whether Tesla will issue a public statement or announcement expressing concerns about the impact of Donald Trump's trade tariffs on its business by 2025-04-15.",
		criterion: {
			resolvesAt: new Date().getTime(),
			sources: ['BBC News', "Elon Musk's Twitter/X account", 'Tesla Press Releases'],
			criteria: "The market resolves to 'Yes' if Tesla releases an official statement, press release, or public comment (via CEO Elon Musk or other executives) expressing concerns about trade tariffs by 2025-04-15. Otherwise, it resolves to 'No'."
		},
		token: '',
		priceFeedId: 'STX/USD/0',
		treasury: getStxAddress(),
		logo: 'https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/01ef/live/2045d160-00c1-11f0-8b2a-c7cde80a6cf3.jpg.webp',
		social: {
			twitter: {
				projectHandle: 'Stacks'
			},
			discord: {
				serverId: '1306302974515089510'
			},
			website: {
				url: 'https://www.stacks.co/'
			}
		},
		createdAt: new Date().getTime(),
		startBurnHeight: ($sessionStore?.poxInfo?.current_burnchain_block_height || 0) + startDelay,
		endBurnHeight: ($sessionStore?.poxInfo?.current_burnchain_block_height || 0) + endDelay,
		proposer: getStxAddress(),
		marketType: 1,
		marketFee: 2,
		objectHash: '',
		processed: false,
		signature: '',
		publicKey: '',
		featured: false
	};

	onMount(async () => {
		canCreate = await canCreateMarket();
		canPrompt = true;
	});
</script>

<svelte:head>
	<title>Create Market</title>
	<meta name="description" content="Create prediction markets at bigmarket.ai" />
</svelte:head>

<div class="min-h-screen bg-[#0A0A1A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0A1A] to-[#0A0A1A]">
	<!-- Hero Section -->
	<DaoHero title={'Create a Market'} subtitle={'Launch your own prediction market on Bitcoin L2. Set the terms, define outcomes, and let the community trade.'} />

	<!-- Quick Info Cards -->
	<div class="bg-[#]/50 border-b border-purple-900/20 py-12">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
					<div class="">
						<p class="text-indigo-200/70 text-sm">Creation Fee</p>
						<p class="mt-2 text-3xl font-bold text-white">{fmtMicroToStx($sessionStore.daoOverview.contractData.marketCreateFee)} STX</p>
						<p class="mt-1 text-sm text-purple-400">One-time fee</p>
					</div>
				</div>

				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
					<div class="">
						<p class="text-indigo-200/70 text-sm">Market Fee</p>
						<p class="mt-2 text-3xl font-bold text-white">0-{$sessionStore.daoOverview.contractData.marketFeeBipsMax / 100}%</p>
						<p class="mt-1 text-sm text-purple-400">Customizable</p>
					</div>
				</div>

				<!-- <div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
					<div class="">
						<p class="text-indigo-200/70 text-sm">Resolution Time</p>
						<p class="mt-2 text-3xl font-bold text-white">24h-1y</p>
						<p class="mt-1 text-sm text-purple-400">Average 2 days</p>
					</div>
				</div>
 -->
				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
					<div class="relative">
						<p class="text-indigo-200/70 text-sm">AI Markets</p>
						<p class="mt-2 text-3xl font-bold text-white">Prompt</p>
						<p class="mt-1 text-sm text-purple-400"><a href="/market-mgt/prompt" class="link link-primary z-50" on:click|preventDefault={() => window.location.reload()}>Coming soon!</a></p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto my-10 w-full px-6 py-4">
		<div class="my-2 flex w-full flex-col">
			{#if canCreate}
				<CreateMarket {examplePoll} onPollSubmit={handlePollSubmission} />
			{:else}
				<EmailRegistration />
			{/if}
		</div>
	</div>

	<!-- Features Section -->
	<div class="mx-auto my-10 w-full px-6 py-4">
		<div class="border-t border-purple-900/20 bg-[#0F1225]/50 py-16 backdrop-blur-sm">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h2 class="text-center text-3xl font-bold text-white">Market Creation Features</h2>
				<p class="text-indigo-200/70 mx-auto mt-4 max-w-2xl text-center">Everything you need to create and manage successful prediction markets</p>

				<div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
						<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
						<div class="relative">
							<h3 class="text-lg font-semibold text-white">Multiple Market Types</h3>
							<p class="text-indigo-200/70 mt-2 text-sm">Create binary, categorical, or scalar markets to suit your needs</p>
						</div>
					</div>

					<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
						<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
						<div class="relative">
							<h3 class="text-lg font-semibold text-white">Social Integration</h3>
							<p class="text-indigo-200/70 mt-2 text-sm">Connect Twitter and Discord for community engagement</p>
						</div>
					</div>

					<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
						<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
						<div class="relative">
							<h3 class="text-lg font-semibold text-white">Flexible Resolution</h3>
							<p class="text-indigo-200/70 mt-2 text-sm">Choose between automated oracles or community resolution</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="py-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-8 text-center shadow-lg">
				<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
				<div class="relative">
					<h2 class="text-2xl font-bold text-white">Need Help?</h2>
					<p class="text-indigo-200/70 mx-auto mt-4 max-w-2xl">Check out our documentation for detailed guides on creating and managing markets.</p>
					<a href="/docs" class="mt-8 inline-flex items-center gap-2 rounded-lg border border-purple-900/20 bg-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-purple-600">
						View Documentation
						<ArrowRight class="h-4 w-4" />
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
