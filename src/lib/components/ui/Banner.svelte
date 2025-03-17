<script lang="ts">
	import { Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import { Icon, Wifi, InformationCircle, XCircle, ExclamationCircle, CheckCircle } from 'svelte-hero-icons';

	export let message: string;
	export let bannerType = 'info';
	let clazz = '';
	let ready = false;
	export { clazz as class };

	let bannerClassList = '';
	onMount(async () => {
		if (bannerType === 'warning') {
			bannerClassList = clazz + ' bg-warning';
		} else if (bannerType === 'danger') {
			bannerClassList = clazz + ' bg-warning';
		} else if (bannerType === 'success') {
			bannerClassList = clazz + ' bg-success-700 text-white';
		} else if (bannerType === 'waiting' || bannerType === 'checking') {
			bannerClassList = clazz + ' bg-lightpurple/60';
		} else if (bannerType === 'info') {
			bannerClassList = clazz + ' border border-primary bg-lightpurple/60';
		} else {
			bannerClassList = clazz + ' bg-sand-500/60';
		}
		ready = true;
	});
</script>

{#if ready}
	<div class="flex w-full rounded-md px-4 py-3 text-base text-black {bannerClassList}">
		<div class="flex gap-2">
			<div class="flex justify-start gap-x-2">
				{#if bannerType === 'warning'}
					<Icon src={ExclamationCircle} class="relative top-[2px] inline-block h-5 w-5 text-black" aria-hidden="true" />
				{:else if bannerType === 'danger'}
					<Icon src={XCircle} class="relative top-[2px] inline-block h-5 w-5 text-black" aria-hidden="true" />
				{:else if bannerType === 'success'}
					<Icon src={CheckCircle} class="relative top-[2px] inline-block h-5 w-5 text-white" aria-hidden="true" />
				{:else if bannerType === 'waiting'}
					<Spinner color="blue" class="mb-0.5 inline-block h-4 w-4" aria-hidden="true" />
				{:else if bannerType === 'checking'}
					<Icon src={Wifi} class="relative top-[2px] inline-block h-5 w-5 text-black" aria-hidden="true" />
				{:else}
					<Icon src={InformationCircle} class="relative top-[2px] inline-block h-5 w-5 text-black" aria-hidden="true" />
				{/if}
				<slot name="message">{@html message}</slot>
			</div>
		</div>
	</div>
{/if}
