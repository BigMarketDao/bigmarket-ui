<script lang="ts">
	import Banner from '$lib/components/ui/Banner.svelte';
</script>

<div class="mx-auto max-w-4xl rounded-lg p-6 shadow-lg">
	<!-- Page Title -->
	<h1 class="mb-6 text-center text-4xl font-bold">📘 Platform Fees</h1>

	<p class="mb-6 text-lg leading-relaxed">
		BigMarket operates under a <strong>DAO-governed fee structure</strong>, meaning that all fees on the platform are determined by <strong>DAO voting</strong>. Fees <strong>can only be changed</strong> through DAO proposals and votes.
	</p>

	<div class="my-4">
		<Banner bannerType={'success'} message={`An up to date list of fees are always available at <a href="/settings">/settings</a> `} />
	</div>

	<h2 class="mb-5 mt-10 text-3xl font-semibold text-gray-700">🔹 Types of Fees</h2>

	<!-- Fee Sections -->
	<div class="space-y-8">
		<!-- Development Fund Fee -->
		<div class="rounded border-l-4 border-blue-500 bg-gray-50 p-4">
			<h3 class="text-2xl font-semibold text-gray-700">1️⃣ Development Fund Fee</h3>
			<p class="text-lg leading-relaxed">
				<strong>Applied to:</strong> All stakes <br />
				<strong>Current Rate:</strong> 2% <br />
				<strong>Purpose:</strong> Funds platform <strong>development & maintenance</strong>. <br />
				<strong>Where it goes:</strong> Paid to the <strong>development fund</strong> to support ongoing improvements.
			</p>
		</div>

		<!-- DAO Fund Fee -->
		<div class="border-green-500 rounded border-l-4 bg-gray-50 p-4">
			<h3 class="text-2xl font-semibold text-gray-700">2️⃣ DAO Fund Fee</h3>
			<p class="text-lg leading-relaxed">
				<strong>Applied to:</strong> Winning claims <br />
				<strong>Purpose:</strong> Funds the <strong>BigMarket DAO treasury</strong>. <br />
				<strong>Where it goes:</strong> The DAO <strong>controls and spends</strong> these funds via governance voting.
			</p>
		</div>

		<!-- Market Fund Fee -->
		<div class="rounded border-l-4 border-yellow-500 bg-gray-50 p-4">
			<h3 class="text-2xl font-semibold text-gray-700">3️⃣ Market Fund Fee</h3>
			<p class="text-lg leading-relaxed">
				<strong>Applied to:</strong> Market winnings (set by market creator) <br />
				<strong>Purpose:</strong> Allows market creators to <strong>earn fees</strong> for running a market. <br />
				<strong>Where it goes:</strong> Paid to a <strong>treasury of the market creator’s choosing</strong>. <br />
				<strong>Restrictions:</strong> The <strong>DAO sets an upper limit</strong> on the fee percentage to ensure fairness.
			</p>
		</div>

		<!-- Market Creation Fee -->
		<div class="border-red-500 rounded border-l-4 bg-gray-50 p-4">
			<h3 class="text-2xl font-semibold text-gray-700">4️⃣ Market Creation Fee</h3>
			<p class="text-lg leading-relaxed">
				<strong>Applied to:</strong> New market creation <br />
				<strong>Purpose:</strong> Discourages spam and funds the <strong>BigMarket DAO treasury</strong>. <br />
				<strong>Where it goes:</strong> Paid directly to the DAO treasury.
			</p>
		</div>
	</div>

	<!-- Who Controls the Fees -->
	<h2 class="mb-5 mt-10 text-3xl font-semibold text-gray-700">🔹 Who Controls the Fees?</h2>
	<ul class="list-inside list-disc space-y-2 text-lg leading-relaxed">
		<li><strong>All fees are set by the DAO</strong> through <strong>voting</strong>.</li>
		<li><strong>Only a DAO proposal</strong> can modify fee structures.</li>
		<li>The <strong>DAO treasury</strong> receives and manages funds, ensuring full transparency.</li>
	</ul>

	<!-- Stay Updated -->
	<h2 class="mb-5 mt-10 text-3xl font-semibold text-gray-700">📢 Stay Updated</h2>
	<p class="text-lg leading-relaxed">
		- Follow <strong>DAO proposals</strong> to see if fees change. <br />
		- <strong>Participate in governance</strong> to influence fee structures. <br />
		- Join the discussion on <a href="#" class="text-blue-600 underline hover:text-blue-800">Discord</a> or <a href="#" class="text-blue-600 underline hover:text-blue-800">Twitter</a>.
	</p>

	<p class="mt-6 text-center text-gray-500">🚀 BigMarket ensures fees are community-driven and DAO-governed, creating a fair and transparent system.</p>
</div>
