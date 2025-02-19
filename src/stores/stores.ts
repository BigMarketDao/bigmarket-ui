import type { AddressObject, DaoOverview, ExchangeRate, PoxInfo, SbtcUserSettingI, StacksBalance, StacksInfo, TokenPermissionEvent } from '@mijoco/stx_helpers/dist/index';
import { persisted } from 'svelte-local-storage-store';
import { writable } from 'svelte/store';

export const sessionStore = persisted('sessionStore', {} as BigMarketSessionStore);

export type Currency = {
	code: string;
	name: string;
	flag: string;
};

export type BigMarketSessionStore = {
	name: string;
	loggedIn: boolean;
	balances?: StacksBalance;
	keySets: { [key: string]: AddressObject };
	userSettings: SbtcUserSettingI;
	poxInfo: PoxInfo;
	exchangeRates: Array<ExchangeRate>;
	stacksInfo: StacksInfo;
	tokens: Array<TokenPermissionEvent>;
	daoOverview: DaoOverview;
};

// stores.ts

// Track user input amount
export const stakeAmount = writable(0);
export const stakeAmountHome = writable(0);
export const selectedCurrency = writable({ code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' });
