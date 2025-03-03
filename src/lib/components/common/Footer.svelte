<script>
	import CurrencyDropdown from './CurrencyDropdown.svelte';
</script>

<footer class="border-t border-purple-900/20 bg-[#0A0A1A]/80 py-12 backdrop-blur-lg">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- Logo & Copyright -->
			<div class="space-y-4">
				<img src="/logo/bm-logo-white.png" alt="BigMarket" class="h-8" />
				<p class="text-indigo-200/50 text-sm">&copy; 2025 BigMarket. All rights reserved.</p>
			</div>

			<!-- Quick Links -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold text-white">Quick Links</h3>
				<div class="flex flex-col gap-2">
					<a href="/docs" class="text-indigo-200/70 text-sm transition-colors hover:text-purple-400">How It Works</a>
					<a href="/dao/token-sale" class="text-indigo-200/70 text-sm transition-colors hover:text-purple-400">Token Sale</a>
					<a href="/market-mgt" class="text-indigo-200/70 text-sm transition-colors hover:text-purple-400">Create Market</a>
				</div>
			</div>

			<!-- Resources -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold text-white">Resources</h3>
				<div class="flex flex-col gap-2">
					<!-- <a href="https://big-market-dao.gitbook.io/big-market-dao-docs" target="_blank" class="text-indigo-200/70 text-sm transition-colors hover:text-purple-400">Documentation</a> -->
					<a href="/docs" target="_blank" class="text-indigo-200/70 text-sm transition-colors hover:text-purple-400">Documentation</a>
					<a href="https://github.com/BigMarketDao" target="_blank" class="text-indigo-200/70 text-sm transition-colors hover:text-purple-400">GitHub</a>
					<a href="/docs/terms" class="text-indigo-200/70 text-sm transition-colors hover:text-purple-400">Terms & Conditions</a>
					<a href="/docs/privacy" class="text-indigo-200/70 text-sm transition-colors hover:text-purple-400">Privacy Policy</a>
				</div>
			</div>
			<div class="space-y-4">
				<h3 class="text-sm font-semibold text-white">Local Currency</h3>
				<CurrencyDropdown />
			</div>
		</div>
	</div>
</footer>
