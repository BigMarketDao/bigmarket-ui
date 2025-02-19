<script lang="ts">
	import { formatter, toFiat } from '$lib/utils';
	import { selectedCurrency, stakeAmountHome } from '$stores/stores';
	import { type Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	export let sip10Data: Sip10Data;
	$: fiatValue = toFiat($selectedCurrency.code, $stakeAmountHome, sip10Data);

	onMount(async () => {});
</script>

<span class="my-4">
	{#if fiatValue}
		<span class="w-auto">{$selectedCurrency.code} {formatter.format(parseFloat(fiatValue))}</span>
	{/if}
</span>
