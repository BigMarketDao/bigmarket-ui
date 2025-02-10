<script lang="ts">
	import { onMount } from 'svelte';
	import { isLoggedIn, loginStacksFromHeader } from '$lib/stacks/stacks-connect';
	import Banner from '$lib/components/ui/Banner.svelte';

	const login = async () => {
		loginStacksFromHeader(document);
	};

	onMount(async () => {});
</script>

<div class="flex flex-col gap-y-2 p-5">
	<div class="flex flex-col gap-y-5">
		<div class="flex flex-col gap-y-2">
			<h1 class="text-lg font-medium">About us</h1>
			<p>
				Connect wallet to take part. Markets operate via a decentralised community - to participate in govenerance and growth of the project <a href="/dao/token-sale">visit our token sale</a> page.
			</p>
		</div>
	</div>
	{#if !isLoggedIn()}
		<div class="">
			<Banner bannerType={'warning'} message={'Your wallet must be connected to vote!'} />
		</div>
		<div class="my-5 flex w-full flex-col items-center">
			<button
				on:click={() => {
					login();
				}}
				class="bg-success-01 w-[250px] items-center justify-center gap-x-1.5 rounded-xl border border-bitcoinorange bg-black px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50 md:inline-flex"
			>
				Connect Wallet to Continue
			</button>
		</div>
	{/if}
</div>
