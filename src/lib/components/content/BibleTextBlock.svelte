<script>
    import {ParallelTextGroup, ParallelText, Word, TextAndRef,VerseWords,stripWord} from './parallelTexts.svelte.js';
    import { SynopsisOptions3 } from './SynopsisClasses.svelte.js';
    import { ColorUtils } from '$lib/utils/color-utils';
    import CopyText     from '../ui/CopyText.svelte';
    import { GreekUtils } from '$lib/utils/greek-utils';
    import * as StringUtils from '$lib/utils/string-utils.js';
    import { mylog } from '$lib/env/env.js';
    import Button from '../ui/Button.svelte';

    /**
     * 
     * @param {Word[]} words
     */
    export function getText(words,hideApp=false){
        const phrase = words.reduce((a,b)=>a ? a +' '+b.word : b.word, '');
        return hideApp ? GreekUtils.removeApparatusMarks(phrase) : phrase;
    }


/** 
* @type {{
* textRef :  TextAndRef
* parGroup:  ParallelTextGroup
* numCols:  number
* copyButton:  boolean 
* cssWordClassDict:  Object<number,string>
* cssWordCustomDict:  Object<string,string>
* cssUniqueColor: string
* showNotes:  boolean
* uniqueSet:  Set<number>
* options:SynopsisOptions3
* notesClick:  function
* wordClick:  function
* }} 
*/
let {
        textRef,
        parGroup,
        options=new SynopsisOptions3(),
        //options.viewOptions.unique=false,
        numCols,
        copyButton=true,
        //options.viewOptions.identical=false,
        cssWordClassDict={},
        cssWordCustomDict={},
//        cssUniqueColor="border-black",
        showNotes=true,
        uniqueSet=new Set(),
        //options.viewOptions.highlightOnClick=$bindable(false),
        notesClick=()=>{},
        wordClick=()=>{},
       // options.viewOptions.hideApp=false,
}=$props();
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
      //mylog("IsUnique("+wordid+", "+Array.from(uniqueSet).join(',')+")--> "+retVal)
      mylog(`isUnique(${wordid},(${uniqueSet}))=>${retVal}`)
    return retVal;
}
</script>

<div class="bible-block">
{#if textRef.text}
    <span class="font-bold bg-white/50 rounded-sm border-2 border-black/60 mr-1 ml-0">
    {#if copyButton}
        <CopyText copyText={textRef.reference} 
        linkText={textRef.reference}
        btnSizeCssClass="text-xl m-0 p-0 hover:link"
        tooltip="Copy reference to clipboard."
        showButton={false}
        
        />
        {#if !showNotes}
        {:else}
            {#if textRef.note}
            <Button buttonText={"\u{1F5C8}"} buttonStyle="btn btn-xs btn-ghost" 
                tooltip={"See Notes"}
                onclick={()=>{notesClick(textRef.reference, textRef.note)}} />
            {:else}     
            {/if}
        {/if}
    {:else}
    
        {textRef.reference}
    {/if}</span>
    {#if textRef.words && textRef.words.length}
                
                {#each textRef.words as verseWords}

                    {@const customMatchedWords=StringUtils.findPhrases(
                    verseWords.words.map((w)=>GreekUtils.onlyPlainGreek(w.word,true,true,true)),
                        Object.keys(cssWordCustomDict).map((str)=>GreekUtils.onlyPlainGreek(str)))
                        // NB: first index is that of cssCustomDict; second is into textRef.words
                    }
                    
                    <span class="bg-white/40 border-black/40 border-2 m-0 p-0 rounded-xl">
                    {#if copyButton}
                        <CopyText getTextFunc={()=>getText(verseWords.words,options.viewOptions.hideApp)}
                        linkText={String(verseWords.verse)} 
                        showButton={false}
                        tooltip={'Copy verse '+verseWords.verse}/>
                        {:else}
                        {verseWords.verse}
                    {/if}
                    </span>
                    {#each verseWords.words as word, index}
                    
                        {@const wordCssClass=cssWordClassDict[word.id]}
                        {@const plainGreek=GreekUtils.onlyPlainGreek(word.word)}
                        {@const customMatchSearchStrings=Object.entries(customMatchedWords).filter(([searchPhrase,array2d])=>array2d.flat().includes(index)).map(([s,a2d])=>s)}
                        {@const customClasses = customMatchSearchStrings.map((s)=>cssWordCustomDict[s])}
                        
                        <span role="none"
                        class={["m-0", "word", "lex-"+word.id, 
                            options.viewOptions.unique && uniqueSet && isUnique(word.id,uniqueSet) && "lex-unique", 
                            wordCssClass, customClasses?.length ? customClasses[0] : '', "test", 
                            options.viewOptions.identical && wordCssClass && parGroup.matchingWords.includes(stripWord(word.word)) && 'underline font-bold'] } 
                        onclick={()=>{if (options.viewOptions.highlightOnClick) wordClick(word.id)}}>{getText([word],options.viewOptions.hideApp)}{'  '}</span>
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
</div>

<style>
    @reference "tailwindcss";

    /*.bible-block {
        @apply bg-white/20 border-1 border-black/30 rounded p-1;
    }*/

   .lex-unique{
      /*  @apply outline-2 pl-0.5 mr-0.5 ;
        outline-color: var(--cssUniqueColor,#000);*/
        
    }
</style>