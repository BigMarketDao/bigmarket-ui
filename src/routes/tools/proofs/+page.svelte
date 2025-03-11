<script lang="ts">
	import TransactionAnalysis from '$lib/bitcoin/TransactionLoader.svelte';
</script>

<div class="mx-auto w-full p-6 md:w-4/5">
	<div class="my-8">
		<div class="mx-auto w-full">
			<div class="flex w-full flex-col items-start gap-10 rounded-lg border-[0.5px] border-gray-700 bg-gray-1000 p-5">
				<TransactionAnalysis />
			</div>
		</div>
	</div>
</div>

<section class=""></section>
