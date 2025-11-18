<script>
    import {ParallelColumnGroup, ParallelColumn, Word, TextAndRef,VerseWords,stripWord} from './parallelTexts.svelte.js';
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
* parGroup:  ParallelColumnGroup
* numCols:  number
* copyButton:  boolean 
* cssWordClassDict:Object<number,Object<number,string[]>>
* cssLexClassDict:  Object<number,string>
* cssCustomStringDict:  Object<string,string>
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
        

        //key is index of textRef.vwords, value is array of arrays of css classes (strings) to apply to it. Each array corresponds with a verse/item in textRef.vwords[key]
        // Thus {2:{3: ["text-blue-300"]}}} would mean that for the third verse, i.e., textRef[2], the fourth word, textRef[2].words[3], should have the class "text-blue-300".
        cssWordClassDict={},//{2:{3: ["text-blue-300"]}},
        cssLexClassDict={},

        //based on strings: key:string, value:
        cssCustomStringDict={},
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
$inspect(`<BibleTextBlock>: textRef.ref=${textRef.reference}`)
</script>

<div class="bible-block ">
{#key parGroup &&  parGroup.updatedCounter && parGroup.lexIdenticalPhrasesMap.size && parGroup.lexIdenticalPhrasesMap}

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
    {#if textRef.vwords && textRef.vwords.length}
                
                {#each textRef.vwords as verseWords,verseIndex}

                    {@const customMatchedWords=StringUtils.findPhrases(
                    verseWords.words.map((w)=>GreekUtils.onlyPlainGreek(w.word,true,true,true)),
                        Object.keys(cssCustomStringDict).map((str)=>GreekUtils.onlyPlainGreek(str)))
                        // NB: first index is that of cssCustomDict; second is into textRef.vwords
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
                         
                        {@const lexicalPhrases = word.phrases['lexical'] ? Array.from(word.phrases['lexical']).
                            map((p)=>parGroup.getCssClassesForPhrase(p)).flat()  : []}
                        
                        {@const phraseNum = parGroup.lexIdenticalPhrasesLocations.findIndex(
                            (v)=>(v.phrase==(word.phrases['lexical'] ? Array.from(word.phrases['lexical']) : [null]).flat()[0]))}
                        
                       
                        {@const lexCssClasses=cssLexClassDict[word.id]}
                        {@const plainGreek=GreekUtils.onlyPlainGreek(word.word)}
                        {@const customMatchSearchStrings=Object.entries(customMatchedWords).filter(([searchPhrase,array2d])=>array2d.flat().includes(index)).map(([s,a2d])=>s)}
                        {@const customClasses = customMatchSearchStrings.map((s)=>cssCustomStringDict[s])}
                        {@const wordClasses = (cssWordClassDict[verseIndex] && cssWordClassDict[verseIndex][index])? cssWordClassDict[verseIndex][index] : []}
                        
                        <span role="none" 
                        class={["m-0", "word", "lex-"+word.id, 
                            options.viewOptions.unique && uniqueSet && isUnique(word.id,uniqueSet) && "lex-unique",
                            lexCssClasses, customClasses?.length ? customClasses[0] : '', wordClasses, options.viewOptions.similarPhrases ? lexicalPhrases : [],
                            options.viewOptions.identical && lexCssClasses && parGroup.matchingWords.includes(stripWord(word.word)) && 'identical-word'] } 
                        onclick={()=>{if (options.viewOptions.highlightOnClick) wordClick(word.id)}}>{getText([word],options.viewOptions.hideApp)}{'  '} 
                        
                    {#if word.phrases['lexical']}
                        <!--Match!:phraseclasses={phraseClasses}-->
                    {:else}
                    {/if}
            </span>
                    {/each}
                {/each}<!--<CopyText linkText="IDs!" getTextFunc={()=>textRef.getWordIdArray().join(',')} />-->
            {:else if textRef.text}
                
                {textRef.text}
            {/if}
    {:else}
        <i class="text-sm">("{textRef.reference}" not found. Did you enter it correctly?)</i>

    {/if}
    {#if copyButton && textRef.text}
        <CopyText copyText={textRef.text} tooltip='Copy pericope'/>
{/if}
{/key}
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

    .identical-word{
        @apply outline-1 outline-dashed;
    }

    .lexical-phrase {

        @apply border-b-2 border-t-1 font-bold;
    }
    .lexical-phrase-1 {
        @apply  border-red-600;
    }
    
    .lexical-phrase-2 {
        @apply border-blue-700;
    }
    .lexical-phrase-3 {
        @apply border-green-500;
    }
    .lexical-phrase-4 {
        @apply border-fuchsia-700;
    }
    .lexical-phrase-5 {
        @apply border-black;
    }
    .lexical-phrase-6 {
        @apply border-amber-600;
    }
    .lexical-phrase-7 {
        @apply border-amber-300;
    }
      .lexical-phrase-8 {
        @apply border-b-rose-600;
    }
    
    .lexical-phrase-9 {
        @apply border-teal-700;
    }
    .lexical-phrase-10 {
        @apply border-purple-800;
    }
    .lexical-phrase-11 {
        @apply border-yellow-950;
    }
    .lexical-phrase-12 {
        @apply border-b-cyan-700;
    }
    .lexical-phrase-13 {
        @apply  border-orange-900;
    }
    .lexical-phrase-14 {
        @apply border-amber-300;
    }
    
    
    
    
</style>