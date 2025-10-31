<script>
	import NtSynopsisPanel from './NtSynopsisPanel.svelte';
    import CustomParallelViewer from './CustomParallelViewer.svelte';
	
    let {
        request
    } = $props();

    
   // let { data=null } = $props();
    
    const panes=[
       {name: 'Gospels', 
        comp: NtSynopsisPanel},
       {name:'Custom', 
       comp: CustomParallelViewer}
    ]
    let selectedPane=$state(0);
</script>
<style>
     @reference "tailwindcss";
/*     @reference "../../../app.css"*/
     

    .tabs .tab-active {
        @apply bg-blue-300;
        
        font-weight: bold;
    }

    .tab {
        height: auto;
        
    }
</style>

<div role="tablist" class="tabs tabs-lifted">
    {#each panes as pane, index}
    <a role="tab" class="tab {selectedPane==index ? 'tab-active' : ''} " tabindex=index onclick={()=>{selectedPane=index}} >{pane.name}</a>
    {/each}
    
  </div>
{#each panes as pane, index}
 <div id="pane-{pane.name}" class={index==selectedPane ? 'block' : 'hidden'}>
   <pane.comp request={request} live={index==selectedPane}/>
 </div>
{/each}
<!--

<div class={panes[selectedPane]=='Gospels' ? 'block' : 'hidden'}>
<NtSynopsisPanel/>
</div>

<div class={panes[selectedPane]=='Custom' ? 'block' : 'hidden'}>
<CustomParallelViewer/>
</div>

-->