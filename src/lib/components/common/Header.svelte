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

	function toggleMenu() {
		isOpen = !isOpen;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
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

<header class=" left-0 right-0 top-0 z-[999] h-20 border-b border-purple-900/20 bg-[#0A0A1A]/80 backdrop-blur-lg" bind:this={dropdownRef}>
	<nav class="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<!-- Logo -->
		<a href="/" class="flex items-center">
			<img src={logo} alt="BigMarket" class="h-8" />
		</a>

		<!-- Desktop Nav -->
		<div class="hidden items-center gap-8 md:flex">
			<a href="/docs" class="text-indigo-200/70 text-sm font-medium transition-colors hover:text-purple-400">HOW IT WORKS</a>
			<a href="/dao/token-sale" class="text-indigo-200/70 text-sm font-medium transition-colors hover:text-purple-400">IDO</a>
			<a href="/market-mgt" class="text-indigo-200/70 text-sm font-medium transition-colors hover:text-purple-400">CREATE</a>
			<div class=" flex items-center gap-4">
				<ConnectMenuDropdown />
				<CurrencyDropdown />
			</div>
		</div>

		<!-- Mobile Menu Button -->
		<button class="text-indigo-200 focus:outline-none md:hidden" on:click={toggleMenu} aria-label="Toggle Menu">
			{#if isOpen}
				<svg id="header-button" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			{:else}
				<svg id="header-button" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
				</svg>
			{/if}
		</button>
	</nav>

	<!-- Mobile Menu -->
	{#if isOpen}
		<div id="header-dd" class=" left-0 right-0 top-20 z-[999] border-b border-purple-900/20 bg-[#0A0A1A]/95 bg-black backdrop-blur-lg md:hidden">
			<div class="mx-auto flex max-w-7xl flex-col gap-6 p-6">
				<a href="/docs" class="text-indigo-200/70 text-sm font-medium transition-colors hover:text-purple-400">HOW IT WORKS</a>
				<a href="/dao/token-sale" class="text-indigo-200/70 text-sm font-medium transition-colors hover:text-purple-400">IDO</a>
				<a href="/market-mgt" class="text-indigo-200/70 text-sm font-medium transition-colors hover:text-purple-400">CREATE</a>
				<div class="flex flex-col gap-4">
					<ConnectMenuDropdown />
					<CurrencyDropdown />
				</div>
			</div>
		</div>
	{/if}
</header>

<!-- Spacer to account for fixed header -->
<!-- <div class="h-20"></div> -->
