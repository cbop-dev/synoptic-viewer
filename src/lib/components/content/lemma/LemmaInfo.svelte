<script>
import { TfServer } from "../TfUtils";
import Button from "$lib/components/ui/Button.svelte";
import Loading from "$lib/components/ui/Loading.svelte";
import Icon from "$lib/components/ui/icons/Icon.svelte";
import BarsSvg from "$lib/components/ui/icons/colorful-bar-chart.svg";
import BookSvg from "$lib/components/ui/icons/book-open.svg";
import CopyText from "$lib/components/ui/CopyText.svelte";
import { LexemeInfo} from "$lib/components/datastructures/lexeme";
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


/**
 * @type {{ lemmaInfo:LexemeInfo,
 *          tfServer:TfServer,
 *          bookID:number,
 * }}
 */
let {

    lemmaInfo=$bindable(),
    tfServer,
    //sectionWords=0,
    bookID=0,//optional, if we want to see book stats for this lexeme
} = $props();

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

let theBookName =$derived(bookID ? tfServer.getBookSyn(bookID) : "");
let theBookAbbrev=$derived(bookID ? tfServer.getBookAbbrev(theBookName) : "");



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

let lemmaBookCountsChartData=$derived({
            nums: Object.values(lemmaInfo.stats.bookStats).map((s)=>s.count),
            labels: Object.keys(lemmaInfo.stats.bookStats).map((id)=>tfServer.booksDict[Number(id)].abbrev)
        });
    


let lemmaBookCountChartOptionIndex = $state(0);
let lemmaBookCountChartOptions =[
    "Data Table",        
    "Lemma Count",
    "Frequency",
        
]

let lemmaBookFreqChartData= $derived(lemmaInfo.stats.bookStats && Object.keys(lemmaInfo.stats.bookStats).length ?
        
         {
            nums: Object.entries(lemmaInfo.stats.bookStats).map(([id,obj])=> (1000 * obj.count / tfServer.booksDict[Number(id)].words)),
            labels: Object.keys(lemmaInfo.stats.bookStats).map((id)=>tfServer.booksDict[Number(id)].abbrev)
        }
        
     :
       null);
    

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
let zoomCharts = $state(false);
let sectionRef = $derived(sections.length ? sections.map((sId)=>
    tfServer.booksDict[bookID] ?
        tfServer.booksDict[bookID].abbrev
        : ""
).filter((b)=>b).join(";") : '');
//$inspect("bookcounts chart data:", lemmaBookCountsChartData);

let chosenBookId=$state(bookID);
let selectedTab=$state(0);
$inspect(`bookid:${bookID}; bookname: ${theBookName}; bookAbbrev: ${theBookAbbrev}`);
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
</style>

<div class="items-center text-center">
<h1 class="font-bold text-xxl greek">{lemmaInfo.lemma}</h1>

<h2 class="inline-block">Gloss:</h2> {lemmaInfo.gloss}<br/>
<!--<h2 class="inline-block">Part of speech:</h2> {lemma.pos}-->

<div class="block text-center m-0 p-0 mt-1 self-center">
<ButtonSelect bind:selected={showReferences} ><Icon svg={BookSvg}/>See all {lemmaInfo.stats.count} reference(s)</ButtonSelect>

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
<h2 class="font-bold underline">All {lemmaInfo.stats.count} NT Occurrences of {lemmaInfo.lemma}</h2>
 <div class="rounded-2xl bg-slate-100/80 p-2 shadow">{theRefs}
<CopyText copyText={theRefs}/> </div>

</div>
<!--{#each lemmaInfo.stats.references as ref}
    {ref}
{/each}-->
{/if}


<!-- STATS/CHARTS-->

{#if showStats}
{@const tabs=["Data","Small Charts","Large Charts/Table"]}
<hr/>
<h2 class="text-2xl">Stats and Charts</h2>

<Tabs headings={tabs} bind:selectedTabIndex={selectedTab} classes={['inline-block','text-center']}/>
<div class="inline-block float-right p-1.5 text-sm">
See Stats for:
<select bind:value={chosenBookId} >
            {#each Object.keys(lemmaInfo.stats.bookStats) as bId}
            
            <option value={Number(bId)}>{tfServer.booksDict[bId].abbrev}</option>
            {/each}
        </select><Button buttonText="Go!" onclick={()=>{bookID=chosenBookId}}></Button>
        
</div>
<br class="clear-both"/>



    {#if selectedTab==0}
    <!--data-->
        {#key bookID && selectedTab}
            {#if sections.length > 0}

            <h2>Lemma Stats: {theBookName} vs. NT</h2>
            


            <!-- stats section-->
            <div class="stats stats-vertical lg:stats-horizontal shadow inline-block">
                <div class="stat">
                <div class="stat-title"> Book Word count </div>
                <div class="stat-value">{lemmaInfo.stats.bookStats[bookID].count}</div>
                <div class="stat-desc">Total in Book</div>
                </div>
            </div>
            {/if}
            <div class="stats shadow inline-block">
                <div class="stat">
                <div class="stat-title"> NT Word count </div>
                <div class="stat-value">{lemmaInfo.stats.count}</div>
                <div class="stat-desc">Total in {tfServer.name}</div>
                </div>
            </div>

            {#if lemmaInfo.stats.bookStats[bookID].freq } 
            <div class="stats shadow inline-block" >
                <div class="stat">
                <div class="stat-title"> Book frequency</div>
                <div class="stat-value">{lemmaInfo.stats.bookStats[bookID].freq.toFixed(3)}</div>
                <div class="stat-desc">per 1,000 words</div>
                </div>
            </div>
            {/if}


            <div class="stats shadow inline-block">
            <div class="stat">
            <div class="stat-title"> NT frequency</div>
            <div class="stat-value">{lemmaInfo.stats.totalFreq.toFixed(3)}</div>
            <div class="stat-desc">per 1,000 words</div>
            </div>
            </div>

        {/key}
    {:else if selectedTab==1}
        {#key bookID && selectedTab}
            {#if  theBookName}
            <hr/>
            <div class="stats shadow inline-block ">
                <h2>{theBookName} vs. NT Lemma Count</h2>
                <div class="stat">
                <div class="stat-title"> % of NT's </div>
                <PieChart pieData={{nums: [lemmaInfo.stats.bookStats[bookID].count, lemmaInfo.stats.count-lemmaInfo.stats.bookStats[bookID].count]}} />
                
                <div class="stat-value">{(100*lemmaInfo.stats.bookStats[bookID].count/lemmaInfo.stats.count).toFixed(2)}%</div>
                <div class="stat-desc">This section's share of NT's total use of this word.
                    </div>
                </div>
            </div>
            {/if}

            

            {#if lemmaInfo.stats.bookStats[bookID].bookTotalFreqRatio && sections} 
            <div class="stats shadow inline-block">
                <h2>{theBookName}/NT Frequency Ratio</h2>
                <div class="stat">
                <div class="stat-title"> How much more/less does {theBookAbbrev} use this lemma?</div>
                <BarChart barData={{nums: [(lemmaInfo.stats.bookStats[bookID].freq).toFixed(3),MathUtils.floatRound(lemmaInfo.stats.totalFreq,3)]}}/>
                <div class="stat-value">{lemmaInfo.stats.bookStats[bookID].bookTotalFreqRatio.toFixed(3)}</div>
                <div class="stat-desc">(1.0=same; 2.0=2x; 0.5=half)</div>
                </div>
            </div>

            {/if}


        {/key}
    {:else if selectedTab==2}




    <!-- CHARTS: -->

    {#key bookID && selectedTab}
    <div class=""> 
    <h2>Use by Book:</h2>
    {#key lemmaBookCountsChartData && lemmaBookCountChartOptionIndex}
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
    {#key lemmaBookCountChartOptionIndex && showStats}
    <Grid data={lemmaBookTable.data} 
    sort={true} 
    columns={lemmaBookTable.columns}
    pagination={{limit:50}}
    style={"td{'font-family':'SBL BibLit'}"}
    />
    {/key}

    {/if}

    </div>
    {:else}

    <div class="block text-center w-full items-center">
        <Loading title="Loading chart data..." message=""/>
    </div>



    {/if}
    {/key}
    </div>
    {/key}
    {/if }
{/if}
</div>
<!--/showStats-->



<!-- {sections.map((id)=>tfLxxBooksDict.getRef(id)).join('; ')} -->
