<script lang="ts">
	import DaoHero from '$lib/components/common/DaoHero.svelte';
	import { readGitbookPage, readGithubPage } from '$lib/gitbook';
	import ConnectWallet from '$lib/predictions/docs/ConnectWallet.svelte';
	import CreateMarkets from '$lib/predictions/docs/CreateMarkets.svelte';
	import MakePredictions from '$lib/predictions/docs/MakePredictions.svelte';
	import MarkDown from '$lib/predictions/docs/MarkDown.svelte';
	import MarketFees from '$lib/predictions/docs/MarketFees.svelte';
	import TokenSaleInfo from '$lib/predictions/docs/TokenSaleInfo.svelte';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	// Open first accordion item by default
	let activeIndex: number | null = -1;
	let page1: string;
	let page2: string;
	let page3: string;

	const toggleAccordion = (index: number) => {
		activeIndex = activeIndex === index ? null : index;
	};

	onMount(async () => {
		// page1 = await readGitbookPage();
		// console.log(page1);
		// page1 = await readGithubPage('getting-started/publish-your-docs.md');
		// page3 = await readGithubPage('how-it-works/editor/creating-a-market-user-guide.md');
		// page2 = await readGithubPage('how-it-works/making-predictions-on-bigmarket.md');
	});
</script>

<div class="">
	<DaoHero title={'BigMarket DAO - User Guides'} subtitle={''} />
	<div>
		<h2 class="text-md mt-6 text-center font-semibold">
			📌 See the <a href="https://big-market-dao.gitbook.io/big-market-dao-docs" target="_blank" class="cursor-pointer text-blue-800 hover:text-blue-600">official docs</a> for full information on prediction markets and how to get involved
		</h2>
	</div>
	<div class="mx-auto mt-5 max-w-4xl px-6 py-5 md:px-20">
		<!-- Accordion -->
		<div class="mt-6 divide-y rounded-lg border border-gray-200">
			<!-- Connect Your Wallet -->
			<div>
				<button class="flex w-full items-center justify-between px-4 py-3 text-left text-xl font-semibold" on:click={() => toggleAccordion(0)}>
					Connect Your Wallet
					<span class="transition-transform" class:rotate-180={activeIndex === 0}>▼</span>
				</button>
				{#if activeIndex === 0}
					<div class="border-t border-gray-200 p-4">
						<ConnectWallet />
						<!-- <MarkDown markdown={page1} /> -->
					</div>
				{/if}
			</div>

			<!-- Making Predictions -->
			<div>
				<button class="flex w-full items-center justify-between px-4 py-3 text-left text-xl font-semibold" on:click={() => toggleAccordion(1)}>
					Making Predictions
					<span class="transition-transform" class:rotate-180={activeIndex === 1}>▼</span>
				</button>
				{#if activeIndex === 1}
					<div class="border-t border-gray-200 p-4">
						<MakePredictions />
						<!-- <MarkDown markdown={page2} /> -->
					</div>
				{/if}
			</div>

			<!-- Market Creation for Users -->
			<div>
				<button class="flex w-full items-center justify-between px-4 py-3 text-left text-xl font-semibold" on:click={() => toggleAccordion(2)}>
					Market Creation for Users
					<span class="transition-transform" class:rotate-180={activeIndex === 2}>▼</span>
				</button>
				{#if activeIndex === 2}
					<div class="border-t border-gray-200 p-4">
						<CreateMarkets />
						<!-- <MarkDown markdown={page3} /> -->
					</div>
				{/if}
			</div>

			<!-- Market Fees -->
			<div>
				<button class="flex w-full items-center justify-between px-4 py-3 text-left text-xl font-semibold" on:click={() => toggleAccordion(3)}>
					Market Fees
					<span class="transition-transform" class:rotate-180={activeIndex === 2}>▼</span>
				</button>
				{#if activeIndex === 3}
					<div class="border-t border-gray-200 p-4">
						<MarketFees />
						<!-- <MarkDown markdown={page3} /> -->
					</div>
				{/if}
			</div>

			<!-- Connect Your Wallet -->
			<div>
				<button class="flex w-full items-center justify-between px-4 py-3 text-left text-xl font-semibold" on:click={() => toggleAccordion(4)}>
					IDO / Token Sale
					<span class="transition-transform" class:rotate-180={activeIndex === 0}>▼</span>
				</button>
				{#if activeIndex === 4}
					<div class="border-t border-gray-200 p-4">
						<TokenSaleInfo />
						<!-- <MarkDown markdown={page1} /> -->
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
</style>
