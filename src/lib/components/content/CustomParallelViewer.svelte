<script>
import { onMount,untrack } from "svelte";
import Loading from "../ui/Loading.svelte";
import LemmaInfo from "./lemma/LemmaInfo.svelte";
import LinkSvg from  '../ui/icons/link.svg';
import { SynopsisOptions3  } from "./SynopsisClasses.svelte.js";
import { ParallelColumn,Word, TextAndRef,VerseWords,ParallelColumnGroup,parseSingleGroup } from "./parallelTexts.svelte.js";
import ParallelColumnSection from "./ParallelColumnSection.svelte";
import { N1904Server, lexemes} from "$lib/n1904/tfN1904";
import {SblGntServer} from '$lib/sblgnt/sblgnt.js';
import { Hotkey,SynopsisHotkeys } from "../ui/hotkeys.svelte.js";

import ParallelGospelSection from "./ParallelGospelSection.svelte";
import { mylog } from "$lib/env/env";
import * as bibleUtils from '$lib/n1904/bibleRefUtils.js'
import * as mathUtils from '$lib/utils/math-utils.js';
//import Button from '../ui/Button.svelte';
import ButtonSelect from '../ui/ButtonSelect.svelte';
import {TfServer, default as TfUtils} from './TfUtils.js';
import { LexemeInfo } from "../datastructures/lexeme";
import Modal2 from '../ui/Modal2.svelte';
import ModalButton from '../ui/ModalButton.svelte';
import Button from '../ui/Button.svelte';
// import { untrack } from 'svelte';
import { ColorUtils } from '$lib/utils/color-utils';
import GreekFilterInput from '../ui/GreekFilterInput.svelte';
import FilterInput from '../ui/FilterInput.svelte';
import { GreekUtils } from '$lib/utils/greek-utils';
import ArrowUp from '../ui/icons/arrow-up.svelte';
import ArrowDown from '../ui/icons/arrow-down.svelte';
import ArrowTop from '../ui/icons/arrow-top-icon.svelte';
import BulletsIcons from '../ui/icons/bullets-outline.svelte';
import CopyText from '../ui/CopyText.svelte';
import { findNextAnchor,findPrevAnchor, getAnchors} from '$lib/utils/ui-utils';
import OptionButton from "../ui/SelectButtons/OptionButton.svelte";
import Footer from './Footer.svelte';
import TitleNavbar from "./title-navbar.svelte";

let {
    live=false,
    keyevent=null,
    thisTabIndex=1,
    /**
    * @type {SynopsisOptions3} options
    */
    options=new SynopsisOptions3(),
    /**
     * @type {TfServer}
    */
    tfServer,
    
} = $props();

let currentServer=$state(tfServer);

/**
 * @type {SynopsisOptions3} myOptions
 */
let myOptions=options;
function setServer(){
    currentServer=tfServer;
}



let fetching = $state(false);
let expecting = $state(0);
let numReady=$state(0);
let ready = $derived(numReady >= expecting);
let dataReady = $state(false);
let showViewOptions=$state(false);
let showUnique = $state(false);
let showIdentical=$state(false);
let uniqueStyle = "lex-uniques";
let showLexemeHighlights = $state(false);
let showLookupPanel = $state(true);
let landingPage=$state(true);
let showInfoModal=$state(false);
let maxLexesToShow=$state(30);
/**
 * @type {Object|null} response
 */
let response=$state(null);

const maxCols = 4;

const requestModes =[
    {name:"Single Group"},
    {name: "Batch"}
];

let selectedRequestModeIndex = $state(myOptions.request.mode < requestModes.length ? myOptions.request.mode : 0);

let theNote = $state({heading: '', note:'',footer:''});

/**
 * 
 * @param {heading} heading
 * * @param {heading} note
 */
function displayNote(heading,note) {
    
    theNote.heading=heading;
    theNote.note=note;
    theNote.footer=currentServer.getNoteFooter();
    viewStates.views.notes.state = true;
}


/**
 * @type {string[]} refAreaInputs
 */
let refAreaInputs = $state(myOptions.request.columns && myOptions.request.columns.length ? myOptions.request.columns : ['Matt 1:1', "Mark 1:1"]); 
let numCols = $derived(refAreaInputs.length);

let batchInput=$state(myOptions.request.batch && myOptions.request.batch.length ? myOptions.request.batch.join("\n") : 'Matt 1:1|Mark 1:1|John 1:1\nMatt 5:17|Eph 2:14-16');

/**
 * @type {ParallelColumnGroup[]} texts
 */
let texts= $state([]);

/**
* @type {number[]} selectedLexes
*/
let selectedLexes=$state(myOptions.viewOptions.lexes);
//mylog("initialized selected lexes: " + selectedLexes.join(','));

let selectedGreekPalette=$derived(ColorUtils.myColorPalette(selectedLexes.length+myOptions.viewOptions.greekStrings.length));

/**
* @type {string[]} selectedGreekStrings
*/
let selectedGreekStrings=$state(myOptions.viewOptions.greekStrings);

let showLexOptionsInfo = $state(false);
    
let lemmasByID=$derived.by(()=>{
    let dict={}
    if (response && response.lexemes && response.lexemes) {
        for (const [lemma,lex] of Object.entries(response.lexemes)){
            dict[lex.id]=lemma;
        }
    }
    mylog("updated lemmasByID. Keys now:[" +Object.keys(dict).join(",")+"]");
    return dict;
});


/**
 * @type {Object<string,string>} lexClasses
 */
let customGreekClasses= $derived.by(()=>{// (greek expression)->css color (e.g., "#eee")
    
    /**
     * @type {Object<string,string>}
     */
    const ret = {}
    if(selectedLexes && selectedGreekStrings.length) {
        //mylog("building lexClasses...",true)
        for(const [relIndex,gk] of selectedGreekStrings.entries()) {
            const color = getColorOfGreek(gk);
            if (color) {
                const index = selectedLexes.length+relIndex
                let classes = "custom-greek-"+ relIndex;
                classes += " " + color;
                ret[gk] = classes;
            }

        }
    }
    return ret;
});

/**
 * @type {Object<number,string>} lexClasses
 */
let lexClasses= $derived.by(()=>{// id->css color (e.g., "#eee")
    
    /**
     * @type {Object<number,string>}
     */
    const ret = {}
    if(dataReady && response?.lexemes) {
        //mylog("building lexClasses...",true)
        for(const id of Object.values(response?.lexemes).map((o)=>o.id)) {
            
            let classes = "lex-"+id;
            if(selectedLexes.includes(id)){
                classes += " " + getColorOfLex(id)
            } 
            //  mylog("setting lex " + id + " to: " + classes,true);
            ret[id] = classes;
        }
    }
    return ret;
});

/**
 * @type {number[]} unselectedLexes
 */
let unselectedLexes =$derived.by(()=>{
    if (response && response.lexemes){
        return Object.values(response.lexemes).filter(
            (lex)=>!selectedLexes.includes(lex.id)).map((l)=>l.id).sort((a,b)=>a-b)}
    else
        return [];
});

//let unselectedLexBetaArray = $derived(unselectedLexes.map((lexID)=>texts.lexemes[lemmasByID[lexID]].beta));
let unselectedLexPlainArray = $derived(unselectedLexes.map((lexID)=>GreekUtils.removeDiacritics(lemmasByID[lexID])));

/**
 * @type {number[]} bestMatchedLexes
 */
let bestMatchedLexes=$state([]);

    
/**
 * @type {number[]} otherMatchedLexes
 */
let otherMatchedLexes=$state([]);


/**
 * 
 * @param {string[]} refsArray
 */
//async function fetchPostTextsBatch(refsArray){
//todo: refactor in another .svelte.js file, then test
    //texts = null;

    /**
     * @type {{book:string,chapter:number|null,verses:number[]}[]} bcvFetchArray
     */
 /*   const bcvFetchArray=currentServer.getBCVarrayFromRefs(refsArray);
    
    return await currentServer.getTexts(bcvFetchArray,true,true);
    //return texts;
}*/

/**
 * 
 * @param {string} theInput
 * @returns {ParallelColumnGroup[]}
 */
function parseGroupsBatch(theInput){
    
    const lines = theInput.trim().replaceAll(/\n+/g,"\n").split("\n").filter((s)=>s.length);
    const parGroups=[]

    for (let line of lines){
        const group = new ParallelColumnGroup();
        const regex = new RegExp(/^\[([^\]\[]+)\]/);
        const titleMatch = line.match(regex);
        group.title=  titleMatch && titleMatch.length > 1 ? 
            titleMatch[1] : '';
        line = line.replace(regex,'');
        group.parallelColumns=parseSingleGroup(line.split("|").filter((l)=>l.trim().length));
        
        parGroups.push(group);
    }
    return parGroups;
}

async function buildAndFetchPericopes(reset=true){

     
    //viewStates.views.lookup.state=false;
    //const parRefsOb
    dataReady=false;
   landingPage=false;
    if (reset) {
          
    // mylog("disabling sortFilter and focus...");
        resetViewOptions();
       
    }
    
    
    
    fetching = true;
    //fetchTexts();
    mylog(`buildAndFetchPericopes: selectedRequestModeIndex=${selectedRequestModeIndex}`)
    if (selectedRequestModeIndex==0) {
        texts = [new ParallelColumnGroup()];
        texts[0].parallelColumns = parseSingleGroup(refAreaInputs);
    }
    else { //presuming batch mode!
        texts = parseGroupsBatch(batchInput);
    }
    
    
    //mylog("after parsing input, but texts.parTexts[0].ref: " + texts.parallelColumns[0].textRefs[0].reference)
    //const parRefsObj = TfUtils.getParallelRefsArrays(texts.parallelColumns);
    const parRefsObj = TfUtils.getParallelGroupsRefsArrays(texts);

    response = await currentServer.fetchPostTextsBatch(parRefsObj.refsArray);
    
    //buildLexArrays();
    for (const [i,textGroup] of texts.entries()) {
        TfUtils.populateTextGroup(textGroup,response,parRefsObj.groupsIndices[i]);
    }
    fetching=false;
    dataReady= true;
    
    //mylog("Got response with " + response.texts.length + " texts. Here's 1:" )
    //mylog(response.texts[0].text)
   // mylog("here texts.ptexts[0].textR[0].text: " + texts.parallelColumns[0].textRefs[0].text)
    
}



function buildLexArrays(){
    //mylog("building LexArrays...", true)
    lemmasByID ={};
    if (texts) {
        for (const [lemma,lex] of Object.entries(response.lexemes)){
            lemmasByID[lex.id]=lemma;
        }
    }
    else{
        mylog("Cannot build LexArrays!")
    }

    
}

function resetViewOptions(lookup=false){
    
    
    viewStates.reset(lookup);
    
    myOptions.reset();
    emptySelectedLexemes();
    emptySelectedCustomGreek();
    
    //  focus=selectedGospel[selectedGospelIndex].value;
}


    

    function toggleViewOptionsModal(){
        if (showViewOptions)
            showViewOptions=false;
        else
            showViewOptions=true;

      
    }

   /**
    * 
    * @param {string} greekString
    */
    function getColorOfGreek(greekString){
    
        let colorString = ''
        if (selectedGreekStrings.includes(greekString)){
            const selectedIndex = selectedLexes.length + selectedGreekStrings.indexOf(greekString)
            colorString += ' '+ ColorUtils.getCustomBgTextColorClasses(selectedIndex);
        }
        
        return colorString;
    }

    /**
     * 
     * @param {number} lexid
     */
    function getColorOfLex(lexid){
    
        let colorString = ''
        if (selectedLexes.includes(lexid)){
            const selectedIndex = selectedLexes.indexOf(lexid)
            colorString += ' '+ ColorUtils.getCustomBgTextColorClasses(selectedIndex);
        }
        
        return colorString;
    }

    function getLexClasses(id){
        /*let classString="lex-"+id;
        let highlight=highlightLexeme(id)
        return classString + (highlight ? " " + highlight : '');
        */
        //mylog("getting Lex class for " + id, true);
        return lexClasses[id];

    }

    function emptySelectedCustomGreek(){
        //selectedGreekStrings.length = 0;
            options.resetProp('greekStrings');
    }

    function emptySelectedLexemes(){
        selectedLexes.length = 0;
    }

    function wordClick(id,bookName=''){
        const bookid=bookName ? tfServer.getBookID(bookName) : 0;
        //mylog(`wordclick(${id},${bookName}[id:${bookid}])`)
        if(options.viewOptions.highlightOnClick){
            toggleLex(id);
        }
        if(options.viewOptions.lexInfoClick){
            //mylog(`about to call showlexinfo(${id})`)
            showLexInfo(id,bookid);
        }

    }

    function toggleLex(id){
        //mylog("toggleLex("+id+")");
        if(selectedLexes.includes(id)) {
            selectedLexes.splice(selectedLexes.indexOf(id),1);

        }
        else {
           
            selectedLexes.push(id);

        }
    }

    /**
     * 
     * @param {string} string
     */
    function toggleGreekString(string){
        if(selectedGreekStrings.includes(string)) {
            selectedGreekStrings.splice(selectedGreekStrings.indexOf(string),1);

        }
        else {
           
            selectedGreekStrings.push(string);

        }

    }

    function highlightLexeme(id=0,color=null){
        let ret = ''
        ret += "bg-red-500";
        return ret;
    }

const viewStates=$state({
    views:{
        
      //  highlightOnClick: { description:  "Enable/disable highlight on click.", hotkeys:['c'], state: myOptions.viewOptions.highlightOnClick,modal:false},
       // unique: { description:  "Toggle Unique Lexeme color outlining", hotkeys:['u'], state: myOptions.viewOptions.unique,modal:false},
      //  identical: { description:  "Show (bold & underline) morphologically identical words shared by different gospels in a parallel group ",
       //     hotkeys:['m'], state:myOptions.viewOptions.identical,modal:false},
       // sections: { description:  "Jump to a section", hotkeys:['j'], state:false,modal:true},
        view: { description:  "View Options", hotkeys:['v'], state:false,modal:true},
        lookup: { description:  "Toggle Lookup input panel", hotkeys:['l',], state:false,modal:false},
        words: {description:  "Lexeme/Word Options", hotkeys:['w'], state:false,modal:true},
       // info: { description:  "Website and project information.", hotkeys:['i'], state:false,modal:true},
        help: { description:  "Show help menu", hotkeys:['h', '?'], state:false,modal:true},
        notes:{description: "Notes on the text",state:false,modal:true}
        
            
    },
    
   
    /**
     * @param {string} modalName
     */
    toggle(modalName){
        if (this.views[modalName].state) {
            this.views[modalName].state=false
        }
        else{
            this.views[modalName].state = true;
        }
    },

    /**
     * 
     * @param {string} key
     * @returns {string}
     */
    getViewNameFromKey(key){
        let retVal = '';
        const matchingViews = Object.entries(this.views)
            .filter(([name,obj])=>obj.hotkeys?.includes(key))
            .map(([k,v])=>k);
        if (matchingViews.length > 0){
            retVal = matchingViews[0]
        }
        
        return retVal;
    },

    /**
     * 
     * @param {boolean} lookup
     * @param {string[]} views
     */
    reset(lookup=false,views=[]){
        if (views.length){
            views.forEach((view)=>{
                this.views[view].state=false;
            })
        }
        else {
            for (const view of Object.keys(this.views)){
                this.views[view].state = false;
            }

        }

        this.views.lookup.state= lookup
        
    },

    /**
     * 
     * @param {string} viewName
     * @returns {boolean}
     */
    isVisible(viewName){
        let retVal = false;
        const view = this.views[viewName];
        if(view){
            retVal = view.state;
        }
        return retVal;
    },
    /**
     * @returns {string[]}
    */
    getVisible(){
        return Object.entries(this.views).filter(([viewName,obj])=>obj.state).map(([k,v])=>k);
    }

});


    const hotkeys=new SynopsisHotkeys(myOptions);
    hotkeys.enableHotkeys('><tbax');
    const hotkeys2=[
      
       
        {key:'c',name:'Highlight on Click',optionName:"highlightOnClick",function: ()=>{myOptions.viewOptions.highlightOnClick =!myOptions.viewOptions.highlightOnClick},navLetterButton:true},
        {key:'u',name:'Unique Lexemes',optionName:"unique",function: ()=>{myOptions.viewOptions.unique =!myOptions.viewOptions.unique},navLetterButton:true},
        {key:'i',name:'Identical Words',optionName:"identical",function: ()=>{myOptions.viewOptions.identical =!myOptions.viewOptions.identical},navLetterButton:true},
         {key:'s',name:'Similar Phrases',optionName:"similarPhrases",function: ()=>{myOptions.viewOptions.similarPhrases =!myOptions.viewOptions.similarPhrases},navLetterButton:true},
        {key:'m',name:'Show/hide options menu',optionName:"menuOpen",function: ()=>{myOptions.viewOptions.menuOpen =!myOptions.viewOptions.menuOpen}},
    ];

    let textAreaFocused=$state(false);

    

    function textAreaFocus(event){
        textAreaFocused=true;
    }
    function textAreaBlur(event){
        textAreaFocused=false;
    }
    function onkeydown(event){
        //mylog(`CustomPanel.keydown: ${event.key}; live: ${live}; textAreaFocused: ${textAreaFocused}`);
        if(live && !textAreaFocused ){
//            mylog("live and no text area focus!");
            const matchedView=viewStates.getViewNameFromKey(event.key);
            const modalVisibles=viewStates.getVisible().filter((name)=>(viewStates.views[name].modal)); 
            
            if (matchedView) {
                    
                if (!modalVisibles.length){
                    viewStates.toggle(matchedView);
//                    mylog(`we're HERE 0 for ${event.key} `);
                    
                }
                else{
//                    mylog(`we're HERE 1 for ${event.key} `);
                }
            }
            else if (!modalVisibles.length && hotkeys){
                hotkeys.keypress(event.key);
            }
            else{
//                mylog(`WHOA -- got not matchedView for ${event.key}`)
            }
             
        }
        else{
//            mylog(`customParView.onkeydown(${event.key}) did nothing!`);
        }
    }

    const wordTabs=['lexemes','custom'];
    let selectedWordTabIndex=$state(0);

    let customGreekInputText = $state('');
   $effect(()=>{customGreekInputText=GreekUtils.onlyPlainGreek(
        GreekUtils.beta2Greek(customGreekInputText),true,true).replaceAll('σ ','ς ');
    });
    

   

    /**
     *
     */
    function lookup(reset=true){
        
        setServer();
        buildAndFetchPericopes(reset);
    }
    //$inspect("Texts:", texts, "texts.lexemes:", [...texts.lexemes].join("; "))
    //$inspect("lemmasbyID.keys", Object.keys(lemmasByID), "selectedLexes:", selectedLexes, "response:", response, "texts:", texts);
    function addCol(){
        refAreaInputs.push('');
    }

    function removeCol(){
        refAreaInputs.pop();

    }

function makeURL(){
    let opt = myOptions.copy();
    
    //opt.viewOptions.greekStrings=myOptions.viewOptions.greekStrings;
    if(selectedRequestModeIndex==0){
        opt.request.columns=refAreaInputs;
    }
    else{
        opt.request.batch=batchInput.split("\n");
        opt.request.mode=1;
        
    }
    
    opt.request.tab=1;
    
    
    const baseurl = window.location.protocol  + "//" + window.location.host + "/";
    return baseurl + opt.generateURI();
   
}

function loadRequestOptions(){
    mylog("loadRequestOptions...")
  /*  if(Object.hasOwn(request,"hideSolos")) {mylog("hideSolos =request.hideSolos;"); hideSolos =request.hideSolos;}
    if(Object.hasOwn(request,"sort")) {mylog("sort =request.sort;"); sort =request.sort;}
    if(Object.hasOwn(request,"hideNonPrimary")) {mylog("hideNonPrimary=request.hideNonPrimary;"); hideNonPrimary=request.hideNonPrimary;}
    if(Object.hasOwn(request,"focusOn")) {mylog("focusOn=request.focusOn;"); focusOn=request.focusOn;}
    if(Object.hasOwn(request,"hideNonPrimarySolos")) {mylog("hideNonPrimarySolos=request.hideNonPrimarySolos;"); hideNonPrimarySolos=request.hideNonPrimarySolos;}
    if(Object.hasOwn(request,"unique")) {mylog("viewStates.views.unique.state=request.unique;"); viewStates.views.unique.state=request.unique;}
    if(Object.hasOwn(request,"identical")) {mylog("viewStates.views.identical=request.identical;"); viewStates.views.identical.state=request.identical;}
    if(Object.hasOwn(request,"selectedGospelIndex")) {mylog("selectedGospelIndex=request.selectedGospelIndex;"); selectedGospelIndex=request.selectedGospelIndex;}
    if(Object.hasOwn(request,"lexes")) {mylog("got lexes param!"); selectedLexes=request.lexes}
    if(Object.hasOwn(request,"greekStrings")) {mylog("got greekSrings!"); selectedGreekStrings=request.greekStrings}
    */

}

//let gotRequest = ((myOptions.columns && myOptions.columns.length) || (myOptions.batch && myOptions.batch.length));
let mounted=$state(false);

/**
 * @type {Object<number,LexemeInfo>} fetchedLexInfo
 */
let fetchedLexInfo=$state({});
let chosenLexIdToShow=$state(0);
let chosenLexBookId=$state(0);
let showLexModal=$state(false);
let lexInfoFetching=$state(false);
/**
 * 
 * @param {number} id
 * @param {number} bookid 
 */
async function showLexInfo(id,bookid=0){
    if (id) {
        chosenLexIdToShow=id;
        chosenLexBookId=bookid;

        showLexModal=true;
        if (!fetchedLexInfo[id]){
            lexInfoFetching=true;
            const lexInfo = await tfServer.fetchLexInfo(id);
            
            if (lexInfo){
                
                //showLexModal=true;
                lexInfo.stats=await tfServer.fetchLexRefsCounts(id,true);
                fetchedLexInfo[id]=lexInfo;
                
              //  mylog(`fetched lemma info for '${lexInfo.lemma}'`)
                
                //fetchedLexInfo[chosenLexIdToShow]=lexInfo;
            }
            else{
                //mylog(`Tried to get lex ${chosenLexIdToShow} but failed.`)
            }
            lexInfoFetching=false;
        }
        if(fetchedLexInfo[chosenLexIdToShow]){
            
            fetchedLexInfo=fetchedLexInfo;
        }
        showLexModal= fetchedLexInfo[chosenLexIdToShow] ? true : false;
    }
    
}

$effect(()=>{
    if (keyevent){

        untrack(()=> onkeydown(keyevent));
    }
})
onMount(() => {
    if (myOptions.request.fromURL){
        landingPage=false;
        
        loadRequestOptions();
        //viewStates.views.lookup.state=false;
        lookup(false);

    }
    else{
        viewStates.reset();
    }
    mounted = true;
});
//$inspect(myOptions.hideApp)
//$inspect(`refarea.0:'${refAreaInputs[0]}`);
</script>
{#snippet titleButtons(hideLookup=false,hideHelp=false)}
        <ul class="bg-white menu menu-horizontal w-auto ">
        
        {#if !landingPage }<li class="m-0 p-0 hidden md:list-item">   {@render menuButton()}</li>{/if}
        
        <li class="m-0 p-0"><ButtonSelect buttonText="?" buttonStyle="btn btn-xs btn-circle btn-ghost p-0 m-0 sm:ml-0.5" bind:selected={viewStates.views.help.state}/>
            </li>
        <li class="m-0 p-0" >
            <ButtonSelect bind:selected={viewStates.views.lookup.state} buttonText="" 
            buttonStyle="btn btn-xs btn-circle btn-ghost p-0 m-0 sm:ml-0.5" >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            </ButtonSelect>
        </li>
        

        
            {#each hotkeys.getNavButtonKeys() as hk}
                <li class={[!myOptions.viewOptions.menuOpen && dataReady ? 'sm:list-item': '', 'hidden','m-0','p-0' ]}>
                    <ButtonSelect buttonText={hk.key} buttonStyle="btn btn-xs btn-circle btn-ghost p-0 m-0 sm:ml-0.5 " 
                    bind:selected={myOptions.viewOptions[hk.optionName]} tooltip={hk.name} tooltipbottom
                    />
                </li>
        
        {/each}
        
    </ul>
{/snippet}
{#snippet appTitle(headingTag="h1", short=false, classes=[])}
    <svelte:element this={headingTag} class={[classes, "inline-block"]}>
     
    {#if !short}Custom NT{/if} Synopsis</svelte:element> 
    
    {@render titleButtons()}
   
   
{/snippet}
{#snippet appSummary(heading=true,headingTag="h1")}

    {#if heading}

        {@render appTitle(headingTag)}
        <hr/>
    {/if}
    
    Based on Kurt Aland's <i>Synopsis Quattuor Evangeliorum</i>, using <a href="https://www.sblgnt.com">The SBL Greek New Testament (2010)</a> or, optionally, Nestle's 1904 edition of the <i>Greek New Testament.</i><br/>
    Enter some NT references in the columns, or select "batch" mode to trying something more fancy.
{/snippet}
{#snippet resultsNav(short=false,tag='li',classes=[])}
    {@const theTag = tag ? tag : 'span'}    
    {#if mounted && dataReady}
    
        
           <!-- <svelte:element this={theTag} class={classes}><ButtonSelect bind:selected={viewStates.views.lookup.state} buttonText="Again!" tooltip="Toggle lookup panel." /></svelte:element>-->
            <svelte:element this={theTag} class={classes}><ButtonSelect buttonText="☰ Words" 
            bind:selected={viewStates.views.words.state} tooltipbottom  tooltip="View Lexeme and custom Greek options."/></svelte:element>  
           <svelte:element this={theTag} class={classes}><ButtonSelect buttonText="Similar" bind:selected={myOptions.viewOptions.similarPhrases} tooltipbottom tooltip="Show lexically similar phrases (same lexemes, but possibly different forms/morphology). With notes of sandlewood and bourbon, this pairs well with the 'Exact' option."/></svelte:element>
            <svelte:element this={theTag} class={classes}><ButtonSelect buttonText="Exact" bind:selected={myOptions.viewOptions.exactPhrases} tooltipbottom tooltip="Show exactly matching phrases (same lexemes, same order, some forms). This pairs well with the 'Similar' option."/></svelte:element>
            <svelte:element this={theTag} class={classes}><ButtonSelect bind:selected={myOptions.viewOptions.unique} buttonText="Unique" tooltipbottom  tooltip="Outline all lexemes unique to each column."/></svelte:element>
            <svelte:element this={theTag} class={classes}><ButtonSelect bind:selected={myOptions.viewOptions.identical} tooltipbottom tooltip="Toggle Bold/underline morphologically identical words, even if they are in diverse positions. This generates 'false positives.'" 
                    buttonText="Identical"/></svelte:element>
            <!--<svelte:element this={theTag} class={classes}><ButtonSelect buttonText="Auto Highlight" bind:selected={myOptions.viewOptions.highlightOnClick}  tooltipbottom  tooltip="If enabled, clicking on any word will highlight all instances of the lexeme. Like fish with red wine, this does not pair well with 'Similar phrases' highlighting."/></svelte:element>-->
           
         

               
                <svelte:element this={theTag} class={[classes, 'menu']}>
                    <label class="label tooltip" 
                        data-tip="Highlight lexemes"    
                            for="highlight-click-check2">
                     <input  class="toggle" id="highlight-click-check2" type="checkbox" bind:checked={myOptions.viewOptions.highlightOnClick}/>Highlight {#if !short} Lexemes{/if}
                    </label>
                </svelte:element>
                  <svelte:element this={theTag} class={[classes, 'menu']}>
                    <label class="label tooltip " 
                        data-tip="Show Lexeme Info on Click"    
                            for="lexeme-info-click2">
                     <input  class="toggle" id="lexeme-info-click2" type="checkbox" bind:checked={myOptions.viewOptions.lexInfoClick}/>Stats{#if short}{:else}{/if}
                    </label>
                
                </svelte:element>  
            {#if currentServer.abbrev==SblGntServer.abbrev}
                <svelte:element this={theTag} class={[classes,["tooltip","tooltip-bottom","menu"]]} 
                data-tip="Show/hide the SBL GNT apparatus marks in the text. This also effects the 'copy' buttons.">
                <label class="label" for="hide-app-check2">
                    <input  class="toggle " id="hide-app-check2" type="checkbox"
                    bind:checked={myOptions.viewOptions.hideApp}/>Hide appar{#if !short}atus{:else}.{/if}</label>
                </svelte:element>
                {/if}  
                   <svelte:element this={theTag} class={classes}><Button buttonText="Reset" tooltipbottom  tooltip="Reset options" buttonColors={"btn-primary"}
                onclick={()=>{myOptions.reset(); myOptions.viewOptions.menuOpen=true}}
            /></svelte:element> 
        
    {/if}
{/snippet}
{#snippet menuButton()}
<ButtonSelect buttonText="☰" 
        buttonStyle="btn btn-xs  btn-circle btn-ghost  p-0" bind:selected={options.viewOptions.menuOpen} tooltip="Expand menu options" tooltipbottom={true}/>
{/snippet}
{#snippet lookupPanel()}
<div class="block text-center items-center">
<h3 class="italic">Choose your <span class="line-through">weapons</span> NT Bible passages:</h3>


    {#if selectedRequestModeIndex == 0}
        {#each refAreaInputs as areaInput, index}
        <div class="inline-block m-3 text-left">
            <label for="refarea{index}" class="label cursor-pointer block  ">
                <span class="label-text">Column {index+1}:</span></label>  
            <textarea id="refarea{index}" class="align-middle resize" rows="1"
                        bind:value={refAreaInputs[index]}
                    onfocus={textAreaFocus} onblur={textAreaBlur}
                        ></textarea>
        </div>         
            

        {/each}
        <div class="block">
        {#if numCols <= maxCols}<Button buttonStyle="btn btn-sm btn-ghost" onclick={addCol} buttonText="+" tooltip="Add Column"/>{/if}
        {#if numCols >1 }<Button onclick={removeCol} buttonStyle="btn btn-sm btn-ghost"  buttonText="-" tooltip="Remove Last Column"/>{/if}
        </div>
    {:else}
        <br/>
        <textarea bind:value={batchInput} cols="20" rows="10"
        onfocus={textAreaFocus} onblur={textAreaBlur}
        /><br/>
    {/if}
    <div class="mb-2">
    <label for="request-mode">Mode:</label>
    <select name="request-mode" bind:value={selectedRequestModeIndex}>
        {#each requestModes as rMode,i}
            <option value={i}>{rMode.name}</option>
        {/each}

    </select>
    <Button onclick={lookup} buttonText="Lookup!" ready={!fetching}/>
    </div>
</div>
{/snippet}
<div id="header-nav-section" class="self-center text-center fixed bg-white z-40 top-8  m-auto w-full" >


<div class="navbar bg-base-100 text-left sm:text-center  shadow-sm pb-0 mb-0 sm:mb-1 sm:pb-1 ">
  
  <div class="text-left sm:navbar-center sm:self-center  sm:w-full sm:m-auto">

            <div class="text-left sm:text-center sm:self-center w-full border-0"> 
                <div id="title-panel">
                      <TitleNavbar title="Custom Greek NT Synopsis" mediumtitle="Custom NT Synopsis" shorttitle="NT Synopsis" 
                        viewStates={viewStates}
                        {hotkeys} bind:options={myOptions} 
                        showResultsButtons={dataReady} 
                        hideLookup={!dataReady || landingPage} />
                </div> 

                {#if myOptions.viewOptions.menuOpen}
                <div class="absolute left-0 m-auto dropdown sm:hidden text-left overflow-auto">
                    
                    <ul 
                    class="menu menu-horizontal bg-base-100 rounded-box z-1 mt-3 w-auto p-2 shadow text-left ">
                    {@render resultsNav(true,'li')}
                    
                    </ul>
                    
                </div>
                

                <div class="bg-white text-left sm:text-center m-auto hidden  menu-horizontal flex-wrap sm:block lex-wrap w-full ">
                    
                    {@render resultsNav(false,'div',['inline-block'])}
                </div>
                {/if}
            </div>
        </div>
  <div class="navbar-end hidden">
  </div>
</div>


</div>
<div id="main-content-div" class="self-center relative text-center bg-white z-20 mt-10 " >
{#if landingPage}
<div id="landing-lookup">
    {@render lookupPanel()}
    </div>
{/if}

<div id="texts1" class="block">
<hr/>


{#if !(mounted && dataReady)}
    {#if fetching && !dataReady}
    <Loading title="Loading texts..." message={[]}/>
    {:else}
    <span class="italic mt-3 pt-5"> Enter some valid NT references and click "Lookup!"</span>
    {/if}
{:else}

    <hr/>
    <h2>Parallel NT Texts from {currentServer.name}:
        <CopyText icon={LinkSvg} 
                getTextFunc={makeURL}
                tooltip='Copy URL'
                
                />

    </h2>
    {#each texts as textGroup,i}
    <hr class=" m-1 p-1"/>
    <div class="anchor" id="group-{i+1}">
    {#if texts.length > 1}<h3 class="font-bold underline">Group #{i+1}{#if textGroup.title}: {textGroup.title}{/if}</h3>{/if}
    <ParallelColumnSection parTextGroup={textGroup}  wordClick={wordClick} 
                        cssClassDict={lexClasses}
                        cssCustomDict={customGreekClasses}
                        options={myOptions}
                        showNotes={true} 
                        showNotesFunction={displayNote}
                        {selectedGreekPalette}
                        />
    </div>
    {/each}
    

        
{/if}
</div>

</div>


<Modal2 bind:showModal={viewStates.views.words.state}>

    <div class="max-w-full block text-center">
                

        <div role="tablist" class="tabs tabs-lifted">
            <a role="tab" class="tab {selectedWordTabIndex==0 ? 'tab-active' : ''} " tabindex=0 onclick={()=>{selectedWordTabIndex=0}} >Lexemes</a>
            <a role="tab" class="tab {selectedWordTabIndex==1 ? 'tab-active' : ''} " tabindex=1 onclick={()=>{selectedWordTabIndex=1}}>Custom</a>
        </div>
        
            <div class="{selectedWordTabIndex== 0 ? 'block' : 'hidden'}">
             <h1>Selected Lexemes</h1>
            {#if selectedLexes.length}
            
            <h2>Selected Lexemes:</h2>
            <i>Click on a lexeme to remove it.</i>
            <br/>
            {#each selectedLexes as lex, index}
                 <Button onclick={()=>toggleLex(lex)} buttonText={lemmasByID[lex]} buttonColors={getColorOfLex(lex)} 
                    bgFontObj={selectedGreekPalette[index]}
                    buttonType=''/> 
               
             {/each}
                
              

                <br/>
            <Button onclick={emptySelectedLexemes}  buttonText="Clear All"/>
            {:else}<br/>
            <i>None selected. Click on a word in the text, or select a lexeme below. Use the search box to find a specific word (type in Latin characters, which will automatically convert to Greek)</i>

            
            {/if}
            <hr class="!border-slate-200"/>
            <h2>Unselected Lexemes</h2>
            <i>Click to add/highlight. Type in search box to find words.</i>
            <GreekFilterInput itemsList={unselectedLexPlainArray}
            labelText=""
            bind:bestMatches={bestMatchedLexes}
            bind:otherMatches={otherMatchedLexes} tooltip="Type latin characters to search for Greek words"/>
            <br>
              {#if bestMatchedLexes.length == 0 && otherMatchedLexes.length == 0}
                <i>None found. Showing all lexemes:</i><br/>
                        {#if unselectedLexes.length > 30 && maxLexesToShow == 0}
                                
                        <Button buttonText='Show less...' onclick={()=>{maxLexesToShow=30}}/>
                            <br/>
                        {/if}
                    {#each unselectedLexes as id,index}
                        
                        {#if (maxLexesToShow == 0 || maxLexesToShow >= unselectedLexes.length)  || ((unselectedLexes.length > maxLexesToShow) && index < maxLexesToShow )}
                            
                        <Button onclick={()=>toggleLex(id)} 
                            buttonText={lemmasByID[id]} 
                            buttonType="btn-accent" style="hover:text-white"/> 
                        
                        {/if}

                    {/each}
                        {#if unselectedLexes.length > maxLexesToShow}
                                <br/>
                        <Button buttonText='Show more...' onclick={()=>{maxLexesToShow=0}}/>
                        {/if}
              {:else}
                 <h1>Trying to filter!</h1>
                 <h3>Best matches:</h3>
                 {#if bestMatchedLexes.length}
                    {#each bestMatchedLexes as lexIndex}
                    {@const lexId = unselectedLexes[Number(lexIndex)]}
                    {@const lemma=lemmasByID[lexId]}
                    <!--  bestMatched.lexIndex = {lexIndex}, LexID={lexId}, Lemma='{lemma}'-->
                
                    <Button onclick={()=>toggleLex(lexId)} 
                    buttonText={lemma} 
                    buttonType="btn-accent" style="hover:text-white"/> 
                    {/each}
                    {:else}
                     <i>None found.</i>
                    {/if}
                    {#if otherMatchedLexes.length}
                        <h3>Other Matches:</h3>
                            {#each otherMatchedLexes as lexIndex}
                        {@const lexId = unselectedLexes[Number(lexIndex)]}
                        {@const lemma=lemmasByID[lexId]}
                        <!--  bestMatched.lexIndex = {lexIndex}, LexID={lexId}, Lemma='{lemma}'-->
                    
                        <Button onclick={()=>toggleLex(lexId)} 
                        buttonText={lemma} 
                        buttonType="btn-accent" style="hover:text-white"/> 
                        {/each}
                    {/if}
                {/if}

            </div>
                
           
           <!-- custom greek: -->
             <div class="{selectedWordTabIndex== 1 ? 'block' : 'hidden'}">
             <h1>Custom Greek Expressions</h1>

             <i>Enter some text in the text box below, then press enter. Type in Latin characters, which will αυτοματως convert to Greek.</i><br/>
             <input type="text" size="15" 
                bind:value={customGreekInputText} placeholder="Type here" 
                class="input input-bordered w-full max-w-xs" 
                onkeydown={(e)=>{if (e.key == 'Enter') toggleGreekString(customGreekInputText);}}/>
                <Button onclick={()=>toggleGreekString(customGreekInputText)} buttonText='Toggle'/>
                <Button onclick={()=>{customGreekInputText=''}} buttonText="Clear Input" buttonStyle='btn btn-ghost btn-md'/>
            
            {#if selectedGreekStrings.length}
            
                <h2>Selected Custom Greek Word Forms:</h2>
                <i>Click on any word-form to remove it.</i>
                <br/>
                {#each selectedGreekStrings as gk,index}
                <Button onclick={()=>toggleGreekString(gk)} buttonText={gk}  buttonType=''
                    bgFontObj={selectedGreekPalette[index+selectedLexes.length]}
                    /> 
                {/each}<br/>
                <Button onclick={emptySelectedCustomGreek}  buttonText="Clear All"/>
            {:else}<br/>
                
                <i>None selected.</i>
 
            {/if}
           
            </div>

    </div>
</Modal2>

<Modal2 bind:showModal={viewStates.views.notes.state} title="Notes" onclose={()=>{theNote.heading=''; theNote.note=''}}>
    <h2>{theNote.heading}</h2>
    <ul>

    {#each theNote.note.split("\n") as line}
    <li>{line}</li>
    {/each}

    </ul>

    <hr/>
    <span class="italic text-xs/0">{theNote.footer}</span>
</Modal2>

<Modal2 bind:showModal={viewStates.views.help.state} title="Help: Custom Synopsis Viewer">
    
    <div class="m-auto  items-center text-center ">
    <div class="inline-block text-left"> 
    Enter several columns of NT references to see them in parallel columns. There are two options:
    <ol class="list-decimal ml-9">
        <li><span class="bold">Single group mode:</span> Enter a group of texts in each column (add/subtract columns by clicking the +/- buttons). Seperate references within a column with a colon or newline.</li>
        <li><span class="bold">Batch mode (aka "Awesome Sauce"):</span>Enter several groups of rows, one group per row. Separate columns with a "pipe" (|) symbol. Separate references within a single column by a colon.</li>
    </ol>
    Press "Lookup!" when you're ready. Then hold on to your exegetical seatbelts and enjoy the NT synopsis ride...
    </div>
    <hr class="m-5"/>

    <h2 class="underline">Results Options: Unique and Identical Words</h2>
             <div class=" m-auto inline-block text-left">
                <ul class="list-disc ml-9">
                    <li>Enabling <b>"Unique"</b> will draw <span class="outline outline-blue-400">an outline</span> (one color per gospel) around each lexeme that is unique to a specific gospel, i.e., that shows up in only one column of a single parallel group.</li>
                    <li>Enabling <b>"Identical"</b> will <span class="font-bold underline">bold and underline</span> all morphologically identical words shared by at least two gospels in the same parallel group </li>
                    <li>Enabling <b>"Auto Highlight"</b> will toggle <span class="bg-cyan-500 text-white">highlighting</span> of all instances of the lexeme.</li>
                    <li>Enabling <b>"Similar"</b> will underline and highlight "lexically-identical" phrases that are common between at least two columns. "Lexically identical" here refers to those phrases which have the same lexemes in the same sequence even if they differ morphologically. This crosses verse boundaries.</li>
                    <li>Enabling <b>"Exact"</b> will double-underline and overline <i>exact</i> matches (same lexemes, same order, same morphology) of phrases that are common between at least two columns.</li>
                </ul>
    
            </div>
   
   <hr class="m-5"/>
            <h2 class="inline text-center ">Hotkeys: <i>The keyboard is your friend!</i></h2>
            
            <table class="table-auto self-center m-auto text-left "><tbody>
                <tr class="border-0  border-b border-collapse border-gray-200" ><th>Key</th><th>Function</th></tr>
                
        {#each Object.entries(viewStates.views) as [theViewName,theViewObj]}
            {#if theViewObj.hotkeys && theViewObj.hotkeys.length}
            <tr>
                <td class="p-2">{theViewObj.hotkeys.map((k)=>"["+k+"]").join(",")} </td>
                <td class="p-2">{theViewObj.description}</td>
            </tr>
            {/if}
        {/each}
        {#each hotkeys as hk}
            <tr>
                <td class="p-2">[{hk.key}] </td>
                <td class="p-2">{hk.name}</td>
            </tr>
        {/each}
        </tbody>
            </table>
    </div>

</Modal2>

<Modal2 bind:showModal={viewStates.views.lookup.state} title="Lookup!">
    {@render lookupPanel()}

</Modal2>

<Modal2 bind:showModal={showLexModal} title="Lexeme Info and Stats">
    
    {#if chosenLexIdToShow && fetchedLexInfo[chosenLexIdToShow]}
    <LemmaInfo lemmaInfo={fetchedLexInfo[chosenLexIdToShow]} tfServer={currentServer} bookID={chosenLexBookId}/>
    {:else} 
    <div class="block w-full text-center">
    <Loading message="" title="Loading Lexeme Info and Stats..."/>
    </div>
    
    
    {/if}

</Modal2>