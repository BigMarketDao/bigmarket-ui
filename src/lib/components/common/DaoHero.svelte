<script>
	export let title = 'Welcome to Our Site';
	export let subtitle = 'Empowering ideas with technology';
</script>

<div class=" z-0 border-b border-purple-900/20 py-24">
	<div class=" inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0F1225]/10 to-[#0F1225]/5"></div>

	<div class=" mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h1 class="bg-gradient-to-r to-indigo-300 from-purple-400 bg-clip-text text-4xl font-bold text-primary sm:text-6xl">
				{title}
			</h1>
			<p class="text-indigo-200/70 mx-auto mt-6 max-w-2xl text-lg">
				{@html subtitle}
			</p>
		</div>
	</div>
</div>
