<script lang="ts">
	import { fmtMicroToStxNumber, toFiat } from '$lib/utils';
	import { selectedCurrency, sessionStore, stakeAmount } from '$stores/stores';
	import { type ExchangeRate, type Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	export let sip10Data: Sip10Data;
	export let totalPoolMicro: number;
	$: fiatValue = toFiat($selectedCurrency.code, totalPoolMicro, sip10Data);

	onMount(async () => {});
</script>

<span class="my-4">
	<span class="w-auto">{$selectedCurrency.code} {fiatValue} {sip10Data.decimals}</span>
</span>
