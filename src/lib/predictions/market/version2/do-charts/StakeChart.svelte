<script lang="ts">
	import type { PredictionMarketCreateEvent, PredictionMarketStakeEvent, Sip10Data } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { fmtMicroToStx, fmtMicroToStxNumber, mapToMinMaxStrings } from '$lib/utils';
	import { convertCryptoToFiatNumber, fetchMarketStakes, getMarketToken } from '$lib/predictions/predictions';
	import { chart } from 'svelte-apexcharts';
	import { selectedCurrency, type Currency } from '$stores/stores';
	let options: any;

	export let market: PredictionMarketCreateEvent;
	export let title: string;
	let marketStakes: Array<PredictionMarketStakeEvent> = [];

	let sip10Data: Sip10Data;
	let series: { name: string; data: number[] }[] = [];
	//let options = {};
	$: initializeChart($selectedCurrency);

	// Helper function to process data
	$: processStakeData = (currency: Currency, data: Array<PredictionMarketStakeEvent>, categories: string[]) => {
		const xAxisData = Array.from({ length: data.length }, (_, i) => i + 1);
		const categoryData: Record<string, number[]> = {};

		// Initialize arrays for each category
		categories.forEach((category) => (categoryData[category] = new Array(data.length).fill(0)));

		// Accumulate stake data
		data.forEach((event, index) => {
			categories.forEach((category) => {
				const previousValue = index > 0 ? categoryData[category][index - 1] : 0;
				const stakeAmount = fmtMicroToStxNumber(event.amount, sip10Data.decimals);
				const stakeAmountFiat = convertCryptoToFiatNumber(currency, (sip10Data?.decimals || 6) === 6, stakeAmount);
				const cate = categories[event.index];
				categoryData[category][index] = previousValue + (cate === category ? Number(stakeAmountFiat) : 0);
			});
		});

		return { xAxisData, categoryData };
	};

	const initializeChart = (currency: Currency) => {
		if (marketStakes && marketStakes.length > 0) {
			let categories = mapToMinMaxStrings(market.marketData.categories);
			const { xAxisData, categoryData } = processStakeData(currency, marketStakes, categories);

			const maxStaked = Math.max(...Object.values(categoryData).flat()).toPrecision(3);

			// Create series data for ApexCharts

			options = {
				legend: {
					position: 'bottom', // Positions: "top", "bottom", "left", "right"
					fontSize: '12px',
					fontWeight: 'bold',
					fontFamily: 'Arial, sans-serif',
					markers: {
						width: 12, // Size of the color marker
						height: 12,
						radius: 12,
						offsetX: -5
					},
					labels: {
						colors: '#fff', // Change text color
						useSeriesColors: false, // If true, uses the series color
						padding: 10, // Space between legend items
						vertical: 5
					},
					itemMargin: {
						horizontal: 10, // Space between legend items
						vertical: 5
					},
					onItemClick: {
						toggleDataSeries: true // Allows users to click and toggle visibility
					},
					onItemHover: {
						highlightDataSeries: true
					}
				},
				series: categories.map((category) => {
					return {
						name: category,
						data: categoryData[category]
					};
				}),
				chart: {
					type: 'line',
					toolbar: { show: false },
					zoom: { enabled: true },
					style: {
						fontSize: '10px', // Adjust font size
						color: '#fff' // Custom color
					}
				},
				title: {
					text: '% Chances',
					align: 'center',
					style: {
						fontSize: '10px', // Adjust font size
						color: '#fff' // Custom color
					}
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
					title: {
						text: '',
						style: {
							fontSize: '10px', // Adjust font size
							color: '#fff' // Custom color
						}
					},
					labels: {
						style: {
							fontSize: '12px',
							colors: '#fff'
						}
					}
				},
				yaxis: {
					title: {
						text: `Total Staked (${currency.code})`,
						style: {
							fontSize: '12px',
							color: '#fff'
						}
					},
					min: 0,
					max: Number(maxStaked),
					labels: {
						formatter: (value: number) => value.toFixed(2),
						style: {
							fontSize: '12px',
							colors: '#fff'
						}
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
			initializeChart($selectedCurrency);
		}
	});
</script>

{#if options}
	<h2 class="card-title mb-6 text-2xl">{title}</h2>
	<div class="h-auto">
		<div class=" z-10" use:chart={options}></div>
	</div>
{/if}
