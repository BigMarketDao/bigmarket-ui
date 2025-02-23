<script lang="ts">
	import type { PredictionMarketCreateEvent, PredictionMarketStakeEvent, Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { fmtMicroToStx, fmtMicroToStxNumber, mapToMinMaxStrings } from '$lib/utils';
	import { fetchMarketStakes, getMarketToken } from '$lib/predictions/predictions';
	import { chart } from 'svelte-apexcharts';
	let options: any;

	export let market: PredictionMarketCreateEvent;
	export let title: string;
	let marketStakes: Array<PredictionMarketStakeEvent> = [];

	let sip10Data: Sip10Data;
	let series: { name: string; data: number[] }[] = [];
	//let options = {};

	// Helper function to process data
	const processStakeData = (data: Array<PredictionMarketStakeEvent>, categories: string[]) => {
		const xAxisData = Array.from({ length: data.length }, (_, i) => i + 1);
		const categoryData: Record<string, number[]> = {};

		// Initialize arrays for each category
		categories.forEach((category) => (categoryData[category] = new Array(data.length).fill(0)));

		// Accumulate stake data
		data.forEach((event, index) => {
			categories.forEach((category) => {
				const previousValue = index > 0 ? categoryData[category][index - 1] : 0;
				const stakeAmount = fmtMicroToStx(event.amount, sip10Data.decimals);
				const cate = categories[event.index];
				categoryData[category][index] = previousValue + (cate === category ? Number(stakeAmount) : 0);
			});
		});

		return { xAxisData, categoryData };
	};

	const initializeChart = () => {
		if (marketStakes) {
			let categories = mapToMinMaxStrings(market.marketData.categories);
			const { xAxisData, categoryData } = processStakeData(marketStakes, categories);

			const maxStaked = Math.max(...Object.values(categoryData).flat()).toPrecision(3);

			// Create series data for ApexCharts

			options = {
				series: categories.map((category) => {
					return {
						name: category,
						data: categoryData[category]
					};
				}),
				chart: {
					type: 'line',
					toolbar: { show: false },
					zoom: { enabled: true }
				},
				title: {
					text: '% Chances',
					align: 'center'
				},
				// tooltip: {
				// 	enabled: true,
				// 	y: {
				// 		formatter: (value: any) => `${value} ${sip10Data.symbol}`
				// 	}
				// },
				xaxis: {
					categories: marketStakes.map((o, index) => index),
					type: 'category',
					title: { text: '' }
				},
				yaxis: {
					title: { text: `Total (${sip10Data.symbol})` },
					min: 0,
					max: Number(maxStaked), // Ensure it's a number, not a string
					labels: {
						formatter: (value: number) => value.toFixed(2) // Display up to 2 decimal places
					}
				}
				// stroke: { curve: 'smooth' },
				// fill: {
				// 	type: 'gradient',
				// 	gradient: {
				// 		shade: 'light',
				// 		type: 'vertical',
				// 		shadeIntensity: 0.25,
				// 		gradientToColors: undefined,
				// 		inverseColors: false,
				// 		opacityFrom: 0.5,
				// 		opacityTo: 0,
				// 		stops: [0, 100]
				// 	}
				// }
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
	<h2 class=" mb-6 text-2xl">{title}</h2>
	<div class="h-auto">
		<div use:chart={options}>chart</div>
	</div>
{/if}
