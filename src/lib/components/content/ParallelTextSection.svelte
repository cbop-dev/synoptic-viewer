<script>
    import { mylog } from '$lib/env/env.js';
    import { GospelPericopeGroup, ParallelText ,Word, TextAndRef,VerseWords,stripWord} from './parallelTexts.svelte';
    import {gospelParallels} from '@cbop-dev/aland-gospel-synopsis';
    import { ColorUtils } from '$lib/utils/color-utils';
    import CopyText     from '../ui/CopyText.svelte';
    import { GreekUtils } from '$lib/utils/greek-utils';
    
    const gospels = gospelParallels.gospels;
    mylog("loading ParTextSecion Compon");
    
    /**
     * @type {{parGroup: GospelPericopeGroup,
     * focus:string,
     * wordClick:function(number):void,
     * showIdentical:boolean,
     * cssClassDict:Object,
     * cssCustomDict:Object,
     * showUnique:boolean,
     * }}
     */
    let {
        parGroup = new GospelPericopeGroup(),
        focus = '',
        showUnique=false,
        showIdentical=true,
        wordClick=(id)=>{},
        cssClassDict={},
        cssCustomDict={}
        
    } = $props();

  
    /**
     * @type {{focused: boolean, cols: ParallelText[], focusIndex: number}} colData
     */
    let colData = $derived.by(()=>{

        /**
         * @type {boolean} focused
         */
        let focused  = false;

        let focusIndex=0;
        /**
         * @type {string[]} bgClasses
         */
       // let bgClasses=[];
        /**
         * @type {ParallelText[]} cols
         */
        let cols = [parGroup.matt, parGroup.mark,parGroup.luke,parGroup.john];
        if (focus==gospels.names.MATTHEW){
            if (parGroup.matt.textRefs.length){
                focusIndex = 0;
                focused=true;            
            }
            
        }
        else if (focus==gospels.names.MARK){
              if (parGroup.mark.textRefs.length){
                 focusIndex = 1;
                    focused=true; 
               // bgClasses=['mark','matt','luke','john'];
            }
        }
        else if (focus==gospels.names.LUKE){
              if (parGroup.luke.textRefs.length){
                focusIndex = 2;
                focused=true; 
            }
        }
        else if (focus==gospels.names.JOHN){
              if (parGroup.john.textRefs.length){
                focusIndex = 3;
                focused=true; 
            }
        }
       

        //const colsBooks=getNonEmptyGospelColsAndBgClasses(cols)
        return {focused: focused, cols: cols, focusIndex:focusIndex};

    });



    

    //let colData =$derived.by([parGroup.matt, parGroup.mark, parGroup.luke, parGroup.john].filter((o)=>o.textRefs.length));
    let otherData= $derived(parGroup.other?.textRefs?.length ? parGroup.other : null);
    let numCols=$derived(colData.cols.filter((col)=>col.textRefs && col.textRefs.length).length)
    let columnStyle = $derived(numCols ? "!grid-cols-"+numCols : 'grid-cols-3');

   
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
function getText(words){
    return words.reduce((a,b)=>a ? a +' '+b.word : b.word, '')
}
//$inspect("ParTexts, focus:", focus)
//$inspect("numCols", numCols, "colData:", colData)
//$inspect("ParText, customClass", cssCustomDict);
</script>
<style>
    @reference "tailwindcss";
    .Matt {
        @apply bg-red-50 border-red-900 border-4;
    }

    .Mark {
        @apply bg-lime-50 border-lime-900 border-4;
    }

    .Luke{
        @apply bg-sky-50 border-sky-900 border-4;
    }

    .John{
        @apply bg-violet-50 border-violet-900 border-4;
    }
    
    .other{
        /*@apply bg-base-200;*/
    }
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

{#snippet showText(textRef,unique,numCols,copyButton=true)}
    <span class="font-bold">[{#if copyButton}
        <CopyText copyText={textRef.reference} 
        linkText={textRef.reference}
        btnSizeCssClass="text-xl m-0 p-0 hover:link"
        tooltip="Copy reference to clipboard."
        showButton={false}
        />
        {:else}
        {textRef.reference}
    {/if}]</span>: 
                {#if textRef.words && textRef.words.length}
                    {#each textRef.words as verseWords}
                        {#if copyButton}
                            <CopyText getTextFunc={()=>getText(verseWords.words)}
                            linkText={'(' + verseWords.verse+')'} 
                            showButton={false}
                            tooltip={'Copy verse '+verseWords.verse}/>
                         {:else}
                            ({verseWords.verse})
                        {/if}
                        {#each verseWords.words as word}
                       
                        {@const wordCssClass=cssClassDict[word.id]}
                        {@const plainGreek=GreekUtils.plainGreek(word.word).toLocaleLowerCase().trim()}
                        {@const customClassLookup=cssCustomDict[plainGreek]}
                        {@const customClass= customClassLookup ? customClassLookup : ''}
                        <span 
                        class={["m-0 word", "lex-" + word.id, 
                            showUnique && unique && isUnique(word.id,unique) && 'lex-unique', 
                            wordCssClass, customClass, plainGreek,
                            showIdentical && wordCssClass && parGroup.matchingWords.includes(stripWord(word.word)) && 'underline font-bold']} 
                        onclick={()=>{wordClick(word.id)}}>{word.word}{'  '}</span>
                        {/each}
                    {/each}
                {:else if textRef.text}
                    
                    {textRef.text}
                {:else}
                    <i class="text-sm">(Not found in Nestle 1904)</i>
                {/if}
        {#if copyButton && textRef.text}
            <CopyText copyText={textRef.text} tooltip='Copy pericope'/>
        {/if}
{/snippet}
{#if !focus}
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

        {#if col.textRefs && col.textRefs.length}
            <div class="rounded-box  {Object.values(gospels.abbreviations)[index]} m-1 p-2 gospel-column-{index}">
            {#if col.textRefs.length}
            
                
                {#each col.textRefs as textRef, index2}
                
                {@const unique = (showUnique && numCols > 1)? col.unique : null}
                    {#if index2 > 0}<br/>{/if}
                    <div class="text-left">
                        
                    {@render showText(textRef,unique )}
                    </div>
                    <!--<hr class='border-accent-content'/> -->
                {/each}
                
            
            {/if}
            </div>
        
                
        {/if}
        {/each}


    </div>
    {#if otherData}
    <div class="mt-2 p-2">
        {#each otherData.textRefs as textRef, index}
                
                <div class="rounded-box bg-base-200 inline-block m-1 text-left">
                {@render showText(textRef)}</div>
         {/each}
    </div>
    {/if}
{:else if colData.focused}<!--focusing on one gospel:-->
<div class="grid {numCols > 1 ? 'sm:!grid-cols-2' :''} gap-1 grid-cols-1">
     <div class="rounded-box   text-3xl gospel-column-0">
        {#each colData.cols[colData.focusIndex].textRefs as textRef, index}
        
        {@const unique = (showUnique && numCols > 1)? colData.cols[colData.focusIndex].unique : null}
        <div class="rounded-box  inline-block p-2 m-1 {Object.values(gospels.abbreviations)[colData.focusIndex]} text-left">
        {@render showText(textRef,unique)}
        </div>
        {/each}
     </div>
     {#if numCols >1}
     <div class="text-2xl gospel-column-unfocused">
        {#each colData.cols as col,index}
        {#if index!=colData.focusIndex}
        {#if col.textRefs.length}
        
             <div class="rounded-box {Object.values(gospels.abbreviations)[index]} m-1 text-left gospel-column-{index+1} p-2">
       
            {#each col.textRefs as textRef, index}
                {#if index > 0}<br/>{/if}
                <div >
                {@render showText(textRef,col.unique)}
                </div>
                <!--<hr class='border-accent-content'/> -->
            {/each}
            
            </div>
        {/if}
        
    
            
        {/if}
        {/each}
        {#if otherData}
        <hr/>
    <div class="mt-2 p-1">
        {#each otherData.textRefs as textRef, index}
                
                <div class="rounded-box bg-base-200 inline-block m-1 text-left">
                {@render showText(textRef)}
                </div>
            {/each}
    </div>
    {/if}
     </div>
     {/if}
</div>
{:else}
<!--Nothing!-->  
{/if}