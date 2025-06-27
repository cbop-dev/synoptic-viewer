<script>
	import OptionButton from "./SelectButtons/OptionButton.svelte";
	import Button from "./Button.svelte";
	let {
			showModal = $bindable(),
			title='',
			onclose=()=>{}, 
			children
	} = $props();
	let max=$state(false);
	let dialog = $state();
	$effect(() => {
		if (showModal) dialog.showModal();
        else
			dialog.close();
	});
	</script>
	<style>
		@reference "tailwindcss";
		hr {
			@apply border-slate-400 m-2;
		}
	</style>
	
	<div class=" bg-gray-100"></div>
	<dialog bind:this={dialog} class="modal max-w-full" 
	class:modal-open={showModal}
	onclose={() => {showModal = false}} 
	
	
	
	>
	{#key max && showModal}
		<div class="modal-box {max ? "w-full max-w-full h-full " : "md:max-w-3/4"} max-w-full" data-theme="winter">
		
		<div class="absolute top-2 right-1">	<form method="dialog">
			<Button tooltip="Close" 
			buttonStyle="btn btn-sm btn-circle m-0 b-0 float-right top-2 tooltip-left" 
			buttonColors="bg-gray-500 text-white"
			onclick={()=>{showModal=false}}
			buttonText="✕"
			/>
			
			<OptionButton bind:selected={max} buttonText="⤢" 
			buttonStyle="btn btn-circle m-0 b-0 btn-ghost float-right top-2 tooltip-left"
			tooltip="Maximize/Minimize" 
			buttonSize="btn-sm"/>
		</form>
		</div>
		<div class="block items-center text-center">
			 {#if title}<h1>{title}</h1>
		
			<hr/>
			{/if}
		</div>
			{@render children()}
			
	<hr />
			<form method="dialog" class="text-center">
				<button class="btn btn-med btn-circle " onclick={()=>{showModal=false}}>Ok</button>
			</form>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={()=>{showModal=false}}>close</button>
		  </form>
	{/key}
	</dialog>