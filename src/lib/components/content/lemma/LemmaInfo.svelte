
<!--- 
NB: this module has been made to not be reactive to the properties sent to it by the parent, because the data charts do not react well to dynamic changes. 
THUS: any instance used by the parent should be destroyed and re-rendered when the lemmaInfo, bookID, or server info changes. 
That is, the <LemmaInfo> tag should be surrounded by tags such as : {#key bookID && tfServer && lemmaInfo } {/key} 

-->
<script>
import { TfServer } from "../TfUtils";
import Button from "$lib/components/ui/Button.svelte";
import Loading from "$lib/components/ui/Loading.svelte";
import Icon from "$lib/components/ui/icons/Icon.svelte";
import BarsSvg from "$lib/components/ui/icons/colorful-bar-chart.svg";
import BookOpenSvg from "$lib/components/ui/icons/book-open.svg";
import BookSvg from "$lib/components/ui/icons/book.svg";
import CopyText from "$lib/components/ui/CopyText.svelte";
import { LexemeInfo,LexStats,LemmaBookStats} from "$lib/components/datastructures/lexeme";
import { TextAndRef } from "../parallelTexts.svelte";
import * as BibleUtils from "$lib/n1904/bibleRefUtils";
import ButtonSelect from "$lib/components/ui/ButtonSelect.svelte";
//import LemmaRefs from "./LemmaRefs.svelte";
import { onMount, untrack } from "svelte";
import { innerWidth  } from 'svelte/reactivity/window';
import BarChart from "$lib/components/ui/BarChart2.svelte";
import PieChart from "$lib/components/ui/PieChart.svelte";
//import BubbleChart from "$lib/components/ui/BubbleChart.svelte";
import Tabs from "$lib/components/ui/Tabs2.svelte";

import { Grid } from "@vortechsolutions/gridjs-svelte";
import { mylog } from "$lib/env/env";
import MathUtils from "$lib/utils/math-utils";
import Modal2 from "$lib/components/ui/Modal2.svelte";
import ViewTexts from "../ViewTexts.svelte";

/**
 * @type {{ lemmaInfo:LexemeInfo,
 *          tfServer:TfServer,
 *          bookID:number,
 * }}
 */
let {

    lemmaInfo, //no need to make bindable: we're not gonna change it!
    tfServer,
    //sectionWords=0,
    bookID=0,//optional, if we want to see book stats for this lexeme
} = $props();


//let textRefsToView=$state([]);

/***/
let enableTextView=$state(false);

let makingRequest=$state(false);
let responseReady=$state(false);
let sections=$state(bookID? [bookID] : []);
function reset(){
    makingRequest=false;
    responseReady=false;
    //lexeme
    showReferences = false;
    showStats=false;
    
}

let theBookName =$derived.by(()=>{
    if(bookID) 
        return untrack(()=>tfServer.getBookSyn(bookID));
    else 
    return "";
});
let theBookAbbrev=$derived.by(()=>{return bookID ? untrack(()=>tfServer.getBookAbbrev(theBookName)) : ""});



let showReferences = $state(false);
let showSectionReferences = $state(false);
/**
 * 
 * @param text {string}
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}


/*function lemmaDetailsClick() {
   
}*/

//let lxxRefsQuery=$state(new LexQuery());
//let sectionRefsQuery=$state(new LexQuery());

let showStats =$state(false);



/**
 * @type {{nums: number[], labels: string[]}|null}
 */

0;
//^---removes IDE complaints! TODO: put correct JS Doc type above!

let lemmaBookCountsChartData={
            
            nums: Object.values(lemmaInfo.stats.bookStats).map((bs)=>bs.lexCounts.book),
            labels: Object.keys(lemmaInfo.stats.bookStats).map((id)=>tfServer.booksDict[Number(id)].abbrev)
        };
    


let lemmaBookCountChartOptionIndex = $state(0);
let lemmaBookCountChartOptions =[
    "Data Table",        
    "Lemma Count",
    "Frequency",
        
]

let lemmaBookFreqChartData= lemmaInfo.stats.bookStats && Object.keys(lemmaInfo.stats.bookStats).length ?
        
         {
            nums: Object.entries(lemmaInfo.stats.bookStats).map(([id,obj])=> obj.freq.book),
            labels: Object.keys(lemmaInfo.stats.bookStats).map((id)=>tfServer.booksDict[Number(id)].abbrev)
        }
        
     :
       null;
    

let lemmaBookTable = 
    (!lemmaBookCountsChartData || !lemmaBookFreqChartData) ?
        null
    : {
            data: lemmaBookCountsChartData.nums.map((count,index)=>
               [lemmaBookCountsChartData.labels[index],
                count,
                MathUtils.floatRound(lemmaBookFreqChartData.nums[index].toFixed(3),3),                
                lemmaInfo.stats.totalFreq ? MathUtils.floatRound(lemmaBookFreqChartData.nums[index]/lemmaInfo.stats.totalFreq,3) : 0
               ]
            ),
            columns:["Book", "Count", "Freq", "Freq ratio"]        
        };
$effect(()=>{
    if(innerWidth.current){
        //Bar Chart resizing can cause a recursive loop that crashes the browser window.  :-(
        // Change tabs! BUT, we need to use untrack to avoid causing yet ANOTHER recursive loop!
        selectedTab=untrack(()=> selectedTab==2? 0 : selectedTab);
    }
})
onMount(()=>{
   // fetchLexStats();
   // lemmaInfo.stats.calculateFrequencies(true);
  //  lemmaInfo=lemmaInfo;
 //  if (lemmaId) {
   // fetchLemma();
   //}
});
//let zoomCharts = $state(false);
/*let sectionRef = $derived(sections.length ? sections.map((sId)=>
    tfServer.booksDict[bookID] ?
        tfServer.booksDict[bookID].abbrev
        : ""
).filter((b)=>b).join(";") : '');*/
//$inspect("bookcounts chart data:", lemmaBookCountsChartData);

let chosenBookId=$state(bookID);
let selectedTab=$state(0);
//$inspect(`bookid:${bookID}; bookname: ${theBookName}; bookAbbrev: ${theBookAbbrev}`);
</script>
<style>
        @reference "tailwindcss";
        @import "https://cdn.jsdelivr.net/npm/gridjs/dist/theme/mermaid.min.css";
    /*.greek {
        font-family: "SBL BibLit", "Gentium";
    }*/
    h1,p {
        text-align: center;
    }
    h1{
     @apply text-3xl font-bold;
    }
    hr {
        @apply p-1 m-1   border-gray-300 ;
    }

    .stats {
        @apply bg-slate-100/75 m-1 p-2 outline-2 outline-slate-300 shadow-2xl;
    }

    .stat-title{
        @apply font-bold underline;
    }
</style>

<div class="items-center text-center">
<h1 class="font-bold text-xxl greek">{lemmaInfo.lemma}</h1>

<h2 class="inline-block">Gloss:</h2> {lemmaInfo.gloss}<br/>
<!--<h2 class="inline-block">Part of speech:</h2> {lemma.pos}-->

<div class="block text-center m-0 p-0 mt-1 self-center">
<ButtonSelect bind:selected={showReferences} ><Icon svg={BookSvg}/>See all {lemmaInfo.stats.count} reference(s)</ButtonSelect>
<ButtonSelect bind:selected={enableTextView}><Icon svg={BookOpenSvg}/>View the Texts</ButtonSelect>
<ButtonSelect buttonText="" bind:selected={showStats}><Icon svg={BarsSvg}/>Stats!</ButtonSelect>

{#if false && bookID > 0}
    <ButtonSelect  buttonText="See {lemmaInfo.stats.bookStats[bookID].count} reference(s) in section." bind:selected={showSectionReferences} />
{/if}

</div>




<!-- REFERENCES:-->
 {#if false && showSectionReferences}
<hr/>
<!--
<LemmaRefs lexId={lemmaInfo.id} lexGreek={lemmaInfo.lemma} sections={sections}
lexRefQuery={sectionRefsQuery}/>-->
{/if}




{#if showReferences}

{@const theRefs= BibleUtils.combineRefs(lemmaInfo.stats.references)}
<hr/>

<div class="rounded bg-slate-200 p-1 shadow">
<h2 class="font-bold"><span class="underline">All {lemmaInfo.stats.count} NT Occurrences of {lemmaInfo.lemma}</span>
    <ButtonSelect buttonStyle="btn btn-xs m-1 p-1" buttonText='See Texts' bind:selected={enableTextView}/></h2>
 <div class="rounded-2xl bg-slate-100/80 p-2 shadow">{theRefs}
<CopyText copyText={theRefs}/> </div>

</div>
<!--{#each lemmaInfo.stats.references as ref}
    {ref}
{/each}-->
{/if}


<!-- STATS/CHARTS-->

{#if showStats}
{@const tabs=["Basic Stats","Small Charts","Large Charts/Table"]}
<hr/>
<h2 class="text-2xl pb-1">Stats and Charts</h2>
<span class="greek block text-xs p0 m0" title="τί τὸ σοφώτατον; ἀριθμός· δεύτερον δὲ τὸ τοῖς πράγμασι τὰ ὀνόματα τιθέμενον. In Pythagoras, 'Testimonia, Part C: Attributed Doctrines (D)', LCL 527:118-119">"What is the wisest? Number. The second is what gives things their names." --Pythagorus</span>
<span class="block text-center text-xs mb-2" title='Twain, Mark. "Chapters from My Autobiography: XX."" The North American Review 185, no. 618 (1907): 465–74. http://www.jstor.org/stable/25105919.'>"There are three kinds of lies: lies, d*mned lies, and statistics." -- Mark Twain</span>

<Tabs headings={tabs} bind:selectedTabIndex={selectedTab} classes={['inline-block','text-center']}/>

{#if selectedTab != 2}
<div class="block m-auto p-1.5 text-sm">

See Stats for:
<select bind:value={chosenBookId} >
            {#each Object.keys(lemmaInfo.stats.bookStats) as bId}
            
            <option value={Number(bId)}>{tfServer.getBookAbbrevById(bId) }</option>
            {/each}
        </select><Button buttonText="Go!" onclick={()=>{bookID=chosenBookId}}></Button>
        
</div>
{/if}


<hr class="w-1/2  m-auto! mt-3! pt-2"/>



    {#if selectedTab==0}
    <!--data-->
        {#key bookID && selectedTab}
            {#if sections.length > 0}

            <h2>Lemma Stats for {lemmaInfo.lemma}: {theBookName} vs. NT</h2>
            


            <!-- stats section-->

            <div class="stats stats-vertical lg:stats-horizontal shadow inline-block">
                <div class="stat">
                <div class="stat-title"> Book Word count </div>
                <div class="stat-value">{lemmaInfo.stats.bookStats[bookID].lexCounts.book}</div>
                <div class="stat-desc">Total instances of {lemmaInfo.lemma} in {theBookAbbrev}</div>
                </div>
            </div>
            
            <div class="stats shadow inline-block">
                <div class="stat">
                <div class="stat-title"> Rest of NT Word count (excluding {theBookAbbrev})</div>
                <div class="stat-value">{lemmaInfo.stats.bookStats[bookID].lexCounts.restNT}</div>
                <div class="stat-desc">Total instances of {lemmaInfo.lemma} (minus {theBookAbbrev}) in {tfServer.name} </div>
                </div>
            </div>

            {/if}
            <div class="stats shadow inline-block">
                <div class="stat">
                <div class="stat-title"> NT count </div>
                <div class="stat-value">{lemmaInfo.stats.count}</div>
                <div class="stat-desc">Total {lemmaInfo.lemma} count in {tfServer.name}</div>
                </div>
            </div>

            {#if lemmaInfo.stats.bookStats[bookID].freq.book } 
            <div class="stats shadow inline-block" >
                <div class="stat">
                <div class="stat-title"> Book frequency</div>
                <div class="stat-value">{lemmaInfo.stats.bookStats[bookID].freq.book.toFixed(3)}</div>
                <div class="stat-desc">Frequency of {lemmaInfo.lemma} in {theBookAbbrev} per 1,000 words</div>
                </div>
            </div>
            {/if}

            <div class="stats shadow inline-block">
            <div class="stat">
            <div class="stat-title"> Rest of NT frequency (excluding {theBookAbbrev})</div>
            <div class="stat-value">{lemmaInfo.stats.bookStats[bookID].freq.restNT.toFixed(3)}</div>
            <div class="stat-desc">per 1,000 words</div>
            </div>
            </div>

            <div class="stats shadow inline-block">
            <div class="stat">
            <div class="stat-title "> Avgerage NT frequency</div>
            <div class="stat-value">{lemmaInfo.stats.totalFreq.toFixed(3)}</div>
            <div class="stat-desc">Frequency of {lemmaInfo.lemma} per 1,000 words in NT</div>
            </div>
            </div>

            <div class="stats shadow inline-block">
            <div class="stat">
            <div class="stat-title"> Percentage of NT use</div>
            <div class="stat-value">{(100* lemmaInfo.stats.bookStats[bookID].lexCounts.book / lemmaInfo.stats.count).toFixed(1)}%</div>
            <div class="stat-desc">Frequency of {lemmaInfo.lemma} per 1,000 words in NT</div>
            </div>
            </div>
        {/key}
    {:else if selectedTab==1}
        {#key bookID }
            {#if  theBookName}
            <h2>Counts and Frequencies Charts: {lemmaInfo.lemma} in {theBookAbbrev} and the NT</h2>

            
            
            <div class="stats shadow inline-block ">
                <h2>{lemmaInfo.lemma}: {theBookAbbrev} vs. Rest of NT </h2>
                <div class="stat">
                <div class="stat-title"> {lemmaInfo.stats.bookStats[bookID].lexCounts.book} of {lemmaInfo.stats.count} </div>
                <PieChart pieData={{labels:[theBookAbbrev,"Rest of NT"], nums: [lemmaInfo.stats.bookStats[bookID].lexCounts.book, lemmaInfo.stats.bookStats[bookID].lexCounts.restNT]}} />
                
                <div class="stat-value">{(100*lemmaInfo.stats.bookStats[bookID].lexCounts.book/lemmaInfo.stats.count).toFixed(2)}%</div>
                <div class="stat-desc">{theBookAbbrev}'s share of NT's total use of {lemmaInfo.lemma}
                    </div>
                </div>
            </div>
            
            {/if}

            

            {#if lemmaInfo.stats.bookStats[bookID].freqRatio && sections} 
            <div class="stats shadow inline-block">
                <h2>{theBookName}/NT Frequency Ratio</h2>


                <div class="stat">
                <div class="stat-title">How much more/less frequently does {theBookAbbrev} use {lemmaInfo.lemma} than the rest of the NT?</div>
                    {#if lemmaInfo.stats.count == lemmaInfo.stats.bookStats[bookID].lexCounts.book}
                    <div class="stat-value">{#if lemmaInfo.stats.count ==1}Hapax!{:else}No contest!{/if} </div>
                    <div class="stat-desc">
                    <span class="italic ">{theBookName} is the only NT book to use {lemmaInfo.lemma}{#if lemmaInfo.stats.count ==1}, and he does so only once{/if}!</span>
                    </div>
                    {:else}


                        <BarChart barData={{labels:[theBookAbbrev + " freq.",'Rest of NT freq.'],nums: [(lemmaInfo.stats.bookStats[bookID].freq.book).toFixed(3),MathUtils.floatRound(lemmaInfo.stats.bookStats[bookID].freq.restNT,3)]}}/>
                        <div class="stat-value">{lemmaInfo.stats.bookStats[bookID].freqRatio.toFixed(3)}</div>
                        <div class="stat-desc">(1.0=same; 2.0=2x; 0.5=half)</div>
                        <div class="stat-desc font-bold italic">     
                            And the winner is....
                            
                            {#if lemmaInfo.stats.bookStats[bookID].freqRatio > 1.2 }{theBookName}
                            {:else if  lemmaInfo.stats.bookStats[bookID].freqRatio > 0.8 }too close to call{:else}the NT{/if}!
                            
                        </div>
                {/if}
                </div>
                
            </div>

            {/if}


        {/key}
    {:else if selectedTab==2}




    <!-- CHARTS: -->

    {#key bookID && selectedTab && lemmaBookCountChartOptionIndex && showStats}
    <div class=""> 
    <h2>Use of {lemmaInfo.lemma} by NT Book:</h2>
    
    {#if lemmaBookCountsChartData}


    <!--<div class="w-screen"></div>-->
    <div class="mt-1 rounded-2xl shadow-2xl p-2 bg-white" >
        
        <select name="lemmaBookCountChartOption" id="lemmaBookCountChartOption" 
        bind:value={lemmaBookCountChartOptionIndex} class="inline-block align-top text-center self-center" >
        {#each lemmaBookCountChartOptions as name, index}
            <option value={index}>{name}</option>
        {/each}
        
        </select>
    <br/>  <i>{#if lemmaBookCountChartOptionIndex == 1}
                # per book:
                {:else if lemmaBookCountChartOptionIndex == 2}
                    per 1000 words:
                {/if}</i>

    {#if lemmaBookCountChartOptionIndex == 1}

    <div id="lemma-info-book-counts-chart">
        <BarChart barData={lemmaBookCountsChartData} 
        horizontal={true}/>
    </div>

    {:else if  lemmaBookCountChartOptionIndex == 2}
    <div id="lemma-info-nt-book-counts-chart">
        {#key lemmaBookCountChartOptionIndex}
        <BarChart barData={lemmaBookFreqChartData} 
        horizontal={true}/>
        {/key}
    </div>
    {:else if lemmaBookCountChartOptionIndex == 0 && lemmaBookTable?.data}
    
    <Grid data={lemmaBookTable.data} 
    sort={true} 
    columns={lemmaBookTable.columns}
    pagination={{limit:50}}
    style={"td{'font-family':'SBL BibLit'}"}
    />
    

    {/if}

    </div>
    {:else}

    <div class="block text-center w-full items-center">
        <Loading title="Loading chart data..." message=""/>
    </div>



    {/if}
    
    </div>
    {/key}
    {/if }
{/if}
</div>
<!--/showStats-->

<Modal2 bind:showModal={enableTextView} >

    <ViewTexts refs={lemmaInfo.stats.references} {tfServer}/>

</Modal2 >


<!-- {sections.map((id)=>tfLxxBooksDict.getRef(id)).join('; ')} -->
