<script>
	import Button from "./Button.svelte";


	let { buttonText='button', title='', description='', 
			header=null, children=null, buttonStyle='', onclick=()=>{},
			showModal = $bindable(false)

		} = $props();

	let dialog = $state(); // HTMLDialogElement
	

	$effect(() => {
		if (showModal) dialog.showModal();
        else dialog.close();
	});
    let scrollHeight =$state();
	let modalHeight =$state();
	let box=$state();
	$effect(()=>{if (showModal) box.scrollIntoView()});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<Button {buttonText} buttonStyle={buttonStyle ? buttonStyle : 'btn  btn-primary font-normal'} onclick={()=>{onclick(); showModal = true;}} />

<dialog
	bind:this={dialog} bind:clientHeight={modalHeight}
	onclose={() => (showModal = false)}
	onclick={(e) => { if (e.target === dialog) dialog.close(); }}
	class="self-center m-auto"
	>
	
	<div bind:this={box} bind:clientHeight={scrollHeight} >
		<form method="dialog">
			<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={()=>{showModal=false}}>✕</button>
		</form>
		{#if title || description}
			{#if title}
			<h1>{title}</h1>
			{/if}
			{#if description}
			{description}
			{/if}
		<hr/>
		{/if}
		
		{#if header}
		{@render header?.()}
		<hr />
		{/if}
		{#if children}
		{@render children?.()}
		<hr />
		{/if}
		<!-- svelte-ignore a11y_autofocus -->
		<div class="items-center flex">
			{#if scrollHeight > modalHeight+1} <button class="btn inline m-auto" autofocus onclick={() => box.scrollIntoView()}>Back to Top</button>{/if}
			<button class="btn inline m-auto" autofocus onclick={() => dialog.close()}>Close</button>
        </div>
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>
