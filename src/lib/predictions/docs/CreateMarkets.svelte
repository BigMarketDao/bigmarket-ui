<script lang="ts">
</script>

<div class="mx-auto max-w-4xl rounded-lg p-6 shadow-lg">
	<h1 class="mb-6 text-center text-4xl font-bold">📘 Creating Markets</h1>
	<h3 class="mt-4 text-lg font-semibold">Who Can Create a Market?</h3>
	<p class="mb-4">
		Market creation can be gated by community vote. If gating is enabled, only approved addresses can create markets. The <strong>BigMarket DAO (BIG)</strong> manages this via a <strong>Merkle whitelist</strong>, ensuring that only approved users
		have access.
	</p>

	<h3 class="text-lg font-semibold">✅ Is Market Creation Open Right Now?</h3>
	<p class="mb-4"><strong>If YES</strong>, anyone can create a market.</p>
	<p class="mb-4"><strong>If NO</strong>, only addresses approved by the DAO community can create markets.</p>

	<h3 class="text-lg font-semibold">💰 Market Creation Fee</h3>
	<p class="mb-4">
		Creating a market costs <strong>100 STX</strong>, but this fee is set by the DAO and may change. Fees contribute to the platform’s treasury and ecosystem development.
	</p>

	<h2 class="mt-6 text-xl font-semibold">🔹 Required Market Details</h2>
	<table class="mt-4 w-full border-collapse border border-gray-300">
		<thead class="bg-gray-200">
			<tr>
				<th class="border border-gray-300 p-2">Field</th>
				<th class="border border-gray-300 p-2">Description</th>
				<th class="border border-gray-300 p-2">Limits</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="border border-gray-300 p-2">Market Name</td>
				<td class="border border-gray-300 p-2">Short title of your market</td>
				<td class="border border-gray-300 p-2">Max 64 chars</td>
			</tr>
			<tr>
				<td class="border border-gray-300 p-2">Market Type</td>
				<td class="border border-gray-300 p-2">Choose one: Binary, Categorical, Scalar</td>
				<td class="border border-gray-300 p-2">-</td>
			</tr>
			<tr>
				<td class="border border-gray-300 p-2">Description</td>
				<td class="border border-gray-300 p-2">Explain the market topic & context</td>
				<td class="border border-gray-300 p-2">Max 1024 chars</td>
			</tr>
			<tr>
				<td class="border border-gray-300 p-2">Criteria</td>
				<td class="border border-gray-300 p-2">Define how the market is resolved</td>
				<td class="border border-gray-300 p-2">Max 1024 chars</td>
			</tr>
			<tr>
				<td class="border border-gray-300 p-2">Treasury Address</td>
				<td class="border border-gray-300 p-2">Address where market fees are collected (defaults to your Stacks address)</td>
				<td class="border border-gray-300 p-2">-</td>
			</tr>
			<tr>
				<td class="border border-gray-300 p-2">Market Image URL</td>
				<td class="border border-gray-300 p-2">Visual representation for the market</td>
				<td class="border border-gray-300 p-2">-</td>
			</tr>
			<tr>
				<td class="border border-gray-300 p-2">Market Fee %</td>
				<td class="border border-gray-300 p-2">% of the market winnings collected as a fee (max set by DAO)</td>
				<td class="border border-gray-300 p-2">0 – DAO max fee</td>
			</tr>
			<tr>
				<td class="border border-gray-300 p-2">Token Used</td>
				<td class="border border-gray-300 p-2">Select from allowed tokens (STX, sBTC, etc.)</td>
				<td class="border border-gray-300 p-2">DAO-controlled</td>
			</tr>
			<tr>
				<td class="border border-gray-300 p-2">Market Category</td>
				<td class="border border-gray-300 p-2">Choose from: Sports, Music, Memes, Crypto, Politics, etc.</td>
				<td class="border border-gray-300 p-2">-</td>
			</tr>
			<tr>
				<td class="border border-gray-300 p-2">Social Integrations</td>
				<td class="border border-gray-300 p-2">Add links (Twitter, Discord, Website) for discussion & engagement</td>
				<td class="border border-gray-300 p-2">-</td>
			</tr>
		</tbody>
	</table>

	<h2 class="mt-6 text-xl font-semibold">⚡ How to Create a Market</h2>
	<ol class="list-inside list-decimal space-y-2">
		<li><strong>Connect your Wallet</strong> (Leather, Asigna, or Xverse).</li>
		<li>Click <strong>"Create Market"</strong> on the BigMarket dashboard.</li>
		<li>Fill in market details (name, type, description, treasury, etc.).</li>
		<li>Choose token & set market fee (if applicable).</li>
		<li>Sign the transaction – this verifies the market’s off-chain data.</li>
		<li><strong>Confirm & Submit</strong></li>
	</ol>
</div>
