<script lang="ts">
	import type { PredictionMarketCreateEvent, PredictionMarketStakeEvent, Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { fmtMicroToStxNumber, mapToMinMaxStrings } from '$lib/utils';
	import { fetchMarketStakes, getMarketToken } from '$lib/predictions/predictions';
	import { chart } from 'svelte-apexcharts';

	let options: any;
	let marketStakes: Array<PredictionMarketStakeEvent> = [];
	export let title: string;
	export let market: PredictionMarketCreateEvent;
	let sip10Data: Sip10Data;

	// Helper function to compute TVL per category
	const calculateTvlPerCategory = (data: Array<PredictionMarketStakeEvent>, categories: string[]) => {
		const categoryTVL: Record<string, number> = {};

		// Initialize all categories with 0
		categories.forEach((category) => (categoryTVL[category] = 0));

		// Sum up all stake amounts per category
		data.forEach((event) => {
			const category = categories[event.index];
			const stakeAmount = fmtMicroToStxNumber(event.amount, sip10Data.decimals);
			categoryTVL[category] += stakeAmount;
		});

		return categoryTVL;
	};

	const initializeChart = () => {
		if (marketStakes) {
			let categories = mapToMinMaxStrings(market.marketData.categories);
			const categoryTVL = calculateTvlPerCategory(marketStakes, categories);

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
					align: 'center'
				},
				xaxis: {
					categories: Object.keys(categoryTVL), // Category names
					title: { text: 'Prediction Outcomes' }
				},
				yaxis: {
					title: { text: `Total Staked (${sip10Data.symbol})` },
					labels: {
						formatter: (value: number) => value.toFixed(2) // Limit decimal places
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
			initializeChart();
		}
	});
</script>

{#if options}
	<h2 class="card-title mb-6 text-2xl">{title}</h2>
	<div class="h-auto">
		<div use:chart={options}>chart</div>
	</div>
{/if}
