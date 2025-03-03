<script lang="ts">
	import { getGovernanceToken, getMarketToken, getStxToken } from '$lib/predictions/predictions';
	import { explorerTxUrl, getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import { fmtMicroToStx, fmtMicroToStxNumber, fmtStxMicro, toFiat, truncate } from '$lib/utils';
	import { getConfig, getDaoConfig } from '$stores/store_helpers';
	import { fetchUserBalances, getStacksNetwork, type DaoOverview, type Sip10Data, type TokenSalePurchase, type TokenSaleStage } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import { fetchTokenSalePurchases } from '../token-sale';
	import { showContractCall } from '@stacks/connect';
	import { Pc, PostConditionMode, uintCV } from '@stacks/transactions';
	import { selectedCurrency, sessionStore, stakeAmount } from '$stores/stores';
	import { Wallet } from 'lucide-svelte';

	export let fiatPerStx = 0;
	let daoOverview = $sessionStore.daoOverview;
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
	let currentStage = (daoOverview?.tokenSale?.currentStage || 1) - 1;
	let walletConnected = isLoggedIn();
	$: stxBalance = 0;
	$: bigBalance = 0;

	$: stage = daoOverview?.tokenSale?.stages[currentStage] || ({} as TokenSaleStage);
	$: totalSold = daoOverview.tokenSale?.stages.reduce((sum: any, stage: { tokensSold: any }) => sum + stage.tokensSold, 0) || 0;
	$: tokens = Object.keys(daoOverview.treasuryBalances.fungible_tokens || {}).map((token) => ({
		contract: getDaoConfig().VITE_DAO_TREASURY,
		token: token.split('::')[1],
		balance: daoOverview.treasuryBalances.fungible_tokens[token].balance,
		decimals: getMarketToken(token.split('::')[0]).decimals,
		symbol: getMarketToken(token.split('::')[0]).symbol
	}));
	$: sip10Data = getStxToken($sessionStore.tokens);
	$: govToken = getGovernanceToken($sessionStore.tokens);
	$: stageProgress = stage ? Math.min((stage.tokensSold / stage.maxSupply) * 100, 100) : 0;
	$: stages = daoOverview?.tokenSale?.stages || [];

	// 0.05 USD per BIG -> 1 USD = 1/0.05 BIG = 20 BIG
	// 1 USD = x STX
	// x SXT = 1 USD = 1/0.05 BIG
	// 1 STX = 1/x USD = 1/(0.05x)
	$: tokensReceived = stacksLeading ? (amount / (0.05 * fiatPerStx)).toFixed(6) : amount;
	$: tokenAmount = stacksLeading ? (amount || 0).toFixed(6) : (amount / (0.05 * fiatPerStx) || 0).toFixed(6);

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
		if (isLoggedIn()) {
			tokenSalePurchases = await fetchTokenSalePurchases(getStxAddress());
			const stageMicro = (tokenSalePurchases[(daoOverview.tokenSale?.currentStage || 1) - 1].amount || 0, govToken.decimals);
			stakeAmount.set(stageMicro);
			stageBalance = fmtMicroToStx(stageMicro);
			const bals = await fetchUserBalances(getConfig().VITE_STACKS_API, getConfig().VITE_MEMPOOL_API, getStxAddress(), '', '');
			const bigContract = `${getDaoConfig().VITE_DOA_DEPLOYER}.${getDaoConfig().VITE_DAO_GOVERNANCE_TOKEN}::bmg-token`;
			bigBalance = Number(bals?.tokenBalances?.fungible_tokens[bigContract]?.balance || 0);
			stxBalance = Number(bals?.tokenBalances?.stx.balance || 0);
			const stxToFiat = 0;
		}
	});
</script>

{#if stage && tokens}
	<div class="mx-auto max-w-7xl space-y-8 px-4 py-8">
		<!-- Purchase Card -->
		<div class="group relative overflow-hidden rounded-xl border border-purple-900/20 bg-[#0F1225] p-8 shadow-lg transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
			<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />
			<div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(168,85,247,0.05)_10px,rgba(168,85,247,0.05)_20px)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

			<div class="relative">
				<!-- Stage Info -->
				<div class="mb-8 flex items-center justify-between">
					<div>
						<h2 class="text-2xl font-bold text-white">Stage {currentStage + 1}</h2>
						<p class="text-indigo-200/70 mt-1">Progress: {stageProgress.toFixed(2)}%</p>
					</div>
					<div class="text-right">
						<p class="text-indigo-200/70 text-sm">Current Price</p>
						<p class="text-xl font-bold text-purple-400">
							{$selectedCurrency.code}
							{toFiat($selectedCurrency.code, fmtStxMicro(1), { symbol: $sessionStore.daoOverview.contractData.tokenSymbol, decimals: $sessionStore.daoOverview.contractData.tokenDecimals } as Sip10Data, 1 / stage.price)}
						</p>
					</div>
				</div>

				{#if !walletConnected}
					<div class="rounded-xl bg-[#151B2D] p-8 text-center">
						<Wallet class="mx-auto h-12 w-12 text-purple-400" />
						<h3 class="mt-4 text-lg font-semibold text-white">Connect Your Wallet</h3>
						<p class="text-indigo-200/70 mt-2">Connect your wallet to participate in the token sale</p>
						<button class="mt-6 w-full rounded-lg bg-purple-500 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-purple-600"> Connect Wallet </button>
					</div>
				{:else}
					<!-- Wallet Info -->
					<div class="mb-6 grid grid-cols-2 gap-4">
						<div class="rounded-lg bg-[#151B2D] p-4">
							<div class="text-indigo-200/70 text-sm">Your Wallet</div>
							<div class="mt-1 font-mono text-sm text-white">{truncate(getStxAddress())}</div>
						</div>
						<div class="rounded-lg bg-[#151B2D] p-4">
							<div class="text-indigo-200/70 text-sm">Your Balance</div>
							<div class="mt-1 text-sm text-white">
								{fmtMicroToStx(bigBalance, 6)}
								{daoOverview.contractData.tokenSymbol}
								<br />
								{fmtMicroToStx(stxBalance)} STX
							</div>
						</div>
					</div>

					<!-- Purchase Input -->
					<div class="space-y-4">
						<div class="flex gap-4">
							<input
								type="number"
								placeholder="Enter amount"
								bind:value={amount}
								on:change={handleChange}
								class="placeholder-indigo-200/30 flex-1 rounded-lg border border-purple-900/20 bg-[#151B2D] px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
							/>
							<select on:change={() => switcheroo()} class="rounded-lg border border-purple-900/20 bg-[#151B2D] px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20">
								<option>STX</option>
								<option>BIG</option>
							</select>
						</div>

						<div class="rounded-lg bg-[#151B2D] p-4">
							<div class="flex justify-between text-sm">
								<span class="text-indigo-200/70">You will receive</span>
								<span class="text-white">{tokensReceived} BIG</span>
							</div>
						</div>
					</div>

					{#if errorMessage}
						<div class="bg-red-500/20 text-red-400 mt-4 rounded-lg p-4">
							{errorMessage}
						</div>
					{/if}

					{#if txId}
						<div class="mt-4 rounded-lg bg-purple-500/20 p-4 text-purple-400">
							Transaction in progress. View on <a href={explorerTxUrl(txId)} target="_blank" class="underline">explorer</a>
						</div>
					{/if}

					<button on:click={buyTokens} class="mt-6 w-full rounded-lg bg-purple-500 py-3 text-sm font-semibold text-white transition-all hover:bg-purple-600"> Buy BIG Tokens </button>

					<p class="text-indigo-200/50 mt-4 text-sm">Tokens are available for voting immediately but transfers are locked until the sale ends.</p>
				{/if}
			</div>
		</div>

		<!-- Sale Stages -->
		<div class="relative overflow-hidden rounded-xl border border-purple-900/20 bg-[#0F1225] p-8 shadow-lg">
			<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5" />

			<div class="relative">
				<h2 class="text-2xl font-bold text-white">Sale Stages</h2>
				<div class="mt-6 space-y-4">
					{#each stages as stage, index}
						<button class="group relative w-full overflow-hidden rounded-lg bg-[#151B2D] p-4 text-left transition-all hover:bg-[#1A2438] {index === currentStage ? 'ring-2 ring-purple-500' : ''}" on:click={() => (currentStage = index)}>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F1225] text-sm font-bold {index === currentStage ? 'text-purple-400' : 'text-indigo-200/50'}">
										{index + 1}
									</div>
									<div>
										<div class="text-lg font-semibold text-white">{fmtMicroToStxNumber(stage.maxSupply).toLocaleString()} BIG</div>
										<div class="text-indigo-200/50 text-sm">
											{$selectedCurrency.code}
											{toFiat($selectedCurrency.code, fmtStxMicro(1), { symbol: $sessionStore.daoOverview.contractData.tokenSymbol, decimals: $sessionStore.daoOverview.contractData.tokenDecimals } as Sip10Data, 1 / stage.price)}
										</div>
									</div>
								</div>
								<div class="text-right">
									<div class="text-indigo-200/70 text-sm">Progress</div>
									<div class="text-lg font-semibold text-purple-400">
										{((stage.tokensSold / stage.maxSupply) * 100).toFixed(1)}%
									</div>
								</div>
							</div>
							<div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#0F1225]">
								<div class="bg-gradient-to-r to-indigo-500 h-full rounded-full from-purple-500 transition-all duration-300" style="width: {(stage.tokensSold / stage.maxSupply) * 100}%" />
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>{/if}
