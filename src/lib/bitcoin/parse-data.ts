import { Cl, serializeCV } from '@stacks/transactions';
import { hex } from '@scure/base';
import type { TransactionProofSet } from './proof-types';
import { callContractReadOnly } from '@mijoco/stx_helpers/dist/index';
import { getConfig, getDaoConfig } from '$stores/store_helpers';

const contract = `${getDaoConfig().VITE_DOA_DEPLOYER}.${getDaoConfig().VITE_DAO_MARKET_BITCOIN}`;
const getParams = (contract: string, functionName: string, functionArgs: Array<string>) => {
	return {
		contractAddress: contract.split('.')[0],
		contractName: contract.split('.')[1],
		functionName,
		functionArgs
	};
};
export const parseOutput = async (proof: TransactionProofSet) => {
	const functionArgs = [`0x${serializeCV(Cl.bufferFromHex(proof.txHex))}`];
	const response = await callContractReadOnly(getConfig().VITE_STACKS_API, getParams(contract, 'get-payload-legacy', functionArgs));
	let result = (response.value?.value || response.value) as string;
	return result;
};
