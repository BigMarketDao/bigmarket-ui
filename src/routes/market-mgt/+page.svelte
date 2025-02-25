<script lang="ts">
	import { onMount } from 'svelte';
	import CreateMarket from '$lib/predictions/market-mgt/CreateMarket.svelte';
	import { explorerTxUrl, getStxAddress } from '$lib/stacks/stacks-connect';
	import type { OpinionPoll } from '@mijoco/stx_helpers/dist/index';
	import { sessionStore } from '$stores/stores';
	import { canCreateMarket } from '$lib/predictions/predictions';
	import EmailRegistration from '$lib/components/EmailRegistration.svelte';
	import { ArrowRight } from 'lucide-svelte';
	import { fmtMicroToStx } from '$lib/utils';

	let showPollResult = false;
	let txId: string;
	$: explorerUrl = explorerTxUrl(txId);
	let startDelay = 5;
	let endDelay = 500;
	$: canCreate = false;

	const handlePollSubmission = (data: any) => {
		txId = data;
		showPollResult = true;
		//goto('/');
	};
	function closeModal() {
		showPollResult = false;
	}
	// $WELSH to 0.001 USD by block 3,614,769
	// Meme season is coming to Stacks - better get ready !
	// https://pbs.twimg.com/profile_images/1648994389799346176/_X8oyw9I_400x400.jpg

	// Scientist discover the world is in fact donutoid!
	// https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa6vLfyKLpdOZH2-qEccGcym4bMpRGAUmvRw&s

	// Gravity changes direction - everyone falls off world?

	// Ants pack up and leave the UK!
	let examplePoll: OpinionPoll = {
		name: '$WELSH to 0.001 USD by block 3,614,769',
		category: 'meme',
		description: 'Is it going to happen? ',
		criterion: {
			resolvesAt: new Date().getTime(),
			sources: [],
			criteria: 'The market will be resolved initially by the DAO core team. Any user with a stake in the market can dispute, disputes are resolved via BigMarket DAO community oracle. See terms for details.'
		},
		token: '',
		priceFeedId: 'STX/USD/0',
		treasury: getStxAddress(),
		logo: 'https://pbs.twimg.com/profile_images/1648994389799346176/_X8oyw9I_400x400.jpg',
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
		marketFee: 2
	};

	onMount(async () => {
		canCreate = await canCreateMarket();
	});
</script>

<svelte:head>
	<title>New Poll</title>
	<meta name="description" content="Create an opinion poll" />
</svelte:head>

<div class="min-h-screen bg-[#0A0A1A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0A1A] to-[#0A0A1A]">
	<!-- Hero Section -->
	<div class="relative overflow-hidden border-b border-purple-900/20 py-24">
		<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />

		<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h1 class="bg-gradient-to-r to-indigo-300 from-purple-400 bg-clip-text text-4xl font-bold text-primary sm:text-6xl">Create a Market</h1>
				<p class="text-indigo-200/70 mx-auto mt-6 max-w-2xl text-lg">Launch your own prediction market on Bitcoin L2. Set the terms, define outcomes, and let the community trade.</p>
			</div>
		</div>
	</div>

	<!-- Quick Info Cards -->
	<div class="border-b border-purple-900/20 bg-[#0F1225]/50 py-12 backdrop-blur-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
					<div class="relative">
						<p class="text-indigo-200/70 text-sm">Creation Fee</p>
						<p class="mt-2 text-3xl font-bold text-white">{fmtMicroToStx($sessionStore.daoOverview.contractData.marketCreateFee)} STX</p>
						<p class="mt-1 text-sm text-purple-400">One-time fee</p>
					</div>
				</div>

				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
					<div class="relative">
						<p class="text-indigo-200/70 text-sm">Market Fee</p>
						<p class="mt-2 text-3xl font-bold text-white">0-{$sessionStore.daoOverview.contractData.marketFeeBipsMax / 100}%</p>
						<p class="mt-1 text-sm text-purple-400">Customizable</p>
					</div>
				</div>

				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
					<div class="relative">
						<p class="text-indigo-200/70 text-sm">Resolution Time</p>
						<p class="mt-2 text-3xl font-bold text-white">24h-1y</p>
						<p class="mt-1 text-sm text-purple-400">Average 2 days</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-4xl px-6 py-4">
		<div class="my-2 flex w-full flex-col">
			{#if !canCreate}
				<CreateMarket {examplePoll} onPollSubmit={handlePollSubmission} />
			{:else}
				<EmailRegistration />
			{/if}
		</div>
	</div>

	<!-- Features Section -->
	<div class="border-t border-purple-900/20 bg-[#0F1225]/50 py-16 backdrop-blur-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<h2 class="text-center text-3xl font-bold text-white">Market Creation Features</h2>
			<p class="text-indigo-200/70 mx-auto mt-4 max-w-2xl text-center">Everything you need to create and manage successful prediction markets</p>

			<div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
					<div class="relative">
						<h3 class="text-lg font-semibold text-white">Multiple Market Types</h3>
						<p class="text-indigo-200/70 mt-2 text-sm">Create binary, categorical, or scalar markets to suit your needs</p>
					</div>
				</div>

				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
					<div class="relative">
						<h3 class="text-lg font-semibold text-white">Social Integration</h3>
						<p class="text-indigo-200/70 mt-2 text-sm">Connect Twitter and Discord for community engagement</p>
					</div>
				</div>

				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
					<div class="relative">
						<h3 class="text-lg font-semibold text-white">Flexible Resolution</h3>
						<p class="text-indigo-200/70 mt-2 text-sm">Choose between automated oracles or community resolution</p>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="py-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-8 text-center shadow-lg">
				<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
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
