<script lang="ts">
	import { onMount } from 'svelte';
	import {
		type PollCreateEvent,
		type PredictionMarketCreateEvent
	} from '@mijoco/stx_helpers/dist/index';
	import PollLogo from './PollLogo.svelte';
	import { isAdministrator } from '$lib/predictions/predictions';

	export let market: PredictionMarketCreateEvent;

	onMount(async () => {});
</script>

<div>
	<h1>{market.unhashedData.name}</h1>
	<div class="flex">
		<PollLogo logo={market.unhashedData.logo} />
		<p>{@html market.unhashedData.description}</p>
	</div>
	<p>
		{#if isAdministrator(market)}
			upload/change logo
		{/if}
	</p>
</div>
