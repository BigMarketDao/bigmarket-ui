<script lang="ts">
	import logo from '$lib/assets/BIGMARKET-logo-white.png';
	import { configStore, switchConfig } from '$stores/stores_config';
	import { goto } from '$app/navigation';
	import CurrencyDropdown from './CurrencyDropdown.svelte';
	import ConnectMenuDropdown from './ConnectMenuDropdown.svelte';
	import { onDestroy, onMount } from 'svelte';

	let isOpen = false;
	let componentKey = 0;
	let dropdownRef: HTMLElement | null = null;
	const dropdownId = 'header-dd';
	const buttonId = 'header-button';

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
	// Click outside to close dropdown
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;

		// Only close the dropdown if the click is outside both the button and dropdown
		if (isOpen && target.id !== buttonId && !document.getElementById(dropdownId)?.contains(target)) {
			isOpen = false;
		}
	}

	onMount(() => {
		window.addEventListener('click', handleClickOutside);
	});

	onDestroy(() => {
		window.removeEventListener('click', handleClickOutside);
	});
</script>

<header class="flex h-[95px] w-full bg-gray-1000 shadow-md" bind:this={dropdownRef}>
	<nav class="container mx-auto flex items-center justify-between p-4 align-middle">
		<!-- Logo -->
		<a href="/" class=" text-xl font-bold text-gray-800 dark:text-white"><img src={logo} alt="BigMarket" /></a>

		<!-- Desktop Nav -->
		<div class="hidden space-x-2 md:flex">
			<span class="py-3 font-inter text-[16px] font-bold"><a href="/" on:click|preventDefault={() => goto('/docs')} class="mx-2 hover:text-blue-400">HOW IT WORKS</a></span>
			<span class="py-3 font-inter text-[16px] font-bold"><a href="/" on:click|preventDefault={() => goto('/dao/token-sale')} class="mx-2 hover:text-blue-400">IDO</a></span>
			<span class="py-3 font-inter text-[16px] font-bold"><a href="/" on:click|preventDefault={() => goto('/market-mgt')} class="mx-2 hover:text-blue-400">CREATE</a></span>
			<!-- <span><a href="/" on:click|preventDefault={() => toggleNetwork()} class="mx-2 hover:text-blue-400">{$configStore.VITE_NETWORK}</a></span> -->
			<span class=""><ConnectMenuDropdown /></span>
			<span class=""><CurrencyDropdown /></span>
		</div>

		<!-- Mobile Menu Button -->
		<button class="text-gray-600 focus:outline-none md:hidden dark:text-gray-300" on:click={toggleMenu} aria-label="Toggle Menu">
			{#if isOpen}
				<svg id="header-button" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			{:else}
				<svg id="header-button" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
				</svg>
			{/if}
		</button>
	</nav>

	<!-- Mobile Menu -->
	{#if isOpen}
		<div id="header-dd" class="fixed right-20 top-16 z-50 w-1/2 rounded-lg px-3 text-white shadow-lg md:hidden">
			<div class="m-2 flex flex-col gap-y-4 rounded-md border border-white bg-black p-5">
				<a href="/" on:click|preventDefault={() => goto('/docs')} class="block w-full font-inter text-lg font-semibold hover:text-blue-400"> HOW IT WORKS </a>

				<a href="/" on:click|preventDefault={() => goto('/dao/token-sale')} class="block w-full font-inter text-lg font-semibold hover:text-blue-400"> IDO </a>

				<a href="/" on:click|preventDefault={() => goto('/market-mgt')} class="block w-full font-inter text-lg font-semibold hover:text-blue-400"> CREATE </a>

				<div class="flex w-full justify-start">
					<ConnectMenuDropdown />
				</div>

				<div class="flex w-full justify-start">
					<CurrencyDropdown />
				</div>
			</div>
		</div>
	{/if}
</header>
