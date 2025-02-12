<script lang="ts">
	import InfoPanel from './InfoPanel.svelte';

	let infoPanels = [
		{
			header: 'User-Owned Market',
			message: 'Bet on US elections, the Oscars, Bitcoin, weather —and more.'
		},
		{
			header: 'Trades on Native Protocols',
			message: 'Transact in BTC and STX with high liquidity. Trade from $1 up to $100M.'
		},
		{
			header: 'Dynamic Yield Growth',
			message: 'Earn competitive, variable interest on your cash and positions.'
		},
		{
			header: 'Instant & Uncensored',
			message: 'No censorship. No KYC. Connect your wallet and start trading'
		}
	];
</script>

<div class="flex min-h-screen flex-col items-center">
	<!-- Grid Wrapper: Scrolls Horizontally if Needed -->
	<div class="w-full overflow-x-auto">
		<div class="grid grid-flow-col gap-6 px-6 py-4">
			{#each infoPanels as info}
				<InfoPanel {info} />
			{/each}
		</div>
	</div>
</div>
