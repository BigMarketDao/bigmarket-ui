<script lang="ts">
	import { goto } from '$app/navigation';
	import { type MarketData, type PredictionMarketCreateEvent, type Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { calculatePayoutCategorical, convertFiatToNative, getMarketToken } from '../predictions';
	import { fmtMicroToStx } from '$lib/utils';
	import { selectedCurrency, stakeAmount } from '$stores/stores';

	export let market: PredictionMarketCreateEvent;
	export let marketData: MarketData | undefined;
	let amount = 0;
	let payouts: Array<number>;
	let sip10Data = getMarketToken(market.token);

	$: marketData ? (payouts = calculatePayoutCategorical(convertFiatToNative(sip10Data, 100, $selectedCurrency.code), sip10Data.decimals, undefined, marketData)) : (payouts = new Array(10).fill(0));

	onMount(async () => {
		sip10Data = getMarketToken(market.token);
		amount = convertFiatToNative(sip10Data, 100, $selectedCurrency.code);
		stakeAmount.set(parseFloat(fmtMicroToStx(amount)));
		if (marketData && marketData.categories.length === 2) payouts = calculatePayoutCategorical(amount, sip10Data.decimals, undefined, marketData);
	});
</script>

{#if market}
	<div class="mt-4 flex w-full justify-between border border-blue-1000">
		<button
			on:click={() => {
				goto(`/market/${market.marketId}`);
			}}
			class="font-inter w-1/2 bg-blue-500 py-2 font-bold text-black">YES</button
		>
		<button
			on:click={() => {
				goto(`/market/${market.marketId}`);
			}}
			class="font-inter w-1/2 bg-blue-900 py-2 font-bold text-white">NO</button
		>
	</div>
	{#if payouts}
		<div class="my-2 flex w-full justify-between text-sm">
			<div class="font-inter w-full text-center font-medium text-black">{$selectedCurrency.symbol}100 -&gt; ${parseFloat(fmtMicroToStx(payouts[0], sip10Data.decimals)).toFixed(2)}</div>
			<div class="font-inter w-full text-center font-medium text-black">{$selectedCurrency.symbol}100 -&gt; ${parseFloat(fmtMicroToStx(payouts[1], sip10Data.decimals)).toFixed(2)}</div>
		</div>
	{/if}
{/if}
