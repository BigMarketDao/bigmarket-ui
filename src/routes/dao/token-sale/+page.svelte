<script lang="ts">
	import DaoHero from '$lib/components/common/DaoHero.svelte';
	import TokenSale from '$lib/dao/token-sale/TokenSale.svelte';
	import { onMount } from 'svelte';

	onMount(async () => {});
</script>

<div class="bg-gray-50">
	<DaoHero title={'Join the BigMarket IDO'} subtitle={'Secure your stake in the worlds most advanced AI governed prediciton platform'} />
	<div class="px-6 py-10 md:px-20">
		<TokenSale />
	</div>
</div>
