<script lang="ts">
	import { selectedCurrency } from '$stores/stores';

	// Store for selected currency
	// Top 10 most common currencies with their flags
	const currencies = [
		{ code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
		{ code: 'EUR', name: 'Euro', flag: '🇪🇺' },
		{ code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
		{ code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
		{ code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
		{ code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
		{ code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
		{ code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
		{ code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
		{ code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' }
	];

	// Dropdown open state
	let isOpen = false;

	// Handle selection
	function selectCurrency(currencyCode: string) {
		const c = currencies.find((o) => o.code === currencyCode);
		selectedCurrency.set(c ? c : { code: 'USD', name: 'US Dollar', flag: '🇺🇸' });
		isOpen = false;
	}
</script>

<div class="relative inline-block text-left">
	<!-- Selected Currency Button -->
	<button class="flex items-center rounded-md border border-black bg-transparent px-4 py-2 shadow-sm transition hover:bg-gray-200" on:click={() => (isOpen = !isOpen)}>
		<span class="text-lg">{$selectedCurrency.flag}</span>
		<span class="ml-2 text-sm font-medium text-gray-900">{$selectedCurrency.code}</span>
		<span class="ml-2 text-gray-600">▼</span>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div class="absolute left-0 z-50 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
			{#each currencies as currency}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="flex cursor-pointer items-center px-4 py-2 transition hover:bg-gray-100" on:click={() => selectCurrency(currency.code)}>
					<span class="text-lg">{currency.flag}</span>
					<span class="ml-2 text-sm font-medium text-gray-900">{currency.name} ({currency.code})</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
