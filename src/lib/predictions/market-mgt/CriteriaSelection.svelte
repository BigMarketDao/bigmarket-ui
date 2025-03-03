<script lang="ts">
	import { onMount } from 'svelte';
	import { DatePicker } from 'date-picker-svelte';
	import { format } from 'date-fns';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { urlRegex } from '$lib/utils';
	import type { Criterion } from '@mijoco/stx_helpers/dist/index';
	import { Profanity } from '@2toad/profanity';

	export let marketType: number;
	export let criteria: Criterion;
	let localCriterion = { ...criteria };
	$: criteria = localCriterion;

	let value: Date = new Date(criteria.resolvesAt);
	let minDate: Date = new Date();
	let maxDate: Date = new Date('2050-12-31 12:00');
	let dateFormat = 'yyyy-MM-dd HH:mm';
	$: localCriterion.resolvesAt = value.getTime();
	let componentKey: number = 0;
	let currentSource: string | undefined;
	let errorMessage: string | undefined;

	function addSource() {
		if (!currentSource || currentSource.trim().length === 0) {
			errorMessage = 'Please enter a valid url';
			return;
		}
		if (!localCriterion.sources) localCriterion.sources = [];
		if (localCriterion.sources.indexOf(currentSource) > -1) {
			errorMessage = 'This url appears to already be included';
			return;
		}
		const profanity = new Profanity();
		currentSource = profanity.censor(currentSource);

		localCriterion.sources.push(currentSource);
		componentKey++;
		currentSource = undefined;
	}

	function removeSource(index: number) {
		localCriterion.sources = localCriterion.sources.filter((_, i) => i !== index);
	}

	onMount(() => {
		if (marketType === 2) {
			const twoDaysFromNow = new Date();
			twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
			localCriterion.resolvesAt = twoDaysFromNow.getTime();
		}
		localCriterion = criteria;
	});
</script>

<div class="flex flex-col gap-y-5 rounded-md border pb-5 shadow-md">
	<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button">Resolution Criteria</button>
	<div class="px-4 pt-5">
		<!-- Market Type Dropdown -->
		<div class="pb-2">
			<p class="mb-0 text-gray-700">Provide a detailed description, date before which resolution date and sources from which the outcome can be gathered.</p>
		</div>

		<!-- Resolution Criteria -->
		<div>
			<textarea class="w-full p-5 font-inter font-medium text-black" placeholder="describe criteria for resolving this market..." rows="5" bind:value={localCriterion.criteria}>{localCriterion.criteria}</textarea>
		</div>

		<!-- Resolution Date with Datepicker -->
		<div class="mt-5 w-full">
			{#if marketType < 2}
				<label for="date-picker" class="block text-sm font-medium text-gray-700">Select Date & Time</label>

				<div id="date-picker" class="relative mt-2">
					<DatePicker bind:value max={maxDate} min={minDate} timePrecision="minute" />
				</div>

				<p class="mt-2 text-gray-600">Resolution after: <strong class="text-white">{format(new Date(localCriterion.resolvesAt), dateFormat)}</strong></p>
			{:else}
				<p class="mt-2 text-gray-600">Resolution after 2 days / 288 blocks: <strong class="text-white">{format(new Date(localCriterion.resolvesAt), dateFormat)}</strong></p>
			{/if}
		</div>

		<!-- Sources Section -->
		<div class="pt-5">
			<h3 class="text-lg font-semibold text-gray-900">Sources</h3>
			{#if errorMessage}
				<div class="flex items-center gap-2">
					<Banner bannerType={'warning'} message={errorMessage} />
				</div>
			{/if}
			<p class="text-sm text-gray-600">
				Add multiple sources to guide the AI agent in learning how to resolve this market. For example, if the market predicts the outcome of a football match, the sources list should include
				<a href="https://www.bbc.co.uk/sport/football/scores-fixtures" target="_blank" class="text-blue-500 underline"> BBC Scores and Fixtures </a>.
			</p>
			<div class="mt-2 space-y-2">
				<div class="flex items-center gap-2">
					<input type="text" class="w-full rounded-md border border-gray-300 px-2 py-1 text-black focus:border-blue-500 focus:ring-blue-500" bind:value={currentSource} />
				</div>
			</div>
			<button class="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" on:click={addSource}> + Add Source </button>
			<div class="mt-2 space-y-2">
				{#key componentKey}
					{#each localCriterion.sources as source, index}
						<div class="flex items-center gap-2">
							<input type="text" class="w-full rounded-md border border-gray-300 px-2 py-1 text-black focus:border-blue-500 focus:ring-blue-500" value={localCriterion.sources[index]} />
							<button class="text-red-500 hover:text-red-700" on:click={() => removeSource(index)}> ✖ </button>
						</div>
					{/each}
				{/key}
			</div>
		</div>
	</div>
</div>

<style>
	:global(.date-time-picker) {
		width: 16rem;
	}
</style>
