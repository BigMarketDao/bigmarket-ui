<script lang="ts">
	import InfoPanel from './InfoPanel.svelte';
	import { TrendingUp, Users, Wallet, Lock } from 'lucide-svelte';

	const infoPanels = [
		{
			Icon: Wallet,
			header: 'User-Owned Market',
			message: 'Bet on US elections, the Oscars, Bitcoin, weather —and more.'
		},
		{
			Icon: TrendingUp,
			header: 'Native Protocols',
			message: 'Transact in BTC and STX with high liquidity. Trade from $1 up to $100M.'
		},
		{
			Icon: Users,
			header: 'Automatic Payouts',
			message: 'Instant payouts directly to your wallet when markets resolve.'
		},
		{
			Icon: Lock,
			header: 'Instant & Uncensored',
			message: 'No censorship. No KYC. Connect your wallet and start trading'
		}
	];
</script>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
	{#each infoPanels as info}
		<div class="relative overflow-hidden rounded-lg border border-purple-900/20 bg-[#0F1225] p-6 shadow-lg">
			<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>

			<div class="relative space-y-4">
				<svelte:component this={info.Icon} class="h-8 w-8 text-purple-400" />
				<h3 class="text-lg font-bold text-white">{info.header}</h3>
				<p class="text-indigo-200/70 text-sm">{info.message}</p>
			</div>
		</div>
	{/each}
</div>
