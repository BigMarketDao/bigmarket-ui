import { getSession } from '$stores/store_helpers';
import { ResolutionState, type PredictionMarketCreateEvent, type ScalarMarketDataItem, type UserStake } from '@mijoco/stx_helpers/dist/index';
import { userStakeSum } from './predictions';
import type { BigMarketSessionStore } from '$stores/stores';

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

export const blocksLeftForDispute = (market: PredictionMarketCreateEvent, $sessionStore: BigMarketSessionStore) => {
	const current = $sessionStore.stacksInfo.burn_block_height;
	const resWindow = $sessionStore.daoOverview.contractData.disputeWindowLength;
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

export const stopBlockForDispute = (market: PredictionMarketCreateEvent, $sessionStore: BigMarketSessionStore) => {
	const current = $sessionStore.stacksInfo.burn_block_height;
	const resWindow = $sessionStore.daoOverview.contractData.disputeWindowLength;
	if (market.marketType === 1) {
		const resBurnHeight = market.marketData.resolutionBurnHeight || 0;
		return resBurnHeight + resWindow;
	} else if (market.marketType === 2) {
		const start = market.marketData.marketStart || 0;
		const end = start + (market.marketData.marketDuration || 0);
		const endCooling = end + (market.marketData.coolDownPeriod || 0);
		return endCooling + resWindow;
	}
	return 0;
};

export const startBlockForDispute = (market: PredictionMarketCreateEvent, $sessionStore: BigMarketSessionStore) => {
	if (market.marketType === 1) {
		const resBurnHeight = market.marketData.resolutionBurnHeight || 0;
		return resBurnHeight;
	} else if (market.marketType === 2) {
		const start = market.marketData.marketStart || 0;
		const end = start + (market.marketData.marketDuration || 0);
		const endCooling = end + (market.marketData.coolDownPeriod || 0);
		return endCooling;
	}
	return 0;
};

export const isDisputable = (market: PredictionMarketCreateEvent, $sessionStore: BigMarketSessionStore) => {
	if (market.marketData.resolutionState === ResolutionState.RESOLUTION_RESOLVING) {
		const current = $sessionStore.stacksInfo.burn_block_height;
		const resWindow = $sessionStore.daoOverview.contractData.disputeWindowLength;
		if (market.marketType === 1) {
			const resBurnHeight = market.marketData.resolutionBurnHeight || 0;
			return current < resBurnHeight + resWindow;
		} else if (market.marketType === 2) {
			const start = market.marketData.marketStart || 0;
			const end = start + (market.marketData.marketDuration || 0);
			const endCooling = end + (market.marketData.coolDownPeriod || 0);
			return current < endCooling + resWindow;
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
		if (market.marketType == 1) return true;
		else {
			const current = sess.stacksInfo.burn_block_height;
			const start = market.marketData.marketStart || 0;
			const end = start + (market.marketData.marketDuration || 0);
			return current <= end;
		}
	}
	return false;
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
		const start = market.marketData.marketStart || 0;
		const end = start + (market.marketData.marketDuration || 0);
		const endCooling = end + (market.marketData.coolDownPeriod || 0);
		return sess.stacksInfo.burn_block_height > endCooling;
	}
	return false;
};

export const getOutcomeMessage = (market: PredictionMarketCreateEvent) => {
	if (market.marketType === 1) {
		return `Outcome is <span class="font-medium text-red-600">${market.marketData.categories[market.marketData.outcome!]}</span>`;
	}
	const cats = market.marketData.categories as ScalarMarketDataItem[];
	return `Outcome is ${market.marketData.priceOutcome || 0} - value between <span class="font-medium text-red-600">${cats[market.marketData.outcome!].min} and ${cats[market.marketData.outcome!].max}</span>`;
};
