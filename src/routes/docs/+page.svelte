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
	import { ArrowRight } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let activeSection: number | null = null;

	const sections = [
		{
			title: 'Connect Your Wallet',
			description: 'Learn how to connect your wallet and start using BigMarket',
			component: ConnectWallet
		},
		{
			title: 'Making Predictions',
			description: 'Discover how to analyze markets and place predictions',
			component: MakePredictions
		},
		{
			title: 'Creating Markets',
			description: 'Guide to creating and managing your own prediction markets',
			component: CreateMarkets
		},
		{
			title: 'Market Fees',
			description: 'Understanding the fee structure and distribution',
			component: MarketFees
		},
		{
			title: 'Token Sale',
			description: 'Information about the BIG token sale and tokenomics',
			component: TokenSaleInfo
		}
	];

	onMount(async () => {
		// Default to first section open
		activeSection = 0;
	});
</script>

<div class="min-h-screen bg-[#0A0A1A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0A1A] to-[#0A0A1A]">
	<!-- Hero Section -->
	<DaoHero title={'How BigMarket Works'} subtitle={'Your comprehensive guide to prediction markets on Bitcoin L2. Learn how to trade, create markets, and participate in the ecosystem.'} />

	<!-- Main Content -->
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
		<div class="grid gap-8 lg:grid-cols-3">
			<!-- Navigation Sidebar -->
			<div class="space-y-4 lg:col-span-1">
				{#each sections as section, index}
					<button
						class="group relative w-full overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 text-left shadow-lg transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] {activeSection ===
						index
							? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
							: ''}"
						on:click={() => (activeSection = index)}
					>
						<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />

						<div class="relative">
							<h3 class="text-lg font-semibold text-white">{section.title}</h3>
							<p class="text-indigo-200/70 mt-2 text-sm">{section.description}</p>

							<ArrowRight class="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400 opacity-0 transition-all duration-300 group-hover:opacity-100" />
						</div>
					</button>
				{/each}
			</div>

			<!-- Content Area -->
			<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-8 shadow-lg lg:col-span-2">
				<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />

				<div class="relative">
					{#if activeSection !== null}
						<svelte:component this={sections[activeSection].component} />
					{/if}
				</div>
			</div>
		</div>

		<!-- Documentation Link -->
		<div class="mt-16 text-center">
			<a
				href="https://big-market-dao.gitbook.io/big-market-dao-docs"
				target="_blank"
				class="inline-flex items-center gap-2 rounded-lg border border-purple-900/20 bg-[#0F1225] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
			>
				View Full Documentation
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
	</div>
</div>
