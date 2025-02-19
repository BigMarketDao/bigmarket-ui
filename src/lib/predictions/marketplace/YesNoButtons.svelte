<script lang="ts">
	import { goto } from '$app/navigation';
	import { type MarketData, type PredictionMarketCreateEvent, type Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { calculatePayoutCategorical, convertFiatToNative, getMarketToken } from '../predictions';
	import { fmtMicroToStx } from '$lib/utils';
	import { selectedCurrency, stakeAmount } from '$stores/stores';

	export let market: PredictionMarketCreateEvent;
	let amount = 0;
	let payouts: Array<number>;
	let sip10Data = getMarketToken(market.marketData.token);

	$: payouts = calculatePayoutCategorical(convertFiatToNative(sip10Data, 100, $selectedCurrency.code), sip10Data.decimals, undefined, market.marketData);

	onMount(async () => {
		sip10Data = getMarketToken(market.marketData.token);
		amount = convertFiatToNative(sip10Data, 100, $selectedCurrency.code);
		stakeAmount.set(parseFloat(fmtMicroToStx(amount)));
		if (market.marketData.categories.length === 2) payouts = calculatePayoutCategorical(amount, sip10Data.decimals, undefined, market.marketData);
	});
</script>

{#if market}
	<div class="mt-4 flex w-full justify-between border border-blue-1000">
		<button
			on:click={() => {
				goto(`/market/${market.marketId}/${market.marketType}`);
			}}
			class="w-1/2 bg-blue-500 py-2 font-inter font-bold text-black">YES</button
		>
		<button
			on:click={() => {
				goto(`/market/${market.marketId}/${market.marketType}`);
			}}
			class="w-1/2 bg-blue-900 py-2 font-inter font-bold text-white">NO</button
		>
	</div>
	{#if payouts}
		<div class="my-2 flex w-full justify-between text-sm">
			<div class="w-full text-center font-inter font-medium text-black">{$selectedCurrency.symbol}100 -&gt; ${parseFloat(fmtMicroToStx(payouts[0], sip10Data.decimals)).toFixed(2)}</div>
			<div class="w-full text-center font-inter font-medium text-black">{$selectedCurrency.symbol}100 -&gt; ${parseFloat(fmtMicroToStx(payouts[1], sip10Data.decimals)).toFixed(2)}</div>
		</div>
	{/if}
{/if}
