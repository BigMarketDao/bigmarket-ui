<script lang="ts">
	export let info: { header: string; message: string };
</script>

<div class="min-w-[200px] max-w-sm border border-blue-1000 bg-blue-500 p-6 text-white shadow-lg">
	<h1 class="font-inter mb-10 text-[16px] font-bold">{info.header}</h1>
	<p class="font-inter mt-2 text-[16px] font-bold">{info.message}</p>
</div>
