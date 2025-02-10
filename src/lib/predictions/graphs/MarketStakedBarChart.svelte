<script lang="ts">
	import type { MarketData, PredictionMarketCreateEvent, Sip10Data } from '@mijoco/stx_helpers';
	import * as echarts from 'echarts';
	import { onDestroy, onMount } from 'svelte';
	import { getMarketToken } from '../predictions';
	import { fmtMicroToStx } from '$lib/utils';

	export let market: PredictionMarketCreateEvent;
	export let marketData: MarketData;
	let sip10Data: Sip10Data;
	let chart: echarts.ECharts | null = null;

	const initializeChart = () => {
		if (!marketData || !marketData.stakes || marketData.stakes.length === 0) return;

		const categories = marketData.categories.slice(0, 10); // Limit to 10 categories
		const stakeValues = marketData.stakes.map((stake) => fmtMicroToStx(stake, sip10Data.decimals));

		const chartDom = document.getElementById('market-bar-chart');
		if (!chartDom) return;

		// Make sure ECharts disposes any existing chart before initializing a new one
		if (chart) {
			chart.dispose();
		}
		chart = echarts.init(chartDom);

		const options = {
			title: { text: 'Total Staked', left: 'center' },
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
				formatter: (params: any) => `${params[0].name}: ${params[0].value} ${sip10Data.symbol}`
			},
			grid: {
				left: '5%',
				right: '5%',
				bottom: '10%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: categories,
				name: 'Current Outcomes',
				nameLocation: 'center',
				nameTextStyle: { fontSize: 14, padding: [10, 0, 0, 0] },
				nameGap: 50,
				axisLabel: { rotate: 30 },
				axisTick: { alignWithLabel: true }
			},
			yAxis: {
				type: 'value',
				name: `Total Staked (${sip10Data.symbol})`,
				min: 0,
				nameLocation: 'center',
				nameTextStyle: { fontSize: 12, padding: [10, 0, 0, 0] },
				nameGap: 50
			},
			series: [
				{
					name: 'Staked',
					type: 'bar',
					data: stakeValues,
					barWidth: '95%',
					barCategoryGap: '5%',
					itemStyle: {
						color: (params: any) => `hsl(${(params.dataIndex * 360) / categories.length}, 70%, 50%)`
					}
				}
			]
		};

		chart.setOption(options);
	};

	const resizeChart = () => {
		if (chart) chart.resize();
	};

	onMount(async () => {
		sip10Data = getMarketToken(market.token);
		initializeChart();
		window.addEventListener('resize', resizeChart);
	});

	onDestroy(() => {
		if (chart) {
			chart.dispose();
		}
		window.removeEventListener('resize', resizeChart);
	});
</script>

<div id="market-bar-chart" class="h-[300px] w-full md:h-[400px]"></div>
