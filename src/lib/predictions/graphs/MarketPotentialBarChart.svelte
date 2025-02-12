<script lang="ts">
	import type { MarketData, PredictionMarketCreateEvent, Sip10Data, UserStake } from '@mijoco/stx_helpers';
	import * as echarts from 'echarts';
	import { onDestroy, onMount } from 'svelte';
	import { calculatePayoutCategorical, getMarketToken } from '../predictions';
	import { fmtMicroToStx } from '$lib/utils';
	import { stakeAmount } from '$stores/stores';

	export let market: PredictionMarketCreateEvent;
	export let marketData: MarketData;
	export let userStake: UserStake | undefined;
	let sip10Data: Sip10Data;
	let chart: echarts.ECharts | null = null;
	let payouts: number[] = [];

	// Function to recalculate and redraw chart when the user updates input
	const updateChart = () => {
		if (!marketData || !marketData.stakes || marketData.stakes.length === 0) return;

		// Calculate new payouts based on user input
		payouts = calculatePayoutCategorical($stakeAmount, sip10Data.decimals, userStake, marketData);

		const categories = marketData.categories.slice(0, 10); // Limit to 10 categories
		const stakeValues = payouts.map((p) => fmtMicroToStx(p, sip10Data.decimals)); // Convert payout strings to numbers

		if (chart) {
			chart.setOption({
				series: [
					{
						data: stakeValues
					}
				]
			});
		}
	};

	const initializeChart = () => {
		if (!marketData || !marketData.stakes || marketData.stakes.length === 0) return;

		const categories = marketData.categories.slice(0, 10);
		const stakeValues = marketData.stakes.map((stake) => fmtMicroToStx(stake, sip10Data.decimals));

		const chartDom = document.getElementById('market-potential-chart');
		if (!chartDom) return;

		if (chart) {
			chart.dispose();
		}
		chart = echarts.init(chartDom);

		const options = {
			title: { text: 'Potential Payouts', left: 'center' },
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
				formatter: (params: any) => `${params[0].name}: ${params[0].value} ${sip10Data.symbol}`
			},
			grid: { left: '5%', right: '5%', bottom: '10%', containLabel: true },
			xAxis: {
				type: 'category',
				data: categories,
				name: 'Categories',
				axisLabel: { rotate: 30 },
				axisTick: { alignWithLabel: true }
			},
			yAxis: { type: 'value', name: `Potential Payout (${sip10Data.symbol})`, min: 0 },
			series: [
				{
					name: 'Potential Payout',
					type: 'bar',
					data: stakeValues, // Initial values before user input
					barWidth: '95%',
					barCategoryGap: '5%',
					itemStyle: {
						color: (params: any) => `hsla(${(params.dataIndex * 360) / categories.length}, 70%, 50%, 0.5)`
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

	// 🚀 Watch for changes in `amount` and update chart dynamically
	// $: $stakeAmount; // ✅ Reactively trigger updates when `stakeAmount` changes
	$: if (chart && $stakeAmount !== undefined) {
		updateChart();
	}
</script>

<!-- Chart Container -->
<div id="market-potential-chart" class="h-[300px] w-full md:h-[400px]"></div>
