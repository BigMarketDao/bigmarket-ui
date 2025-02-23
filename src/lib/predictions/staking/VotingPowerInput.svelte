<script lang="ts">
	import { onMount } from 'svelte';
	import { fmtMicroToStx, fmtMicroToStxFormatted, fmtStxMicro } from '$lib/utils';
	import type { Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import ExchangeRate from '$lib/components/common/ExchangeRate.svelte';
	import { stakeAmount } from '$stores/stores';

	export let onVotingPowerChange;
	export let sip10Data: Sip10Data;
	export let totalBalanceUstx: number = 0;
	export let votingPowerUstx: number = 0;
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
		const amountMicro = fmtStxMicro(Number(value), sip10Data.decimals);
		//stakeAmount.set(amountMicro);
	}
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
		if (votingPowerUstx === 0) votingPowerUstx = totalBalanceUstx;
		console.log('sip10Data: ', sip10Data);
		stakeAmount.set(0);
	});
</script>

<div class="max-w-xl rounded-lg bg-gray-50 p-4 shadow-md">
	<!-- Staking Info -->
	<div class="mb-3 flex items-center justify-between">
		<div class="text-lg font-medium text-gray-800">
			Staking: <span class="text-primary-500"
				>{votingPowerUstx}
				{sip10Data?.symbol || 'STX'}
			</span>
		</div>
		<div>
			<ExchangeRate {sip10Data} />
		</div>
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
		<span class="text-lg font-semibold text-gray-800">{sip10Data.symbol}</span>
	</div>

	<!-- Balance Hint -->
	<p class="mt-2 text-sm text-gray-500">
		Stake up to your balance: <span class="font-medium">{fmtMicroToStx(totalBalanceUstx, sip10Data.decimals)} {sip10Data.symbol}</span>
	</p>
</div>
