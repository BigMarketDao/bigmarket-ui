<script lang="ts">
	import { onMount } from 'svelte';
	import CreateMarket from '$lib/predictions/market-mgt/CreateMarket.svelte';
	import { explorerTxUrl, getStxAddress } from '$lib/stacks/stacks-connect';
	import type { OpinionPoll } from '@mijoco/stx_helpers/dist/index';
	import { sessionStore } from '$stores/stores';
	import { canCreateMarket } from '$lib/predictions/predictions';
	import EmailRegistration from '$lib/components/EmailRegistration.svelte';

	let showPollResult = false;
	let txId: string;
	$: explorerUrl = explorerTxUrl(txId);
	let startDelay = 5;
	let endDelay = 500;
	let canCreate = false;
	let email: string;

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
			criteria: 'The market will be resolved initially by the DAO core team. Any user with a stake in the market can dispute, disputes are resolved via BigMarketDAO community oracle. See terms for details.',
			resolvesAt: 0,
			sources: []
		},
		token: '',
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
		marketFee: 2,
		treasury: ''
	};

	onMount(async () => {
		canCreate = await canCreateMarket();
	});
</script>

<svelte:head>
	<title>BigMarket Register</title>
	<meta name="description" content="Register for DAO Governance of Bitcoin prediction markets" />
</svelte:head>

{#if showPollResult}{/if}

<div class="px-20">
	<div class="my-2 flex w-full flex-col">
		<EmailRegistration />
	</div>
</div>
