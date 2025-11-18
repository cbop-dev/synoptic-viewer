<script>
    import { mylog } from '$lib/env/env.js';
    import { GospelPericopeGroup, ParallelColumnGroup, ParallelColumn ,Word, TextAndRef,VerseWords,stripWord} from './parallelTexts.svelte.js';
    import {gospelParallels} from '@cbop-dev/aland-gospel-synopsis';
    import { ColorUtils } from '$lib/utils/color-utils';
    import CopyText     from '../ui/CopyText.svelte';
    import { GreekUtils } from '$lib/utils/greek-utils';
	import Button from '../ui/Button.svelte';
    import { SynopsisOptions3 } from './SynopsisClasses.svelte.js';
    import BibleTextBlock from './BibleTextBlock.svelte';
    const gospels = gospelParallels.gospels;
    
    //let showSecondary=$state(true);
    //mylog("loading ParTextSecion Component");
    
    /**
     * @type {{parGroup: GospelPericopeGroup,
     * options:SynopsisOptions3,
     * focus:string,
     * enableSecondary:boolean,
     * wordClick:function(number):void,
     * cssClassDict:Object,
     * cssCustomDict:Object,
     * showNotes:boolean,
     * showNotesFunction(heading:string,note:string):void
     * }}
     */
    let {
        parGroup = new GospelPericopeGroup(),
        options=new SynopsisOptions3(),
        enableSecondary=false,
       focus = '',
       /* showUnique=false,
        showIdentical=true,*/
        wordClick=(id)=>{},
        cssClassDict={},
        cssCustomDict={},
        /*highlightOnClick=true,
        
        hideApp=false,*/
        showNotes=false,
        showNotesFunction=(heading,note)=>{alert(heading+"\n"+note)}

        
    } = $props();


    /**
     * key: bible ref (string) that matches a textAndRef.reference value.
     * value: 3-d array [x][y]=[array z], where x and y are verse and word indexes into the correponding textAndRef.vwords instance(s):
     *      x=index for textAndRef.vwords[x] (thus, the verse index)
     *      y=index of textAndRef.vwords[x][y] (thus, the word index in this verse)
     * and z= an array of strings, each of which is a css class to be added to the corresponding word in textAndRef.vwords[x][y]
     *
     * Capisci?
     */
    //wrong description above!

    /**
     * similarPhrasesDict
     * key: a string of ordered integers separated by commas; each number is a lex id, 
     * value: an array of diction
     * 
     * {}
     */
    let similarPhrasesDb=$state({})
    
    /**
     * * @param {string} heading 
     * @param {string} note 
    */
    function notesClick(heading,note){
        showNotesFunction(heading,note);
    }
    /**
     * @type {{focused: boolean, cols: ParallelColumn[], focusIndex: number}} colData
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
         * @type {ParallelColumn[]} cols
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
/*function getText(words){
    return words.reduce((a,b)=>a ? a +' '+b.word : b.word, '')
}*/
//$inspect("ParTexts, focus:", focus)
//$inspect("numCols", numCols, "colData:", colData)
//$inspect("ParText, customClass", cssCustomDict);
</script>
<style>
    @reference "tailwindcss";
    /*
    .Matts {
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
        @apply bg-base-200;
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
    .gospel-column-3 span.lex-unique, span.lex-unique {
            @apply outline-fuchsia-600   ;
        
    }*/
    .column {
      /*  @apply border-4;*/
       /* border-color: var(--borderColor,#eee)*/
    }


    .column .secondary {
        @apply text-sm;
    }
    


</style>
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
            {#if (col.textRefs && col.textRefs.length) || (enableSecondary && col.secondary && col.secondary.length)}
            <div class="rounded-box  {Object.values(gospels.abbreviations)[index]} m-1 p-2 gospel-column gospel column gospel-column-{index} column-{index}">
                {#if col.textRefs && col.textRefs.length}
                    {#if col.textRefs.length}
                        {#each col.textRefs as textRef, index2}
                        
                            {@const unique = (options.viewOptions.unique && numCols > 1)? col.unique : new Set()}
                            {#if index2 > 0}<br/>{/if}
                            <div class="text-left">    
                                <BibleTextBlock {textRef}  {parGroup} {options} {numCols} copyButton={true} 
                                    cssLexClassDict={cssClassDict} cssCustomStringDict={cssCustomDict} 
                                    {showNotes} uniqueSet={unique} notesClick={showNotesFunction} 
                                        {wordClick} 
                                />
                            </div>
                            
                        {/each}       
                    {/if}  
                {/if}
                {#if enableSecondary && col.secondary && col.secondary.length}
                    <span class="italic text-base">Secondary parallels:</span>  
                    <div class="rounded-box secondary {Object.values(gospels.abbreviations)[index]} ">
                
                    {#each col.secondary as secondaryTextRef, index2}
                    
                        {@const unique = (options.viewOptions.unique && numCols > 1)? col.unique : new Set()}
                        {#if index2 > 0}<br/>{/if}
                        
                        <div class="text-left">
                        
                        <BibleTextBlock textRef={secondaryTextRef}  {parGroup} {options} {numCols} copyButton={true} 
                        cssLexClassDict={cssClassDict} cssCustomStringDict={cssCustomDict} 
                        {showNotes} uniqueSet={unique} notesClick={showNotesFunction} 
                            {wordClick} 
                        />
                        </div>
                            
                    {/each}   
                
                    </div>

                {/if}
            </div>
            {/if}
        {/each}


    </div>
    {#if otherData}
    <div class="mt-2 p-2 flex flex-wrap">
        {#each otherData.textRefs as textRef, index}
               
                <div class="rounded-box bg-base-200 other inline-block m-1 p-1 text-left m:flex-1">

                         <BibleTextBlock {textRef}  {parGroup} {options} {numCols} copyButton={true} 
                    cssLexClassDict={cssClassDict} cssCustomStringDict={cssCustomDict} 
                    {showNotes} notesClick={showNotesFunction} 
                        {wordClick} 
                    />
                <!--{@render showText(myOptions)}-->
            
            </div>
         {/each}
    </div>
    {/if}
{:else if colData.focused}<!--focusing on one gospel:-->
<div class="grid {numCols > 1 ? 'sm:!grid-cols-2' :''} gap-1 grid-cols-1">
     <div class="rounded-box   text-3xl  column gospel gospel-column  gospel-column-0 column-{colData.focusIndex}">
        {#each colData.cols[colData.focusIndex].textRefs as textRef, index}
        
        {@const unique = (options.viewOptions.unique && numCols > 1)? colData.cols[colData.focusIndex].unique : new Set()}
        
                 
        <div class="rounded-box  inline-block p-2 m-1 {Object.values(gospels.abbreviations)[colData.focusIndex]} text-left">
                 <BibleTextBlock {textRef}  {parGroup} {options} {numCols} copyButton={true} 
                    cssLexClassDict={cssClassDict} cssCustomStringDict={cssCustomDict} 
                    {showNotes} uniqueSet={unique}  notesClick={showNotesFunction} 
                        {wordClick} 
                    />
        <!--{@render showText(myOptions)}-->
        </div>
        {/each}
     </div>
     {#if numCols >1}
     <div class="text-2xl gospel column gospel-column-unfocused">
        {#each colData.cols as col,index}
        {#if index!=colData.focusIndex}
        {#if col.textRefs.length}
        
             <div class="rounded-box {Object.values(gospels.abbreviations)[index]} m-1 text-left gospel-column gospel-column-{index+1} nonfocused   p-2">
       
            {#each col.textRefs as textRef, index}
                
                    
                {#if index > 0}<br/>{/if}
                <div >
                         <BibleTextBlock {textRef}  {parGroup} {options}  {numCols} copyButton={true} 
                    cssLexClassDict={cssClassDict} cssCustomStringDict={cssCustomDict} 
                    {showNotes} uniqueSet={col.unique} notesClick={showNotesFunction} 
                        {wordClick} 
                    />
                <!--{@render showText(myOptions)}-->
                </div>
                
            {/each}
            
            </div>
        {/if}
        
    
            
        {/if}
        {/each}
        {#if otherData}
        <hr/>
    <div class="mt-2 p-1">
        {#each otherData.textRefs as textRef, index}
                 
                 
                <div class="rounded-box other bg-base-200 inline-block m-1 text-left">
                         <BibleTextBlock {textRef}  {parGroup} {options}  {numCols} copyButton={true} 
                    cssLexClassDict={cssClassDict} cssCustomStringDict={cssCustomDict} 
                    {showNotes}  notesClick={showNotesFunction} 
                        {wordClick}
                    />
                    <!--{@render showText(myOptions)}-->
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
