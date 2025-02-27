<script lang="ts">
	import { calculatePayoutCategorical, convertFiatToNative, getMarketToken, userStakeSum, type Payout } from '$lib/predictions/predictions';
	import { explorerTxUrl, getAddressId, getStxAddress, isLoggedIn } from '$lib/stacks/stacks-connect';
	import { fmtMicroToStx, fmtStxMicro, mapToMinMaxStrings } from '$lib/utils';
	import { getConfig } from '$stores/store_helpers';
	import { selectedCurrency, sessionStore, stakeAmount } from '$stores/stores';
	import { fullBalanceInSip10Token, getStacksNetwork, isSTX, type PredictionMarketCreateEvent, type Sip10Data, type UserStake } from '@mijoco/stx_helpers/dist/index';
	import { onMount } from 'svelte';
	import StakingBinary from './do-stake/StakingBinary.svelte';
	import StakingCategorical from './do-stake/StakingCategorical.svelte';
	import StakingScalar from './do-stake/StakingScalar.svelte';
	import Banner from '$lib/components/ui/Banner.svelte';
	import { isCooling, isPostCooling, isStaking } from '$lib/predictions/market-states';
	import { showContractCall } from '@stacks/connect';
	import { Cl, Pc, PostConditionMode, stringAsciiCV, uintCV } from '@stacks/transactions';
	import ExchangeRate from '$lib/components/common/ExchangeRate.svelte';
	import AgentResolveMarket from './do-resolve/AgentResolveMarket.svelte';
	import StakingCoolDown from './do-stake/StakingCoolDown.svelte';

	export let market: PredictionMarketCreateEvent;
	export let userStake: UserStake | undefined;
	let sip10Data: Sip10Data = getMarketToken(market.marketData.token);
	let totalBalanceUstx: number = 0;
	let resolutionAgent: boolean;
	let amountToStake = 0;
	let payouts: Array<Payout>;

	let errorMessage: string | undefined;
	let successMessage: string | undefined;

	let txId: string;

	const handleInput = () => {
		errorMessage = undefined;
		if (fmtStxMicro(amountToStake, sip10Data.decimals) > totalBalanceUstx) {
			errorMessage = 'Amount exceeds your balance';
		}
		const amountMicro = fmtStxMicro(Number(amountToStake), sip10Data.decimals);
		stakeAmount.set(amountMicro);
	};
	const doPrediction = async (index: number) => {
		errorMessage = undefined;
		if (!isLoggedIn()) {
			errorMessage = 'Please connect your wallet';
			return;
		}
		console.log(amountToStake);
		if (fmtStxMicro(amountToStake, sip10Data.decimals) > totalBalanceUstx) {
			errorMessage = 'Amount exceeds your balance';
			return;
		}
		if (amountToStake <= 0.00005) {
			errorMessage = `Amount must be greater than 0.00005 ${sip10Data.symbol}`;
			return;
		}
		const mult = isSTX(market.marketData.token) ? 1_000_000 : Number(`1e${sip10Data.decimals}`);
		const microStxAmount = Math.round(parseFloat(String(amountToStake)) * mult);
		const contractAddress = market.votingContract.split('.')[0];
		const contractName = market.votingContract.split('.')[1];
		let functionName = 'predict-category';
		const categorical = mapToMinMaxStrings(market.marketData.categories)[index];
		const address = getStxAddress();
		const postConditions = [];
		if (!isSTX(market.marketData.token)) {
			const formattedToken = (market.marketData.token.split('.')[0] + '.' + market.marketData.token.split('.')[1]) as `${string}.${string}`;
			const postConditionFt = Pc.principal(address).willSendEq(microStxAmount).ft(formattedToken, sip10Data.symbol);
			postConditions.push(postConditionFt);
		} else {
			postConditions.push(Pc.principal(address).willSendEq(microStxAmount).ustx());
		}

		// const postConditionAddress = 'SP2ZD731ANQZT6J4K3F5N8A40ZXWXC1XFXHVVQFKE';
		// const postConditionCode = FungibleConditionCode.GreaterEqual;
		// const postConditionAmount = 12345n;

		let functionArgs = [uintCV(market.marketId), uintCV(microStxAmount), stringAsciiCV(categorical), Cl.principal(market.marketData.token)];
		if (market.marketType === 2) {
			functionArgs = [uintCV(market.marketId), uintCV(microStxAmount), uintCV(index), Cl.principal(market.marketData.token)];
		}
		await showContractCall({
			network: getStacksNetwork(getConfig().VITE_NETWORK),
			postConditions,
			postConditionMode: PostConditionMode.Deny,
			contractAddress,
			contractName,
			functionName,
			functionArgs,
			onFinish: (data) => {
				txId = data.txId;
				localStorage.setItem('VOTED_FLAG' + getAddressId(), JSON.stringify(market.votingContract));
				localStorage.setItem('VOTED_TXID_3' + getAddressId(), JSON.stringify({ txId }));
			},
			onCancel: () => {
				console.log('popup closed!');
			}
		});
	};

	const handleResolution = async (data: any) => {
		errorMessage = undefined;
		if (data.error) {
			errorMessage = data.message;
		} else {
			successMessage = 'Market resolution begun';
		}
	};

	onMount(async () => {
		errorMessage = undefined;
		sip10Data = getMarketToken(market.marketData.token);
		if (isLoggedIn()) {
			totalBalanceUstx = await fullBalanceInSip10Token(getConfig().VITE_STACKS_API, getStxAddress(), market.marketData.token);
			const sum = userStake ? userStakeSum(userStake) : 0;
			totalBalanceUstx = totalBalanceUstx - sum;
			resolutionAgent = getStxAddress() === $sessionStore.daoOverview.contractData.resolutionAgent;
			const hundredNative = convertFiatToNative(sip10Data, 100, $selectedCurrency.code);
			payouts = calculatePayoutCategorical(hundredNative, sip10Data.decimals, userStake, market.marketData);
		} else {
			totalBalanceUstx = 0;
		}
	});
</script>

<!-- Staking Interface -->
<div class="card bg-neutral shadow-xl">
	<div class="card-body">
		{#if market.marketType === 2 && isCooling(market)}
			<StakingCoolDown {payouts} {market} />
		{:else}
			<h2 class="card-title mb-6 text-2xl">Place Your Stake</h2>

			{#if isStaking(market)}
				<div class="form-control">
					<label for="stake-input" class="label">
						<span class="label-text">Stake Amount: <ExchangeRate {sip10Data} /> </span>
						<span class={'+ label-text-alt ' + (typeof errorMessage !== 'string') ? 'text-danger' : ''}
							>Balance: {fmtMicroToStx(totalBalanceUstx, sip10Data.decimals)}
							{sip10Data.symbol}

							{#if sip10Data.symbol === 'BIG'}
								<span class="label-text-alt mx-2">
									<a href="/dao/token-sale" class=" link-primary">mint</a>
								</span>
							{/if}
						</span>
					</label>
					<div class="join">
						<input id="stake-input" type="number" placeholder="Enter amount (e.g., 0.04)" bind:value={amountToStake} on:keyup={() => handleInput()} class={' input join-item input-bordered flex-1 '} />
						<span class={'btn join-item no-animation border border-none'}>{sip10Data.symbol}</span>
					</div>
				</div>
			{/if}
			{#if txId}
				<div class="mb-4 flex w-full justify-start gap-x-4">
					<Banner bannerType={'info'} message={'your request is being processed. See <a href="' + explorerTxUrl(txId) + '" target="_blank">explorer!</a>'} />
				</div>
			{/if}
			{#if errorMessage}
				<div class="mb-4 flex w-full justify-start gap-x-4">
					<Banner bannerType={'info'} message={errorMessage} />
				</div>
			{/if}
			{#if market.marketType === 2}
				{#if isStaking(market)}
					<StakingScalar {doPrediction} {payouts} {market} />
				{:else}
					<p>
						Cool down is in progress. The outcome is determined at the height of the first stacks block after the cool cool down expires <a href="/docs" class="font-medium text-red-600">see the docs</a> for more information.
					</p>
				{/if}
			{:else if market.marketData.categories.length === 2}
				<StakingBinary {doPrediction} {payouts} />
			{:else if market.marketType === 1}
				<StakingCategorical {doPrediction} {payouts} categories={mapToMinMaxStrings(market.marketData.categories)} />
			{/if}
		{/if}

		<div class="mt-4">
			<a href="/docs" class="link link-primary">How does staking work?</a>
		</div>
		{#if resolutionAgent}
			<div class="my-4">
				{#if market.marketType === 1}
					<AgentResolveMarket {market} onResolved={handleResolution} />
				{:else if isPostCooling(market)}
					<AgentResolveMarket {market} onResolved={handleResolution} />
				{/if}
			</div>
		{/if}
	</div>
</div>
