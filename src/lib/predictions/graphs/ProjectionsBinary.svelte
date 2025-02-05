<script lang="ts">
	import type { MarketData, PredictionMarketCreateEvent, Sip10Data, UserStake } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { calculatePayoutBinary, getMarketToken } from '../predictions';
	import { fmtMicroToStx } from '$lib/utils';

	export let categories: Array<string>;
	export let payouts: Array<string>;
	export let votingPowerUstx: number;
	export let token: string;
	let sip10Data: Sip10Data | undefined = undefined;

	onMount(() => {
		sip10Data = getMarketToken(token);
	});
</script>

<!-- <div class="mx-auto max-w-md rounded-lg bg-gray-100 p-6 text-black shadow-md"> -->
<!-- <h2 class="mb-4 text-xl font-bold">Prediction Market Payout Calculator</h2>

	<label for="amount" class="mb-2 block">Stake Amount:</label>
	<input id="amount" type="number" bind:value={votingPowerUstx} class="mb-4 w-full rounded-md border p-2" />

	<label for="Noamount" class="mb-2 block">Existing Stake on "No":</label>
	<input id="Noamount" type="number" bind:value={existingNo} class="mb-4 w-full rounded-md border p-2" />

	<label for="Yesamount" class="mb-2 block">Existing Stake on "Yes":</label>
	<input id="Yesamount" type="number" bind:value={existingYes} class="mb-4 w-full rounded-md border p-2" /> -->

{#if payouts}
	<div class="bg-gray-50 max-w-xl rounded-lg p-4 shadow-md">
		<h3 class="text-lg font-semibold">Potential Winnings <span class="text-[10px]">(excluding fees)</span></h3>
		<p class="mt-2">Payout if staking <span class="font-bold">{votingPowerUstx}</span> on "No": <span class="font-bold">{payouts[0]}</span></p>
		<p class="mt-2">Payout if staking <span class="font-bold">{votingPowerUstx}</span> on "Yes": <span class="font-bold">{payouts[1]}</span></p>
	</div>
{/if}
