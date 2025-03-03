<script lang="ts">
	import tokenpie from '$lib/assets/tokenpie.png';
</script>

<div class="mx-auto max-w-4xl rounded-lg p-6 shadow-lg">
	<h1 class="mb-6 text-center text-4xl font-bold">📘 Token Sale</h1>
	<div class="mx-auto max-w-4xl py-12">
		<h1 class="mb-8 text-center text-4xl font-bold">BigMarket Token Sale & Distribution</h1>
		<p class="mb-4 text-gray-700"><i><span class="text-primary">This is a work in progress - the final version will include feedback from early contributors via proposal voting.</span></i></p>

		<!-- Token Sale Mechanics -->
		<div class="rounded-lg p-6 shadow-lg">
			<h2 class="mb-4 text-2xl font-semibold">📌 IDO Sale Mechanics</h2>
			<p class="mb-4 text-gray-700">The <b>BigMarketDAO Governance (BIG)</b> token will be distributed in multiple stages. The sale will fund the ecosystem and provide early supporters access to governance.</p>

			<h3 class="mb-3 mt-6 text-xl font-medium">Tokenomics</h3>
			<ul class="list-inside list-disc text-gray-700">
				<li><strong>Blockchain:</strong> Stacks L2</li>
				<li><strong>Token Standard:</strong> SIP-010 Fungible Token</li>
				<li><strong>Total Supply:</strong> 10,000,000 BIG</li>
				<li><strong>Decimals:</strong> 6</li>
				<li><strong>Utility:</strong> Governance, Market Creation, Dispute Resolution, Fee Distribution</li>
			</ul>
		</div>

		<!-- IDO Stages -->
		<!-- <div class="mt-10 rounded-lg p-6 shadow-lg">
			<h2 class="mb-4 text-2xl font-semibold">🚀 IDO Stages</h2>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse border border-gray-200">
					<thead class="bg-gray-200 text-gray-900">
						<tr>
							<th class="border border-gray-300 px-4 py-2 text-left">Stage</th>
							<th class="border border-gray-300 px-4 py-2 text-left">Raise (USD)</th>
							<th class="border border-gray-300 px-4 py-2 text-left">Price (USD)</th>
							<th class="border border-gray-300 px-4 py-2 text-left">Tokens</th>
							<th class="border border-gray-300 px-4 py-2 text-left">Lockup</th>
						</tr>
					</thead>
					<tbody>
						<tr class="">
							<td class="border border-gray-300 px-4 py-2">Stage 1</td>
							<td class="border border-gray-300 px-4 py-2">$30,000</td>
							<td class="border border-gray-300 px-4 py-2">$0.05</td>
							<td class="border border-gray-300 px-4 py-2">600,000 BIG</td>
							<td class="border border-gray-300 px-4 py-2">1 Month</td>
						</tr>
						<tr class="bg-gray-50">
							<td class="border border-gray-300 px-4 py-2">Stage 2</td>
							<td class="border border-gray-300 px-4 py-2">$50,000</td>
							<td class="border border-gray-300 px-4 py-2">$0.06</td>
							<td class="border border-gray-300 px-4 py-2">833,333 BIG</td>
							<td class="border border-gray-300 px-4 py-2">1 Month</td>
						</tr>
						<tr class="">
							<td class="border border-gray-300 px-4 py-2">Stage 3</td>
							<td class="border border-gray-300 px-4 py-2">$75,000</td>
							<td class="border border-gray-300 px-4 py-2">$0.07</td>
							<td class="border border-gray-300 px-4 py-2">1,071,429 BIG</td>
							<td class="border border-gray-300 px-4 py-2">1 Month</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div> -->

		<!-- Team & Advisor Vesting Schedule -->
		<div class="mt-10 rounded-lg p-6 shadow-lg">
			<h2 class="mb-4 text-2xl font-semibold">🔐 Team & Advisor Vesting Schedule</h2>
			<table class="w-full border-collapse border border-gray-200">
				<thead class="bg-gray-200 text-gray-900">
					<tr>
						<th class="border border-gray-300 px-4 py-2 text-left">Category</th>
						<th class="border border-gray-300 px-4 py-2 text-left">Percentage</th>
						<th class="border border-gray-300 px-4 py-2 text-left">Amount</th>
						<th class="border border-gray-300 px-4 py-2 text-left">Vesting Period</th>
					</tr>
				</thead>
				<tbody>
					<tr class="">
						<td class="border border-gray-300 px-4 py-2">Community/IDO</td>
						<td class="border border-gray-300 px-4 py-2">60%</td>
						<td class="border border-gray-300 px-4 py-2">6,000,000 BIG</td>
						<td class="border border-gray-300 px-4 py-2">According to sale stages</td>
					</tr>
					<tr class="bg-gray-50">
						<td class="border border-gray-300 px-4 py-2">Operations</td>
						<td class="border border-gray-300 px-4 py-2">15%</td>
						<td class="border border-gray-300 px-4 py-2">1,500,000 BIG</td>
						<td class="border border-gray-300 px-4 py-2">1-year cliff, 2-year linear</td>
					</tr>
					<tr class="">
						<td class="border border-gray-300 px-4 py-2">Treasury</td>
						<td class="border border-gray-300 px-4 py-2">25%</td>
						<td class="border border-gray-300 px-4 py-2">2,500,000 BIG</td>
						<td class="border border-gray-300 px-4 py-2">Governance controlled</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Token Distribution Chart -->
		<!-- <div class="mt-10 rounded-lg p-6 text-center shadow-lg">
			<h2 class="mb-4 text-2xl font-semibold">📊 Token Distribution</h2>
			<img src={tokenpie} alt="Token Distribution Chart" class="mx-auto w-3/4" />
		</div> -->
	</div>
</div>
