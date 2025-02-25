<script lang="ts">
	import { getDaoOverview } from '$lib/predictions/predictions';
	import { sessionStore, type BigMarketSessionStore } from '$stores/stores';
	import { onMount } from 'svelte';
	import TokenSaleV3 from '$lib/dao/token-sale/TokenSaleV3.svelte';
	import { ArrowRight } from 'lucide-svelte';

	onMount(async () => {
		const daoOverview = await getDaoOverview();
		sessionStore.update((conf: BigMarketSessionStore) => {
			conf.daoOverview = daoOverview;
			return conf;
		});
	});
</script>

<div class="min-h-screen bg-[#0A0A1A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0A1A] to-[#0A0A1A]">
	<!-- Hero Section -->
	<div class="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
		<h1 class="bg-gradient-to-r to-indigo-300 lg:text-7xl from-purple-400 bg-clip-text text-5xl font-bold text-primary sm:text-6xl">Join the BigMarket IDO</h1>
		<p class="text-indigo-200/70 mx-auto mt-6 max-w-2xl text-xl">Secure your stake in the world's most advanced AI-governed prediction platform</p>
	</div>

	<!-- Main Content -->
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid gap-8 lg:grid-cols-2">
			<!-- Left Column: Info -->
			<div class="space-y-6">
				<div class="grid grid-cols-2 gap-4">
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
							<p class="mt-2 text-3xl font-bold text-white">$0.05</p>
							<p class="mt-1 text-sm text-purple-400">USD per BIG</p>
						</div>
					</div>
				</div>

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
								<span class="text-indigo-200/70">Team & Council</span>
								<span class="font-semibold text-purple-400">25%</span>
							</div>
							<div class="flex justify-between">
								<span class="text-indigo-200/70">Treasury</span>
								<span class="font-semibold text-purple-400">15%</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Purchase Card -->
			<div>
				<TokenSaleV3 />
			</div>
		</div>
	</div>
</div>
