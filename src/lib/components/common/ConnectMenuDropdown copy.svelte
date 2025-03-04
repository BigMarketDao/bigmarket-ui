<script lang="ts">
	import { getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import { logUserOut } from '$lib/stacks/stacks-connect';
	import { truncate } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';
	import { Icon, User } from 'svelte-hero-icons';

	export let connectWallet;
	let isOpen = false;
	let dropdownRef: HTMLElement | null = null;

	const logoutStacks = async () => {
		logUserOut();
	};

	// Dropdown open state
	function selectItem(currencyCode: string) {
		isOpen = false;
	}
	// Click outside to close dropdown
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
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

<div class="relative z-[999] inline-block text-left" bind:this={dropdownRef}>
	<!-- Selected Currency Button -->
	{#if isLoggedIn()}
		<button class=" inline-block px-4 py-3 font-inter text-sm font-bold text-white hover:rounded-md hover:bg-blue-800 hover:text-white" on:click={() => (isOpen = !isOpen)}>
			<span class="ml-2"><Icon src={User} height={'20px'} width={'20px'} class="me-2 inline-block text-white" /> {truncate(getStxAddress())}</span>
			<!-- <span class="ml-2">▼</span> -->
		</button>
	{:else}
		<button class="rounded-md bg-blue-900 py-3 font-inter text-sm font-normal text-white hover:text-blue-400"><a id="connect-wallet" href="/" on:click|preventDefault={() => connectWallet()} class="mx-2">CONNECT WALLET</a></button>
	{/if}

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div class="absolute right-0 top-[50px] z-50 mt-2 w-48 rounded-md border border-gray-300 bg-black text-white shadow-lg">
			<div class="flex cursor-pointer px-4 py-2 transition hover:bg-gray-900 hover:text-gray-100">
				<span class="font-inter font-bold hover:text-gray-200"><a href="/settings" class=""><span class="me-3 text-lg">⚙️</span> settings</a></span>
			</div>
			<div class="flex cursor-pointer px-4 py-2 transition hover:bg-gray-900 hover:text-gray-100">
				<span class="font-inter font-bold hover:text-gray-200"><a href="/" on:click|preventDefault={() => logoutStacks()} class=""><span class="me-3 text-lg">🔌</span> disconnect</a></span>
			</div>
		</div>
	{/if}
</div>
