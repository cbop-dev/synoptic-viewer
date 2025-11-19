<script>
    import ButtonSelect from '../ui/ButtonSelect.svelte';
    import { Hotkey,SynopsisHotkeys } from '../ui/hotkeys.svelte';
    import { SynopsisOptions3 } from './SynopsisClasses.svelte';
    let {
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
        titleClasses=['inline-block']
    }=$props();

    
</script>
    
    <svelte:element this={headingTag} class={[titleClasses]}>
     
    {#if short && shorttitle}{shorttitle}
    {:else}
        <span class="sm:inline hidden md:hidden">{mediumtitle ? mediumtitle : shorttitle ? shorttitle : title}</span>
        <span class="md:inline hidden sm:hidden">{title}</span>
    
    
    {/if}</svelte:element> 

        <ul class="bg-white menu menu-horizontal w-auto ">
            
        {#if showResultsButtons}
            
            <li class="m-0 p-0 hidden md:list-item">
                <ButtonSelect buttonText="☰" buttonStyle="btn btn-xs  btn-circle btn-ghost  p-0 ml-0.5" 
                bind:selected={options.viewOptions.menuOpen} tooltip="Expand menu options" tooltipbottom={true}/>
            </li>
        {/if}
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
                    <ButtonSelect buttonText={hk.key} buttonStyle="btn btn-xs btn-circle btn-ghost p-0 ml-0.5"  
                    bind:selected={options.viewOptions[hk.optionName]} tooltipbottom tooltip={hk.name}
                    />
                </li>
        
            {/each}
        {:else}
        {/if}
        
    </ul>
