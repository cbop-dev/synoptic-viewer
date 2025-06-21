<script>
    import { mylog } from '$lib/env/env.js';
    import { GospelPericopeGroup, ParallelText ,Word, TextAndRef,VerseWords} from './parallelTexts.svelte';
    import {gospelParallels} from '@cbop-dev/aland-gospel-synopsis';
    import { ColorUtils } from '$lib/utils/color-utils';
    
    const gospels = gospelParallels.gospels;
    mylog("loading ParTextSecion Compon");
    
    /**
     * @type {{parGroup: GospelPericopeGroup,
     * focus:number,
     * wordClick:function(number):void,
     * cssClassDict:Object,
     * showUnique:boolean
     * uniqueStyle: string, // cssClasses to apply to unique lexemes; default, blank, thus no styling.
     * classFunc:function(number):string
     * }}
     */
    let {
        parGroup = new GospelPericopeGroup(),
        focus = gospels.NONE,
        uniqueStyle='',
        showUnique=false,
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

/**
 * 
 * @param {number} wordid
 * @param {Set<number>} uniqueSet
 * @returns boolean
 */
function isUnique(wordid, uniqueSet){
    const retVal = uniqueSet && uniqueSet.has(wordid);
    if (uniqueSet && uniqueSet.size) 
        0;
      //  mylog("IsUnique("+wordid+", "+Array.from(uniqueSet).join(',')+")--> "+retVal, true)
    return retVal;
}

$inspect("ParTexts, focus:", focus)
</script>
<style>
    @reference "tailwindcss";
    .lex-unique{
        @apply outline-4 pl-0.5 mr-0.5 ;
    }
    .gospel-column-0 span.lex-unique
   {
            @apply outline-red-600   ;
        
    }
    .gospel-column-1 span.lex-unique {
            @apply outline-green-600   ;
        
    }
    .gospel-column-2 span.lex-unique
    {
            @apply outline-blue-600   ;
        
    }
    .gospel-column-3 span.lex-unique {
            @apply outline-fuchsia-600   ;
        
    }
</style>
{#snippet showText(textRef,unique)}
    <b>[{textRef.reference}]</b>: 
                {#if textRef.words && textRef.words.length}
                    {#each textRef.words as verseWords}
                        ({verseWords.verse})
                        {#each verseWords.words as word}
                        {@const  uniqueClass  = (showUnique && unique && isUnique(word.id,unique)) ? 
                        'lex-unique ': ''}
                        <span class="m-0 {classFunc(word.id)} {uniqueClass} " 
                        onclick={()=>{wordClick(word.id)}}>{word.word}{'  '}</span>
                        {/each}
                    {/each}
                {:else}
                    
                    {textRef.text}
                {/if}
{/snippet}
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
    
        {#each colData.cols as col, index}
        <div class="rounded-box bg-base-200 m-1 p-1 gospel-column-{index}">
        {#if col.textRefs.length}
        
            
            {#each col.textRefs as textRef, index2}
            {@const unique = (showUnique && colData.cols.length > 1)? col.unique : null}
                {#if index2 > 0}<br/>{/if}
                <div class="text-left">
                    
                {@render showText(textRef,unique )}
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
                {@render showText(textRef)}</div>
         {/each}
    </div>
    {/if}
{:else if colData.focused}<!--focusing on one gospel:-->
<div class="grid sm:!grid-cols-2 gap-1 grid-cols-1">
     <div class="rounded-box bg-blue-300  text-3xl gospel-column-0">
        {#each colData.focused.textRefs as textRef, index}
        {@const unique = (showUnique && colData.cols.length > 0)? colData.focused.unique : null}
        <div class="rounded-box  inline-block m-1 bg-blue-100 text-left">
        {@render showText(textRef,unique)}
        </div>
        {/each}
     </div>
     <div class="text-2xl gospel-column-unfocused">
        {#each colData.cols as col,index}
        <div class="rounded-box bg-base-200 m-1 text-left gospel-column-{index+1}">
        {#if col.textRefs.length}
        
            
            {#each col.textRefs as textRef, index}
                {#if index > 0}<br/>{/if}
                <div >
                {@render showText(textRef,col.unique)}
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
<!--Nothing!-->  
{/if}