<script lang="ts">
	import { onMount } from 'svelte';
	import { getStxAddress, isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import { aiMarket } from '$stores/stores';
	import { canCreateMarket, createMarketAI } from '$lib/predictions/predictions';
	import DaoHero from '$lib/components/common/DaoHero.svelte';
	import Banner from '$lib/components/ui/Banner.svelte';
	import PromptMarket from '$lib/predictions/market-mgt/prompt/PromptMarket.svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import CreateMarket from '$lib/predictions/market-mgt/CreateMarket.svelte';
	import EmailRegistration from '$lib/components/EmailRegistration.svelte';
	import type { StoredOpinionPoll } from '@mijoco/stx_helpers';

	let txId: string;
	let errorMessage: string = '';
	let running = false;
	let loaded = false;
	$: canCreate = false;
	let examplePoll: StoredOpinionPoll;

	const handlePollSubmission = (data: any) => {
		txId = data;
	};

	const handlePromptMarket = async (market: { mechanism: number; source: string; suggestion: string }) => {
		if (!isLoggedIn()) {
			loginStacksFromHeader(document);
			return;
		}
		running = true;
		let llmMarket;
		if ((!market.suggestion || market.suggestion.trim().length === 0) && (!market.source || market.source.trim().length === 0)) {
			errorMessage = 'Please enter a news source or a suggestion';
		} else {
			llmMarket = await createMarketAI(getStxAddress(), market);
			aiMarket.set(llmMarket);
			examplePoll = llmMarket;
			loaded = true;
		}
		running = false;
	};

	onMount(async () => {
		canCreate = await canCreateMarket();
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
	{#if loaded}
		<div>
			{#if canCreate}
				<CreateMarket {examplePoll} onPollSubmit={handlePollSubmission} />
			{:else}
				<EmailRegistration />
			{/if}
		</div>
	{:else if !running}
		<div class="mx-auto max-w-3xl space-y-6">
			{#if errorMessage}
				<div class="mb-3">
					<Banner bannerType={'danger'} message={errorMessage} />
				</div>
			{/if}
			<!-- Accordion: Markets Info -->
			<div class="rounded-md border shadow-md">
				<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#markets-info"> Generate Market </button>
				<div id="poll-info" class="flex flex-col gap-y-5 px-4 py-4">
					<PromptMarket promptMarket={handlePromptMarket} />
				</div>
			</div>
		</div>
	{:else}
		<div class="mx-auto max-w-3xl space-y-6">
			<LoaderCircle class="h-8 w-8" />
		</div>
	{/if}
</div>
