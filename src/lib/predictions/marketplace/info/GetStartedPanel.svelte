<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowRight, Icon } from 'svelte-hero-icons';
</script>

<div class="max-w-sm border border-blue-1000 bg-transparent py-6 text-center text-white shadow-lg">
	<h1 class="mb-6 line-clamp-6 font-inter text-[36px] font-bold">Get Started Today!</h1>
	<p class="mt-2 font-inter text-[24px]">Ready to participate? Connect your wallet and start predicting now!</p>
	<p class="mt-2 font-inter text-[24px]">For more details or support, check out our:</p>
	<div class="mt-10 flex w-full flex-col justify-between gap-5 border border-blue-1000 md:flex-row">
		<button
			on:click={() => {
				goto(`/docs/register`);
			}}
			class="flex w-full justify-between bg-blue-500 px-5 py-2 font-inter text-sm font-bold text-white"
			><span>FAQs</span>
			<Icon src={ArrowRight} class="h-4 w-4" />
		</button>
		<button
			on:click={() => {
				goto(`/docs/register`);
			}}
			class="flex w-full justify-between bg-white px-5 py-2 font-inter text-sm font-bold text-black"
			><span>Contact Us</span>
			<Icon src={ArrowRight} class="h-4 w-4" />
		</button>
	</div>
</div>
