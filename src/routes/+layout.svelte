<script lang="ts">
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	import { isLocalhost, sessionStore, type BigMarketSessionStore } from '../stores/stores';
	import { configStore, setConfigByUrl } from '../stores/stores_config';
	import Header from '$lib/components/common/Header.svelte';
	import Footer from '$lib/components/common/Footer.svelte';
	import { initAddresses, initApplication } from '@mijoco/stx_helpers/dist/account';
	import { getStxAddress, getUserData } from '$lib/stacks/stacks-connect';
	import { page } from '$app/state';
	import { getAllowedTokens, getDaoOverview, isExecutiveTeamMember } from '$lib/predictions/predictions';
	import { fetchExchangeRates } from '$lib/stacks/rates';
	import { fetchStacksInfo, type StacksInfo } from '@mijoco/stx_helpers/dist/index';
	import { getConfig } from '$stores/store_helpers';

	const unsubscribe1 = sessionStore.subscribe(() => {});
	const unsubscribe3 = configStore.subscribe(() => {});
	let inited = false;

	onDestroy(async () => {
		unsubscribe1();
		unsubscribe3();
	});

	setConfigByUrl(page.url.searchParams);
	isLocalhost.set(window.location.hostname.indexOf('localhost') > -1);

	const initApp = async () => {
		if (!$sessionStore.keySets || !$sessionStore.keySets[$configStore.VITE_NETWORK]) await initAddresses(sessionStore);
		const exchangeRates = await fetchExchangeRates();
		const daoOverview = $sessionStore.daoOverview || (await getDaoOverview());
		const tokens = $sessionStore.tokens || (await getAllowedTokens());
		const userSettings = $sessionStore.userSettings || (await isExecutiveTeamMember(undefined, getStxAddress()));

		if (!$sessionStore.balances) {
			await initApplication($configStore.VITE_STACKS_API, $configStore.VITE_MEMPOOL_API, $configStore.VITE_NETWORK, sessionStore, exchangeRates, '$configStore.VITE_SBTC_CONTRACT_ID', getUserData());
		} else {
			initApplication($configStore.VITE_STACKS_API, $configStore.VITE_MEMPOOL_API, $configStore.VITE_NETWORK, sessionStore, exchangeRates, '$configStore.VITE_SBTC_CONTRACT_ID', getUserData());
		}

		sessionStore.update((conf: BigMarketSessionStore) => {
			conf.userSettings.executiveTeamMember = userSettings?.executiveTeamMember || false;
			conf.daoOverview = daoOverview;
			conf.tokens = tokens;
			conf.exchangeRates = exchangeRates;
			return conf;
		});
		const ticker = setInterval(async function () {
			const stacksInfo = (await fetchStacksInfo(getConfig().VITE_STACKS_API)) || ({} as StacksInfo);
			sessionStore.update((conf: BigMarketSessionStore) => {
				conf.stacksInfo = stacksInfo;
				return conf;
			});
		}, 60000);
		initAppFromServer();
	};

	const initAppFromServer = async () => {
		const daoOverview = await getDaoOverview();
		const tokens = await getAllowedTokens();
		const userSettings = await isExecutiveTeamMember(undefined, getStxAddress());
		sessionStore.update((conf: BigMarketSessionStore) => {
			conf.userSettings.executiveTeamMember = userSettings?.executiveTeamMember || false;
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

<div class="min-h-screen bg-[#0A0A1A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0A1A] to-[#0A0A1A] font-extralight text-white">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex min-h-screen flex-col">
			<div class="border-b border-purple-900/20 backdrop-blur-sm"><Header /></div>
			<div class="mb-10 grow">
				{#if inited}
					<slot />
				{/if}
			</div>
			<div class="border-t border-purple-900/20"><Footer /></div>
		</div>
	</div>
</div>
