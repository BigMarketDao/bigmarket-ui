<script lang="ts">
	import DaoHero from '$lib/components/common/DaoHero.svelte';
	import TokenSale from '$lib/dao/token-sale/TokenSale.svelte';
	import TokenSaleV3 from '$lib/dao/token-sale/TokenSaleV3.svelte';
	import { getDaoOverview } from '$lib/predictions/predictions';
	import { sessionStore, type BigMarketSessionStore } from '$stores/stores';
	import type { DaoOverview } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	onMount(async () => {
		const daoOverview = await getDaoOverview();
		sessionStore.update((conf: BigMarketSessionStore) => {
			conf.daoOverview = daoOverview;
			return conf;
		});

		console.log('tokenSale: ', daoOverview.tokenSale);
	});
</script>

<div class="bg-gray-50">
	<DaoHero title={'Join the BigMarket IDO'} subtitle={'Secure your stake in the worlds most advanced AI governed prediciton platform'} />
	<div class="">
		<TokenSaleV3 />
	</div>
	<div class="px-6 py-10 md:px-20">
		<TokenSale />
	</div>
</div>
