<script lang="ts">
	import { getSip10Properties, type TokenPermissionEvent } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { getAllowedTokens } from '../predictions';
	import { getStxAddress } from '$lib/stacks/stacks-connect';
	import { getConfig } from '$stores/store_helpers';

	export let onSelectToken: any;

	function addContract(event: any) {
		if (!event || !event.target || !event.target.value) return;
		const token = event.target.value;
		onSelectToken(token);
	}

	let tokens: Array<TokenPermissionEvent>;

	onMount(async () => {
		tokens = await getAllowedTokens();
		for (let token of tokens) {
			const p = await getSip10Properties(getConfig().VITE_STACKS_API, token, getStxAddress());
			console.log(p);
		}
	});
</script>

<div class="rounded-md border shadow-md">
	<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button" data-accordion-target="#vote-gating"> Token </button>
	<div id="markets-info" class="px-4 py-4">
		<p class="mb-0 text-gray-700">Users will transact in this market using this token</p>
	</div>
	<div id="vote-gating" class="py-2">
		<div class="mx-auto px-4 text-white shadow-md">
			<h2 class="mb-4 text-xl font-bold">Select Preferred Token</h2>

			<div class="mb-6">
				{#if tokens}
					<select id="popular-contracts" on:change={(e) => addContract(e)} class="h-10 w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500">
						<option value="" disabled selected>-- Select a Token --</option>
						{#each tokens as token}
							{#if token.allowed}
								<option value={token.token}>{token.sip10Data?.symbol.toUpperCase()}</option>
							{/if}
						{/each}
					</select>
				{/if}
			</div>
		</div>
	</div>
</div>
