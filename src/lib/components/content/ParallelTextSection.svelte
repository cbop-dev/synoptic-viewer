<script module>
    export { showText };
    import {ParallelTextGroup, ParallelText ,Word, TextAndRef,VerseWords,stripWord} from './parallelTexts.svelte.js';
    
    import { ColorUtils } from '$lib/utils/color-utils';
    import CopyText     from '../ui/CopyText.svelte';
    import { GreekUtils } from '$lib/utils/greek-utils';
    import * as StringUtils from '$lib/utils/string-utils.js';

    /**
     * 
     * @param {Word[]} words
     */
    export function getText(words){
        return words.reduce((a,b)=>a ? a +' '+b.word : b.word, '')
    }


    /**
     * @type function(ShowTextOptions):void showText
    */
    
    export class ShowTextOptions {
        
        /**
         * 
         * @param {TextAndRef} textRef 
         * @param {ParallelTextGroup} parGroup
         * @param {boolean} showUniques
         * @param {number} numCols
         * @param {boolean }copyButton
         * @param {Object<number,string>} cssClassDict
         * * @param {Object<string,string>} cssCustomDict
         * @param {boolean} showNotes
         * @param {boolean} showUnique
         * @param {boolean} unique
         * @param {boolean} highlightOnClick 
         * @param {function} notesClick
         * @param {function} wordClick
         */
        constructor(textRef,parGroup,showUniques,numCols,copyButton=true,cssClassDict,cssCustomDict,showNotes,showUnique,unique,highlightOnClick,wordClick,notesClick){
            this.textRef=textRef;
            this.parGroup=parGroup;
            this.showUniques=showUniques;
            this.numCols=numCols;
            this.copyButton=copyButton;
            this.cssClassDict=cssClassDict;
            this.cssCustomDict=cssCustomDict;
            this.showNotes=showNotes;
            this.showUnique=showUnique;
            this.unique=unique;
            this.highlightOnClick=highlightOnClick;
            this.notesClick=notesClick;
            this.wordClick=wordClick;
        }
        
    }
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
</script>
{#snippet showText(options)}
   
    {#if options.textRef.text}
        <span class="font-bold bg-white/50 rounded-sm border-2 border-black/60 mr-1 ml-0">
        {#if options.copyButton}
            <CopyText copyText={options.textRef.reference} 
            linkText={options.textRef.reference}
            btnSizeCssClass="text-xl m-0 p-0 hover:link"
            tooltip="Copy reference to clipboard."
            showButton={false}
            
            />
            {#if !options.showNotes}
            {:else}
                {#if options.textRef.note}
                <Button buttonText={"\u{1F5C8}"} buttonStyle="btn btn-xs btn-ghost" 
                    tooltip={"See Notes"}
                    onclick={()=>{options.notesClick(options.textRef.reference, options.textRef.note)}} />
                {:else}     
                {/if}
            {/if}
        {:else}
        
            {options.textRef.reference}
        {/if}</span>
        {#if options.textRef.words && options.textRef.words.length}
                    
                    {#each options.textRef.words as verseWords}

                        {@const customMatchedWords=StringUtils.findMatchingPhrases(
                        verseWords.words.map((w)=>GreekUtils.onlyPlainGreek(w.word,true,true,true)),
                            Object.keys(options.cssCustomDict).map((str)=>GreekUtils.onlyPlainGreek(str)))
                            // NB: first index is that of cssCustomDict; second is into textRef.words
                        }
                        
                        <span class="bg-white/40 border-black/40 border-2 m-0 p-0 rounded-xl">
                        {#if options.copyButton}
                            <CopyText getTextFunc={()=>getText(verseWords.words)}
                            linkText={verseWords.verse} 
                            showButton={false}
                            tooltip={'Copy verse '+verseWords.verse}/>
                         {:else}
                            {verseWords.verse}
                        {/if}
                        </span>
                        {#each verseWords.words as word, index}
                        
                            {@const wordCssClass=options.cssClassDict[word.id]}
                            {@const plainGreek=GreekUtils.onlyPlainGreek(word.word)}
                            {@const customMatchSearchStrings=Object.entries(customMatchedWords).filter(([searchPhrase,array])=>array.includes(index)).map(([s,a])=>s)}
                            {@const customClasses = customMatchSearchStrings.map((s)=>options.cssCustomDict[s])}
                          <!--  [words matched search: ['{customMatchSearchStrings.join("','")}'']-->
                            <span 
                            class={["m-0 word", "lex-" + word.id, 
                                options.showUnique && options.unique && isUnique(word.id,options.unique) && 'lex-unique', 
                                wordCssClass, customClasses, plainGreek,
                                options.showIdentical && wordCssClass && options.parGroup.matchingWords.includes(stripWord(word.word)) && 'underline font-bold']} 
                            onclick={()=>{if (options.highlightOnClick) options.wordClick(word.id);}}>{word.word}{'  '}</span>
                        {/each}
                    {/each}
                {:else if options.textRef.text}
                    
                    {options.textRef.text}
                {/if}
        {:else}
            <i class="text-sm">("{options.textRef.reference}" not found. Did you enter it correctly?)</i>

        {/if}
        {#if options.copyButton && options.textRef.text}
            <CopyText copyText={options.textRef.text} tooltip='Copy pericope'/>
    {/if}
{/snippet}

<script>
    import { mylog } from '$lib/env/env.js';
  
    import Button from '../ui/Button.svelte';

    
    
   
    
   
    
    /**
     * @type {{parTextGroup: ParallelTextGroup,
     * wordClick:function(number):void,
     * showIdentical:boolean,
     * cssClassDict:Object<number,string>,
     * cssCustomDict:Object,
     * showUnique:boolean,
     * highlightOnClick:boolean,
     * showNotes:boolean,
     * showNotesFunction(heading:string,note:string):void
     * }}
     */
    let {
        parTextGroup = new ParallelTextGroup(),
        showUnique=false,
        showIdentical=true,
        wordClick=(id)=>{},
        cssClassDict={},
        cssCustomDict={},
        highlightOnClick=true,
        showNotes=true,
        showNotesFunction=(heading,note)=>{alert(heading+"\n"+note)}
        
    } = $props();

  
   /**
 * * @param {string} heading 
 * @param {string} note 
*/
function notesClick(heading,note){
    showNotesFunction(heading,note);
}

    let numCols=$derived(parTextGroup.parallelTexts.length)
 
    
    let columnStyle = $derived('grid-cols-'+numCols);

   




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
                {@const myOptions=new ShowTextOptions(textRef,parTextGroup,showUnique,numCols,true,cssClassDict,cssCustomDict,showNotes,
                showUnique,unique,highlightOnClick,wordClick,showNotesFunction)}   
                    {#if index2 > 0}<br/>{/if}
                    <div class="text-left">
                     
                    
                     {@render showText(myOptions)}
                    </div>
                    <!--<hr class='border-accent-content'/> -->
                {/each}
                
            
            {/if}
            </div>
        
                
        {/if}
        {/each}


    </div>
    
