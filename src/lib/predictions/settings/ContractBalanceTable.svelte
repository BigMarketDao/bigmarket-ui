<script lang="ts">
	import { fmtMicroToStx } from '$lib/utils';
	import type { ContractBalances } from '@mijoco/stx_helpers/dist/stacks-node/stacks-node';
	import { onMount } from 'svelte';
	import { getMarketToken } from '../predictions';

	export let contracts: Array<{ contract: string; balances: ContractBalances }>;

	let balances: any[] = [];
	const formatCryptoValue = (value: string | number): string => {
		if (typeof value === 'number') value = value.toString();
		if (!value || value.indexOf('.') === -1) return value;
		const parts = value.split('.'); // Split integer and decimal parts
		const integerPart = Number(parts[0]).toLocaleString(); // Format integer part with commas
		const decimalPart = parts[1] ? parts[1].padEnd(8, '0') : '00000000'; // Ensure 8 decimal places
		return `${integerPart}.<span class="text-sm text-gray-300">${decimalPart}</span>`;
	};

	onMount(() => {
		balances = contracts.flatMap(({ contract, balances }) => {
			const tokens = Object.keys(balances.fungible_tokens || {}).map((token) => ({
				contract,
				token: token.split('::')[1],
				balance: balances.fungible_tokens[token].balance,
				decimals: getMarketToken(token.split('::')[0]).decimals
			}));

			// Add STX as a separate entry
			return [
				...tokens,
				{
					contract,
					token: 'STX',
					balance: balances.stx.balance,
					decimals: 6
				}
			];
		});
	});
</script>

<table class="min-w-full table-auto border-collapse border border-gray-300 shadow-lg">
	<thead>
		<tr class="bg-gray-200 text-left">
			<th class="border border-gray-300 px-4 py-2 text-gray-800">Contract</th>
			<th class="border border-gray-300 px-4 py-2 text-gray-800">Token</th>
			<th class="border border-gray-300 px-4 py-2 text-gray-800">Balance</th>
		</tr>
	</thead>
	<tbody>
		{#each balances as { contract, token, balance, decimals }}
			<tr class="border-b transition hover:bg-gray-700">
				<td class="border border-gray-300 px-4 py-2">{contract}</td>
				<td class="border border-gray-300 px-4 py-2">{token}</td>
				<td class="border border-gray-300 px-4 py-2">{@html formatCryptoValue(fmtMicroToStx(balance, decimals))} </td>
			</tr>
		{/each}
	</tbody>
</table>
