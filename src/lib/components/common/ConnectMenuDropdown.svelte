<script lang="ts">
	import { fmtMicroToStx, truncate } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';
	import { User } from 'lucide-svelte';
	import { isLoggedIn, logUserOut, getStxAddress, getBtcAddress, getStxBalance, getBtcBalance } from '$lib/stacks/stacks-connect';
	import { bitcoinMode } from '$stores/stores';

	export let connectWallet;
	let isOpen = false;
	let dropdownRef: HTMLElement | null = null;
	let showStacksAddress = true;

	const logout = async () => {
		logUserOut();
	};

	// Toggle between Stacks and Bitcoin addresses
	function toggleAddress() {
		showStacksAddress = !showStacksAddress;
		bitcoinMode.set(!showStacksAddress);
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
	{#if isLoggedIn()}
		<button class="inline-flex items-center rounded-md border border-blue-800 px-4 py-3 text-sm font-bold text-white hover:rounded-md hover:bg-blue-800" on:click={() => (isOpen = !isOpen)}>
			<User class="me-3" />
			{#if showStacksAddress}
				{truncate(getStxAddress())}
				<span class="text-md mx-3 font-inter font-bold">STX</span>
			{:else}
				{truncate(getBtcAddress().toUpperCase())}
				<span class="text-md mx-3 font-inter font-bold">BTC</span>
			{/if}
		</button>

		{#if isOpen}
			<div class="absolute right-0 top-[50px] z-50 mt-2 w-48 rounded-md border border-gray-300 bg-black text-white shadow-lg">
				<!-- Address Toggle -->
				<div class="flex items-center justify-between px-4 py-2">
					<label class="relative inline-flex cursor-pointer items-center">
						<input type="checkbox" class="peer sr-only" on:change={toggleAddress} />
						<div class="peer h-5 w-9 rounded-full bg-blue-600 after:absolute after:start-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-gray-600 peer-checked:after:translate-x-4"></div>
					</label>
					<span class="font-inter font-medium"
						>{#if showStacksAddress}STX{:else}BTC{/if}</span
					>
				</div>

				<!-- Balance -->
				<div class="flex justify-between px-4 py-2 transition hover:bg-gray-900">
					{#if showStacksAddress}
						<span class="me-3 font-inter text-lg font-bold text-primary">STX</span>
						{fmtMicroToStx(getStxBalance(), 6)}
					{:else}
						<span class="me-3 font-inter text-lg font-bold text-primary">BTC</span>
						{fmtMicroToStx(getBtcBalance(), 6)}
					{/if}
				</div>

				<!-- Settings -->
				<div class="flex cursor-pointer px-4 py-2 transition hover:bg-gray-900">
					<a href="/settings" class="flex items-center font-bold hover:text-gray-200">
						<span class="me-3 text-lg">⚙️</span> Settings
					</a>
				</div>

				<!-- Logout -->
				<div class="flex cursor-pointer px-4 py-2 transition hover:bg-gray-900">
					<a href="/" on:click|preventDefault={logout} class="flex items-center font-bold hover:text-gray-200">
						<span class="me-3 text-lg">🔌</span> Disconnect
					</a>
				</div>
			</div>
		{/if}
	{:else}
		<button class="rounded-md bg-blue-900 py-3 text-sm text-white hover:text-blue-400">
			<a id="connect-wallet" href="/" on:click|preventDefault={connectWallet} class="mx-2">CONNECT WALLET</a>
		</button>
	{/if}
</div>
