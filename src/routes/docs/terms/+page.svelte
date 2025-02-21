<script>
	import DaoHero from '$lib/components/common/DaoHero.svelte';
</script>

<div class="bg-gray-50">
	<DaoHero title={'BigMarket DAO'} subtitle={'Terms and Conditions'} />
	<div class="px-6 py-10 md:px-20">
		<div class="mx-auto max-w-4xl px-6 py-12">
			<h1 class="mb-8 text-center text-4xl font-bold">Disclaimer and Terms of Use</h1>

			<p class="mb-2 text-gray-700">
				By accessing, downloading, installing, or otherwise using this product (the "<strong>BigMarket</strong>"), you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree with these terms, you must
				immediately cease all use of the Product.
			</p>

			<div class="text-whiterounded-lg p-6 text-white shadow-lg">
				<h2 class="mb-2 text-2xl font-semibold">🔹 "As-Is" Provision</h2>
				<p class="text-gray-700">
					This Product is provided on an <strong>"as-is"</strong> and <strong>"as-available"</strong> basis without any warranties or representations of any kind, whether express, implied, or statutory. To the fullest extent permitted by law, we expressly
					disclaim any and all warranties, including but not limited to:
				</p>
				<ul class="mb-1 list-inside list-disc text-gray-700">
					<li>Implied warranties of merchantability or fitness for a particular purpose</li>
					<li>Non-infringement, title, reliability, security, accuracy, or availability</li>
				</ul>
				<p class="BigMarket text-gray-700">We make no representations or guarantees that:</p>
				<ul class="mb-1 list-inside list-disc text-gray-700">
					<li>The Product will meet your specific needs or expectations</li>
					<li>The Product will be uninterrupted, timely, secure, or error-free</li>
					<li>The results, data, or outputs obtained through the Product will be accurate or reliable</li>
					<li>Any defects or errors in the Product will be corrected</li>
				</ul>
			</div>

			<div class="text-whiterounded-lg p-6 text-white shadow-lg">
				<h2 class="mb-2 text-2xl font-semibold">🔹 Assumption of Risk</h2>
				<p class="text-gray-700">You expressly acknowledge and accept that your use of the Product is at your sole risk. We shall not be liable for any losses or damages of any kind, including but not limited to:</p>
				<ul class="mb-1 list-inside list-disc text-gray-700">
					<li>Direct, indirect, incidental, consequential, or special damages</li>
					<li>Financial losses, including loss of income, revenue, or profits</li>
					<li>Data breaches, unauthorized access, or data loss</li>
					<li>Errors, inaccuracies, or omissions in the Product's functionalities</li>
					<li>Any outcomes resulting from reliance on the Product</li>
				</ul>
			</div>

			<div class="text-whiterounded-lg p-6 text-white shadow-lg">
				<h2 class="mb-2 text-2xl font-semibold">🔹 Limitation of Liability</h2>
				<p class="text-gray-700">To the maximum extent permitted by law, we shall not be liable for any damages arising out of or related to:</p>
				<ul class="mb-1 list-inside list-disc text-gray-700">
					<li>The use or inability to use the Product</li>
					<li>Any errors, bugs, vulnerabilities, or interruptions</li>
					<li>Unauthorized access to your data or transactions</li>
					<li>Any reliance placed on the Product or its outputs</li>
				</ul>
			</div>

			<div class="text-whiterounded-lg p-6 text-white shadow-lg">
				<h2 class="mb-2 text-2xl font-semibold">🔹 Indemnification</h2>
				<p class="text-gray-700">You agree to indemnify, defend, and hold harmless us, our affiliates, officers, directors, employees, and agents from and against any claims, liabilities, or damages arising from:</p>
				<ul class="mb-1 list-inside list-disc text-gray-700">
					<li>Your use or misuse of the Product</li>
					<li>Your violation of these terms</li>
					<li>Your violation of any laws, regulations, or third-party rights</li>
					<li>Any misrepresentation or reliance on the Product's outputs</li>
				</ul>
			</div>

			<div class="text-whiterounded-lg p-6 text-white shadow-lg">
				<h2 class="mb-2 text-2xl font-semibold">🔹 User Responsibility</h2>
				<p class="text-gray-700">The Product is intended solely as a tool to assist users. You are responsible for:</p>
				<ul class="mb-1 list-inside list-disc text-gray-700">
					<li>Conducting your own research before making decisions</li>
					<li>Safeguarding your data, credentials, and sensitive information</li>
					<li>Ensuring compliance with applicable laws and regulations</li>
				</ul>
				<p class="BigMarket text-gray-700">We make no recommendations or assurances regarding the suitability of the Product for any specific use case. Any reliance on the Product is at your own risk.</p>
			</div>

			<div class="text-whiterounded-lg p-6 text-white shadow-lg">
				<h2 class="mb-2 text-2xl font-semibold">🔹 No Professional Advice</h2>
				<p class="text-gray-700">
					The Product does not provide professional advice of any kind, including legal, financial, medical, or technical advice. You should consult appropriate professionals before acting on any information from the Product.
				</p>
			</div>

			<div class="rounded-lg p-6 text-white shadow-lg">
				<h2 class="mb-2 text-2xl font-semibold">🔹 Termination & Updates</h2>
				<p class="text-gray-700">
					We reserve the right to modify, suspend, or discontinue the Product at any time, with or without notice, and without liability to you. These terms may be updated periodically, and continued use of the Product constitutes acceptance of such
					updates.
				</p>
			</div>

			<p class="mt-6 text-center text-sm text-gray-500">Last Updated: [20/Feb/2025]</p>
		</div>
	</div>
</div>

<style>
	h1 {
		@apply mb-6 text-center text-4xl font-bold;
	}

	h2 {
		@apply mb-2 mt-8 text-2xl font-semibold;
	}

	h3 {
		@apply mb-2 mt-6 text-xl font-semibold;
	}

	p {
		@apply mb-0 text-lg leading-relaxed text-gray-700;
	}

	ul {
		@apply list-inside list-disc space-y-2 text-lg text-gray-700;
	}

	li {
		@apply pl-2;
	}

	a {
		@apply text-blue-600 underline hover:text-blue-800;
	}

	strong {
		@apply font-semibold text-gray-900;
	}
</style>
