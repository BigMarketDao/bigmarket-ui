<script lang="ts">
	import { fmtAmount, fmtMicroToStxNumber, formatter, toFiat } from '$lib/utils';
	import { selectedCurrency, stakeAmount } from '$stores/stores';
	import { type Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	export let sip10Data: Sip10Data;
	$: fiatValue = toFiat($selectedCurrency.code, $stakeAmount, sip10Data);

	onMount(async () => {});
</script>

<span class="my-4">
	{#if fiatValue}
		<span class="w-auto">{formatter.format(parseFloat(fiatValue))} {$selectedCurrency.code} </span>
	{/if}
</span>
