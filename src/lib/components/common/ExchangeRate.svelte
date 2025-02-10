<script lang="ts">
	import { selectedCurrency, sessionStore, stakeAmount } from '$stores/stores';
	import { type Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	export let sip10Data: Sip10Data;
	let currency = $selectedCurrency;
	let rate = $sessionStore.exchangeRates.find((o) => o.currency === currency.code);
	$: fiatValue = ($stakeAmount * (rate?.fifteen || 0)).toFixed(2);

	onMount(async () => {});
</script>

<span class="my-4">
	<span class="w-auto">{$selectedCurrency.code} {fiatValue}</span>
</span>
