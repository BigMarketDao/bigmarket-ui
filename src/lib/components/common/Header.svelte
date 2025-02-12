<script>
	import logo from '$lib/assets/BIGMARKET-logo-white.png';
	import { configStore, switchConfig } from '$stores/stores_config';
	import { goto } from '$app/navigation';
	import CurrencyDropdown from './CurrencyDropdown.svelte';
	import ConnectMenuDropdown from './ConnectMenuDropdown.svelte';

	let isOpen = false;
	let componentKey = 0;

	const toggleNetwork = async () => {
		const network = $configStore.VITE_NETWORK;
		if (network === 'devnet') switchConfig('testnet');
		else if (network === 'testnet') switchConfig('mainnet');
		else if (network === 'mainnet') switchConfig('devnet');
		componentKey++;
	};

	function toggleMenu() {
		isOpen = !isOpen;
	}
</script>

<header class="flex h-[95px] w-full border-b border-white bg-gray-1000 shadow-md">
	<nav class="container mx-auto flex items-center justify-between p-4 align-middle">
		<!-- Logo -->
		<a href="/" class=" text-xl font-bold text-gray-800 dark:text-white"><img src={logo} alt="BigMarket" /></a>

		<!-- Desktop Nav -->
		<div class="relative top-[-10px] hidden space-x-6 md:flex">
			<span class="font-inter h-[48px] py-8 text-[20px] font-bold"><a href="/" on:click|preventDefault={() => goto('/terms')} class="mx-2 hover:text-gray-200">HOW IT WORKS</a></span>
			<span class="font-inter h-[48px] py-8 text-[20px] font-bold"><a href="/" on:click|preventDefault={() => goto('/dao/token-sale')} class="mx-2 hover:text-gray-200">IDO</a></span>
			<span class="font-inter h-[48px] py-8 text-[20px] font-bold"><a href="/" on:click|preventDefault={() => goto('/market-mgt')} class="mx-2 hover:text-gray-200">(real time) DAO</a></span>
			<!-- <span><a href="/" on:click|preventDefault={() => toggleNetwork()} class="mx-2 hover:text-gray-200">{$configStore.VITE_NETWORK}</a></span> -->
			<span class="font-inter h-[48px] py-8 text-[20px] font-bold"><ConnectMenuDropdown /></span>
			<span class="font-inter h-[48px] py-8 text-[20px] font-bold"><CurrencyDropdown /></span>
		</div>

		<!-- Mobile Menu Button -->
		<button class="text-gray-600 focus:outline-none md:hidden dark:text-gray-300" on:click={toggleMenu} aria-label="Toggle Menu">
			{#if isOpen}
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			{:else}
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
				</svg>
			{/if}
		</button>
	</nav>

	<!-- Mobile Menu -->
	{#if isOpen}
		<div class="fixed left-1/2 top-16 z-50 w-1/2 -translate-x-1/2 rounded-lg bg-gray-800 text-white shadow-lg md:hidden">
			<div class="flex flex-col items-center space-y-4 py-6">
				<a href="/" on:click|preventDefault={() => goto('/terms')} class="font-inter block w-full py-2 text-center text-lg font-semibold hover:text-gray-200"> HOW IT WORKS </a>

				<a href="/" on:click|preventDefault={() => goto('/dao/token-sale')} class="font-inter block w-full py-2 text-center text-lg font-semibold hover:text-gray-200"> IDO </a>

				<a href="/" on:click|preventDefault={() => goto('/market-mgt')} class="font-inter block w-full py-2 text-center text-lg font-semibold hover:text-gray-200"> (real time) DAO </a>

				<div class="flex w-full justify-center">
					<ConnectMenuDropdown />
				</div>

				<div class="flex w-full justify-center">
					<CurrencyDropdown />
				</div>
			</div>
		</div>
	{/if}
</header>
