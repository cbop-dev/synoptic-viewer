<script>
    import { mylog } from '$lib/env/env.js';
    import { GospelPericopeGroup, ParallelText } from './parallelTexts.svelte';
    mylog("loading ParTextSecion Compon");
    
    /**
     * @type {{parGroup: GospelPericopeGroup}}
     */
    let {
        parGroup = []
    } = $props();

    /**
     * @type {ParallelText[]} colData
     */
    let colData =$derived([parGroup.matt, parGroup.mark, parGroup.luke, parGroup.john,parGroup.other].filter((o)=>o.textRefs.length));
    let columnStyle = $derived(colData.length ? "!grid-cols-"+colData.length : 'grid-cols-3');
    let numCols=$derived(colData.length ? colData.length : 1)
  //  let columnStyle = $derived("columns-5");
    //let columns=$derived(texts.length && texts.length < 4 ? texts.length : 3);

</script>

<div 
class="grid  
{numCols >=2 ? "sm:grid-cols-2" : ''}
{numCols == 2 ? "md:grid-cols-2 gap-1" :
    numCols == 3 ? "md:grid  grid-cols-3 gap-1" : 
    numCols ==4 ? "lg:grid-cols-4 gap-1" :
    numCols ==5 ? "lg:grid-cols-5 gap-1" :
    ""
} grid-cols-1">
    {#each colData as col}
    {#if col.textRefs.length}
    <div >
        
        {#each col.textRefs as textRef, index}
            {#if index > 0}<br/>{/if}
            <div class="rounded-box bg-base-200">
            <b>[{textRef.reference}]</b>: {textRef.text}</div>
             <!--<hr class='border-accent-content'/> -->
        {/each}
        
    </div>
    {/if}
    {/each}


</div>
