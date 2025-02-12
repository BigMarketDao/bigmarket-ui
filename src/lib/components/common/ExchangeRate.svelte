<script lang="ts">
	import { selectedCurrency, sessionStore, stakeAmount } from '$stores/stores';
	import { type ExchangeRate, type Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	export let sip10Data: Sip10Data;
	$: rate = $sessionStore.exchangeRates ? $sessionStore.exchangeRates.find((o) => o.currency === $selectedCurrency.code) : ({} as ExchangeRate);
	$: fiatValue = sip10Data.symbol === 'STX' ? $stakeAmount * (rate?.fifteen || 0) * (rate?.stxToBtc || 0) : $stakeAmount * (rate?.fifteen || 0); // $: fiatValue = isSTX(sip10Data.name) ? (fiatValue0 * (rate?.stxToBtc || 1)).toFixed(2) : fiatValue0.toFixed(2);

	onMount(async () => {});
</script>

<span class="my-4">
	<span class="w-auto">{$selectedCurrency.code} {fiatValue.toFixed(2)}</span>
</span>
