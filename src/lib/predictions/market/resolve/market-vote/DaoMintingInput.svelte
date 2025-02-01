<script lang="ts">
	import { onMount } from 'svelte';
	import { fmtMicroToStx, fmtMicroToStxFormatted } from '$lib/utils';
	import { Icon, PencilSquare } from 'svelte-hero-icons';
	import BannerSlot from '$lib/components/ui/BannerSlot.svelte';
	import type { Sip10Data, TokenPermissionEvent } from '@mijoco/stx_helpers';

	export let onVotingPowerChange;
	export let onVotingTypeChange;

	export let sip10Data: Sip10Data;
	export let totalBalanceUstx: number = 0;
	export let votingPower: number = 0;
	export let txVoting = false;
	$: message = txVoting
		? `Vote by sending a Stacks transaction - you will need enough ${sip10Data.symbol} pay the gas fee.  <a href="/" on:click|preventDefault=${() => (txVoting = !txVoting)}>change</a>`
		: `Vote by signing a message - voting is free. <a href="/" on:click|preventDefault=${() => (txVoting = !txVoting)}>change</a>`;

	let amountStx: number;
	const balanceAtHeightF = fmtMicroToStxFormatted(totalBalanceUstx);

	let stxAmount = '';

	// Handle input change
	function mintToken() {}
	const updateTxVoting = () => {
		onVotingTypeChange(!txVoting);
	};

	function handleSubmit() {
		if (!stxAmount) {
			alert(`Please enter a valid ${sip10Data.symbol} amount`);
			return;
		}

		// Convert STX to microSTX
		const microStxAmount = Math.round(parseFloat(stxAmount) * 1_000_000);

		// Log or send the microSTX amount to the contract
		console.log('Sending to contract:', microStxAmount);
		// Add your contract call here
	}

	onMount(async () => {
		if (votingPower === 0) votingPower = totalBalanceUstx;
		console.log('sip10Data: ', sip10Data);
		//amountStx = fmtMicroToStx(totalBalanceUstx);
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
			on:keyup={() => onVotingPowerChange(amountStx)}
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
