<script lang="ts">
	import { onMount } from 'svelte';
	import { fmtMicroToStx, fmtMicroToStxFormatted } from '$lib/utils';
	import { Icon, PencilSquare } from 'svelte-hero-icons';
	import BannerSlot from '$lib/components/ui/BannerSlot.svelte';
	import type { Sip10Data, TokenPermissionEvent } from '@mijoco/stx_helpers/dist/index';

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
	function handleChange(event: any) {
		const value = event.target.value;

		// Regex to allow numbers, one decimal point, and up to 6 decimal places
		const regex = /^\d*\.?\d{0,6}$/;
		if (regex.test(value)) {
			stxAmount = value;
		}
	}
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
		console.log('sip10Data: ', sip10Data);
		//amountStx = fmtMicroToStx(totalBalanceUstx);
	});
</script>

<div class="my-5 max-w-xl rounded-lg bg-gray-50 p-4 shadow-md">
	<!-- Staking Info -->
	<div class="mb-3 flex flex-col">
		<span class="text-lg font-medium text-gray-800"> Market Resolution </span>
		<p>
			Cast your vote and help decide how this market resolves {#if votingPower > 0}{votingPower}{/if}
		</p>
	</div>

	<!-- Input Field -->
	<div class="flex items-center gap-2">
		<input
			class="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			bind:value={amountStx}
			on:input={handleChange}
			on:keyup={() => onVotingPowerChange(amountStx)}
			placeholder="Enter amount (e.g., 0.000000)"
			type="number"
			id="Contribution"
			aria-describedby="Contribution"
		/>
		<span class="text-lg font-semibold text-gray-800">{sip10Data?.symbol || 'SYM'}</span>
	</div>

	<!-- Balance Hint -->
	<p class="mt-2 text-sm text-gray-500">
		Vote up to your balance: <span class="font-medium">{fmtMicroToStx(totalBalanceUstx, sip10Data?.decimals || 6)} {sip10Data?.symbol}</span>
	</p>
</div>
