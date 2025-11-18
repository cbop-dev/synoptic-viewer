<script>
import { onMount, untrack } from 'svelte';
import Footer from './Footer.svelte';
import { SynopsisOptions3} from './SynopsisClasses.svelte.js';
import Icon from '../ui/icons/Icon.svelte';
import LinkIcon from '../ui/icons/link-icon.svelte';
import LinkSvg from  '../ui/icons/link.svg';
import {gospelParallels} from '@cbop-dev/aland-gospel-synopsis'
import parallelColumnsSvelte, { ParallelColumn, GospelPericopeGroup,Word, TextAndRef,VerseWords } from "./parallelTexts.svelte";
import { N1904Server, lexemes} from "$lib/n1904/tfN1904";
import { SblGntServer } from '$lib/sblgnt/sblgnt.js';

//import {tfServer,lexemes} from '$lib/sblgnt/sblgnt.js'
import ParallelGospelSection from "./ParallelGospelSection.svelte";
import { mylog } from "$lib/env/env";
import * as bibleUtils from '$lib/n1904/bibleRefUtils.js'
import * as mathUtils from '$lib/utils/math-utils.js';
//import Button from '../ui/Button.svelte';
import ButtonSelect from '../ui/ButtonSelect.svelte';
import {default as TfUtils} from './TfUtils.js';
import Modal2 from '../ui/Modal2.svelte';
import { TfServer } from './TfUtils.js';
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


//import { generateHslColorGradient } from '../ui/chartUtils';
   /**
     * @type {{options:SynopsisOptions2,
     * allowEverything:boolean,
     * live:boolean,
     * tfServer:TfServer}}
     */
let {
    allowEverything=false,
    /**
     * keyboard event
    */
    keyevent=null,
    /**
     * @type {SynopisOptions3} options
    */
    options=new SynopsisOptions3(),
    //viewOptions=new ViewOptions(),
    live=true,
    /**
     * @type TfServer
    */
    tfServer
}=$props();
//mylog("NTSynPanel: about to copy options")
mylog(`typeof options: ${typeof options}`)
let myOptions=options;

let fetching = $state(false);
let expecting = $state(0);
let numReady=$state(0);
let ready = $derived(numReady >= expecting);
let dataReady = $state(false);
let showSectionLinks=$state(false);
let showViewOptions=$state(false);
//let showUnique = $state(false);
//let showIdentical=$state(false);
let uniqueStyle = "lex-uniques";
//let hideSolos = $state(false);
//let hideNonPrimarySolos = $state(false);
//let showLexemeHighlights = $state(false);
let showLookupPanel = $state(true);
// let showViewOptions = $state(false);
//let landingPage=$state(true);
//let gotRequest = myOptions ? (myOptions.request.pericopes && myOptions.request.pericopes.length  
  //  || myOptions.request.sections && myOptions.request.sections.length) : false;
let landingPage = $state(!myOptions.request.fromURL);
let requestProcessed = $state(false);
let enableSecondary=$state(true);

let showInfoModal=$state(false);
let maxLexesToShow=$state(30);

/**
* @type {number[]} selectedLexes
*/
let selectedLexes=$state(myOptions.viewOptions.lexes);

/**
* @type {string[]} myOptions.viewOptions.greekStrings
*/
//let myOptions.viewOptions.greekStrings=$state(myOptions);
myOptions.viewOptions.greekStrings
//let selectedGospelIndex =$state(0);
const gospelOptions =[
{value: '', name: "None", abbrev:""},
{value: gospelParallels.gospels.names.MATTHEW, name: "Matthew", abbrev:"matt"},
{value: gospelParallels.gospels.names.MARK, name:  "Mark", abbrev:"mark"},
{value: gospelParallels.gospels.names.LUKE, name:  "Luke", abbrev:"luke"},
{value: gospelParallels.gospels.names.JOHN, name: "John", abbrev: "john"}

];
/**
 * @type {string} selectedGospel
 */
let selectedGospel=$derived(gospelOptions[myOptions.viewOptions.selectedGospelIndex].value);
//let hideNonPrimary = $state(true);
//what is this for?
let hideOthers = $state(false);
//let focusOn=$state(false);
let focused=$derived.by(()=>{
    let retVal = '';
    if (myOptions.viewOptions.focusOn){
        retVal = selectedGospel;
    }
    return retVal;
});
let sort = $state(false);

let callSortFilter=$derived(myOptions.viewOptions.hideSolos || (gospelParallels.gospels.isValid(selectedGospel)   &&
( myOptions.viewOptions.sort ||myOptions.viewOptions.hideNonPrimary || myOptions.viewOptions.focusOn|| myOptions.viewOptions.hideNonPrimarySolos)));

/**
 * @description Array of pericopes groups, with refs for each gospel (matt,mark,luke,john,other),
 *  derived from 'filteredPericopes' and (maybe?? see next variable comment) retaining the same order.
 * @type {GospelPericopeGroup[]} perGroups
 */
let perGroups = $state([]);

//is the sorting here necessary???
let filteredPerGroups=$derived(perGroups.filter((g)=>filteredPericopes.includes(g.id)).toSorted(
    (a,b)=>filteredPericopes.indexOf(a.id)-filteredPericopes.indexOf(b.id)
));
/**
 * @type {{matt:number[], mark:number[], luke:number[], john:number[], other:number[]}[]} perGroupsIndices
 */
// let perGroupsIndices = $state([]); //indices of groupsRefsArray
let perGroupsIndices=$derived.by(()=>{
    let retVal = [];
    if (perGroups && perGroups.length){
        retVal = TfUtils.getGospelGroupRefsArrays(perGroups,enableSecondary).groupsIndices;
    }
    return retVal;
});
/**
* @type string[] groupsRefsArray
*/
let groupsRefsArray=$derived.by(()=>{
    let retVal = [];
    if (perGroups && perGroups.length){
        retVal = TfUtils.getGospelGroupRefsArrays(perGroups,enableSecondary).refsArray;
    }
    return retVal;
});

//let groupsRefsArray = $state([]);
let currentServer=$state(tfServer);

let fetchedTextsResponse = $state(null);
let showLexOptionsInfo = $state(false);
function parsePericopeNums(){
    const refAreaRefs = refAreaText.trim().replaceAll(/\n+/g,";").replaceAll(/;+/g,";");

    /**
     * @type {number[]} theNums
     */
    const theNums = [];
    bibleUtils.expandRefs(refAreaRefs).forEach((ref)=>{
        const pNum = gospelParallels.getAlandPericopeNumbers(ref.trim(),selectedGospel, true);
        for (const num of pNum){
            if(!theNums.includes(num))
                theNums.push(num);
        }
        
    });
    
    alandPericopeNums = theNums.sort((a,b)=>a-b);   
}


function buildPericopeRefs(){
    // mylog("sorting pericopes. Initial state = " + alandPericopeNums.join(","));

    //  mylog("sorting pericopes. Sorted state = " + alandPericopeNums.join(","));
    
    perGroups = TfUtils.getGroupsArray(filteredPericopes,true);

    // mylog("ran geRefsArrays!")

}


    /**
 * @type {number[]} alandPericopes
 */
let alandPericopeNums = $state(myOptions.request.pericopes);

let filteredPericopes=$derived.by(()=>{
    let alands= (alandPericopeNums ? [...alandPericopeNums] : []); //copy of alands for sorting/filtering...
    if (callSortFilter) {
        if (myOptions.viewOptions.sort && gospelParallels.gospels.isValid(selectedGospel)) {//sort!
            // mylog("before sorting Alands for "+ selectedGospel +": ["+alands.join(',')+"]",true);
            gospelParallels.sortAlandPericopes(alands,selectedGospel);
            // mylog("after sorting Alands: ["+alands.join(',')+"]",true);
        }
        if (myOptions.viewOptions.hideSolos || myOptions.viewOptions.hideNonPrimary || myOptions.viewOptions.hideNonPrimarySolos||myOptions.viewOptions.focusOn) {
            //we need to filter:
            alands = gospelParallels.filterAlandPericopes(alands,selectedGospel,myOptions.viewOptions.focusOn || myOptions.viewOptions.hideNonPrimary,myOptions.viewOptions.hideSolos,
            myOptions.viewOptions.focusOn||myOptions.viewOptions.hideNonPrimarySolos);

        }
        
    }
    //mylog("after filtering alands: ["+ alands.join(",")+"]")
    return alands;
})


let lemmasByID=$derived.by(()=>{
    let dict={}
    if (fetchedTextsResponse && fetchedTextsResponse.lexemes) {
        for (const [lemma,lex] of Object.entries(fetchedTextsResponse.lexemes)){
            dict[lex.id]=lemma;
        }
    }
    return dict;
});

    let refAreaText = $state('Matt 6:10');


/**
 * @type {number[]} filteredPericopes
 */
//   let filteredPericopes = $state([]);
//$derived(alandPericopeNums.filter((p)=>!hideNonPrimary || 
    //      (gospelParallels.alandSynopsis.isPrimaryPericope(p,selectedGospel[selectedGospelIndex].value))))

function setServer(){
    currentServer=tfServer;
    
}

let selectedSection = $state([1]);
function selectSection(){

    landingPage=false;
    resetViewOptions(false);
    alandPericopeNums=[...selectedSection];

    buildAndFetchPericopes();
} 

/**
 * @type {Object<string,string>} lexClasses
 */
let customGreekClasses= $derived.by(()=>{// id->css color (e.g., "#eee")
    
    /**
     * @type {Object<string,string>}
     */
    const ret = {}
    if(selectedLexes && myOptions.viewOptions.greekStrings.length) {
        //mylog("building lexClasses...",true)
        for(const [relIndex,gk] of myOptions.viewOptions.greekStrings.entries()) {
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
    if(dataReady && fetchedTextsResponse.lexemes) {
        //mylog("building lexClasses...",true)
        for(const id of Object.values(fetchedTextsResponse.lexemes).map((o)=>o.id)) {
            
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
    if (fetchedTextsResponse && fetchedTextsResponse.lexemes){
        return Object.values(fetchedTextsResponse.lexemes).filter(
            (lex)=>!selectedLexes.includes(lex.id)).map((l)=>l.id).sort((a,b)=>a-b)}
    else
        return [];
});

//let unselectedLexBetaArray = $derived(unselectedLexes.map((lexID)=>fetchedTextsResponse.lexemes[lemmasByID[lexID]].beta));
let unselectedLexPlainArray = $derived(unselectedLexes.map((lexID)=>GreekUtils.removeDiacritics(lemmasByID[lexID])));

/**
 * @type {number[]} bestMatchedLexes
 */
let bestMatchedLexes=$state([]);

    
/**
 * @type {number[]} otherMatchedLexes
 */
let otherMatchedLexes=$state([]);


async function buildAndFetchPericopes(reset=true){
    viewStates.views.lookup.state=false;
    dataReady=false;
    landingPage=false;
    if (reset) {
          
    // mylog("disabling sortFilter and focus...");
        resetViewOptions();
        emptySelectedLexemes();
        emptySelectedCustomGreek();
    }
    
    
    buildPericopeRefs();
    fetching = true;
    //fetchTexts();
    
    fetchedTextsResponse = await currentServer.fetchPostTextsBatch(groupsRefsArray);
    //buildLexArrays();
    populateGroupsText(true,enableSecondary);
    dataReady= true;
}
//let lemmasByID={}


function buildLexArrays(){
    //mylog("building LexArrays...", true)
    lemmasByID ={};
    if (fetchedTextsResponse) {
        for (const [lemma,lex] of Object.entries(fetchedTextsResponse.lexemes)){
            lemmasByID[lex.id]=lemma;
        }
    }
    else{
        //mylog("Cannot build LexArrays!")
    }

    
}

function populateGroupsText(words=false,includeSecondary=false){
    mylog("v==================================v", true);
    mylog(`populateGroupTexts(includeSecondary:${includeSecondary})...`,true);
    
    for (const [index,group] of perGroups.entries()){
        mylog("checking group # " + group.id +" , title: '"+ group.title + ", index: " + index);
        for (const book of ['matt', 'mark', 'luke', 'john','other']){
            for (const [i,textRef] of group[book].textRefs.entries()){
                mylog("checking ref: " + textRef.reference);
                const queryIndex= perGroupsIndices[index][book].main[i];
                if (fetchedTextsResponse && fetchedTextsResponse['texts'] && fetchedTextsResponse['texts'][queryIndex]){
                    textRef.text= fetchedTextsResponse['texts'][queryIndex].text;
                    if (fetchedTextsResponse['texts'][queryIndex].notes){
                        const notes = fetchedTextsResponse['texts'][queryIndex].notes.filter((n)=>n.length).join("\n");
                        if (notes.length){
                            textRef.note=notes;
                        }
                    }
                    if (words){
                        
                        textRef.vwords=VerseWords.buildFromObj(fetchedTextsResponse['texts'][queryIndex].words);
                    }
                    // mylog("populating fetched text for group index "+index + ", ref: '" + textRef.reference
                    // + "', queryIndex = " + queryIndex +", text='"+textRef.text +"'", true);
                }

            }

            if (includeSecondary && group[book].secondary && group[book].secondary.length){
                for (const [i,textRef] of group[book].secondary.entries()){
                    mylog("checking ref: " + textRef.reference);
                    const queryIndex= perGroupsIndices[index][book].secondary[i];
                    if (fetchedTextsResponse && fetchedTextsResponse['texts'] && fetchedTextsResponse['texts'][queryIndex]){
                        textRef.text= fetchedTextsResponse['texts'][queryIndex].text;
                        if (fetchedTextsResponse['texts'][queryIndex].notes){
                            const notes = fetchedTextsResponse['texts'][queryIndex].notes.filter((n)=>n.length).join("\n");
                            if (notes.length){
                                textRef.note=notes;
                            }
                        }
                        if (words){
                            
                            textRef.vwords=VerseWords.buildFromObj(fetchedTextsResponse['texts'][queryIndex].words);
                        }
                        // mylog("populating fetched text for group index "+index + ", ref: '" + textRef.reference
                        // + "', queryIndex = " + queryIndex +", text='"+textRef.text +"'", true);
                    }

                }


            }

        }
        group.markUniqueAndIdenticalWords();    
        group.buildLexIdenticalPhrases(3,true);    
    }
    mylog("DONE! Populated the GroupTexts()!")
    mylog("^==================================^")
}


function resetViewOptions(lookup=false){
    myOptions.viewOptions.selectedGospelIndex =0;
    myOptions.viewOptions.sort = false;
    viewStates.reset(lookup);
    myOptions.viewOptions.hideNonPrimary=false;
    myOptions.viewOptions.focusOn=false;
    myOptions.viewOptions.unique=false;
    myOptions.viewOptions.hideSolos=false;
    myOptions.viewOptions.hideNonPrimarySolos=false;
    setServer();
    
    //  focus=selectedGospel[selectedGospelIndex].value;
}
function lookupShowNtParallels(){
    resetViewOptions();
    parsePericopeNums();
    buildAndFetchPericopes();
    //fetching = false;
    //ready = true;
    

    
}


async function urlRequestShowNtParallels(){

    //resetViewOptions();
    viewStates.reset(false,['view','lookup','words']);
    //viewStates.views.highlightOnClick.state =false;
    let pericopes = new Set([]);
    
    if (myOptions.request.pericopes) {
        pericopes = new Set(myOptions.request.pericopes);
    }
    
    if (myOptions.request.sections && myOptions.request.sections.length){
        
        myOptions.request.sections.forEach((s)=>{
            const secs = mathUtils.createNumArrayFromStringListRange(gospelParallels.alandSynopsis.lookupSection(s).pericopes);
            mylog("urlRequestShowNtParallels: got secs: " + secs?.join(','))
            pericopes = pericopes.union(new Set(secs));

    });
        
    }
    if (pericopes.size){
        alandPericopeNums=[...pericopes];
        await buildAndFetchPericopes(false);

    }


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
    if (myOptions.viewOptions.greekStrings.includes(greekString)){
        const selectedIndex = selectedLexes.length + myOptions.viewOptions.greekStrings.indexOf(greekString)
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
    myOptions.viewOptions.greekStrings.length = 0;
}

function emptySelectedLexemes(){
    selectedLexes.length = 0;
}
function toggleLex(id){
//    mylog("toggleLex("+id+")");
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
    if(myOptions.viewOptions.greekStrings.includes(string)) {
        myOptions.viewOptions.greekStrings.splice(myOptions.viewOptions.greekStrings.indexOf(string),1);

    }
    else {
        
        myOptions.viewOptions.greekStrings.push(string);

    }

}

function highlightLexeme(id=0,color=null){
    let ret = ''
    ret += "bg-red-500";
    return ret;
}

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

const hotkeys=[
    {key:'>', name:'Next Section',function: jumpToNextSection},
    {key:'<',name:'Previous Section',function: jumpToPrevSection},
    {key:'t',name:'Top/First Section',function: jumpToFirstSection},
    {key:'b',name:'Bottom/Last Section',function: jumpToLastSection},
    {key:'c',name:'Highlight on Click',function: ()=>{myOptions.viewOptions.highlightOnClick =!myOptions.viewOptions.highlightOnClick}},
    {key:'u',name:'Unique Lexemes',function: ()=>{myOptions.viewOptions.unique =!myOptions.viewOptions.unique}},
    {key:'i',name:'Identical Words',function: ()=>{myOptions.viewOptions.identical =!myOptions.viewOptions.identical}},
    {key:'s',name:'Similar Phrases',function: ()=>{myOptions.viewOptions.similarPhrases =!myOptions.viewOptions.similarPhrases}},
    {key:'m',name:'Show/hide options menu',function: ()=>{myOptions.viewOptions.menuOpen =!myOptions.viewOptions.menuOpen}},
        
];

const viewStates=$state({
    views:{
        
        //highlightOnClick: { description:  "Enable/disable highlight on click.", hotkeys:['c'], state: myOptions.viewOptions.highlightOnClick,modal:false},
        //unique: { description:  "Toggle Unique Lexeme color outlining", hotkeys:['u'], state: myOptions.viewOptions.unique,modal:false},
       // identical: { description:  "Show (bold & underline) morphologically identical words shared by different gospels in a parallel group ",
         //   hotkeys:['m'], state:myOptions.viewOptions.identical,modal:false},
        sections: { description:  "Jump to a section", hotkeys:['j'], state:false,modal:true},
        view: { description:  "View Options", hotkeys:['v'], state:false,modal:true},
        lookup: { description:  "Lookup passage(s) or select section", hotkeys:['l'], state:false,modal:false},
        words: {description:  "Lexeme/Word Options", hotkeys:['w'], state:false,modal:true},
      //  info: { description:  "Website and project information.", hotkeys:['i'], state:false,modal:true},
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
    reset(lookup=true,views=[]){
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

        this.views.lookup.state= lookup ? true :false;
        
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



function makeURL(){

    myOptions.request.pericopes=alandPericopeNums;
//    mylog("MakeURL: about to call generateURL()!")
    const baseurl = window.location.protocol  + "//" + window.location.host + "/";
    return baseurl + myOptions.generateURI();
}

function jumpToPrevSection(){
    const nextId=findPrevAnchor()
    if (nextId){
        document.location=document.location.toString().split('#')[0]+'#'+nextId;
    }
}


function jumpToFirstSection(){
    const anchors = getAnchors();
    if (anchors && anchors.length) {
        document.location=document.location.toString().split('#')[0]+'#'+anchors[0].id;

    }     
    
}

function jumpToLastSection(){
    const anchors = getAnchors();
    if (anchors && anchors.length) {
        document.location=document.location.toString().split('#')[0]+'#'+anchors[anchors.length-1].id;

    }     
    
}


function jumpToNextSection(){
    const nextId=findNextAnchor()
    if (nextId){
        document.location=document.location.toString().split('#')[0]+'#'+nextId;
    }
}


function onkeydown(event){
//    mylog("NTSyPanel.onkeydown! event: ");
    mylog(event);
    if(live && !textAreaFocused ){


        const matchedView=viewStates.getViewNameFromKey(event.key);
        const modalVisibles=viewStates.getVisible().filter((name)=>(viewStates.views[name].modal)); 
        if (matchedView) {
                
            if (!modalVisibles.length){
                
                if (matchedView){
                    viewStates.toggle(matchedView);
                }
            }  
        }
        else if (!modalVisibles.length){
            const matchedHotkey=hotkeys.filter((o)=>o.key==event.key);
            if (matchedHotkey.length){
                matchedHotkey[0].function();
            }
        }
            
    }
    else{
//        mylog("onkey: text area focused. Doing nothing!")
    }
}


let textAreaFocused=$state(false);

function textAreaFocus(event){
    textAreaFocused=true;
}
function textAreaBlur(event){
    textAreaFocused=false;
}

const wordTabs=['lexemes','custom'];
let selectedWordTabIndex=$state(0);

let customGreekInputText = $state('');

$effect(()=>{
    if (keyevent){

        untrack(()=> onkeydown(keyevent));
    }
})
$effect(()=>{customGreekInputText=GreekUtils.removeDiacritics(
     GreekUtils.beta2Greek(customGreekInputText),true,true).replaceAll('σ ','ς ');
});
//$inspect(customGreekClasses);



function loadRequestOptions(){
    //mylog("loadRequestOptions...")
    
}
let mounted=$state(false);
onMount(() => {
    if (myOptions.request.fromURL){
//        mylog("NTSynPanel got url params. Let's make a request!")
        landingPage=false;
        viewStates.views.lookup.state=false;
        loadRequestOptions();
        viewStates.views.lookup.state=false;
        urlRequestShowNtParallels().then(()=>{requestProcessed=true});

    }
    else{
        viewStates.reset();
    }
    mounted = true;
});

$inspect("fetchedTextsResponse",fetchedTextsResponse);
$inspect("groupsRefsArray", groupsRefsArray);
$inspect('perGroups', perGroups);
</script>
<style>
    @reference "tailwindcss";

    hr{
       @apply border-slate-400 m-2;
    }
   /* div :global(.lex-unique) {
        @apply outline-red-600 outline outline-3 pl-0.5 ml-0.5 mr-0.5 ;
    }*/
    a:link:hover {
        text-decoration: underline;
        
    }

    .anchor{
        @apply md:-mt-30 md:pt-30 -mt-20 pt-20;
    }


    select{
        @apply max-w-5/6  wrap-normal overflow-clip ;
       /* overflow: hidden  !important;*/
    }

    option{
        @apply max-w-11/12 wrap-normal overflow-clip;
        /*overflow: hidden  !important;*/
      
    }
   
   
                
    

        .tabs .tab-active {
            
            font-weight: bold;
            @apply border-t-2 border-l-2 border-r-2;
            background-color: white;
            color:black;
            text-decoration: underline;
            
        }

        .tab {
            height: auto;
            @apply rounded-t-lg;
            border-color: slategrey;
            color: ghostwhite;
            background-color: darkgrey;
            text-align: center;
            
        }



</style>
{#snippet appTitle(headingTag="h1",classes=["text-center","inline"])}

    <svelte:element this={headingTag} class={classes}>        
      {#if !landingPage}
        <ButtonSelect buttonText="☰" 
        buttonStyle="btn btn-xs  btn-circle btn-ghost  p-0" bind:selected={options.viewOptions.menuOpen} tooltip="Expand menu options" tooltipbottom={true}/>
      {/if}
            <a href="/" data-sveltekit-reload>
                <span class="hidden lg:inline">NT Gospel Synopsis Viewer</span>
                <span class="lg:hidden inline">NT Synopsis</span>
                <span class="sm:hidden inline">Synopsis</span>
                </a>
        
    </svelte:element> 
{/snippet}
{#snippet appSummary(heading=true,headingTag="h1")}

    {#if heading}
        {@render appTitle(headingTag)}
        <hr/>
    {/if}
    
    Based on Kurt Aland's <i>Synopsis Quattuor Evangeliorum</i>, using <a href="https://www.sblgnt.com">The SBL Greek New Testament (2010)</a> or, optionally, Nestle's 1904 edition of the <i>Greek New Testament.</i><br/>
    Enter NT reference to view parallel texts and click "Look up!", or select a section and press "Go!"
{/snippet}
{#snippet resultsButtons(short=false,theTag='li',classes=[])}
      
        {#if !short && !(landingPage)}    
            <svelte:element this={theTag} class={classes}>
                <ButtonSelect bind:selected={viewStates.views.lookup.state} tooltipbottom tooltip="Show Lookup panel pop-up" buttonText="☰ Lookup" buttonStyle="btn"/>
                </svelte:element>
        {/if}

        {#if alandPericopeNums && alandPericopeNums.length}
            {#if dataReady}
                <svelte:element this={theTag} class={classes}><ButtonSelect bind:selected={viewStates.views.view.state} tooltipbottom tooltip="Show other viewing options (sort, etc.)"  buttonText="☰ View"/></svelte:element>
                <svelte:element this={theTag} class={classes}><ButtonSelect buttonText="Similar" bind:selected={myOptions.viewOptions.similarPhrases} tooltipbottom ="Show lexically similar phrases (same lexemes, but possibly different forms/morphology)"/></svelte:element>
                <svelte:element this={theTag} class={classes}> <ButtonSelect buttonText="☰ Jump to ↓" bind:selected={viewStates.views.sections.state}/></svelte:element>       
                    <svelte:element this={theTag} class={classes}><ButtonSelect bind:selected={viewStates.views.words.state} buttonText="☰ Words" /></svelte:element>
                    <svelte:element this={theTag} class={classes}><ButtonSelect bind:selected={myOptions.viewOptions.highlightOnClick} buttonText="Auto Highlight" 
                        tooltipbottom={true}
                        tooltip="If enabled, clicking/tapping on a word will toggle highlighting of that lexeme. Press 'c' to toggle this option."/></svelte:element>    
                    {#if currentServer.abbrev==SblGntServer.abbrev}   
                    <svelte:element this={theTag} class={[classes, 'menu']}><label class="label" for="hide-app-check{short? '-short':''}">
            <input  class="toggle" id="hide-app-check{short? '-short':''}" type="checkbox" bind:checked={myOptions.viewOptions.hideApp}/>Hide appar{#if !short}aratus marks{:else}.{/if}</label>
                </svelte:element>
                    {/if}
                    
            {/if}
        {/if}
    
{/snippet}

<div id="top-fixed" class="self-center text-center m-auto w-full fixed top-8  bg-white z-40">
    <div id="header-nav-section" class="self-center text-center   m-auto w-full" >
    <div class="navbar bg-base-100 text-center  shadow-sm ">
        <div class="navbar-start text-left max-w-full w-full m-auto md:hidden">
            
            {#if !landingPage && dataReady}
            <div class="dropdown  text-left">
            
            <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
            </div>

            <ul tabindex="0"
            class="menu  dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-left ">
            {@render resultsButtons(true)}
        
            </ul>
            </div>
            {/if}
            <div class="text-left ">
            <h1 class="inline">
                <a href="" data-sveltekit-reload><span class="hidden sm:inline">NT&nbsp;Synopsis</span>
                <span class="sm:hidden inline">Synopsis</span></a>
            </h1>    
            <ul class="bg-white menu menu-horizontal ">
                
            <li><ButtonSelect buttonText="?" buttonStyle="btn btn-xs btn-circle btn-ghost p-0" bind:selected={viewStates.views.help.state}/>
                </li>
            <li>
                <ButtonSelect bind:selected={viewStates.views.lookup.state} buttonText="" 
                buttonStyle="btn btn-xs btn-circle btn-ghost p-0" >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
                </ButtonSelect>
            </li></ul>
            </div>
        </div>
        <div class="hidden md:navbar-center self-center m-auto">

            <div class="text-center self-center border-0"> 
                <div id="title-panel">
                    {@render appTitle()}&nbsp;
                    <ButtonSelect buttonText="?" buttonStyle="btn btn-xs btn-circle btn-ghost p-0" bind:selected={viewStates.views.help.state}/>
                </div> 

                {#if myOptions.viewOptions.menuOpen}
                <div class="bg-white text-center flex flex-wrap block w-full ">
                    
                    {@render resultsButtons(false,'div',['inline-block'])}
                </div>
                {/if}
            </div>
        </div>
        <div class="navbar-end hidden">
        


        </div>
    </div>
    </div>
    <div id='landing'>

        {#if landingPage}
        <div id="landing-panel text-center">

            
            <div class="text-center m-auto">
            
                    Based on Kurt Aland's <i>Synopsis Quattuor Evangeliorum</i>, using <a href="https://www.sblgnt.com">The SBL Greek New Testament (2010)</a> or, optionally, Nestle's 1904 edition of the <i>Greek New Testament</i>.<br/>
                    Enter NT reference to view parallel texts and click "Look up!", or select a section and press "Go!"
            </div>
            <hr/>
          </div>
          {/if}
    </div>
    <div id="lookup">
        {#if !mounted}
        <div class="bg-transparent m-10 p-10">
            <h3><i>Page Loading...</i></h3>
        <span class="loading loading-spinner loading-xl"></span>    
        </div>
        
        {:else if viewStates.views.lookup.state}

        <div id="search-panel" class="text-center ">
            Choose One:
                    <h2 class="cursor-default">Enter References</h2><div class="inline-block mb-1">
                        <textarea id="refarea" class="inline-block align-middle" 
                        rows="1" bind:value={refAreaText}
                        onfocus={textAreaFocus} onblur={textAreaBlur}
                        ></textarea>
            <button onclick={lookupShowNtParallels} class="btn btn-primary inline-block ">Look up!</button></div>
                    
                        
                    <br/> OR:
                    <h2 class="cursor-default">Select a section:</h2> 
                    <select bind:value={selectedSection} >
                    
                    {#each gospelParallels.alandSynopsis.sections as section}
                    <option value={mathUtils.createNumArrayFromStringListRange(section.pericopes)}>{mathUtils.romanize(section.section)}: {section.title}</option>
                    <hr/>
                    {/each}
                    {#each gospelParallels.alandSynopsis.pericopes as per }
                    {#if per.pericope == 1 }
                    <option value={[per.pericope]} selected="selected">{per.pericope}: {per.title}</option>
                    {:else}
                    <option value={[per.pericope]} >{per.pericope}: {per.title}</option>
                    {/if}
                    {/each}
                    
                    {#if allowEverything}
                    <hr/>
                    <option value={gospelParallels.alandSynopsis.pericopes.map((p)=>p.pericope)}>Everything!!</option>
                    {/if}
                </select>
                <button onclick={selectSection} class="align-top btn btn-primary inline-block m-1">Go!</button>
        </div>
        <hr class="!border-slate-300 m-6"/>
        {/if}

    </div>

</div><!--end fixed section-->

<div id="main-content-div" class="self-center relative text-center bg-white mt-10 z-20">
       {#if !landingPage}
            {#if myOptions.request.fromURL && !requestProcessed}
                
                <h3><i>Processing Request...</i></h3>
                <span class="loading loading-spinner loading-xl"></span>
            
            

            {/if}          
        {/if}


</div>
<div class="text-center mt-3">
   
    {#if alandPericopeNums.length}
         

    <div id="results">


        {#if dataReady && fetchedTextsResponse}
            <h1 class="text-center">Results from {currentServer.name}:
            {#key myOptions.viewOptions}<CopyText icon={LinkSvg} 
            getTextFunc={makeURL} 
            tooltip='Copy stuff'
            
            />{/key}</h1>
        
            {#if filteredPerGroups.length}
                {#each filteredPerGroups as group, index }
                <hr class="mb-2 !border-slate-200"/>
                <div class='anchor text-center' id="section-{group.id}">
                    <h2 class="inline-block"><u><b>{group.title}:</b></u><br/> {group.getRefs()}<CopyText copyText={group.getRefs()} tooltip='Copy parallel group references'/></h2>
                    
                <h3>            {#if group.lexIdenticalPhrasesLocations.length > 0}
                  <!-- (TODO: remove) Got some phrases: {group.lexIdenticalPhrasesLocations} -->
            {:else}
                    {/if}</h3>
                </div>
                <div class="float-right mr-2 break-after-all">
                    <a href="" class="" title="Jump to section"
                    onclick={()=>{viewStates.views.sections.state=true}}><BulletsIcons height={20} width={20}/></a>
                    {#if index > 0}
                    <a href="#section-{filteredPerGroups[index-1].id}"
                    title="Previous"><ArrowUp height={20} width={20}/></a>{/if}
                    {#if index < filteredPerGroups.length-1}
                    <a href="#section-{filteredPerGroups[index+1].id}" 
                    class="break-after-all" title="Next"><ArrowDown height={20} width={20}/></a>{/if}
                    <a href="#"  class="inline" title="Top"><ArrowTop height={20} width={20}/></a>
                </div>
                    
        
            
                <br class="break-all"/>
                <div>
                    <ParallelGospelSection parGroup={group} options={myOptions} focus={focused}
                    wordClick={toggleLex}
                    {enableSecondary}
                    cssClassDict={lexClasses}
                    cssCustomDict={customGreekClasses}
                    showNotes={currentServer.showNotes}
                    showNotesFunction={displayNote}
                    
                    />
                </div>
                    
                {/each}
            {:else}
                (No results. Try <a href="" data-sveltekit-reload>another search</a>{#if myOptions.viewOptions.hideNonPrimary || myOptions.viewOptions.focusOn || myOptions.viewOptions.hideSolos }, 
                or change the <a href="" onclick={()=>{viewStates.toggle('view')}}>View Options</a>{/if}.)
            {/if}
        {:else}
        <h3><i>Loading...</i></h3>
        <span class="loading loading-spinner loading-xl"></span>
        {/if}

    </div>
    
    {:else}
        <div class="text-center"><i class="m-auto">Results will show up here. 
            {#if viewStates.views.lookup.state ==false}<a class="link hover:text-blue-700" 
            href="#" onclick={()=>{viewStates.views.lookup.state=true}}>Search for a text or select a section.</a>
            {:else}
                Search for a text or select a section above.
            {/if}
        </i></div>
    {/if}


</div>
{#if dataReady}
<Modal2 bind:showModal={viewStates.views.sections.state}>
            <div id="results-navigation"  class=" text-left">
            <h1>Search Results Navigation</h1>
                    <ul>
            {#each filteredPericopes as section, index}
            {@const pericope=gospelParallels.alandSynopsis.lookupPericope(section)}
            <li class="m-1 p-1 "><h3><a href="#section-{section}" 
                onclick={()=>{viewStates.views.sections.state=false}}><b>{section}. {pericope.title}</b> 
                <i>({gospelParallels.getAlandPericopeRefs(section).join("; ")})</i></a></h3></li>
            {/each}
                </ul>           
            </div>
</Modal2>
{/if}


<Modal2 bind:showModal={viewStates.views.view.state}>
    <div class="text-center">
     <h2>Select Primary Gospel for Viewing:</h2>
                <select bind:value={myOptions.viewOptions.selectedGospelIndex}>
                {#each gospelOptions as option, index}
                <option value={index}>{option.name}</option>
                {/each}
                </select>
           <hr/>
           <h2>Sort, Filter, and/or Focus:</h2>
           <i>(Based on selected primary Gospel.)</i><br/>
            <ButtonSelect bind:selected={myOptions.viewOptions.sort} disable={!gospelParallels.gospels.isValid(selectedGospel)} 
            buttonText="Sort" tooltip="Sort according to the selected gospel's order."/> 
            <ButtonSelect bind:selected={myOptions.viewOptions.hideNonPrimary} 
            disable={myOptions.viewOptions.focusOn || !gospelParallels.gospels.isValid(selectedGospel)} 
            buttonText="Isolate" tooltip="Hide all Aland's sections which do not include the selected gospel or which contain seconary duplicates of it."/>
            <ButtonSelect bind:selected={myOptions.viewOptions.focusOn} disable={!gospelParallels.gospels.isValid(selectedGospel)} 
            buttonText="Focus!" tooltip="Focus on the selected gospel, making it more visibled, and removing any sections which do not contain it or contain secondary duplicates."/>
            <ButtonSelect 
            disable={!gospelParallels.gospels.isValid(selectedGospel) || (myOptions.viewOptions.focusOn||myOptions.viewOptions.hideNonPrimary)} 
            bind:selected={myOptions.viewOptions.hideNonPrimarySolos} 
           buttonText="Hide Non-Primary Solos" 
           tooltip="Hide all sections that have only one column but which is not the selected gospel."/>
    <br/>
            <ButtonSelect bind:selected={myOptions.viewOptions.hideSolos} buttonText="Hide All Solos" 
            tooltip="Hide ALL sections that have only one gospel column."/>
           

        <hr class="mt-1 mb-1"/>
        <Button onclick={resetViewOptions} buttonText="Reset All"/>
</div>
        </Modal2>

<!--<Modal2 bind:showModal={viewStates.views.info.state}>
    <div class="text-left m-auto inline">
        {@render appSummary()}
        <hr/>
        <Footer/>
    </div>
    <div class="btn-sm"></div>
</Modal2>-->
<Modal2 bind:showModal={viewStates.views.help.state} title="Help">
    
    <div class="m-auto  items-center text-center ">
    <h2>Synopsis View</h2>
    On landing page, enter NT reference to view parallel texts and click "Look up!", or select a section and press "Go!"    
   <hr class="m-5 mb-3"/>

        <h2 class="underline">Results Options: Unique and Identical Words</h2>
             <div class=" m-auto inline-block text-left">
                <ul class="list-disc ml-9">
                    <li>Enabling <b>"Outline Unique Lexemes"</b> will draw <span class="outline outline-blue-400">an outline</span> (one color per gospel) around each lexeme that is unique to a specific gospel, i.e., that shows up in only one column of a single parallel group.</li>
                    <li>Enabling <b>"Identical words"</b> will <span class="font-bold underline">bold and underline</span> all morphologically identical words shared by at least two gospels in the same parallel group </li>
                    <li>Enabling <b>"Highlight Lexeme on Click"</b> will toggle <span class="bg-cyan-500 text-white">highlighting</span> of all instances of the lexeme.</li>
                    <li>Enabling <b>"Similar"</b> will underline "lexically-identical" phrases that are common between at least two columns. "Lexically identical" here refers to those phrases which have the same lexemes in the same sequence even if they differ morphologically. This crosses verse boundaries.</li>
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


<Modal2 bind:showModal={viewStates.views.words.state}>

    

    <div class="max-w-full block text-center">
                <h3>Highlight Features:</h3>
            <ButtonSelect bind:selected={myOptions.viewOptions.unique} buttonText="Unique" tooltipbottom  tooltip="Outline all lexemes unique to each column."/>
            <ButtonSelect buttonText="Similar" tooltipbottom bind:selected={myOptions.viewOptions.similarPhrases} tooltip="Show lexically similar phrases (same lexemes, but possibly different forms/morphology)"/>
            <ButtonSelect bind:selected={myOptions.viewOptions.identical} tooltipbottom tooltip="Toggle Bold/underline setting for morphologically identical words." 
            buttonText="Identical"/>
            <ButtonSelect bind:selected={myOptions.viewOptions.highlightOnClick}   tooltipbottom 
            buttonText="Auto Highlight" 
            tooltip="If enabled, clicking/tapping on a word will toggle highlighting of that lexeme."/>
    
        <ButtonSelect buttonStyle="btn btn-neutral btn-outline btn-circle btn-xs p-0 m-0"
            buttonText="?"
            bind:selected={showLexOptionsInfo}/>
            {#if showLexOptionsInfo}
            <div class="md:max-w-3/4  self-center m-auto">
                <h2 class="underline">Unique and Identical Words Options:</h2>
                                        <div class="inline-block text-left">
                <ul class="list-disc">
                    <li>Enabling <b>"Outline Unique Lexemes"</b> will draw <span class="outline outline-blue-400">an outline</span> (one color per gospel) around each lexeme that is unique to a specific gospel, i.e., that shows up in only one column of a single parallel group.</li>
                    <li>Enabling <b>"Identical words"</b> will <span class="font-bold underline">bold and underline</span> all morphologically identical words shared by at least two gospels in the same parallel group </li>
                    <li>Enabling <b>"Highlight Lexeme on Click"</b> will toggle <span class="bg-cyan-500 text-white">highlighting</span> of all instances of the lexeme.</li>
                </ul>
                </div>
            </div>
            {/if}


 

            
           
            <hr/>
        <div role="tablist" class="tabs tabs-lifted">
            <a role="tab" class="tab {selectedWordTabIndex==0 ? 'tab-active' : ''} " tabindex=0 onclick={()=>{selectedWordTabIndex=0}} >Lexemes</a>
            <a role="tab" class="tab {selectedWordTabIndex==1 ? 'tab-active' : ''} " tabindex=1 onclick={()=>{selectedWordTabIndex=1}}>Custom</a>
        </div>
        
            <div class="{selectedWordTabIndex== 0 ? 'block' : 'hidden'}">
             <h1>Highlighted Lexemes</h1>
            {#if selectedLexes.length}
            
            <h2>Selected Lexemes:</h2>
            <i>Click on a lexeme to remove it.</i>
            <br/>
            {#each selectedLexes as lex, index}
                 <Button onclick={()=>toggleLex(lex)} buttonText={lemmasByID[lex]} buttonColors={getColorOfLex(lex)} buttonType=''/> 
               
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
             <h1>Custom Greek Highlights</h1>

             <i>Enter some text in the text box below, then press enter. Type in Latin characters, which will automatically convert to Greek.</i><br/>
             <input type="text" size="15" autofocus 
                bind:value={customGreekInputText} placeholder="Type here" 
                class="input input-bordered w-full max-w-xs" 
                onkeydown={(e)=>{if (e.key == 'Enter') toggleGreekString(customGreekInputText);}}/>
                <Button onclick={()=>toggleGreekString(customGreekInputText)} buttonText='Toggle'/>
                <Button onclick={()=>{customGreekInputText=''}} buttonText="Clear Input" buttonStyle='btn btn-ghost btn-md'/>
            
            {#if myOptions.viewOptions.greekStrings.length}
            
                <h2>Selected Custom Greek Word Forms:</h2>
                <i>Click on any word-form to remove it.</i>
                <br/>
                {#each myOptions.viewOptions.greekStrings as gk}
                <Button onclick={()=>toggleGreekString(gk)} buttonText={gk} buttonColors={getColorOfGreek(gk)} buttonType=''/> 
                {/each}<br/>
                <Button onclick={emptySelectedCustomGreek}  buttonText="Clear All"/>
            {:else}<br/>
                
                <i>None selected.</i>
 
            {/if}
           
            </div>

    </div>
</Modal2>