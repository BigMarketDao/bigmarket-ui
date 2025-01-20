<script lang="ts">
	import { onMount } from 'svelte';
	import CreateMarket from '$lib/predictions/market/manage/CreateMarket.svelte';
	import SlotModal from '$lib/components/common/SlotModal.svelte';
	import { explorerTxUrl, getStxAddress } from '$lib/stacks/stacks-connect';
	import { goto } from '$app/navigation';
	import type { OpinionPoll } from '@mijoco/stx_helpers';
	import { sessionStore } from '$stores/stores';
	import Banner from '$lib/components/ui/Banner.svelte';

	let showPollResult = false;
	let txId: string;
	$: explorerUrl = explorerTxUrl(txId);
	let startDelay = 5;
	let endDelay = 500;

	const handlePollSubmission = (data: any) => {
		txId = data;
		showPollResult = true;
		//goto('/');
	};
	function closeModal() {
		showPollResult = false;
	}

	let examplePoll: OpinionPoll = {
		name: 'Solana flips Ethereum by end of March 2025?',
		description: 'Is it going to happen? ',
		logo: 'https://bitcoinfaces.xyz/api/get-image?name=SP1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28GBQA1W0F',
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
		proposer: getStxAddress()
	};

	onMount(async () => {});
</script>

<svelte:head>
	<title>New Poll</title>
	<meta name="description" content="Create an opinion poll" />
</svelte:head>

{#if showPollResult}
	<!-- <SlotModal onClose={() => closeModal()}>
		<div slot="modalBody">
			Your transaction has been sent - <a href={explorerUrl} target="_blank">show tx!</a>!
		</div>
	</SlotModal> -->
{/if}

<div class="mx-auto max-w-4xl py-4 md:px-6">
	<div class="my-2 flex w-full flex-col">
		<CreateMarket {examplePoll} onPollSubmit={handlePollSubmission} />
	</div>
</div>
