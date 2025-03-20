export const appDetails = {
	name: 'bigmarket-dao',
	icon: '/img/stx_eco_logo_icon_white.png'
};

export interface Config {
	VITE_PUBLIC_APP_NAME: string;
	VITE_PUBLIC_APP_VERSION: string;
	VITE_NETWORK: string;
	VITE_POLL_PAYMENT_USTX: number;
	VITE_BIGMARKET_API: string;
	VITE_SUI_API: string;
	VITE_BRIDGE_API: string;
	VITE_STACKS_API: string;
	VITE_STACKS_EXPLORER: string;
	VITE_MEMPOOL_API: string;
	VITE_BITCOIN_WALLET: string;
	VITE_CLARITY_BITCOIN: string;
}

export const config: { [key: string]: Config } = {
	devnet: {
		VITE_PUBLIC_APP_NAME: 'BigMarket',
		VITE_PUBLIC_APP_VERSION: '1.0.0',
		VITE_NETWORK: 'devnet',
		VITE_BIGMARKET_API: 'http://localhost:3020/bigmarket-api',
		VITE_SUI_API: 'http://localhost:9001',
		VITE_BRIDGE_API: 'http://localhost:3020/bridge-api',
		VITE_STACKS_API: 'http://localhost:3999',
		VITE_STACKS_EXPLORER: 'http://localhost:8000',
		VITE_MEMPOOL_API: 'http://localhost:8001',
		VITE_POLL_PAYMENT_USTX: 50000000,
		VITE_BITCOIN_WALLET: 'bcrt1q4zymxl8934vvle2ppzw0j6tkwz3d7qw4f0esme',
		VITE_CLARITY_BITCOIN: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin-lib-v5'
	},
	testnet: {
		VITE_PUBLIC_APP_NAME: 'BigMarket',
		VITE_PUBLIC_APP_VERSION: '1.0.0',
		VITE_NETWORK: 'testnet',
		VITE_BIGMARKET_API: 'https://api.bigmarket.ai/bigmarket-api',
		//VITE_BIGMARKET_API: 'http://localhost:3020/bigmarket-api',
		VITE_STACKS_API: 'https://api.testnet.hiro.so',
		VITE_STACKS_EXPLORER: 'https://explorer.hiro.so',
		VITE_BRIDGE_API: 'https://api.stx.eco/bridge-api',
		VITE_SUI_API: 'http://localhost:9001',
		VITE_MEMPOOL_API: 'https://beta.sbtc-mempool.tech/api/proxy', //0bbc856394ffdab7e69e0b2b8ddb1fa7e901974cd89b90a64349b48b643c7e9c
		VITE_POLL_PAYMENT_USTX: 50000000,
		VITE_BITCOIN_WALLET: 'bcrt1q4zymxl8934vvle2ppzw0j6tkwz3d7qw4f0esme',
		VITE_CLARITY_BITCOIN: 'ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R.clarity-bitcoin-lib-v5'
	},
	mainnet: {
		VITE_PUBLIC_APP_NAME: 'BigMarket',
		VITE_PUBLIC_APP_VERSION: '1.0.0',
		VITE_NETWORK: 'mainnet',
		VITE_BIGMARKET_API: 'https://api.bigmarket.ai/bigmarket-api',
		VITE_STACKS_API: 'https://api.hiro.so',
		VITE_STACKS_EXPLORER: 'https://explorer.hiro.so',
		VITE_BRIDGE_API: 'https://api.stx.eco/bridge-api',
		VITE_SUI_API: 'http://localhost:9001',
		VITE_MEMPOOL_API: 'https://mempool.space/api',
		VITE_POLL_PAYMENT_USTX: 50000000,
		VITE_BITCOIN_WALLET: 'bcrt1q4zymxl8934vvle2ppzw0j6tkwz3d7qw4f0esme',
		VITE_CLARITY_BITCOIN: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.clarity-bitcoin-lib-v5'
	}
};
