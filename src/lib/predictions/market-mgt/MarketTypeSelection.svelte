<script lang="ts">
	import { MARKET_BINARY_OPTION, type MarketCategoricalOption, type ScalarMarketDataItem } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';

	export let priceFeedId: string;
	export let marketType = 0;
	export let marketTypeDataCategorical: Array<MarketCategoricalOption>;
	export let marketTypeDataScalar: Array<ScalarMarketDataItem> = [
		{ min: 0.4, max: 0.6 },
		{ min: 0.6, max: 0.8 },
		{ min: 0.8, max: 1.0 },
		{ min: 1.0, max: 1.2 }
	];

	let marketTypeDataCategoricalSaved = marketTypeDataCategorical;
	let rangeValuesSaved = marketTypeDataScalar;
	let componentKey = 0;

	let marketTypes = [
		{ name: 'Binary Market - for or against', value: 0 },
		{ name: 'Categorical Market - multiple options', value: 1 },
		{ name: 'Scalar Market - range of options', value: 2 }
	];
	let startType = 1;

	// Categorical Market Options
	function addRange() {
		marketTypeDataScalar = [...marketTypeDataScalar, { min: marketTypeDataScalar[marketTypeDataScalar.length - 1].max, max: marketTypeDataScalar[marketTypeDataScalar.length - 1].max + 1 }];
		rangeValuesSaved = marketTypeDataScalar;
	}
	function removeRange() {
		if (marketTypeDataScalar.length === 1) return;
		marketTypeDataScalar.splice(marketTypeDataScalar.length - 1, 1);
		rangeValuesSaved = marketTypeDataScalar;
		componentKey++;
	}
	function addOption() {
		marketTypeDataCategorical = [...marketTypeDataCategorical, { label: `Option ${marketTypeDataCategorical.length + 1}` }];
		marketTypeDataCategoricalSaved = marketTypeDataCategorical;
	}
	function removeOption(index: number) {
		if (marketTypeDataCategorical.length < 4) return;
		marketTypeDataCategorical = marketTypeDataCategorical.filter((_, i) => i !== index);
		marketTypeDataCategoricalSaved = marketTypeDataCategorical;
	}
	function changeMarketType() {
		if (marketType === 0) marketTypeDataCategorical = MARKET_BINARY_OPTION;
		else if (marketType === 1) marketTypeDataCategorical = marketTypeDataCategoricalSaved;
	}

	onMount(() => {
		if (marketTypeDataCategorical) {
			startType = 1;
			if (marketTypeDataCategorical.length === 2) {
				startType = 0;
			}
		}
		// marketTypeDataCategorical = [{ label: 'Option 1' }, { label: 'Option 2' }, { label: 'Option 3' }];
	});
</script>

<div class="flex flex-col gap-y-5 rounded-md border pb-5 shadow-md">
	<!-- Market Type Dropdown -->
	<button class="w-full bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200" type="button"> Type of Market </button>
	<div id="markets-info" class="px-4">
		<p class="mb-0 text-gray-700">Affects the way users choose an answer</p>
	</div>

	<div class="">
		<div class="mx-auto px-4 text-white shadow-md">
			<div class="mb-2">
				<select id="market-type" bind:value={marketType} on:change={() => changeMarketType()} class="h-auto w-full rounded-md border-gray-300 px-4 py-4 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500">
					<option value="" disabled selected>-- Select a Market Type --</option>
					{#each marketTypes as type}
						<option value={type.value} selected={type.value === startType}>{type.name}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Categorical Market Input -->
	{#if marketType === 1 && marketTypeDataCategorical}
		<div class="px-4">
			<h3 class="text-lg font-semibold text-white">Define Choices</h3>
			<p class="text-sm text-gray-600">Add multiple choices for users to select from - minimum three.</p>
			<ul class="mt-2">
				{#each marketTypeDataCategorical as option, index}
					<li class="mb-2 flex items-center gap-2">
						<input type="text" class="w-full rounded-md border-gray-300 px-2 py-1 text-black focus:border-blue-500 focus:ring-blue-500" bind:value={marketTypeDataCategorical[index].label} />
						<button class="text-red-500 hover:text-red-700" on:click={() => removeOption(index)}>✖</button>
					</li>
				{/each}
			</ul>
			<button class="bg-warning-500 hover:bg-warning-600 mt-2 rounded-md px-3 py-2 text-white" on:click={addOption}> + Add Option </button>
		</div>
	{/if}

	<!-- Scalar Market Input -->
	{#key componentKey}
		{#if marketType === 2}
			<div class="px-4">
				<h3 class="text-lg font-semibold text-white">Set Range</h3>
				<p class="text-sm text-gray-600">Define the min/max steps values for the market - the steps have to be contiguous.</p>
				{#each marketTypeDataScalar as range, index}
					<div class="mt-2 flex flex-col">
						<label for="lower">Enter range</label>
						<div class="flex gap-4">
							<input type="number" class="w-1/4 rounded-md border-gray-300 px-2 py-1 text-black focus:border-blue-500 focus:ring-blue-500" placeholder="Min Value" bind:value={range.min} />
							<input type="number" class="w-1/4 rounded-md border-gray-300 px-2 py-1 text-black focus:border-blue-500 focus:ring-blue-500" placeholder="Max Value" bind:value={range.max} />
						</div>
					</div>
				{/each}
				<button class="bg-warning-500 hover:bg-warning-600 mt-2 rounded-md py-2 text-white" on:click={removeRange}> - Remove Last </button>
				<button class="bg-warning-500 hover:bg-warning-600 mt-2 rounded-md py-2 text-white" on:click={addRange}> + Add Range </button>
				<div class="">
					<h3 class="text-lg font-semibold text-white">Trading Pair</h3>
					<p class="text-sm text-gray-600">See <a href="https://docs.diadata.org/use-nexus-product/how-to-dia-nexus-oracles/access-the-oracle/stacks-price-oracles">supported by dia-oracle</a>.</p>
					<p class="text-sm text-gray-600">Choose one of below for now.</p>
					<div class="mx-auto text-white shadow-md">
						<div class="mb-2">
							<select id="market-type" bind:value={priceFeedId} class="h-10 w-full rounded-md border-gray-300 px-4 py-3 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500">
								<option value="" disabled selected>-- Select a Trading Pair --</option>
								<option value="STX/USD/0">STX/USD/0</option>
								<option value="STX/USD/1">STX/USD/1</option>
								<option value="STX/USD/2">STX/USD/2</option>
								<option value="STX/USD/3">STX/USD/3</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/key}
</div>
