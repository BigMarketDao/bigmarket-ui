<script lang="ts">
	import { onMount } from 'svelte';
	import { AppConfig, UserSession, showConnect } from '@stacks/connect';
	import { authenticate, getStxAddress } from '$lib/stacks/stacks-connect';

	const appConfig = new AppConfig(['store_write', 'publish_data']);
	const userSession = new UserSession({ appConfig });

	let walletAddress = getStxAddress();

	async function buySTX(provider: string) {
		const response = await fetch(`/api/buy-stx`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ provider, walletAddress })
		});
		const data = await response.json();
		if (data.url) {
			window.open(data.url, '_blank');
		}
	}

	const loginStacks = async () => {
		authenticate(function () {
			typeof window !== 'undefined' ? window.location.reload() : '';
		});
	};

	onMount(() => {
		walletAddress = getStxAddress();
	});
</script>

<div class="mx-auto max-w-lg space-y-8 rounded-xl bg-white p-6 shadow-md">
	<div>
		<h2 class="text-xl font-semibold text-gray-900">Buy STX & Connect Wallet</h2>
		<p class="font-inter text-sm font-semibold text-gray-900">BigMarket inherits Bitcoin of security and finality via Stacks</p>
	</div>
	<div>
		<h3 class="text-lg font-medium text-gray-700">Choose an Onramp:</h3>
		<div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
			<button class="rounded-md bg-blue-600 px-4 py-2 text-white" on:click={() => window.open('https://www.coinbase.com/pay', '_blank')}> Buy with Coinbase Pay </button>
			<!-- <button class="rounded-md bg-green-600 px-4 py-2 text-white" on:click={() => window.open('https://global.transak.com?apiKey=YOUR_API_KEY&cryptoCurrency=STX', '_blank')}> Buy with Transak </button>
			<button class="rounded-md bg-purple-600 px-4 py-2 text-white" on:click={() => window.open('https://buy.moonpay.com?apiKey=YOUR_API_KEY&currencyCode=STX', '_blank')}> Buy with MoonPay </button> -->
		</div>
	</div>

	<div class="mt-20">
		<h2 class="text-xl font-semibold text-gray-900">Already a Stacker?</h2>
		<p class="font-inter text-sm font-semibold text-gray-900">Continue by connecting your Stacks / Bitcoin Layer 2 wallet</p>
		{#if walletAddress}
			<p class="mt-2 text-gray-900">Connected: {walletAddress}</p>
		{:else}
			<button class="mt-2 rounded-md bg-gray-800 px-4 py-2 text-white" on:click={loginStacks}> Connect Stacks Wallet </button>
		{/if}
	</div>
</div>
