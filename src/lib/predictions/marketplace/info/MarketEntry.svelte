<script lang="ts">
	import { fetchMarketData, type MarketData, type PredictionMarketCreateEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import YesNoButtons from '../YesNoButtons.svelte';
	import LogoContainer from '../LogoContainer.svelte';
	import { getConfig } from '$stores/store_helpers';
	import { goto } from '$app/navigation';
	import { ArrowDown, ArrowRight, Icon } from 'svelte-hero-icons';
	import { ArrowKeyRight } from 'flowbite-svelte';

	export let market: PredictionMarketCreateEvent;
	let marketData: MarketData | undefined;

	onMount(async () => {
		marketData = await fetchMarketData(getConfig().VITE_STACKS_API, market.marketId, market.votingContract.split('.')[0], market.votingContract.split('.')[1]);
	});
</script>

<div class="mx-16 my-3 md:mx-32">
	<!-- Market Logo -->
	<div class="flex w-full justify-start gap-y-5 border-b border-white py-3 text-white">
		<div class="w-[150px]"><LogoContainer logo={market.unhashedData.logo} /></div>
		<div class="flex w-full grow flex-col">
			<div class="font-inter text-[10px] font-medium md:text-[16px]">
				{market.unhashedData.category}
			</div>
			<div class="font-inter text-[16px] font-bold md:text-[24px]">
				<a href={`/market/${market.marketId}`} class="hover:underline">{market.unhashedData.name}</a>
			</div>
		</div>
		<div class="font-inter font-bold text-white">
			<button class=" md:text-md flex w-[100px] justify-between bg-blue-500 px-3 py-2 text-start text-sm md:w-[150px]" on:click={() => goto(`/market/${market.marketId}`)}>
				<span>Trade</span> <span><Icon src={ArrowRight} height="20" /> </span></button
			>
		</div>
	</div>
</div>
