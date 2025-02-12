<script lang="ts">
	import { selectedCurrency, sessionStore } from '$stores/stores';

	// Store for selected currency
	// Top 10 most common currencies with their flags
	const currencies = [
		{ code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
		{ code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '$' },
		{ code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '$' },
		{ code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '$' },
		{ code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', symbol: '$' },
		{ code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: '$' },
		{ code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: '$' },
		{ code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbol: '$' },
		{ code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', symbol: '$' },
		{ code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: '$' }
	];

	// Dropdown open state
	let isOpen = false;

	// Handle selection
	function selectCurrency(currencyCode: string) {
		const c = currencies.find((o) => o.code === currencyCode);
		const rate = $sessionStore.exchangeRates.find((o) => o.currency === currencyCode);
		let symbol = '$';
		if (rate) symbol = rate.symbol;
		if (c) c.symbol = symbol;
		selectedCurrency.set(c ? c : { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol });
		isOpen = false;
	}
</script>

<div class="relative inline-block text-left">
	<!-- Selected Currency Button -->
	<button class="font-inter font-bold text-white hover:text-gray-400" on:click={() => (isOpen = !isOpen)}>
		<span class="font-inter text-[20px] font-bold">{$selectedCurrency.flag}</span>
		<span class="relative top-[-3px] mb-2 text-[20px] font-bold">{$selectedCurrency.code}</span>
		<span class="ml-2">▼</span>
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
