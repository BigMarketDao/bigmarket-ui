<script lang="ts">
	import { onMount } from 'svelte';
	import { fullBalanceInSip10Token, type Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { getGovernanceToken } from '$lib/predictions/predictions';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import { getStxAddress } from '$lib/stacks/stacks-connect';
	import { sessionStore } from '$stores/stores';

	let sip10Data: Sip10Data;
	let totalBalanceUstx: number = 0;

	let amountStx: number;

	// Handle input change
	function mintToken() {}

	onMount(async () => {
		sip10Data = getGovernanceToken($sessionStore.tokens);
		totalBalanceUstx = await fullBalanceInSip10Token(getConfig().VITE_STACKS_API, getStxAddress(), `${getDaoConfig().VITE_DOA_DEPLOYER}.${getDaoConfig().VITE_DAO_GOVERNANCE_TOKEN}`);
	});
</script>

<div class="bg-gray-50 my-5 max-w-xl rounded-lg p-4 shadow-md">
	<!-- Staking Info -->
	<div class="mb-3 flex flex-col">
		<span class="text-lg font-medium text-gray-800">Market Resolution </span>
		<p>Become part of BitcoinDao to participate in market resolution decisions much much more</p>
	</div>

	<!-- Input Field -->
	<div class="flex items-center gap-2">
		<input
			class="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			bind:value={amountStx}
			placeholder="Enter amount (e.g., 0.000000)"
			type="number"
			id="Contribution"
			aria-describedby="Contribution"
		/>
		<span class="text-lg font-semibold text-gray-800">{sip10Data?.symbol || 'SYM'}</span>
	</div>
	<div class="">
		<button
			on:click={() => {
				mintToken();
			}}
			class="bg-green-700 hover:bg-green-600 mt-4 rounded px-4 py-2 text-white"
		>
			MINT
		</button>
	</div>
	<p class="mt-20 text-[10px]">To participate in market voting <a href="/" class="text-black underline">mint some governance token here</a></p>

	<!-- Balance Hint -->
</div>
