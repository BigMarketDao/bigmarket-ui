<script lang="ts">
	import { getAllowedTokens, getGovernanceToken, getMarketToken, getStxToken } from '$lib/predictions/predictions';
	import { explorerTxUrl, getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import { fmtMicroToStx } from '$lib/utils';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import { getStacksNetwork, type DaoOverview, type Sip10Data, type TokenSalePurchase, type TokenSaleStage } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { fetchTokenSalePurchases } from '../token-sale';
	import { showContractCall } from '@stacks/connect';
	import { Pc, PostConditionMode, uintCV } from '@stacks/transactions';
	import { ArrowsPointingOut, Icon } from 'svelte-hero-icons';
	import Banner from '$lib/components/ui/Banner.svelte';
	import Stages from './Stages.svelte';
	import { sessionStore, stakeAmount } from '$stores/stores';
	import ExchangeRate from '$lib/components/common/ExchangeRate.svelte';

	$: daoOverview = $sessionStore.daoOverview;
	let tokenSalePurchases: Array<TokenSalePurchase>;
	let stage: TokenSaleStage;
	let tokens: any;
	let govToken: Sip10Data;
	let totalSold: number;
	let amount: number = 0;
	let txId: string;
	let errorMessage: string | undefined;
	let sip10Data: Sip10Data;
	let stacksLeading = true;
	let stageBalance = '0';
	$: stage = daoOverview?.tokenSale?.stages[daoOverview?.tokenSale?.currentStage] || ({} as TokenSaleStage);
	$: totalSold = daoOverview.tokenSale?.stages.reduce((sum, stage) => sum + stage.tokensSold, 0) || 0;
	$: tokens = Object.keys(daoOverview?.treasuryBalances.fungible_tokens || {}).map((token) => ({
		contract: getDaoConfig().VITE_DAO_TREASURY,
		token: token.split('::')[1],
		balance: daoOverview?.treasuryBalances.fungible_tokens[token].balance,
		decimals: getMarketToken(token.split('::')[0]).decimals
	}));
	$: tokenAmount = stacksLeading ? (amount * stage?.price || 0).toFixed(6) : (amount / stage?.price || 0).toFixed(6);
	$: sip10Data = getStxToken($sessionStore.tokens);
	$: govToken = getGovernanceToken($sessionStore.tokens);

	let currentStage = (daoOverview?.tokenSale?.currentStage || 1) - 1;
	let walletConnected = false;
	let purchaseAmount = '';

	// Sample data for IDO stages
	const stages = daoOverview?.tokenSale?.stages;
	// [
	// 	{ id: 1, tokens: 600000, price: 0.05, raise: 30000, complete: true },
	// 	{ id: 2, tokens: 833333, price: 0.06, raise: 50000, complete: false },
	// 	{ id: 3, tokens: 1071429, price: 0.07, raise: 75000, complete: false },
	// 	{ id: 4, tokens: 1250000, price: 0.08, raise: 100000, complete: false },
	// 	{ id: 5, tokens: 1500000, price: 0.1, raise: 150000, complete: false },
	// 	{ id: 6, tokens: 1000000, price: 0.2, raise: 200000, complete: false }
	// ];

	// Sample data for token distribution
	const distribution = [
		{ category: 'Community/IDO', percentage: 60, amount: 6000000 },
		{ category: 'Staking Rewards', percentage: 15, amount: 1500000 },
		{ category: 'Team & Council', percentage: 15, amount: 1500000 },
		{ category: 'Treasury', percentage: 10, amount: 1000000 }
	];

	// Example tokens sold (for current stage progress)
	let tokensSoldForThisStage = 300000;

	// Reactive calculation of current stage data and progress
	$: currentStageData = stages![currentStage];
	$: stageProgress = currentStageData ? Math.min((currentStageData.tokensSold / currentStageData.maxSupply) * 100, 100) : 0;

	function handlePurchase() {
		if (!walletConnected) {
			alert('Please connect your wallet first.');
			return;
		}
		if (!purchaseAmount || Number(purchaseAmount) <= 0) {
			alert('Please enter a valid purchase amount.');
			return;
		}
		console.log(`Purchasing ${purchaseAmount} BIG at $${currentStageData?.price || 0} (Stage ${currentStage})`);
	}

	const switcheroo = () => {
		stacksLeading = !stacksLeading;
	};

	const handleChange = () => {
		stakeAmount.set(amount);
	};

	const buyTokens = async () => {
		errorMessage = undefined;
		if (!isLoggedIn()) {
			errorMessage = 'Please connect your wallet';
			return;
		}
		console.log(amount);
		if (!amount || amount <= 0) {
			errorMessage = `Amount must be greater than 0 ${sip10Data.symbol}`;
			return;
		}
		const mult = Number(`1e${govToken.decimals}`);
		const actual = stacksLeading ? amount : tokenAmount;
		const microStxAmount = Math.round(parseFloat(String(actual)) * mult);
		const contractAddress = getDaoConfig().VITE_DOA_DEPLOYER;
		const contractName = getDaoConfig().VITE_DAO_TOKEN_SALE;
		let functionName = 'buy-ido-tokens';
		const address = getStxAddress();
		const postConditions = [];
		postConditions.push(Pc.principal(address).willSendEq(microStxAmount).ustx());
		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions,
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs: [uintCV(microStxAmount)],
			onFinish: (data) => {
				txId = data.txId;
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	onMount(async () => {
		if (getStxAddress()) {
			tokenSalePurchases = await fetchTokenSalePurchases(getStxAddress());
			const stageMicro = (tokenSalePurchases[(daoOverview.tokenSale?.currentStage || 1) - 1].amount || 0, govToken.decimals);
			stakeAmount.set(stageMicro);
			stageBalance = fmtMicroToStx(stageMicro);
			console.log(tokenSalePurchases);
		}
	});
</script>

<div class="min-h-screen bg-gray-900 text-white">
	<!-- Header -->

	<!-- Main Content -->
	<section class="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-2">
		<!-- Left Column: Token Info -->
		<div class="space-y-8">
			<!-- Token Overview Card -->
			<div class="card border border-gray-700 bg-gray-800/50">
				<div class="card-body">
					<h3 class="card-title text-xl font-semibold text-blue-400">Token Overview</h3>
					<div class="mt-4 space-y-4">
						<div class="flex justify-between">
							<span class="text-gray-400">Token Name</span>
							<span class="font-semibold">BigMarket (BIG)</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">Total Supply</span>
							<span class="font-semibold">10,000,000 BIG</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">Blockchain</span>
							<span class="font-semibold">Stacks L2</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">Token Standard</span>
							<span class="font-semibold">SIP-010</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Token Distribution Card -->
			<div class="card border border-gray-700 bg-gray-800/50">
				<div class="card-body">
					<h3 class="card-title text-purple-400 text-xl font-semibold">Token Distribution</h3>
					<div class="mt-4 space-y-4">
						{#each distribution as item}
							<div class="space-y-2">
								<div class="flex justify-between">
									<span>{item.category}</span>
									<span class="text-purple-400">{item.percentage}%</span>
								</div>
								<div class="h-2 w-full rounded-full bg-gray-700">
									<div class="bg-hero-gradient from-pink-500 to-purple-500 h-full transition-all duration-500" style="width: {item.percentage}%"></div>
								</div>
								<div class="text-right text-sm text-gray-400">
									{item.amount.toLocaleString()} BIG
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Right Column: Sales Widget -->
		<div class="lg:sticky lg:top-6">
			<div class="card border border-gray-700 bg-gray-800/50">
				<div class="card-body">
					<h3 class="card-title text-pink-400 text-xl font-semibold">
						Token Sale - Stage {currentStage + 1}
					</h3>
					<div class="mt-4 space-y-6">
						<!-- Stage Progress -->
						<div>
							<div class="mb-2 flex justify-between">
								<span class="text-gray-400">Current Stage Progress</span>
								<span class="text-pink-400">{stageProgress.toFixed(2)}%</span>
							</div>
							<div class="h-4 w-full rounded-full bg-gray-700">
								<div class="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-500" style="width: {stageProgress}%"></div>
							</div>
						</div>

						<!-- Stage Details -->
						<div class="grid grid-cols-2 gap-4">
							<div class="rounded-lg border border-gray-600 bg-gray-700/50 p-4">
								<div class="text-sm text-gray-400">Current Price</div>
								<div class="text-pink-400 text-2xl font-bold">
									${currentStageData ? currentStageData.price.toFixed(2) : '0.00'}
								</div>
							</div>
							<div class="rounded-lg border border-gray-600 bg-gray-700/50 p-4">
								<div class="text-sm text-gray-400">Tokens Available</div>
								<div class="text-pink-400 text-2xl font-bold">
									{currentStageData ? currentStageData.maxSupply.toLocaleString() : '0'}
								</div>
							</div>
						</div>

						<!-- Purchase Form -->
						<div class="rounded-lg border border-gray-700 bg-gray-900/50 p-6">
							<div class="mb-4 flex justify-between">
								<div>
									<div class="text-sm text-gray-400">Your Wallet</div>
									<div class="font-mono text-sm">ST105...BYBJ</div>
								</div>
								<div class="text-right">
									<div class="text-sm text-gray-400">Your Balance</div>
									<div>1,000.000000 BIG</div>
								</div>
							</div>

							<div class="mb-4 flex gap-4">
								<input type="number" placeholder="Enter BIG amount" bind:value={purchaseAmount} class="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2" disabled={!walletConnected} />
								<select class="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2" disabled={!walletConnected}>
									<option>STX</option>
									<option>BIG</option>
								</select>
							</div>

							<button
								on:click={handlePurchase}
								class="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 w-full rounded-lg py-3 font-semibold shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300"
								disabled={!walletConnected}
							>
								{walletConnected ? 'Buy BIG Tokens' : 'Connect Wallet First'}
							</button>

							{#if !walletConnected}
								<div class="mt-2 flex items-center gap-2 text-sm text-yellow-400">
									<!-- <AlertCircle class="h-4 w-4" /> -->
									<span>Please connect your wallet to purchase tokens.</span>
								</div>
							{/if}

							<div class="mt-4 flex items-start gap-2 text-sm text-gray-400">
								<!-- <AlertCircle class="mt-1 h-4 w-4 flex-shrink-0" /> -->
								<p>Tokens will be locked for 1 month after purchase. This protects early participants and ensures fair distribution.</p>
							</div>
						</div>

						<!-- IDO Stages Timeline -->
						<div class="space-y-4">
							<h4 class="font-semibold">IDO Stages</h4>
							<div class="space-y-2">
								{#each stages! as stage, index}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div on:click={() => (currentStage = index)} class={`flex cursor-pointer items-center gap-4 rounded p-2 transition-all ${index === currentStage ? 'border-purple-500/50 border bg-gray-700/50' : ''}`}>
										<div
											class="flex h-6 w-6 items-center justify-center rounded-full"
											class:bg-green-500={index < currentStage}
											class:bg-purple-500={index === currentStage && index >= currentStage}
											class:bg-gray-600={index >= currentStage && index !== currentStage}
										>
											{index}
										</div>
										<div class="flex-1">
											<div class="flex justify-between">
												<span>{stage.maxSupply.toLocaleString()} BIG</span>
												<span class="text-gray-400">${stage.price}</span>
											</div>
											<div class="text-sm text-gray-400">
												Raise: ${stage.tokensSold.toLocaleString()}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="bg-black/50 px-6 py-16">
		<div class="mx-auto max-w-7xl">
			<h2 class="bg-gradient-to-r to-purple-400 mb-12 from-blue-400 bg-clip-text text-center text-3xl font-bold text-transparent">Why Choose BigMarket?</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
				<!-- Feature Card 1 -->
				<div class="card rounded-lg border border-gray-700 bg-gray-800/50 p-6 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-transform duration-300 hover:scale-105">
					<h3 class="mb-4 text-xl font-semibold">AI-Driven Governance</h3>
					<p class="text-gray-300">Smart algorithms propose markets, balance liquidity, and detect fraud through advanced pattern recognition.</p>
				</div>
				<!-- Feature Card 2 -->
				<div class="card rounded-lg border border-gray-700 bg-gray-800/50 p-6 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-transform duration-300 hover:scale-105">
					<h3 class="mb-4 text-xl font-semibold">Bitcoin Security</h3>
					<p class="text-gray-300">Built on Stacks L2 with Bitcoin settlement, ensuring maximum security and immutability for all predictions.</p>
				</div>
				<!-- Feature Card 3 -->
				<div class="card rounded-lg border border-gray-700 bg-gray-800/50 p-6 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-transform duration-300 hover:scale-105">
					<h3 class="mb-4 text-xl font-semibold">Fair Economics</h3>
					<p class="text-gray-300">Dynamic fee model with transparent distribution: 40% dev fund, 30% DAO treasury, 20% staking, 10% buyback.</p>
				</div>
				<!-- Feature Card 4 -->
				<div class="card rounded-lg border border-gray-700 bg-gray-800/50 p-6 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-transform duration-300 hover:scale-105">
					<h3 class="mb-4 text-xl font-semibold">Staking Rewards</h3>
					<p class="text-gray-300">Earn up to 12% base APR with bonus multipliers for longer lock-in periods up to 6 months.</p>
				</div>
			</div>
		</div>
	</section>
</div>
