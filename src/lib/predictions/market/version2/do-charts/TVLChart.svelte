<script lang="ts">
	import type { PredictionMarketCreateEvent, PredictionMarketStakeEvent, Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { fmtMicroToStxNumber, fmtRoundToNDecimalPlaces, mapToMinMaxStrings } from '$lib/utils';
	import { convertCryptoToFiatNumber, fetchMarketStakes, getMarketToken } from '$lib/predictions/predictions';
	import { chart } from 'svelte-apexcharts';
	import { selectedCurrency, type Currency } from '$stores/stores';

	let options: any;
	let marketStakes: Array<PredictionMarketStakeEvent> = [];
	export let title: string;
	export let market: PredictionMarketCreateEvent;
	let sip10Data: Sip10Data;
	$: initializeChart($selectedCurrency);

	// Helper function to compute TVL per category
	const calculateTvlPerCategory = (currency: Currency, data: Array<PredictionMarketStakeEvent>, categories: string[]) => {
		let categoryTVL: Record<string, number> = {};

		// Initialize all categories with 0
		categories.forEach((category) => (categoryTVL[category] = 0));

		// Sum up all stake amounts per category
		data.forEach((event) => {
			const category = categories[event.index];
			let stakeAmount = fmtMicroToStxNumber(event.amount, sip10Data.decimals);
			stakeAmount = fmtRoundToNDecimalPlaces(stakeAmount, 2);
			categoryTVL[category] += stakeAmount;
		});
		//categoryTVL = Object.fromEntries(Object.entries(categoryTVL).map(([key, val]) => [key, Number(val.toFixed(2))]));
		categoryTVL = Object.fromEntries(Object.entries(categoryTVL).map(([key, val]) => [key, convertCryptoToFiatNumber(currency, (sip10Data?.decimals || 6) === 6, val)]));

		return categoryTVL;
	};

	const initializeChart = (currency: Currency) => {
		if (marketStakes) {
			let categories = mapToMinMaxStrings(market.marketData.categories);
			const categoryTVL = calculateTvlPerCategory(currency, marketStakes, categories);

			// Generate data for the bar chart
			options = {
				series: [
					{
						name: 'Total Staked',
						data: Object.values(categoryTVL) // Heights of the bars (TVL)
					}
				],
				chart: {
					type: 'bar',
					toolbar: { show: false },
					zoom: { enabled: false }
				},
				title: {
					text: 'Total Value Locked (TVL)',
					align: 'center',
					style: {
						fontSize: '10px', // Adjust font size
						color: '#fff' // Custom color
					}
				},
				xaxis: {
					categories: Object.keys(categoryTVL), // Category names
					title: {
						text: 'Prediction Outcomes',
						style: {
							fontSize: '10px', // Adjust font size
							color: '#fff' // Custom color
						}
					},
					labels: {
						formatter: (value: string) => {
							return value.length > 10 ? value.slice(0, 10) + '...' : value; // Truncate long names
						},
						style: {
							fontSize: '12px',
							colors: '#fff'
						}
					}
				},
				yaxis: {
					title: {
						text: 'Total Staked (' + currency.code + ')',
						style: {
							fontSize: '12px',
							color: '#fff'
						}
					},
					labels: {
						formatter: (value: number) => value.toFixed(2),
						style: {
							fontSize: '12px',
							colors: '#fff'
						}
					}
				},
				plotOptions: {
					bar: {
						borderRadius: 4,
						horizontal: false,
						columnWidth: '50%' // Adjust width of bars
					}
				},
				tooltip: {
					y: {
						formatter: (value: number) => `${value} ${sip10Data.symbol}`
					}
				}
			};
		}
	};

	onMount(async () => {
		marketStakes = await fetchMarketStakes(market.marketId, market.marketType);
		sip10Data = getMarketToken(market.marketData.token);

		if (marketStakes) {
			initializeChart($selectedCurrency);
		}
	});
</script>

{#if options}
	<h2 class="card-title mb-6 text-2xl">{title}</h2>
	<div class="h-auto">
		<div use:chart={options}></div>
	</div>
{/if}
