<script lang="ts">
	import { onMount } from 'svelte';
	import { isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';

	const login = async () => {
		loginStacksFromHeader(document);
	};

	onMount(async () => {});
</script>

<div class="flex flex-col gap-y-2">
	<div class="flex flex-col gap-y-5">
		<div class="flex flex-col gap-y-2">
			<h1 class="text-lg font-medium">Staking</h1>
			<p>
				See project docs for full <a href="/dao/token-sale">documentation</a> page.
			</p>
		</div>
	</div>
	{#if !isLoggedIn()}
		<div class="">
			<Banner bannerType={'warning'} message={'Your wallet must be connected to vote!'} />
		</div>
		<div class="my-5 flex w-full flex-col">
			<button
				on:click={() => {
					login();
				}}
				class="w-full flex-1 rounded bg-success-600 px-4 py-2 text-white transition-all duration-300 sm:w-auto"
			>
				Connect Wallet to Continue
			</button>
		</div>
	{/if}
</div>
