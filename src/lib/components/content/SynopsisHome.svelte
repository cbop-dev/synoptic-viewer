<script>
	import NtSynopsisPanel from './NtSynopsisPanel.svelte';
    import CustomParallelViewer from './CustomParallelViewer.svelte';
	import { SynopsisOptions,getRequestParamsObj,generateURL } from './SynopsisClasses';
	import { mylog } from '$lib/env/env';
    import {getServer, sbl as sblServer, n1904 as n1904Server} from '$lib/tf/tfServer.js'
    import { N1904Server } from '$lib/n1904/tfN1904';
    import { SblGntServer } from '$lib/sblgnt/sblgnt';
    import Button from '../ui/Button.svelte';
    import { TfServer } from './TfUtils';
	
    let {
        options=null,
    } = $props();

    mylog("<SynopHome> options:");
    mylog(options);
    

    const myServers={
        list: [
            {abbrev: 'sblgn', name: "SBL Greek NT", server: sblServer},
            {abbrev: 'n1904', name: "Nestle's 1904 GNT", server: n1904Server},
        ],
        
        /**
         * 
         * @param {string} abbrev
         * @returns {TfServer|undefined}
         */
        lookup(abbrev){
            return this.list.find((server)=>server.abbrev == abbrev)?.server
        }

    }

    let currentServerName = $state(myServers.lookup(options.nt) ? options.nt : myServers.list[0].abbrev);
  //  let serverUserSelectField = $state(currentServerName);
    
    
    /**
     * @type {TfServer|N1904Server|SblGntServer}
     */
    let tfServer=$derived(myServers.lookup(currentServerName) ? myServers.lookup(currentServerName) : myServers.list[0].server);
    //let tfServer=$state(getServer());
   // let { data=null } = $props();
    
    const panes=[
       {name: 'Gospels', 
        comp: NtSynopsisPanel},
       {name:'Custom', 
       comp: CustomParallelViewer}
    ]
    let selectedPane=$state(options.tab && parseInt(options.tab) ? parseInt(options.tab) : 0);
    
    /**
     * @param {number} index 
    */
    /*function switchNT(){
        if ((currentServerName != serverUserSelectField) 
            && myServers.lookup(currentServerName)){
            currentServerName=serverUserSelectField;
        }
    }*/
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
<div class="relative">
<div class="sticky z-50 pt-0.5"> 
<div class="inline-block float-right">
    <label for="ntversion" class="hidden md:inline m-0 p-0 text-sm">NT version:</label>
    <select name="ntversion" class="m-0 ml-1 mr-1 p-0 text-sm" bind:value={currentServerName}>
        {#each myServers.list as serverOption, index}
        <option value={serverOption.abbrev}>{serverOption.name}</option>
        {/each}
    </select>
     <!--<Button buttonText="Switch!" textSize="text-sm" buttonStyle="btn btn-ghost btn-xs" onclick={switchNT}/>-->
    </div>
   
<div role="tablist" class="tabs tabs-lifted">
    {#each panes as pane, index}
    <a role="tab" class="tab {selectedPane==index ? 'tab-active' : ''} " tabindex=index onclick={()=>{selectedPane=index}} >{pane.name}</a>
    {/each}
</div>
</div>

<div class="clear-right block">
{#each panes as pane, index}

 <div id="pane-{pane.name}" class={index==selectedPane ? 'block' : 'hidden'}>
    
        <pane.comp options={options} live={index==selectedPane} tfServer={tfServer}/>
    
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

</div>

</div>