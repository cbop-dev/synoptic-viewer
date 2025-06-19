<script>
    import { mylog } from '$lib/env/env.js';
    import { GospelPericopeGroup, ParallelText } from './parallelTexts.svelte';
    import {gospelParallels} from '@cbop-dev/aland-gospel-synopsis';
    const gospels = gospelParallels.gospels;
    mylog("loading ParTextSecion Compon");
    
    /**
     * @type {{parGroup: GospelPericopeGroup,
     * focus:number,
     * wordClick:function(number):void,
     * cssClassDict:Object,
     * classFunc:function(number):string
     * }}
     */
    let {
        parGroup = new GospelPericopeGroup(),
        focus = gospels.NONE,
        wordClick=(id)=>{},
        cssClassDict={},
        classFunc=(id)=>'',
    } = $props();

    /**
     * @type {{focused: ParallelText|null, cols: ParallelText[]}} colData
     */
    let colData = $derived.by(()=>{

        /**
         * @type {ParallelText|null} focused
         */
        let focused  = null;
        /**
         * @type {ParallelText[]} cols
         */
        let cols = [];
        if (focus==gospels.MATTHEW){
            if (parGroup.matt.textRefs.length){
                focused = parGroup.matt;
                cols = [parGroup.mark,parGroup.luke,parGroup.john];

            }
            
        }
        else if (focus==gospels.MARK){
              if (parGroup.mark.textRefs.length){
                focused = parGroup.mark;
                cols = [parGroup.matt,parGroup.luke,parGroup.john];
            }
        }
        else if (focus==gospels.LUKE){
              if (parGroup.luke.textRefs.length){
                focused = parGroup.luke;
                cols = [parGroup.matt,parGroup.mark,parGroup.john]
            }
        }
        else if (focus==gospels.JOHN){
              if (parGroup.john.textRefs.length){
                focused = parGroup.john;
                cols = [parGroup.matt,parGroup.mark,parGroup.luke]
            }
        }
        else{
            cols = [parGroup.matt,parGroup.mark,parGroup.luke,parGroup.john]
        }
        return {focused: focused, cols: cols.filter((o)=>o.textRefs.length)};

    });

    //let colData =$derived.by([parGroup.matt, parGroup.mark, parGroup.luke, parGroup.john].filter((o)=>o.textRefs.length));
    let otherData= $derived(parGroup.other?.textRefs?.length ? parGroup.other : null);
    let columnStyle = $derived(colData.cols.length ? "!grid-cols-"+colData.cols.length : 'grid-cols-3');
    let numCols=$derived(colData.cols.length ? colData.cols.length : 1)
  //  let columnStyle = $derived("columns-5");
    //let columns=$derived(texts.length && texts.length < 4 ? texts.length : 3);

</script>
{#if focus==gospels.NONE}
    <div 
    class="grid  
    {numCols >=2 ? "sm:grid-cols-2" : ''}
    {
        numCols == 3 ? "md:!grid-cols-3 gap-1" : 
        numCols ==4 ? "lg:!grid-cols-4 gap-1" :
        numCols ==5 ? "lg:grid-cols-5 gap-1" :
        ""
    } grid-cols-1 text-2xl">
    
        {#each colData.cols as col}
        <div class="rounded-box bg-base-200 m-1 p-1">
        {#if col.textRefs.length}
        
            
            {#each col.textRefs as textRef, index}
                {#if index > 0}<br/>{/if}
                <div class="text-left">
                <b>[{textRef.reference}]</b>: 
                {#if textRef.words && textRef.words.length}
                    {#each textRef.words as word}
                        <span class="m-0 {classFunc(word.id)} " onclick={()=>{console.log("word clicked!"); wordClick(word.id)}}>{word.word}{'  '}</span>
                    {/each}
                    {:else}
                    
                    {textRef.text}
                {/if}
                 </div>
                <!--<hr class='border-accent-content'/> -->
            {/each}
            
        
        {/if}
        </div>
    
            
        
        {/each}


    </div>
    {#if otherData}
    <div class="mt-2 p-1">
        {#each otherData.textRefs as textRef, index}
                
                <div class="rounded-box bg-base-200 inline-block m-1 text-left">
                <b>[{textRef.reference}]</b>: 
            {#if textRef.words && textRef.words.length}
                    {#each textRef.words as word}
                        <span class={'m-0 ' + classFunc(word.id)} onclick={()=>{console.log("word clicked!"); wordClick(word.id)}}>{word.word}{'  '}</span>
                    {/each}
                    {:else}
                    
                    {textRef.text}
                {/if}</div>
            {/each}
    </div>
    {/if}
{:else if colData.focused}<!--focusing on one gospel:-->
<div class="grid sm:!grid-cols-2 gap-1 grid-cols-1">
     <div class="rounded-box bg-blue-300  text-3xl">
        {#each colData.focused.textRefs as textRef, index}
        <div class="rounded-box  inline-block m-1 bg-blue-100 text-left">
        <b>[{textRef.reference}]</b>: 
        {#if textRef.words && textRef.words.length}
                    {#each textRef.words as word}
                        <span class={'m-0 ' + classFunc(word.id)} onclick={()=>{console.log("word clicked!"); wordClick(word.id)}}>{word.word}{'  '}</span>
                    {/each}
                    {:else}
                    
                    {textRef.text}
                {/if}
        </div>
        {/each}
     </div>
     <div class="text-2xl">
        {#each colData.cols as col}
        <div class="rounded-box bg-base-200 m-1 text-left">
        {#if col.textRefs.length}
        
            
            {#each col.textRefs as textRef, index}
                {#if index > 0}<br/>{/if}
                <div >
                <b>[{textRef.reference}]</b>: 
                    {#if textRef.words && textRef.words.length}
                    {#each textRef.words as word}
                        <span class={'m-0 ' + classFunc(word.id)} onclick={()=>{console.log("word clicked!"); wordClick(word.id)}}>{word.word}{'  '}</span>
                    {/each}
                    {:else}
                    
                    {textRef.text}
                {/if}
            </div>
                <!--<hr class='border-accent-content'/> -->
            {/each}
            
        
        {/if}
        </div>
    
            
        
        {/each}
        {#if otherData}
        <hr/>
    <div class="mt-2 p-1">
        {#each otherData.textRefs as textRef, index}
                
                <div class="rounded-box bg-base-200 inline-block m-1 text-left">
                <b>[{textRef.reference}]</b>: {textRef.text}</div>
            {/each}
    </div>
    {/if}
     </div>
</div>
{:else}
What?   
{/if}