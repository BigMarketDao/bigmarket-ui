import { getSession } from '$stores/store_helpers';
import { ResolutionState, type PredictionMarketCreateEvent, type ScalarMarketDataItem, type UserStake } from '@mijoco/stx_helpers/dist/index';
import { ORACLE_MULTIPLIER, userStakeSum } from './predictions';
import { estimateBitcoinBlockTime, fmtNumber, formatFiat } from '$lib/utils';
import { DateTime } from 'luxon';

export const getMarketStatus = (resolutionState: number) => {
	if (resolutionState === ResolutionState.RESOLUTION_OPEN) {
		return 'open';
	} else if (resolutionState === ResolutionState.RESOLUTION_RESOLVING) {
		return 'resolving';
	} else if (resolutionState === ResolutionState.RESOLUTION_RESOLVED) {
		return 'resolved';
	} else if (resolutionState === ResolutionState.RESOLUTION_DISPUTED) {
		return 'challenged';
	}
	return false;
};

export const hasUserStaked = (userStake: UserStake | undefined) => {
	if (userStake) {
		return userStakeSum(userStake) > 0;
	}
	return false;
};

export const canUserClaim = (market: PredictionMarketCreateEvent, userStake: UserStake) => {
	if (userStake) {
		return userStake.stakes[market.marketData.outcome!] > 0;
	}
	return false;
};

export const blocksLeftForDispute = (market: PredictionMarketCreateEvent) => {
	const sess = getSession();
	const current = sess.stacksInfo.burn_block_height;
	const resWindow = sess.daoOverview.contractData.disputeWindowLength;
	if (market.marketType === 1) {
		const resBurnHeight = market.marketData.resolutionBurnHeight || 0;
		return resBurnHeight + resWindow - current;
	} else if (market.marketType === 2) {
		const start = market.marketData.marketStart || 0;
		const end = start + (market.marketData.marketDuration || 0);
		const endCooling = end + (market.marketData.coolDownPeriod || 0);
		return endCooling + resWindow - current;
	}
	return 0;
};

export const coolDownBlock = (market: PredictionMarketCreateEvent) => {
	const start = market.marketData.marketStart || 0;
	const end = start + (market.marketData.marketDuration || 0);
	const endCooling = end + (market.marketData.coolDownPeriod || 0);
	return endCooling;
};
export const dateOfResolution = (market: PredictionMarketCreateEvent) => {
	const sess = getSession();
	const current = sess.stacksInfo.burn_block_height;
	if (market.marketType === 2) {
		const endCooling = coolDownBlock(market);
		return {
			offChain: estimateBitcoinBlockTime(endCooling, current),
			onChain: fmtNumber(endCooling)
		};
	} else {
		if (isStaking(market)) {
			let resolvesAt = market.unhashedData?.criterion?.resolvesAt || new Date().getTime();
			const currentTimeUtc = DateTime.utc().toISO();
			const estimatedTime = DateTime.fromMillis(resolvesAt, { zone: 'utc' });

			return {
				offChain: estimatedTime.toFormat('yyyy-MM-dd HH:mm') || new Date(),
				onChain: 0,
				tip: market.unhashedData?.criterion?.criteria
			};
		} else {
			const resBurnHeight = market.marketData.resolutionBurnHeight || 0;
			return {
				offChain: resBurnHeight > 0 ? estimateBitcoinBlockTime(resBurnHeight, current) : 0,
				onChain: fmtNumber(resBurnHeight || 0),
				tip: ''
			};
		}
	}
};

export const stopBlockForDispute = (market: PredictionMarketCreateEvent) => {
	const sess = getSession();
	const current = sess.stacksInfo.burn_block_height;
	const resWindow = sess.daoOverview.contractData.disputeWindowLength;
	if (market.marketType === 1) {
		const resBurnHeight = market.marketData.resolutionBurnHeight || 0;
		return resBurnHeight + resWindow;
	} else if (market.marketType === 2) {
		const endCooling = coolDownBlock(market);
		return endCooling + resWindow;
	}
	return 0;
};

export const startBlockForDispute = (market: PredictionMarketCreateEvent) => {
	if (market.marketType === 1) {
		const resBurnHeight = market.marketData.resolutionBurnHeight || 0;
		return resBurnHeight;
	} else if (market.marketType === 2) {
		return coolDownBlock(market);
	}
	return 0;
};

export const isDisputable = (market: PredictionMarketCreateEvent) => {
	if (market.marketData.resolutionState === ResolutionState.RESOLUTION_RESOLVING) {
		const sess = getSession();
		const current = sess.stacksInfo.burn_block_height;
		const resWindow = sess.daoOverview.contractData.disputeWindowLength;
		if (market.marketType === 1) {
			const resBurnHeight = market.marketData.resolutionBurnHeight || 0;
			return current < resBurnHeight + resWindow;
		} else if (market.marketType === 2) {
			const endCooling = coolDownBlock(market);
			return current < endCooling + resWindow;
		}
	}
	return false;
};

export const isFinalisable = (market: PredictionMarketCreateEvent) => {
	if (market.marketData.resolutionState === ResolutionState.RESOLUTION_RESOLVING) {
		const sess = getSession();
		const current = sess.stacksInfo.burn_block_height;
		const resWindow = sess.daoOverview.contractData.disputeWindowLength;
		if (market.marketType === 1) {
			const resBurnHeight = market.marketData.resolutionBurnHeight || 0;
			return current >= resBurnHeight + resWindow;
		} else if (market.marketType === 2) {
			const endCooling = coolDownBlock(market);
			return current > endCooling + resWindow;
		}
	}
	return false;
};

export const isDisputeRunning = (market: PredictionMarketCreateEvent) => {
	const sess = getSession();
	if (market.marketData.resolutionState === ResolutionState.RESOLUTION_DISPUTED) {
		return true;
	}
	return false;
};

export const isStaking = (market: PredictionMarketCreateEvent) => {
	const sess = getSession();
	if (market.marketData.resolutionState === ResolutionState.RESOLUTION_OPEN) {
		if (market.marketType == 1 || market.marketType == 3) return true;
		else {
			const current = sess.stacksInfo.burn_block_height;
			const start = market.marketData.marketStart || 0;
			const end = start + (market.marketData.marketDuration || 0);
			return current <= end;
		}
	}
	return false;
};

export const isResolving = (market: PredictionMarketCreateEvent) => {
	return market.marketData.resolutionState === ResolutionState.RESOLUTION_RESOLVING;
};
export const getResolutionMessage = (state: number) => {
	if (state === ResolutionState.RESOLUTION_RESOLVING) return 'market is resolving';
	else if (state === ResolutionState.RESOLUTION_OPEN) return 'market is open';
	else if (state === ResolutionState.RESOLUTION_RESOLVED) return 'market is resolved';
	else if (state === ResolutionState.RESOLUTION_DISPUTED) return 'market is disputed';
	else return 'market state unknown';
};
export const isResolved = (market: PredictionMarketCreateEvent) => {
	return market.marketData.resolutionState === ResolutionState.RESOLUTION_RESOLVED;
};

export const isCooling = (market: PredictionMarketCreateEvent) => {
	const sess = getSession();
	if (market.marketType === 2) {
		const start = market.marketData.marketStart || 0;
		const end = start + (market.marketData.marketDuration || 0);
		const endCooling = end + (market.marketData.coolDownPeriod || 0);
		return sess.stacksInfo.burn_block_height > end && sess.stacksInfo.burn_block_height <= endCooling;
	}
	return false;
};

export const isPostCooling = (market: PredictionMarketCreateEvent) => {
	const sess = getSession();
	if (market.marketType === 2) {
		const endCooling = coolDownBlock(market);
		return sess.stacksInfo.burn_block_height > endCooling;
	}
	return false;
};

export const getOutcomeMessage = (market: PredictionMarketCreateEvent) => {
	if (market.marketType === 1) {
		return `Outcome is <span class="font-medium text-primary">${market.marketData.categories[market.marketData.outcome!]}</span>`;
	}
	const cats = market.marketData.categories as ScalarMarketDataItem[];
	return `Outcome is ${market.marketData.priceOutcome!} - value between <span class="font-medium text-primary">${formatFiat(cats[market.marketData.outcome!].min / ORACLE_MULTIPLIER, false)} and ${formatFiat(cats[market.marketData.outcome!].max / ORACLE_MULTIPLIER, false)}</span>`;
};
