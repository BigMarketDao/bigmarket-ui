<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	export let onClose: () => void;

	function closeModal() {
		if (onClose) {
			onClose();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	onMount(async () => {
		if (typeof window !== 'undefined') window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative inset-0 z-10 flex h-screen w-full items-center justify-center bg-transparent backdrop-blur-sm transition-opacity duration-300" style="@apply animate-fade-in" on:click={closeModal}>
	<div class="absolute top-20 h-auto overflow-auto rounded-lg p-8 text-white shadow-lg transition-transform duration-300" on:click|stopPropagation>
		<slot name="modalBody"></slot>

		<button on:click={closeModal} class="absolute right-1 top-2 text-2xl font-semibold text-white hover:text-gray-700 focus:outline-none"> &times; </button>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.animate-fade-in {
		animation: fade-in 0.3s ease-in-out;
	}
</style>
