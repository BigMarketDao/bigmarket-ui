<script lang="ts">
	import type {
		PredictionMarketCreateEvent,
		PredictionMarketStakeEvent
	} from '@mijoco/stx_helpers';
	import * as echarts from 'echarts';
	import { onDestroy, onMount } from 'svelte';
	import { fetchMarketsStakesData, type MarketData } from '../predictions';
	import { fmtMicroToStx } from '$lib/utils';

	export let market: PredictionMarketCreateEvent;
	let stakeData: Array<PredictionMarketStakeEvent> | undefined;
	let chart: echarts.ECharts | null = null;

	// Helper function to process data
	const processStakeData = (data: Array<PredictionMarketStakeEvent>) => {
		const xAxisData = data.map((event) => event.event_index); // Stake event indices
		const yAxisData = data.reduce((acc: Array<number>, event, index) => {
			const cumulative = (acc[index - 1] || 0) + fmtMicroToStx(event.amount);
			acc.push(cumulative);
			return acc;
		}, []);
		return { xAxisData, yAxisData };
	};

	const initializeChart = () => {
		if (stakeData) {
			const { xAxisData, yAxisData } = processStakeData(stakeData);

			const chartDom = document.getElementById('market-chart');
			chart = echarts.init(chartDom);

			const options = {
				title: { text: 'Market Stake Progress' },
				tooltip: {
					trigger: 'axis',
					formatter: (params: any[]) => {
						const point = params[0];
						return `Event Index: ${point.name}<br>Total Staked: ${point.value} STX`;
					}
				},
				xAxis: {
					type: 'category',
					name: 'Predictions',
					data: xAxisData,
					axisLabel: { rotate: 0 }
				},
				yAxis: {
					type: 'value',
					name: 'Total Staked (STX)',
					axisLabel: { formatter: '{value} STX' }
				},
				series: [
					{
						name: 'Total Staked',
						data: yAxisData,
						type: 'line',
						smooth: true,
						color: '#4caf50',
						areaStyle: { color: 'rgba(76, 175, 80, 0.2)' }
					}
				]
			};

			chart.setOption(options);
		}
	};

	const resizeChart = () => {
		if (chart) chart.resize();
	};

	onMount(async () => {
		stakeData = await fetchMarketsStakesData(market.marketId);

		if (stakeData) {
			initializeChart();

			// Attach resize event listener
			window.addEventListener('resize', resizeChart);
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.dispose();
		}
		window.removeEventListener('resize', resizeChart);
	});
</script>

<div id="market-chart" class="h-[300px] w-full md:h-[400px]"></div>
