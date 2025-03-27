<script lang="ts">
	import { validEmail } from '$lib/predictions/predictions';
	import { getConfig } from '$stores/store_helpers';
	import { registerAction } from 'echarts';
	import Banner from './ui/Banner.svelte';

	let email = '';
	let result: string | undefined;

	const register = async () => {
		result = undefined;
		if (validEmail(email)) {
			try {
				const path = `${getConfig().VITE_BIGMARKET_API}/gating/register-interest/${email}`;
				const response = await fetch(path);
				await response.json();
				result = "Thanks for registering - we'll be in touch!";
			} catch (err: any) {
				result = 'Already registered - thanks for your interest!';
			}
		} else {
			result = 'Invalid email';
		}
	};
</script>

<div class="w-full">
	<!-- Purchase Card -->
	<div class="group relative overflow-hidden rounded-xl border border-purple-900/20 bg-[#0F1225] p-8 shadow-lg transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
		<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>
		<div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(168,85,247,0.05)_10px,rgba(168,85,247,0.05)_20px)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

		<div class="relative">
			<!-- Page Heading -->
			<div class="text-center">
				<h1 class="mb-4 text-3xl font-extrabold tracking-tight">🚀 Join the Waiting List</h1>
				<p class="text-lg text-gray-100">Be the first to create markets and unlock new opportunities!</p>
			</div>

			<div class=" mt-6 space-y-6 px-6">
				<!-- Accordion: Markets Info -->
				<div class="rounded-lg border border-gray-200 shadow-md">
					<button class="flex w-full items-center justify-between px-5 py-4 text-left text-lg font-semibold text-blue-900 transition-all duration-300 ease-in-out">
						<span>Why Become a Market Creator?</span>
						<span class="text-xl">▼</span>
					</button>
					<div id="markets-info" class="px-6 py-4 text-gray-800">
						<ul class="space-y-3">
							<li class="flex items-center space-x-2">
								<span class="text-green-500 text-2xl">💰</span> <span>Generate revenue for your project</span>
							</li>
							<li class="flex items-center space-x-2">
								<span class="text-2xl text-purple-500">📢</span> <span>Amplify your reach</span>
							</li>
							<li class="flex items-center space-x-2">
								<span class="text-2xl text-yellow-500">🎨</span> <span>Tailor markets to your community</span>
							</li>
						</ul>

						<!-- Email Signup -->
						<div class="mt-6">
							<!-- <label for="email" class="mb-2 block text-sm font-medium text-gray-700">📩 Drop your email, and we'll be in touch!</label> -->
							<div class="flex">
								<input id="email" type="email" bind:value={email} placeholder="Enter your email..." class="w-full rounded-l-lg border-b border-gray-800 p-3 font-semibold text-black shadow-sm focus:border-gray-800 focus:ring-blue-500" />
								<button on:click={() => register()} class="bg-success-800 hover:bg-success-700 rounded-r-lg px-4 py-3 font-semibold text-white transition-all duration-300"> Join </button>
							</div>
							<p class="mt-2 text-sm text-gray-600">We respect your privacy. No spam, ever.</p>
						</div>
						{#if result}
							<div class="my-4">
								<Banner bannerType={'success'} message={result} />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
