<script lang="ts">
	import { Tooltip } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import { Icon, Wifi, InformationCircle, XCircle, ExclamationCircle, CheckCircle } from 'svelte-hero-icons';

	export let message: string;
	export let trigger: string;

	onMount(async () => {});
</script>

<Tooltip placement="top" trigger="hover" triggeredBy={`#${trigger}`} class="rounded-lg border border-gray-700 bg-gray-1000  px-3 py-2 text-white shadow-lg">{message}</Tooltip>
<div class="">
	<slot name="title"></slot>
	<Icon src={InformationCircle} mini class="ml-2 inline h-5 w-5 shrink-0 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500/50" aria-hidden="true" id={trigger} />
</div>
