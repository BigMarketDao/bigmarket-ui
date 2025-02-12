<script lang="ts">
	import { getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import { selectedCurrency } from '$stores/stores';
	import { authenticate, logUserOut } from '$lib/stacks/stacks-connect';
	import { truncate } from '$lib/utils';

	const loginStacks = async () => {
		authenticate(function () {
			typeof window !== 'undefined' ? window.location.reload() : '';
		});
	};
	const logoutStacks = async () => {
		logUserOut();
	};

	// Dropdown open state
	let isOpen = false;
	function selectItem(currencyCode: string) {
		isOpen = false;
	}
</script>

<div class="relative inline-block text-left">
	<!-- Selected Currency Button -->
	{#if isLoggedIn()}
		<button class="font-inter font-bold hover:text-gray-400" on:click={() => (isOpen = !isOpen)}>
			<span class="ml-2">MORE</span>
			<!-- <span class="ml-2">▼</span> -->
		</button>
	{:else}
		<span class="font-inter h-[48px] py-8 text-[20px] font-bold"><a id="connect-wallet" href="/" on:click|preventDefault={() => loginStacks()} class="mx-2 hover:text-blue-400">Connect Wallet</a></span>
	{/if}

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div class="absolute left-0 z-50 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
			<div class="flex cursor-pointer px-4 py-2 text-black transition hover:bg-gray-900 hover:text-gray-100">
				<span class="font-inter font-bold hover:text-gray-200"><a href="/settings" class="">settings</a></span>
			</div>
			<div class="flex cursor-pointer px-4 py-2 text-black transition hover:bg-gray-900 hover:text-gray-100">
				<span class="font-inter font-bold hover:text-gray-200"><a href="/" on:click|preventDefault={() => logoutStacks()} class="">disconnect</a></span>
			</div>
		</div>
	{/if}
</div>
