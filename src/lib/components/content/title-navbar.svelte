<script>
    import ButtonSelect from '../ui/ButtonSelect.svelte';
    import { Hotkey,SynopsisHotkeys } from '../ui/hotkeys.svelte';
    import { SynopsisOptions3 } from './SynopsisClasses.svelte';
    import ModalButton from '../ui/ModalButton.svelte';
    import {gospelParallels} from '@cbop-dev/aland-gospel-synopsis';
    import { LexPhraseAndLocations, ParallelColumnGroup } from './parallelTexts.svelte';
	import Modal from '../ui/Modal.svelte';
    import Modal2 from '../ui/Modal2.svelte';
import MatchColorsKey from './MatchColorsKey.svelte';    
     /**
     * @type {{hotkeys:SynopsisHotkeys,
     * title:string,
     * 
     * }}
     */
    
    let {
        /**
         * @type {SynopsisHotKey[]} hotkeys
        */ 
        hotkeys=new SynopsisHotkeys(),
        options=$bindable(new SynopsisOptions3()),
        title,
        longtitle='',
        mediumtitle='',
        shorttitle='',
        veryshirttitle='',
        showResultsButtons=false,
        viewStates=$bindable(),
        hideHelp=false,
        hideLookup=false,
        headingTag="h1",
        short=false,
        //shortBoundary='sm',
        titleClasses=['inline-block'],
        useGospels=true
    }=$props();

    let showColorsModal=$state(false);
    
</script>
    
     {#if showResultsButtons}
            
            
                <ButtonSelect buttonText="☰" buttonStyle="btn  btn-ghost btn-circle btn-sm p-0 pr-1 m-0 pl-1 ml-0.5" 
                bind:selected={options.viewOptions.menuOpen} tooltip="Expand menu options" tooltipbottom={true}/>
            
        {/if}
    <svelte:element this={headingTag} class={[titleClasses]}>
    
    {#if short && shorttitle}{shorttitle}
    {:else}
        {@const extraTitleclasses=['text-shadow-sm/20']}
        <span class={["sm:hidden inline text-nowrap",extraTitleclasses]}>{ shorttitle ? shorttitle: mediumtitle ? mediumtitle : title}</span>
        <span class={["sm:inline md:hidden text-nowrap hidden",extraTitleclasses]}>{mediumtitle ? mediumtitle : shorttitle ? shorttitle : title}</span>
        <span class={["md:inline hidden ",extraTitleclasses]}>{title}</span>
    
    
    {/if}</svelte:element> 

        <ul class="bg-white menu menu-horizontal w-auto">
            
        
        <li><ButtonSelect buttonText="?" buttonStyle="btn btn-xs btn-circle btn-ghost p-0 ml-0.5" 
            bind:selected={viewStates.views.help.state} tooltipbottom tooltip="Show help."/>
            </li>
        <li >
            <ButtonSelect bind:selected={viewStates.views.lookup.state} buttonText="" tooltipbottom
            buttonStyle="btn btn-xs btn-circle btn-ghost p-0 ml-0.5" >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            </ButtonSelect>
        </li>
         {#if showResultsButtons && !options.viewOptions.menuOpen}   
              {#each hotkeys.getNavButtonKeys() as hk}
              
                <li class={[showResultsButtons? 'sm:list-item': '', 'hidden' ]}>
                    <ButtonSelect buttonText={hk.key} buttonStyle={"btn btn-xs btn-circle btn-ghost p-0 ml-0.5 text-md " +( hk.navKeyClasses ? hk.navKeyClasses  : '')}  
                    bind:selected={options.viewOptions[hk.optionName]} tooltipbottom tooltip={hk.description ? hk.description : hk.name}
                    />
                </li>
        
            {/each}
            {#if useGospels && (options.viewOptions.similarPhrases || options.viewOptions.exactPhrases)}
            
            <li class={[showResultsButtons? 'sm:list-item': '', 'hidden' ]}>
                <ButtonSelect buttonText="Colors" buttonStyle="btn btn-xs  btn-ghost p-0 ml-0.5 text-md "
            bind:selected={showColorsModal} tooltipbottom tooltip="Show Matching Colors Key"/>
            
            </li>

        {/if}
        {:else}
        {/if}
        
         
    </ul>


    <Modal2 bind:showModal={showColorsModal} title="Matching Colors Key">
       <MatchColorsKey {useGospels}/>
    </Modal2>