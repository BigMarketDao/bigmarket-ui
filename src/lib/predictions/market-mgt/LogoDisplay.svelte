<script lang="ts">
	export let logo: string; // Can be a data URL, HTTP URL, or inline SVG

	// Function to determine if the string is an inline SVG
	function isInlineSVG(str: string) {
		return str.trim().startsWith('<svg');
	}

	// Function to determine if it's a data URL
	function isDataURL(str: string) {
		return str.startsWith('data:image');
	}

	// Function to determine if it's an external URL
	function isHttpURL(str: string) {
		return str.startsWith('http://') || str.startsWith('https://');
	}
</script>

{#if isHttpURL(logo) || isDataURL(logo)}
	<!-- Display as an image -->
	<img src={logo} alt="Logo" class="h-32 w-32 object-contain" />
{:else if isInlineSVG(logo)}
	<!-- Display inline SVG -->
	{@html logo}
	<p class="relative top-[-10px] text-sm text-primary">AI generated logo.</p>
{:else}
	<!-- Fallback for invalid input -->
	<p>Invalid logo format</p>
{/if}
