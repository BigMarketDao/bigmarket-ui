<script lang="ts">
	import type { PredictionMarketCreateEvent, PredictionMarketStakeEvent, Sip10Data } from '@mijoco/stx_helpers';
	import * as echarts from 'echarts';
	import { onDestroy, onMount } from 'svelte';
	import { fetchMarketStakes, getMarketToken } from '../predictions';
	import { fmtMicroToStx } from '$lib/utils';
	import { sessionStore } from '$stores/stores';

	export let market: PredictionMarketCreateEvent;
	let sip10Data: Sip10Data;
	let stakeData: Array<PredictionMarketStakeEvent> | undefined;
	let chart: echarts.ECharts | null = null;

	// Helper function to process data
	const processStakeData = (data: Array<PredictionMarketStakeEvent>) => {
		// Extract x-axis labels (event indices)
		const xAxisData = Array.from({ length: data.length }, (_, i) => i + 1);

		// Calculate cumulative stakes for "yes" and "no" predictions
		const yesData = data.reduce((acc: Array<number>, event, index) => {
			const cumulative = (acc[index - 1] || 0) + (event.yes ? Number(fmtMicroToStx(event.amount, sip10Data.decimals)) : 0);
			acc.push(cumulative);
			return acc;
		}, []);

		const noData = data.reduce((acc: Array<number>, event, index) => {
			const cumulative = (acc[index - 1] || 0) + (!event.yes ? Number(fmtMicroToStx(event.amount, sip10Data.decimals)) : 0);
			acc.push(cumulative);
			return acc;
		}, []);

		return { xAxisData, yesData, noData };
	};

	const initializeChart = () => {
		if (stakeData) {
			const { xAxisData, yesData, noData } = processStakeData(stakeData);

			const chartDom = document.getElementById('market-chart');
			chart = echarts.init(chartDom);

			// Find the max total staked value
			const maxStaked = Math.max(...yesData, ...noData);

			const options = {
				title: { text: 'Predictions Progress' },
				tooltip: {
					trigger: 'axis',
					formatter: (params: any[]) => {
						const yesPoint = params.find((p) => p.seriesName === 'Yes Predictions');
						const noPoint = params.find((p) => p.seriesName === 'No Predictions');
						return `
						Event Index: ${yesPoint?.name || noPoint?.name}<br>
						Yes Total Staked: ${yesPoint?.value || 0} ${sip10Data.symbol}<br>
						No Total Staked: ${noPoint?.value || 0} ${sip10Data.symbol}`;
					}
				},
				xAxis: {
					type: 'category',
					name: '# of predictions',
					data: xAxisData,
					axisLabel: { rotate: 0 },
					nameLocation: 'center',
					nameTextStyle: {
						fontSize: 14,
						padding: [10, 0, 0, 0] // Adjusts spacing below the label
					},
					nameGap: 25 // Pushes the label down slightly to avoid overlap
				},
				yAxis: {
					type: 'value',
					name: ` Total (${sip10Data.symbol})`,
					min: 0,
					max: maxStaked * 1.1, // Scale up slightly for padding
					axisLabel: {
						rotate: 0,
						formatter: (value: number) => `${value}`
					},
					nameLocation: 'center',
					nameTextStyle: {
						fontSize: 12,
						padding: [10, 0, 0, 0] // Adjusts spacing below the label
					},
					nameGap: 50 // Pushes the label down slightly to avoid overlap
				},
				series: [
					{
						name: 'Yes Predictions',
						data: yesData,
						type: 'line',
						smooth: true,
						color: '#4caf50',
						areaStyle: { color: 'rgba(76, 175, 80, 0.2)' }
					},
					{
						name: 'No Predictions',
						data: noData,
						type: 'line',
						smooth: true,
						color: '#f44336',
						areaStyle: { color: 'rgba(244, 67, 54, 0.2)' }
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
		stakeData = await fetchMarketStakes(market.marketId);
		sip10Data = getMarketToken(market.token);

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
