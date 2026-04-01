<script>
	import NtSynopsisPanel from './NtSynopsisPanel.svelte';
    import CustomParallelViewer from './CustomParallelViewer.svelte';
	import { SynopsisOptions3 } from './SynopsisClasses.svelte.js';
    import CodexAmatt1Wide from '$lib/images/codex-B-matt1-2-trans.png';
    import LinenPng from '$lib/images/black-linen.png';
	import { mylog } from '$lib/env/env';
    import Button from '$lib/components/ui/Button.svelte';
    import {getServer, sbl as sblServer, n1904 as n1904Server, vulgate as vulgateServer, web as webcServer} from '$lib/tf/tfServer.js'
    import { N1904Server } from '$lib/n1904/tfN1904';
    import { SblGntServer } from '$lib/sblgnt/sblgnt';
    //import {gospelParallels} from '@cbop-dev/aland-gospel-synopsis';
    //import { LexPhraseAndLocations, ParallelColumnGroup } from './parallelTexts.svelte';
//    import {Button} from '../ui/Button.svelte';
    import { TfServer } from './TfUtils';
	import ButtonSelect from '../ui/ButtonSelect.svelte';
    import Modal2 from '../ui/Modal2.svelte';
    import Footer from './Footer.svelte';
    import ArrowTop from '../ui/icons/arrow-top-icon.svelte';
    import ArrowDown from '../ui/icons/arrow-down.svelte';
    import SiteInfo from './SiteInfo.svelte';
    //import ModalButton from '../ui/ModalButton.svelte';
    //import grainTexture from '$lib/images/black-linen.png';
    

    let showInfoModal = $state(false);
    let y = $state();
    let windowHeight=$state();
    let contentHeight = $state();
    const bgApp="#DCCFB0";
    const bgContent="#f4f0e6";

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
            {abbrev: 'vulgate', name: "Latin Vulgate", server: vulgateServer},
            {abbrev: 'web', name: "World English Bible (Catholic)", server: webcServer},
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
       {name: 'Gospels', short:"Gos",
        comp: NtSynopsisPanel},
        
       {name:'Custom', short:"Cust",
       comp: CustomParallelViewer}
       
    ]

    const hotkeys={
       // 'i':()=>{showInfoModal=!showInfoModal}
    }
    let selectedPane=$state(options.request.tab ? options.request.tab : 0);
    
    let keyEvents=$state([null,null])

    function onkeydown(event,ignoreCtrl=true){
        //mylog(`SynHome onkeydown=${event}`,true);
        if((!event.ctrlKey || !ignoreCtrl) && enableKeys) {
                    const key=event.key;
            if(Object.keys(hotkeys).includes(key)){
                hotkeys[key]();
            }
            else if(selectedPane >= 0 && selectedPane < keyEvents.length){
                keyEvents[selectedPane]=event;
            }
        }

    }
    let showNTselect=$state(false);

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
   //$inspect(`options: viewOptions.similarPhrases=${options.viewOptions.similarPhrases}`)
</script>

{#snippet appTitle(headingTag="h1")}
    <svelte:element this={headingTag}><a href="/">NT Gospel Synopsis Viewer</a></svelte:element> 
{/snippet}
{#snippet appSummary(heading=true,headingTag="h1")}

    {#if heading}
        {@render appTitle(headingTag)}
        <hr/>
    {/if}
    
    <SiteInfo/>
{/snippet}
<svelte:window bind:scrollY={y} bind:innerHeight={windowHeight} onkeydown={onkeydown}/>
<div id="app-container" style="--codex-img: url('{CodexAmatt1Wide}'); --bg-app: {bgApp}; --bg-content: {bgContent};">
<div id="main-wrap" style="--bgCodex: url('{CodexAmatt1Wide}'); --bgLinen: url('{LinenPng}');">
<!--<img id="main-bg" src='{CodexAmatt1Wide}' alt='Codex Vaticanus: Matt 1'/>-->
<div id="main-bg"></div>
<div id="main-content" class="relative" bind:clientHeight={contentHeight} >


    <div id="top-tab-bar" class="block top-1 left-0 z-100 w-full text-right fixed" bind:clientHeight={headerHeight}>
        
        
        <div id="tabs" role="tablist" class="inline-block float-left top-0 tabs tabs-lifted">
            {#each panes as pane, index}
            <a role="tab" class="tab {selectedPane==index ? 'tab-active' : ''} " tabindex={index} onclick={()=>{selectedPane=index}} >
                <span class="sm:inline hidden">{pane.name}</span><span class="inline sm:hidden">{pane.short}</span></a>
            {/each}
        </div>
        <div class="inline-block mr-1 mt-1">
            
				
            
            <ButtonSelect buttonText="i" 
       buttonStyle="btn btn-xs  btn-circle btn-ghost  p-0" bind:selected={showInfoModal} tooltip="Show site info" tooltipbottom={true}/> 
       <ButtonSelect buttonStyle="btn btn-xs rounded   btn-square  p-0.5 m-0" 
            bind:selected={enableKeys} buttonText="k" tooltip="Enable/disable hotkeys" tooltipbottom={true}/> 
            <ButtonSelect buttonText={`☰ ${currentServerName}`} 
       buttonStyle="btn btn-xs  btn-round btn-ghost   p-0.5 m-0" bind:selected={showNTselect} tooltip="Select NT version" tooltipbottom={true}/>
            
        </div>

        {#if showNTselect}
        <div id="version-select-panel" class="blockitems-center absolute right-0 m-2 p-5  rounded-2xl outline-2">
            

            <label for="ntversion" class="hidden md:inline m-0 p-0 text-sm">NT version:</label>
            <select name="ntversion" class="m-2 ml-1 mr-1 p-1 text-sm" bind:value={currentServerName}>
                {#each myServers.list as serverOption, index}
                <option value={serverOption.abbrev}>{serverOption.name}</option>
                {/each}
            </select> <br class="hidden md:block"/>
            <span class="italic text-sm hidden md:inline-block">Takes effect after submitting a new query.</span>
            <Button tooltip="Close" 
			buttonStyle="btn btn-xs btn-circle m-0 b-0 float-right  tooltip-left absolute top-0 right-0 " 
			buttonColors="bg-gray-500 text-white"
			onclick={()=>{showNTselect=false}}
			buttonText="✕"
			/>
            <!--<Button buttonText="Switch!" textSize="text-sm" buttonStyle="btn btn-ghost btn-xs" onclick={switchNT}/>-->
        </div>
        {/if}
    
     </div>
    
    <div id="main-panes" class="clear-right relative block mt-40">
    {#each panes as pane, index}

    <div id="pane-{pane.name}" class={index==selectedPane ? 'block' : 'hidden'}>
            
            {#if options.request.tab==index}
            <pane.comp options={options.copy()} live={index==selectedPane} tfServer={tfServer} keyevent={keyEvents[index]} --bg-app={bgApp} --bg-content={bgContent}/>
            {:else}
            <pane.comp live={index==selectedPane} tfServer={tfServer} keyevent={keyEvents[index]} --bg-app={bgApp} --bg-content={bgContent}/>
            {/if}
            
        
    </div>
    {/each}

    </div>
    

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
</div>
<style>
    #app-container{
        /*--bg-app: #e2decb;*/
        --bg-content: var(--bg-content,#dfbc6b);
        --bg-app: var(--bg-app,#DCCFB0);
        --bg-opacity: 0.2;
        --bg-saturation: 1.3;
        --bg-brightness: 160%;
        --bg-contrast: 0.4;
        min-height: 100vh;
        background-color: var(--bg-app);
        background-image: var(--codex-img);
        background-size: 100%;
        background-repeat: no-repeat;
        background-position: center;
        background-attachment: fixed;
        padding: 2rem;
        font-family: 'SBL BibLit', 'Gentium Plus', 'Times New Roman', serif;
        transition: background-color 0.4s ease;
        background-blend-mode:soft-light;
        
    }
     @reference "tailwindcss";
/*     @reference "../../../app.css"*/
     

    .tabs .tab-active {
        @apply bg-blue-300;
        
        font-weight: bold;
    }

    .tab {
        height: auto;
        
    }
    #main-content{
        position:  relative;
    }
    #main-wrap{
        overflow:hidden;
        position:relative;
        
        /*background-color: var(--bg-app);
        background-image: var(--bgCodex), var(--bgLinen);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        background-blend-mode:multiply;*/


    }
    #maiddn-bg {
        background-color: var(--bg-app);
        background-image: var(--bgCodex), var(--bgLinen);
        background-size: cover;
        background-position: center;
        content:"";
        background-repeat: no-repeat;
        background-attachment: fixed;
        background-blend-mode:multiply;
        position: absolute;
        left: 0; 
        right: 0;
        width: 100%;
        height: 100%;
        filter: opacity(var(--bg-opacity)) saturate(var(--bg-saturation)) brightness(var(--bg-brightness));
    }

#top-tab-bar{
    background-color: white;
}
#version-select-panel{
    background-color: color-mix(in srgb, var(--secondary-bg) 60%, transparent 40%);
}

</style>