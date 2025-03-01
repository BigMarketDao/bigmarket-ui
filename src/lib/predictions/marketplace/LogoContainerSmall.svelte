<script lang="ts">
	let placeholderImage = 'https://bitcoinfaces.xyz/api/get-image?name=SP1R1061ZT6KPJXQ7PAXPFB6ZAZ6ZWW28GBQA1W0F'; // Path to your standard placeholder image
	export let logo: string = placeholderImage;
	let isPlaceholder = false;

	function handleError(event: any) {
		event.target.src = placeholderImage; // Set the fallback image
		event.target.alt = 'Default placeholder image';
		isPlaceholder = true; // Update state
	}
</script>

<div class=""><img width={150} height={150} src={logo || placeholderImage} alt="Market Logo" on:error={handleError} class="max-h-[150px] max-w-[150px] place-self-center rounded-full object-cover" /></div>
