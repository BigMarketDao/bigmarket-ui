<script lang="ts">
	import { fetchTokenSalePurchases } from '$lib/dao/token-sale';
	import TokenSale from '$lib/dao/token-sale/TokenSale.svelte';
	import { getStxAddress } from '$lib/stacks/stacks-connect';
	import { sessionStore } from '$stores/stores';
	import type { TokenSalePurchases } from '@mijoco/stx_helpers';
	import { onMount } from 'svelte';

	let tokenSalePurchases: TokenSalePurchases = { amount: [] } as TokenSalePurchases;
	let daoOverview = $sessionStore.daoOverview;

	// Fetch user balance and sale details (Placeholder for API call)
	onMount(async () => {
		// Example API Calls
		tokenSalePurchases = await fetchTokenSalePurchases(getStxAddress());
	});
</script>

<TokenSale {tokenSalePurchases} {daoOverview} />
