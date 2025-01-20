import { appDetails } from '$lib/config';
import { domainCV, getStxAddress, getStxNetwork } from '$lib/stacks/stacks-connect';
import { getConfig } from '$stores/store_helpers';
import {
	ADMIN_MESSAGE,
	adminMessageToTupleCV,
	verifyBaseAdminSignature,
	verifyDaoSignature,
	type BaseAdminMessage
} from '@mijoco/stx_helpers/dist/index';
import { openStructuredDataSignatureRequestPopup } from '@stacks/connect';
import { ChainId } from '@stacks/network';
import {
	cvToHex,
	stringAsciiCV,
	tupleCV,
	uintCV,
	type ClarityValue,
	type TupleCV
} from '@stacks/transactions';
import { request } from 'sats-connect';

// export async function signAnyMessage(messageToSign: TupleCV, callback: any) {
// 	const chainId = getConfig().VITE_NETWORK === 'mainnet' ? ChainId.Mainnet : ChainId.Testnet;

// 	console.log('domainCV: ', domainCV);
// 	console.log('chainId: ', chainId);
// 	//const message = messageCV(adminMessage);

// 	openStructuredDataSignatureRequestPopup({
// 		message: messageToSign,
// 		domain: tupleCV({
// 			name: stringAsciiCV(getConfig().VITE_PUBLIC_APP_NAME),
// 			version: stringAsciiCV(getConfig().VITE_PUBLIC_APP_VERSION),
// 			'chain-id': uintCV(chainId)
// 		}),
// 		network: getStxNetwork(),
// 		appDetails: {
// 			name: appDetails.name,
// 			icon: (window?.location?.origin || '') + appDetails.icon
// 		},
// 		onFinish(signature) {
// 			const network = getConfig().VITE_NETWORK;
// 			const appName = getConfig().VITE_PUBLIC_APP_NAME;
// 			const appVersion = getConfig().VITE_PUBLIC_APP_VERSION;
// 			console.log('/votes: network: ' + getConfig().VITE_NETWORK);
// 			console.log('/votes: publicAppName: ' + getConfig().VITE_PUBLIC_APP_NAME);
// 			console.log('/votes: publicAppVersion: ' + getConfig().VITE_PUBLIC_APP_VERSION);
// 			console.log('/votes: signature: ' + signature.signature);
// 			console.log('/votes: publicKey: ' + signature.publicKey);
// 			console.log('/votes: message: ', messageToSign);
// 			let res = verifyDaoSignature(
// 				network,
// 				appName,
// 				appVersion,
// 				messageToSign,
// 				signature.signature,
// 				signature.publicKey
// 			);
// 			callback({ message: messageToSign, signature });
// 		}
// 	});
// }
export async function signAdminMessage(callback: any) {
	const adminMessage: BaseAdminMessage = {
		message: ADMIN_MESSAGE,
		timestamp: new Date().getTime(),
		admin: getStxAddress()
	};
	const chainId = getConfig().VITE_NETWORK === 'mainnet' ? ChainId.Mainnet : ChainId.Testnet;

	console.log('domainCV: ', domainCV);
	console.log('chainId: ', chainId);
	//const message = messageCV(adminMessage);

	openStructuredDataSignatureRequestPopup({
		message: tupleCV({
			message: stringAsciiCV(adminMessage.message),
			timestamp: uintCV(adminMessage.timestamp),
			admin: stringAsciiCV(adminMessage.admin)
		}),
		domain: tupleCV({
			name: stringAsciiCV(getConfig().VITE_PUBLIC_APP_NAME),
			version: stringAsciiCV(getConfig().VITE_PUBLIC_APP_VERSION),
			'chain-id': uintCV(chainId)
		}),
		network: getStxNetwork(),
		appDetails: {
			name: appDetails.name,
			icon: (window?.location?.origin || '') + appDetails.icon
		},
		onFinish(signature) {
			const network = getConfig().VITE_NETWORK;
			const appName = getConfig().VITE_PUBLIC_APP_NAME;
			const appVersion = getConfig().VITE_PUBLIC_APP_VERSION;
			console.log('/votes: network: ' + getConfig().VITE_NETWORK);
			console.log('/votes: publicAppName: ' + getConfig().VITE_PUBLIC_APP_NAME);
			console.log('/votes: publicAppVersion: ' + getConfig().VITE_PUBLIC_APP_VERSION);
			console.log('/votes: signature: ' + signature.signature);
			console.log('/votes: publicKey: ' + signature.publicKey);
			console.log('/votes: message: ', adminMessage);
			let res = verifyBaseAdminSignature(
				network,
				appName,
				appVersion,
				adminMessage,
				signature.signature,
				signature.publicKey
			);
			callback({ message: adminMessage, signature });
		}
	});
}
export async function signAdminMessageXverse() {
	const adminMessage: BaseAdminMessage = {
		message: ADMIN_MESSAGE,
		timestamp: 1736281142366, //new Date().getTime(),
		admin: getStxAddress()
	};
	const response = await request('stx_signStructuredMessage', {
		message: cvToHex(adminMessageToTupleCV(adminMessage)).slice(2), // remove 0x,
		domain: cvToHex(
			tupleCV({
				name: stringAsciiCV('sats-connect-example'),
				version: stringAsciiCV('1.2.3'),
				'chain-id': uintCV(
					getConfig().VITE_NETWORK === 'mainnet' ? ChainId.Mainnet : ChainId.Testnet
				)
			})
		).slice(2)
	});
	if (response.status === 'success') {
		alert('Success! Check the console for the response.');
		console.log(response.result);
	} else {
		console.error('Something went wrong. Check the console for the response.');
		console.error(response);
	}
	return response;
}
