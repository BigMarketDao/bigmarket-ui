<script lang="ts">
	import { isLoggedIn } from '$lib/stacks/stacks-connect';
	import { authenticate, logUserOut } from '$lib/stacks/stacks-connect';

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
		<button class="inline-block font-inter font-bold text-white hover:text-blue-400" on:click={() => (isOpen = !isOpen)}>
			<span class="ml-2">MORE</span>
			<!-- <span class="ml-2">▼</span> -->
		</button>
	{:else}
		<span class="inline-block font-inter font-bold text-white hover:text-blue-400"><a id="connect-wallet" href="/" on:click|preventDefault={() => loginStacks()} class="mx-2 hover:text-blue-400">CONNECT WALLET</a></span>
	{/if}

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div class="absolute right-0 top-[40px] z-50 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
			<div class="flex cursor-pointer px-4 py-2 text-black transition hover:bg-gray-900 hover:text-gray-100">
				<span class="font-inter font-bold hover:text-gray-200"><a href="/settings" class="">settings</a></span>
			</div>
			<div class="flex cursor-pointer px-4 py-2 text-black transition hover:bg-gray-900 hover:text-gray-100">
				<span class="font-inter font-bold hover:text-gray-200"><a href="/" on:click|preventDefault={() => logoutStacks()} class="">disconnect</a></span>
			</div>
		</div>
	{/if}
</div>
