<script lang="ts">
	import type { MarketData, PredictionMarketCreateEvent, PredictionMarketStakeEvent, Sip10Data } from '@mijoco/stx_helpers';
	import * as echarts from 'echarts';
	import { onDestroy, onMount } from 'svelte';
	import { fetchMarketStakes, getMarketToken } from '../predictions';
	import { fmtMicroToStx } from '$lib/utils';

	export let market: PredictionMarketCreateEvent;
	export let marketData: MarketData;
	let sip10Data: Sip10Data;
	let stakeData: Array<PredictionMarketStakeEvent> | undefined;
	let chart: echarts.ECharts | null = null;

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
				categoryData[category][index] = previousValue + (event.category === category ? Number(stakeAmount) : 0);
			});
		});

		return { xAxisData, categoryData };
	};

	const initializeChart = () => {
		if (stakeData) {
			const categories = marketData.categories.slice(0, 10); // Ensure max 10 categories
			const { xAxisData, categoryData } = processStakeData(stakeData, categories);

			const chartDom = document.getElementById('market-chart');
			chart = echarts.init(chartDom);

			const maxStaked = Math.max(...Object.values(categoryData).flat());

			const seriesData = categories.map((category, index) => ({
				name: category,
				data: categoryData[category],
				type: 'line',
				smooth: true,
				color: `hsl(${(index * 360) / categories.length}, 70%, 50%)`, // Dynamic color generation
				areaStyle: { color: `hsla(${(index * 360) / categories.length}, 70%, 50%, 0.2)` }
			}));

			const options = {
				title: { text: 'Predictions Progress' },
				tooltip: {
					trigger: 'axis',
					formatter: (params: any[]) => {
						return params.map((p) => `${p.seriesName}: ${p.value} ${sip10Data.symbol}`).join('<br>');
					}
				},
				xAxis: {
					type: 'category',
					name: '# of predictions',
					data: xAxisData,
					nameLocation: 'center',
					nameTextStyle: { fontSize: 14, padding: [10, 0, 0, 0] },
					nameGap: 25
				},
				yAxis: {
					type: 'value',
					name: `Total (${sip10Data.symbol})`,
					min: 0,
					max: maxStaked * 1.1,
					nameLocation: 'center',
					nameTextStyle: { fontSize: 12, padding: [10, 0, 0, 0] },
					nameGap: 50
				},
				series: seriesData
			};

			chart.setOption(options);
		}
	};

	const resizeChart = () => {
		if (chart) chart.resize();
	};

	onMount(async () => {
		stakeData = await fetchMarketStakes(market.marketId);
		sip10Data = getMarketToken(market.token);

		if (stakeData) {
			initializeChart();
			window.addEventListener('resize', resizeChart);
		}
	});

	onDestroy(() => {
		if (chart) chart.dispose();
		window.removeEventListener('resize', resizeChart);
	});
</script>

<div id="market-chart" class="h-[300px] w-full md:h-[400px]"></div>
