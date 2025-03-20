export interface DaoConfig {
	VITE_DOA_DEPLOYER: string;
	VITE_DAO_BASE_CONTRACTS: string;
	VITE_DOA: string;
	VITE_DOA_PROPOSAL: string;
	VITE_DAO_MARKET_VOTING: string;
	VITE_DAO_MARKET_GATING: string;
	VITE_DAO_MARKET_PREDICTING: string;
	VITE_DAO_MARKET_SCALAR: string;
	VITE_DAO_MARKET_BITCOIN: string;
	VITE_DAO_TREASURY: string;
	VITE_DAO_GOVERNANCE_TOKEN: string;
	VITE_DAO_TOKEN_SALE: string;
	VITE_DOA_PROPOSAL_VOTING_EXTENSION: string;
	VITE_DOA_FUNDED_SUBMISSION_EXTENSION: string;
	VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: string;
}

export const config_dao: { [key: string]: DaoConfig } = {
	devnet: {
		VITE_DOA_DEPLOYER: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
		VITE_DOA: 'bigmarket-dao',
		VITE_DAO_BASE_CONTRACTS: 'ecosystem-dao,bigmarket-dao',
		VITE_DOA_PROPOSAL: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bdp001-sip-021-test-01',
		VITE_DOA_PROPOSAL_VOTING_EXTENSION: 'bme007-snapshot-proposal-voting',
		VITE_DOA_FUNDED_SUBMISSION_EXTENSION: 'bme002-proposal-submission',
		VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: 'bme004-emergency-execute',
		VITE_DAO_MARKET_VOTING: 'bme021-0-market-voting',
		VITE_DAO_MARKET_GATING: 'bme022-0-market-gating',
		VITE_DAO_MARKET_PREDICTING: 'bme023-0-market-predicting',
		VITE_DAO_MARKET_SCALAR: 'bme023-2-market-scalar',
		VITE_DAO_MARKET_BITCOIN: 'bme023-0-market-bitcoin',
		VITE_DAO_GOVERNANCE_TOKEN: 'bme000-0-governance-token',
		VITE_DAO_TOKEN_SALE: 'bme010-0-token-sale',
		VITE_DAO_TREASURY: 'bme006-0-treasury'
	},
	testnet: {
		VITE_DOA_DEPLOYER: 'ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R', //'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY',
		VITE_DAO_BASE_CONTRACTS: 'ecosystem-dao,bigmarket-dao',
		VITE_DOA: 'bigmarket-dao',
		VITE_DOA_PROPOSAL: 'ST31A25YBK50KFJ2QS0EQK9FNXEQJD4PR0828789R.bdp001-sip-021-nakamoto', // 'ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY.bdp001-sip-021-nakamoto',
		VITE_DOA_PROPOSAL_VOTING_EXTENSION: 'bme007-snapshot-proposal-voting',
		VITE_DOA_FUNDED_SUBMISSION_EXTENSION: 'bme008-flexible-funded-submission',
		VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: 'bme004-emergency-execute',
		VITE_DAO_MARKET_VOTING: 'bme021-0-market-voting',
		VITE_DAO_MARKET_GATING: 'bme022-0-market-gating',
		VITE_DAO_MARKET_PREDICTING: 'bme023-0-market-predicting',
		VITE_DAO_MARKET_SCALAR: 'bme023-2-market-scalar',
		VITE_DAO_MARKET_BITCOIN: 'bme023-0-market-bitcoin',
		VITE_DAO_GOVERNANCE_TOKEN: 'bme000-0-governance-token',
		VITE_DAO_TOKEN_SALE: 'bme010-0-token-sale',
		VITE_DAO_TREASURY: 'bme006-0-treasury'
	},
	mainnet: {
		VITE_DOA_DEPLOYER: 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z',
		VITE_DAO_BASE_CONTRACTS: 'ecosystem-dao,bigmarket-dao',
		VITE_DOA: 'bigmarket-dao',
		VITE_DOA_PROPOSAL: 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.bdp001-sip-021-nakamoto',
		VITE_DOA_PROPOSAL_VOTING_EXTENSION: 'bme007-snapshot-proposal-voting',
		VITE_DOA_FUNDED_SUBMISSION_EXTENSION: 'bme008-flexible-funded-submission',
		VITE_DOA_EMERGENCY_EXECUTE_EXTENSION: 'bme004-emergency-execute',
		VITE_DAO_MARKET_VOTING: 'bme021-0-market-voting',
		VITE_DAO_MARKET_GATING: 'bme022-0-market-gating',
		VITE_DAO_MARKET_PREDICTING: 'bme023-0-market-predicting',
		VITE_DAO_MARKET_SCALAR: 'bme023-2-market-scalar',
		VITE_DAO_MARKET_BITCOIN: 'bme023-0-market-bitcoin',
		VITE_DAO_GOVERNANCE_TOKEN: 'bme000-0-governance-token',
		VITE_DAO_TOKEN_SALE: 'bme010-0-token-sale',
		VITE_DAO_TREASURY: 'bme006-0-treasury'
	}
};
