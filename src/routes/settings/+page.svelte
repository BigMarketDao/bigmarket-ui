<script lang="ts">
	import { onMount } from 'svelte';
	import {
		readPredictionContractData,
		type PredictionContractData
	} from '@mijoco/stx_helpers/dist/index';
	import { configStore } from '$stores/stores_config';
	import { configDaoStore } from '$stores/stores_config_dao';
	import { Icon } from 'svelte-hero-icons';
	import { Spinner } from 'flowbite-svelte';
	import { getContractData } from '$lib/predictions/predictions';

	let data: PredictionContractData;

	onMount(async () => {
		data = await getContractData();
	});
</script>

<svelte:head>
	<title>Market Volumes</title>
	<meta name="description" content="Create an opinion poll" />
</svelte:head>

<div class="mx-auto md:px-6">
	<h1 class="mb-6 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-800">
		Prediction Market Settings
	</h1>
	{#if !data}
		<div class="place-content-start self-start align-top">
			<Icon src={Spinner} /> Loading settings from contracts
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full border border-gray-300 bg-white text-left text-sm text-gray-700">
				<thead class="bg-gray-100 text-xs uppercase text-gray-500">
					<tr>
						<th scope="col" class="px-6 py-3">Field</th>
						<th scope="col" class="px-6 py-3">Value</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-t">
						<td class="px-6 py-4 font-medium text-gray-900">Markets</td>
						<td class="px-6 py-4">{data.marketCounter}</td>
					</tr>
					<tr class="border-t">
						<td class="px-6 py-4 font-medium text-gray-900">Create market gating</td>
						<td class="px-6 py-4"
							>{#if data.createMarketGated}yes{:else}no{/if}</td
						>
					</tr>
					<tr class="border-t">
						<td class="px-6 py-4 font-medium text-gray-900">Dispute voting majority</td>
						<td class="px-6 py-4">{data.customMajority || '50%'}</td>
					</tr>
					<tr class="border-t">
						<td class="px-6 py-4 font-medium text-gray-900">Dispute Window Length</td>
						<td class="px-6 py-4">{data.disputeWindowLength}</td>
					</tr>
					<tr class="border-t">
						<td class="px-6 py-4 font-medium text-gray-900">Resolution Agent</td>
						<td class="px-6 py-4">{data.resolutionAgent}</td>
					</tr>
					<tr class="border-t">
						<td class="px-6 py-4 font-medium text-gray-900">Dev Fund</td>
						<td class="px-6 py-4">{data.devFund}</td>
					</tr>
					<tr class="border-t">
						<td class="px-6 py-4 font-medium text-gray-900">DAO Treasury</td>
						<td class="px-6 py-4">{data.daoTreasury}</td>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
</div>
