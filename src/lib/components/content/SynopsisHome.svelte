<script>
	import NtSynopsisPanel from './NtSynopsisPanel.svelte';
    import CustomParallelViewer from './CustomParallelViewer.svelte';
	import { SynopsisOptions3 } from './SynopsisClasses.svelte.js';
	import { mylog } from '$lib/env/env';
    import {getServer, sbl as sblServer, n1904 as n1904Server} from '$lib/tf/tfServer.js'
    import { N1904Server } from '$lib/n1904/tfN1904';
    import { SblGntServer } from '$lib/sblgnt/sblgnt';
    
    import Button from '../ui/Button.svelte';
    import { TfServer } from './TfUtils';
	import ButtonSelect from '../ui/ButtonSelect.svelte';
    import Modal2 from '../ui/Modal2.svelte';
    import Footer from './Footer.svelte';
    import ArrowTop from '../ui/icons/arrow-top-icon.svelte';
    import ArrowDown from '../ui/icons/arrow-down.svelte';
    let showInfoModal = $state(false);
    let y = $state();
    let windowHeight=$state();
    let contentHeight = $state();

    /**
     * @type {{options:SynopsisOptions3}}
     */
    let {
        options=new SynopsisOptions3(),
    } = $props();

    mylog("<SynopHome> options:");
    mylog(options);
    
    let headerHeight = $state();
    const myServers={
        list: [
            {abbrev: 'sblgnt', name: "SBL Greek NT", server: sblServer},
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

    let currentServerName = $state(myServers.lookup(options.request.nt) ? options.request.nt : myServers.list[0].abbrev);
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

    const hotkeys={
        'i':()=>{showInfoModal=!showInfoModal}
    }
    let selectedPane=$state(options.request.tab ? options.request.tab : 0);
    
    let keyEvents=$state([null,null])

    function onkeydown(event){
        if(enableKeys) {
                    const key=event.key;
            if(Object.keys(hotkeys).includes(key)){
                hotkeys[key]();
            }
            else if(selectedPane >= 0 && selectedPane < keyEvents.length){
                keyEvents[selectedPane]=event;
            }
        }

    }

    let enableKeys=$state(true);
    /**
     * @param {number} index 
    */
    /*function switchNT(){
        if ((currentServerName != serverUserSelectField) 
            && myServers.lookup(currentServerName)){
            currentServerName=serverUserSelectField;
        }
    }*/
   $inspect(`options: typeof='${typeof options}'; viewOptions.keys=['${Object.keys(options.viewOptions).join("','")}']`)
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
{#snippet appTitle(headingTag="h1")}
    <svelte:element this={headingTag}>NT Gospel Synopsis Viewer</svelte:element> 
{/snippet}
{#snippet appSummary(heading=true,headingTag="h1")}

    {#if heading}
        {@render appTitle(headingTag)}
        <hr/>
    {/if}
    
    Based on Kurt Aland's <i>Synopsis Quattuor Evangeliorum</i>, using <a href="https://www.sblgnt.com">The SBL Greek New Testament (2010)</a> or, optionally, Nestle's 1904 edition of the <i>Greek New Testament.</i>
{/snippet}
<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} onkeydown={onkeydown}/>

<div class="relative" bind:clientHeight={contentHeight}>
    <div class="sticky block top-0 z-100 bg-white/70 text-center" bind:clientHeight={headerHeight}>
        <div class="inline-block float-right">
            

            <label for="ntversion" class="hidden md:inline m-0 p-0 text-sm">NT version:</label>
            <select name="ntversion" class="m-0 ml-1 mr-1 p-0 text-sm" bind:value={currentServerName}>
                {#each myServers.list as serverOption, index}
                <option value={serverOption.abbrev}>{serverOption.name}</option>
                {/each}
            </select>
            <!--<Button buttonText="Switch!" textSize="text-sm" buttonStyle="btn btn-ghost btn-xs" onclick={switchNT}/>-->
        </div>
        
        <div role="tablist" class="inline-block float-left tabs tabs-lifted">
            {#each panes as pane, index}
            <a role="tab" class="tab {selectedPane==index ? 'tab-active' : ''} " tabindex=index onclick={()=>{selectedPane=index}} >{pane.name}</a>
            {/each}
        </div>
        <div class="inline-block text-center">
            <ButtonSelect buttonText="i" 
       buttonStyle="btn btn-xs  btn-circle btn-ghost  p-0" bind:selected={showInfoModal} tooltip="Show site info" tooltipbottom={true}/>
            <ButtonSelect buttonStyle="btn btn-xs rounded   btn-square btn-ghost  p-1" 
            bind:selected={enableKeys} buttonText="k" tooltip="Enable/disable hotkeys" tooltipbottom={true}/>
                
            
        </div>
    
    </div>
    
    <div class="clear-right block btn-square">
    {#each panes as pane, index}

    <div id="pane-{pane.name}" class={index==selectedPane ? 'block' : 'hidden'}>
        
            <pane.comp options={options} live={index==selectedPane} tfServer={tfServer} keyevent={keyEvents[index]}/>
        
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
<div class="fixed bottom-0 right-0 z-100 mr-1 mb-1"><!--up//downarros-->



{#if y>100}
    <div class="block">
        <a href="#"  class="inline bg-white/60 border-slate-400/80 border-1 p-0.5 rounded-lg" title="Top"><ArrowTop height={20} width={20}/></a>
    </div>
{/if}
{#if (y <= contentHeight-windowHeight) && (windowHeight < contentHeight-10) }
    <div class="block">
    <a href="#bottom-div"  class="inline bg-white/60 border-slate-400/80 border-1 p-0.5 rounded-lg" title="Bottom">
        <ArrowDown height={20} width={20}/></a>
    </div>
{/if}
    
</div>
<Modal2 bind:showModal={showInfoModal}>
    <div class="text-left m-auto inline">
        {@render appSummary()}
        <hr/>
        <div class="italic text-sm">
        <Footer/>
        </div>
    </div>    
</Modal2>

<div id="bottom-div"></div>