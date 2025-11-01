<script>
    import { mylog } from '$lib/env/env.js';
    import {ParallelTextGroup, ParallelText ,Word, TextAndRef,VerseWords,stripWord} from './parallelTexts.svelte.js';
        import { ColorUtils } from '$lib/utils/color-utils';
    import CopyText     from '../ui/CopyText.svelte';
    import { GreekUtils } from '$lib/utils/greek-utils';
    
   
    
   
    
    /**
     * @type {{parTextGroup: ParallelTextGroup,
     * wordClick:function(number):void,
     * showIdentical:boolean,
     * cssClassDict:Object,
     * cssCustomDict:Object,
     * showUnique:boolean,
     * highlightOnClick:boolean
     * }}
     */
    let {
        parTextGroup = new ParallelTextGroup(),
        showUnique=false,
        showIdentical=true,
        wordClick=(id)=>{},
        cssClassDict={},
        cssCustomDict={},
        highlightOnClick=true
        
    } = $props();

  
   
    let numCols=$derived(parTextGroup.parallelTexts.length)
 
    
    let columnStyle = $derived('grid-cols-'+numCols);

   
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
    .column-1 {
        @apply bg-red-50 border-red-900 border-4;
    }

    .column-2 {
        @apply bg-lime-50 border-lime-900 border-4;
    }

    .column-3{
        @apply bg-sky-50 border-sky-900 border-4;
    }

    .column-4{
        @apply bg-violet-50 border-violet-900 border-4;
    }
    
    
    .lex-unique{
        @apply outline-4 pl-0.5 mr-0.5 ;
    }
    .column-0 span.lex-unique
   {
            @apply outline-red-600   ;
        
    }
    .column-1 span.lex-unique {
            @apply outline-green-600   ;
        
    }
    .column-2 span.lex-unique
    {
            @apply outline-blue-600   ;
        
    }
    .column-3 span.lex-unique {
            @apply outline-fuchsia-600   ;
        
    }
</style>

{#snippet showText(textRef,unique,numCols,copyButton=true)}
    {#if textRef.text}
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
                        {@const plainGreek=GreekUtils.plainGreek(word.word).toLocaleLowerCase().replaceAll(/[^α-ω]+/g,'')}
                        {@const customClassLookup=cssCustomDict[plainGreek]}
                        {@const customClass= customClassLookup ? customClassLookup : ''}
                        <span 
                        class={["m-0 word", "lex-" + word.id, 
                            showUnique && unique && isUnique(word.id,unique) && 'lex-unique', 
                            wordCssClass, customClass, plainGreek,
                            showIdentical && wordCssClass && parTextGroup.matchingWords.includes(stripWord(word.word)) && 'underline font-bold']} 
                        onclick={()=>{if (highlightOnClick) wordClick(word.id);}}>{word.word}{'  '}</span>
                        {/each}
                    {/each}
                {:else if textRef.text}
                    
                    {textRef.text}
                {/if}
        {:else}
            <i class="text-sm">("{textRef.reference}" not found. Did you enter it correctly?)</i>

        {/if}
        {#if copyButton && textRef.text}
            <CopyText copyText={textRef.text} tooltip='Copy pericope'/>
        {/if}
{/snippet}

    <div 
    class="grid  
    {numCols >=2 ? "sm:grid-cols-2" : ''}
    {
        numCols == 3 ? "md:!grid-cols-3 gap-1" : 
        numCols ==4 ? "lg:!grid-cols-4 gap-1" :
        numCols ==5 ? "lg:grid-cols-5 gap-1" :
        ""
    } grid-cols-1 text-2xl">
    
        {#each parTextGroup.parallelTexts as col, index}

        {#if col.textRefs && col.textRefs.length}
            <div class="rounded-box  m-1 p-2 column-{index+1}">
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
    
