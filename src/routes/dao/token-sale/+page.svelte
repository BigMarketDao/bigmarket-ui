<script lang="ts">
	import { convertFiatToNative, getAllowedTokens, getDaoOverview, getStxToken } from '$lib/predictions/predictions';
	import { selectedCurrency, sessionStore, type BigMarketSessionStore } from '$stores/stores';
	import { onMount } from 'svelte';
	import TokenSaleV3 from '$lib/dao/token-sale/TokenSaleV3.svelte';
	import { ArrowRight } from 'lucide-svelte';
	import DaoHero from '$lib/components/common/DaoHero.svelte';

	let fiatPerStx = 0;

	onMount(async () => {
		const daoOverview = await getDaoOverview();
		sessionStore.update((conf: BigMarketSessionStore) => {
			conf.daoOverview = daoOverview;
			return conf;
		});

		// 0.05 USD per BIG -> 1 USD = 1/0.05 BIG = 20 BIG
		// 1 USD = x STX
		// x SXT = 1 USD = 1/0.05 BIG
		// 1 STX = 1/x USD = 1/(0.05x)
		fiatPerStx = convertFiatToNative(getStxToken(await getAllowedTokens()), 1, $selectedCurrency.code);
		const rate = $sessionStore.exchangeRates.find((c) => c.currency === $selectedCurrency.code);
		if (rate) return 0;
	});
</script>

<svelte:head>
	<title>BigMarket Token Sale</title>
	<meta name="description" content="DAO Governance tokens to participate in BigMarket prediction markets on Bitcoin" />
</svelte:head>

<div class="min-h-screen bg-[#0A0A1A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0A1A] to-[#0A0A1A]">
	<!-- Hero Section -->
	<DaoHero
		title={'Join the BigMarket IDO'}
		subtitle={'Secure your stake in the world\'s most advanced AI-enabled prediction platform<br/><br/><i><span class="text-primary">This is a work in progress - the final version will include feedback from early contributors via proposal voting.</span></i>'}
	/>

	<!-- Main Content -->
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid gap-8 lg:grid-cols-1">
			<!-- Left Column: Info -->
			<div class="space-y-6">
				<div class="grid grid-cols-3 gap-4">
					<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
						<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
						<div class="relative">
							<p class="text-indigo-200/70 text-sm">Total Supply</p>
							<p class="mt-2 text-3xl font-bold text-white">10,000,000</p>
							<p class="mt-1 text-sm text-purple-400">BIG Tokens</p>
						</div>
					</div>

					<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
						<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
						<div class="relative">
							<p class="text-indigo-200/70 text-sm">Initial Price</p>
							<p class="mt-2 text-3xl font-bold text-white">$0.05 ({fiatPerStx} STX)</p>
							<p class="mt-1 text-sm text-purple-400">USD per BIG</p>
						</div>
					</div>

					<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
						<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
						<div class="relative">
							<p class="text-indigo-200/70 text-sm">Open Proposals</p>
							<p class="mt-2 text-3xl font-bold text-white">3</p>
							<p class="mt-1 text-sm text-purple-400">Coming Soon!</p>
						</div>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
					<div class="relative">
						<h2 class="text-xl font-bold text-white">Token Utility</h2>
						<ul class="mt-4 space-y-3">
							<li class="flex items-center gap-3">
								<div class="rounded-full bg-purple-500/20 p-2 text-purple-400">
									<ArrowRight class="h-4 w-4" />
								</div>
								<span class="text-indigo-200/70">Governance voting rights</span>
							</li>
							<li class="flex items-center gap-3">
								<div class="rounded-full bg-purple-500/20 p-2 text-purple-400">
									<ArrowRight class="h-4 w-4" />
								</div>
								<span class="text-indigo-200/70">Platform fee sharing</span>
							</li>
							<li class="flex items-center gap-3">
								<div class="rounded-full bg-purple-500/20 p-2 text-purple-400">
									<ArrowRight class="h-4 w-4" />
								</div>
								<span class="text-indigo-200/70">Market creation privileges</span>
							</li>
							<li class="flex items-center gap-3">
								<div class="rounded-full bg-purple-500/20 p-2 text-purple-400">
									<ArrowRight class="h-4 w-4" />
								</div>
								<span class="text-indigo-200/70">Dispute resolution participation</span>
							</li>
						</ul>
					</div>
				</div>

				<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
					<div class="relative">
						<h2 class="text-xl font-bold text-white">Token Distribution</h2>
						<div class="mt-4 space-y-3">
							<div class="flex justify-between">
								<span class="text-indigo-200/70">Community/IDO</span>
								<span class="font-semibold text-purple-400">60%</span>
							</div>
							<div class="flex justify-between">
								<span class="text-indigo-200/70">Operations</span>
								<span class="font-semibold text-purple-400">15%</span>
							</div>
							<div class="flex justify-between">
								<span class="text-indigo-200/70">Treasury</span>
								<span class="font-semibold text-purple-400">25%</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Purchase Card -->
			<div>
				<TokenSaleV3 {fiatPerStx} />
			</div>
		</div>
	</div>
</div>
