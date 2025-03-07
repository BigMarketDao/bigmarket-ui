import { writable } from 'svelte/store';
import { config } from '$lib/config';
import { switchDaoConfig } from './stores_config_dao';
import { page } from '$app/state';

const initialConfig = config.mainnet;

export let configStore = writable(initialConfig);

export function switchConfig(env: string) {
	switchDaoConfig(env);
	configStore.set(config[env]);
}

function validChain(search: URLSearchParams): boolean {
	if (search.has('chain') && search.get('chain') != null) {
		const chain = search.get('chain');
		return chain === 'mainnet' || chain === 'testnet' || chain === 'devnet';
	}
	return false;
}
export function setConfigByUrl(search: URLSearchParams, override?: string) {
	if (validChain(search) && !override) {
		const newNetwork = search.get('chain') || override || 'testnet';
		switchConfig(newNetwork);
	} else {
		const newNetwork = override || 'testnet';
		switchConfig(newNetwork);
		const currentUrl = new URL(window.location.href);
		currentUrl.searchParams.set('chain', newNetwork);
		window.history.replaceState({}, '', currentUrl.toString());
		return;
	}
}
