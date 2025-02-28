<script lang="ts">
	import { onMount } from 'svelte';
	import { explorerTxUrl, getStxAddress } from '$lib/stacks/stacks-connect';
	import type { OpinionPoll } from '@mijoco/stx_helpers/dist/index';
	import { sessionStore } from '$stores/stores';
	import { canCreateMarket } from '$lib/predictions/predictions';
	import DaoHero from '$lib/components/common/DaoHero.svelte';
	import PromptDiscoveryMarket from '$lib/predictions/market-mgt/prompt/PromptDiscoveryMarket.svelte';

	let showPollResult = false;
	let txId: string;
	$: explorerUrl = explorerTxUrl(txId);
	let startDelay = 5;
	let endDelay = 500;
	$: canCreate = false;
	$: canPrompt = false;

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
		canPrompt = true;
	});
</script>

<svelte:head>
	<title>Create Market</title>
	<meta name="description" content="Create prediction markets at bigmarket.ai" />
</svelte:head>

<div class="min-h-screen bg-[#0A0A1A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0A1A] to-[#0A0A1A]">
	<!-- Hero Section -->
	<DaoHero title={'Prompt a Market'} subtitle={'Launch your own prediction market on Bitcoin L2! With a suggestion! <br/><br/><button class="mb-5 btn btn-primary">Try now for free!</button>'} />

	<!-- Quick Info Cards -->

	<div class="mx-auto max-w-4xl px-6 py-4">
		<div class="my-2 flex w-full flex-col">
			{#if canPrompt}
				<PromptDiscoveryMarket />
			{/if}
		</div>
	</div>
</div>
