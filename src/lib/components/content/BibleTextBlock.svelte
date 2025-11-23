<script>
    import {ParallelColumnGroup, ParallelColumn, Word, TextAndRef,VerseWords,stripWord} from './parallelTexts.svelte.js';
    import { SynopsisOptions3 } from './SynopsisClasses.svelte.js';
    import { ColorUtils } from '$lib/utils/color-utils';
    import CopyText     from '../ui/CopyText.svelte';
    import { GreekUtils } from '$lib/utils/greek-utils';
    import * as StringUtils from '$lib/utils/string-utils.js';
    import { mylog } from '$lib/env/env.js';
    import Button from '../ui/Button.svelte';
    import { LexemeInfo } from '../datastructures/lexeme.js';
    import * as BibleUtils from "$lib/n1904/bibleRefUtils";
    /**
     * 
     * @param {Word[]} words
     */
    export function getText(words,hideApp=false){
        const phrase = words.reduce((a,b)=>{
            const word = hideApp ? b.clean : b.word;
            return a ? a +' '+word: word;
        }, '');
        return phrase;
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
* wordClick:  function,
* lexInfoDict:Object<number,LexemeInfo>
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
        wordClick=(wordid,bookid)=>{},
        lexInfoDict={}
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
//$inspect(`<BibleTextBlock>: textRef.ref=${textRef.reference}`)
</script>

<div class="bible-block {options.viewOptions.exactPhrases ? 'show-exact' : ''} {!options.viewOptions.similarPhrases ? 'hide-similar': ''}">
{#key parGroup &&  parGroup.updatedCounter && parGroup.lexIdenticalPhrasesMap.size && parGroup.lexIdenticalPhrasesMap}

{#if textRef.text}
{@const book=BibleUtils.getBookChapVerseFromRef(textRef.reference)?.book}
    <span class="font-bold bg-white/50 rounded-sm border-2 border-black/60 mr-1 ml-0 bible-text-block">
    {#if copyButton}
        <CopyText copyText={textRef.reference} 
        linkText={textRef.reference}
        btnCssClass="m-0 p-0 hover:link bible-ref"
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
                        {#if false && word.specialCss.size}[[Special class={[...word.specialCss].join(",")}]]:{/if}
                        <span role="none" 
                        class={["m-0", "word", "lex-"+word.id, 
                            options.viewOptions.unique && uniqueSet && isUnique(word.id,uniqueSet) && "lex-unique",
                            customClasses?.length ? customClasses[0] : '', wordClasses,  lexicalPhrases,
                            options.viewOptions.identical && lexCssClasses && parGroup.matchingWords.includes(stripWord(word.word)) && 'identical-word',
                            lexCssClasses, ...word.specialCss]} 
                        onclick={()=>{if (options.viewOptions.highlightOnClick || options.viewOptions.lexInfoClick) wordClick(word.id,book)}}>{getText([word],options.viewOptions.hideApp)}{'  '} 
                        
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

    .hide-similar .lexical-phrase{
        @apply bg-transparent;
    }

    .show-exact .exact-phrase {
        @apply  border-t-2 border-b-2  font-bold underline ;
    }

    
    
        .lexical-phrase {

            
        }
       	 .lexical-phrase-1 {
            @apply  border-red-600 bg-red-600/20 decoration-red-600;
        }
        
        .lexical-phrase-2 {
            @apply border-blue-700 bg-blue-700/20 decoration-blue-700;
        }
        .lexical-phrase-3 {
            @apply border-green-500 bg-green-500/20 decoration-green-500;
        }
        .lexical-phrase-4 {
            @apply border-fuchsia-700 bg-fuchsia-700/20 decoration-fuchsia-700;
        }
        .lexical-phrase-5 {
            @apply border-black bg-slate-400/30 decoration-black;
        }
        .lexical-phrase-6 {
            @apply border-amber-600 bg-amber-600/20 decoration-amber-600;
        }
        .lexical-phrase-7 {
            @apply border-amber-300 bg-amber-300/40 decoration-amber-300;
        }
        .lexical-phrase-8 {
            @apply border-rose-600 bg-rose-600/20 decoration-rose-600;
        }
        
        .lexical-phrase-9 {
            @apply border-teal-700 bg-teal-700/20 decoration-teal-700;
        }
        .lexical-phrase-10 {
            @apply border-purple-800 bg-purple-800/20 decoration-purple-800;
        }
        .lexical-phrase-11 {
            @apply border-yellow-950 bg-yellow-950/20 decoration-yellow-950;
        }
        .lexical-phrase-12 {
            @apply border-cyan-700 bg-cyan-700/20 decoration-cyan-700;
        }
        .lexical-phrase-13 {
            @apply  border-orange-900 bg-orange-900/20 decoration-orange-900;
        }
        .lexical-phrase-14 {
            @apply border-amber-300 bg-amber-300/20 decoration-amber-300;
        }
    
    
    
</style>