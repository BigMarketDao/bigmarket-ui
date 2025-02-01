<script lang="ts">
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	import { sessionStore, type BigMarketSessionStore } from '../stores/stores';
	import { configStore, setConfigByUrl } from '../stores/stores_config';
	import Header from '$lib/components/common/Header.svelte';
	import Footer from '$lib/components/common/Footer.svelte';
	import { initAddresses, initApplication } from '@mijoco/stx_helpers/dist/account';
	import { getStxAddress, getUserData } from '$lib/stacks/stacks-connect';
	import { page } from '$app/state';
	import { fetchContractAssets, type ExchangeRate } from '@mijoco/stx_helpers/dist/index';
	import { getAllowedTokens, getDaoOverview, isExecutiveTeamMember } from '$lib/predictions/predictions';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import type { _ } from '$env/static/private';

	const unsubscribe1 = sessionStore.subscribe(() => {});
	const unsubscribe3 = configStore.subscribe(() => {});
	let inited = false;

	onDestroy(async () => {
		unsubscribe1();
		unsubscribe3();
	});

	setConfigByUrl(page.url.searchParams, 'devnet');

	const initApp = async () => {
		if (!$sessionStore.keySets || !$sessionStore.keySets[$configStore.VITE_NETWORK]) await initAddresses(sessionStore);
		const exchangeRates: Array<ExchangeRate> = []; //await fetchExchangeRates();
		const daoOverview = await getDaoOverview();
		const tokens = await getAllowedTokens();

		if (!$sessionStore.balances) {
			await initApplication($configStore.VITE_STACKS_API, $configStore.VITE_MEMPOOL_API, $configStore.VITE_NETWORK, sessionStore, exchangeRates, '$configStore.VITE_SBTC_CONTRACT_ID', getUserData());
		} else {
			initApplication($configStore.VITE_STACKS_API, $configStore.VITE_MEMPOOL_API, $configStore.VITE_NETWORK, sessionStore, exchangeRates, '$configStore.VITE_SBTC_CONTRACT_ID', getUserData());
		}
		const cb = await fetchContractAssets(getConfig().VITE_STACKS_API, getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DAO_MARKET_PREDICTING);
		console.log('cb: ', cb);
		const emTeamMam = await isExecutiveTeamMember(undefined, getStxAddress());
		sessionStore.update((conf: BigMarketSessionStore) => {
			conf.userSettings.executiveTeamMember = emTeamMam?.executiveTeamMember || false;
			conf.daoOverview = daoOverview;
			conf.tokens = tokens;
			return conf;
		});
	};

	onMount(async () => {
		await initApp();
		inited = true;
	});
</script>

<div class="min-h-screen bg-gray-1000 bg-[url('$lib/assets/bg-lines.svg')] bg-cover font-extralight text-white">
	<div class=" min-h-[calc(100vh-160px)] px-6">
		<div class="relative mx-auto flex min-h-screen flex-col">
			<div class="mx-[10%]"><Header /></div>
			<div class="mx-[10%] grow">
				{#if inited}
					<slot></slot>
				{/if}
			</div>
			<div class="mx-[10%]"><Footer /></div>
		</div>
	</div>
</div>
