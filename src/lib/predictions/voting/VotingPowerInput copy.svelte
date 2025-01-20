<script lang="ts">
	import { onMount } from 'svelte';
	import { fmtMicroToStx, fmtMicroToStxFormatted } from '$lib/utils';
	import { Icon, PencilSquare } from 'svelte-hero-icons';
	import BannerSlot from '$lib/components/ui/BannerSlot.svelte';

	export let onVotingPowerChange;
	export let totalBalanceUstx: number = 0;
	export let votingPowerUstx: number = 0;
	export let txVoting = false;
	$: message = txVoting
		? `Vote by sending a Stacks transaction - you will need enough STX pay the gas fee.  <a href="/" on:click|preventDefault=${() => (txVoting = !txVoting)}>change</a>`
		: `Vote by signing a message - voting is free. <a href="/" on:click|preventDefault=${() => (txVoting = !txVoting)}>change</a>`;

	let amountStx: number;
	let editing = false;
	const balanceAtHeightF = fmtMicroToStxFormatted(totalBalanceUstx);
	let showVotingMethodToggle = false;

	let stxAmount = '';

	// Handle input change
	function handleChange(event: any) {
		const value = event.target.value;

		// Regex to allow numbers, one decimal point, and up to 6 decimal places
		const regex = /^\d*\.?\d{0,6}$/;
		if (regex.test(value)) {
			stxAmount = value;
		}
	}
	function handleSubmit() {
		if (!stxAmount) {
			alert('Please enter a valid STX amount');
			return;
		}

		// Convert STX to microSTX
		const microStxAmount = Math.round(parseFloat(stxAmount) * 1_000_000);

		// Log or send the microSTX amount to the contract
		console.log('Sending to contract:', microStxAmount);
		// Add your contract call here
	}

	onMount(async () => {
		if (votingPowerUstx === 0) votingPowerUstx = totalBalanceUstx;
		//amountStx = fmtMicroToStx(totalBalanceUstx);
	});
</script>

{#if showVotingMethodToggle}
	<div class="">
		<BannerSlot bannerType={'warning'}>
			<div class="flex w-full justify-between">
				<div>
					Vote by sending a Stacks transaction - you will need enough STX to pay the gas fee
				</div>
			</div>
		</BannerSlot>
	</div>
{/if}

<div class="my-5 max-w-xl">
	<div class="flex flex-col gap-y-5 rounded-md">
		<div class="">
			<div>
				<div class="start">
					<a href="/" on:click|preventDefault={() => (editing = !editing)}>
						<!-- <Icon src={PencilSquare} class="mb-1 inline h-5 w-5" aria-hidden="true" /> -->
						<span class="underline"
							>Staking: {votingPowerUstx} STX
							<span class="text-[10px]">(stake up to your balance)</span></span
						>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<div class=" mb-5 flex w-full justify-start">
	<div class="w-full">
		<input
			class="inline w-full rounded-lg border-gray-800 p-2 text-black"
			bind:value={amountStx}
			on:input={handleChange}
			on:keyup={onVotingPowerChange(amountStx)}
			placeholder="0.000000"
			type="number"
			id="Contribution"
			aria-describedby="Contribution"
		/>
	</div>
	<div class="relative mx-2 ms-[-70px] mt-1 text-center text-xl text-black">STX</div>
</div>
<!-- <div class="mx-auto mt-10 flex w-96 flex-col space-y-4">
	<label for="stx-input" class="text-lg font-medium text-white">
		Enter STX Amount {stxAmount}</label
	>
	<input
		id="stx-input"
		type="text"
		bind:value={amountStx}
		on:input={handleChange}
		on:keyup={onVotingPowerChange(amountStx)}
		placeholder="0.000000"
		class="rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
	/>
</div> -->
