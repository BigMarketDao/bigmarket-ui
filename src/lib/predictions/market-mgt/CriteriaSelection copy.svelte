<script lang="ts">
	import { onMount } from 'svelte';
	import type { Criterion } from '../predictions';
	import { DatePicker } from '@svelte-plugins/datepicker';
	import { format } from 'date-fns';

	export let criterion: Criterion;

	let startDateTime = new Date();
	let dateFormat = 'MM/dd/yy HH:mm';
	let isOpen = false;
	let componentKey = 0;
	// Create a local state copy to avoid mutating props directly
	let localCriterion: Criterion = {
		criteria: '',
		sources: [' ', ' '],
		resolvesAt: 0
	};
	const toggleDatePicker = () => (isOpen = !isOpen);

	const formatDate = (dateString: any) => {
		if (!dateString) return '';

		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			console.warn('Invalid date value detected:', dateString);
			return format(new Date(), dateFormat); // Prevents error from breaking the UI
		}

		return format(date, dateFormat);
	};
	let formattedStartDate = formatDate(startDateTime);
	$: formattedStartDate = formatDate(startDateTime);

	const handleChangeDate = () => {
		if (!formattedStartDate) {
			console.warn('Invalid date value detected:');
			return;
		}

		const parsedDate = new Date(formattedStartDate);

		if (isNaN(parsedDate.getTime())) {
			console.error('Invalid date format:', formattedStartDate);
			return;
		}

		startDateTime = parsedDate;
		localCriterion.resolvesAt = startDateTime.getTime();
		formattedStartDate = formatDate(startDateTime);
		componentKey++;
	};
	// Add a new empty source field
	function addSource() {
		localCriterion.sources.push('');
		console.log('localCriterion.sources: ', localCriterion.sources);
		componentKey++;
	}

	// Remove a source field by index
	function removeSource(index: number) {
		localCriterion.sources = localCriterion.sources.filter((_, i) => i !== index);
	}

	onMount(() => {
		// Clone the object to ensure reactivity
		if (criterion) {
			localCriterion = { ...criterion };
		} else {
			localCriterion = {
				criteria: '',
				sources: [''],
				resolvesAt: new Date().getTime()
			};
		}
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
		<div class="pt-5">
			<label for="resolution-date" class="mb-1 block text-sm font-medium">Resolution Date</label>
			<!-- <DatePicker showTimePicker="true" enableFutureDates="true" bind:isOpen bind:startDateTime enableTime>
				<input class="rounded-md p-2 text-black" type="text" placeholder="Select date" bind:value={formattedStartDate} on:change={onChange} on:click={toggleDatePicker} />
			</DatePicker> -->
			<DatePicker showTimePicker="true" enableFutureDates="true" bind:isOpen bind:startDateTime enableTime>
				<input class="rounded-md p-2 text-black" type="text" placeholder="Select date" bind:value={startDateTime} on:change={handleChangeDate} on:click={toggleDatePicker} />
			</DatePicker>
		</div>

		<!-- Sources Section -->
		<div class="pt-5">
			<h3 class="text-lg font-semibold text-gray-900">Sources</h3>
			<p class="text-sm text-gray-600">
				Add multiple sources to guide the AI agent in learning how to resolve this market. For example, if the market predicts the outcome of a football match, the sources list should include
				<a href="https://www.bbc.co.uk/sport/football/scores-fixtures" target="_blank" class="text-blue-500 underline"> BBC Scores and Fixtures </a>.
			</p>
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
			<button class="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" on:click={addSource}> + Add Source </button>
		</div>
	</div>
</div>
