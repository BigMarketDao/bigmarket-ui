<script>
	import { fmtNumber } from '$lib/utils';
	import { sessionStore } from '$stores/stores';
	import Countdown from './Countdown.svelte';

	export let startBurnHeight;
	export let stopBurnHeight;
	let currentBurnHeight = $sessionStore.stacksInfo.burn_block_height;

	// Calculate the progress percentage
	$: progress = (() => {
		if (currentBurnHeight < startBurnHeight) {
			return 0;
		} else if (currentBurnHeight >= startBurnHeight && currentBurnHeight < stopBurnHeight) {
			return ((currentBurnHeight - startBurnHeight) / (stopBurnHeight - startBurnHeight)) * 100;
		} else {
			return 100;
		}
	})();

	// Determine the state for styling purposes
	$: state = (() => {
		if (currentBurnHeight < startBurnHeight) {
			return 'bg-gray-200'; // Not started
		} else if (currentBurnHeight >= startBurnHeight && currentBurnHeight < stopBurnHeight) {
			return 'bg-hero-gradient'; // In progress
		} else {
			return 'bg-green-600'; // Completed
		}
	})();
</script>

<!-- Progress Bar Display -->
<div class="flex flex-col items-start space-y-3 text-sm">
	<div class="h-2.5 w-full rounded-full bg-gray-700">
		<div class={`h-2.5 rounded-full text-primary ${state}`} style="width: {progress}%"></div>
	</div>
	<div class="relative top-[-10px] flex w-full justify-between font-inter text-[12px] font-light">
		<span>{fmtNumber(startBurnHeight)}</span>
		<span>{fmtNumber(stopBurnHeight)}</span>
	</div>
	{#if stopBurnHeight >= currentBurnHeight}
		<div class="relative top-[-30px] w-full text-center font-inter text-[14px] font-semibold">
			<Countdown endBlock={stopBurnHeight - currentBurnHeight} scaleFactor={1} />
		</div>
	{/if}
</div>
