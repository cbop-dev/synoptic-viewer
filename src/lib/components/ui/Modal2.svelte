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
	
	</script>
	
	<div class="bg-gray-100"></div>
	<dialog class="modal" class:modal-open={showModal} 
	onclose={() => (showModal = false)} >
	{#key max && showModal}
		<div class="modal-box {max ? "w-full max-w-full h-full max-h-full" : ""}" data-theme="winter">
		<form method="dialog">
			<Button tooltip="Close" 
			buttonStyle="btn btn-sm btn-circle m-0 b-0 float-right top-2" 
			buttonColors="bg-gray-500 text-white"
			onclick={()=>{showModal=false}}
			buttonText="✕"
			/>
			
			<OptionButton bind:selected={max} buttonText="⤢" buttonStyle="btn btn-circle m-0 b-0 btn-ghost float-right top-2"
			tooltip="Maximize/Minimize" 
			buttonSize="btn-sm"/>
		</form>
		<div class="block items-center text-center">
			 {#if title}<h1>{title}</h1>
		
			<hr/>
			{/if}
		</div>
			{@render children()}
			
	<hr/>
			<form method="dialog" class="text-center">
				<button class="btn btn-med btn-circle " onclick={()=>{showModal=false}}>Ok</button>
			</form>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={()=>{showModal=false}}>close</button>
		  </form>
	{/key}
	</dialog>