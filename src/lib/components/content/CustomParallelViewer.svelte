<script>
import { ParallelText,Word, TextAndRef,VerseWords } from "./parallelTexts.svelte";
import { tfServer, TfServer, lexemes} from "$lib/n1904/tfN1904";
import ParallelTextSection from "./ParallelTextSection.svelte";
import { mylog } from "$lib/env/env";
import * as bibleUtils from '$lib/n1904/bibleRefUtils.js'
import * as mathUtils from '$lib/utils/math-utils.js';
//import Button from '../ui/Button.svelte';
import ButtonSelect from '../ui/ButtonSelect.svelte';
import {default as TfUtils} from './TfUtils.js';
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
* @type {number[]} selectedLexes
*/
let selectedLexes=$state([]);

/**
* @type {string[]} selectedGreekStrings
*/
let selectedGreekStrings=$state([]);
let fetchedTextsResponse = $state(null);
let showLexOptionsInfo = $state(false);
    
let lemmasByID=$derived.by(()=>{
    let dict={}
    if (fetchedTextsResponse && fetchedTextsResponse.lexemes) {
        for (const [lemma,lex] of Object.entries(fetchedTextsResponse.lexemes)){
            dict[lex.id]=lemma;
        }
    }
    return dict;
});


/**
 * @type {Object<string,string>} lexClasses
 */
let customGreekClasses= $derived.by(()=>{// id->css color (e.g., "#eee")
    
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

    
async function fetchPostTextsBatch(){
//todo: refactor in another .svelte.js file, then test
    fetchedTextsResponse = null;

    /**
     * @type {{book:string,chapter:number|null,verses:number[]}[]} bcvFetchArray
     */
    const bcvFetchArray=TfUtils.getBCVarrayFromRefs(groupsRefsArray);
    
    fetchedTextsResponse = await tfServer.getTexts(bcvFetchArray,true,true);
    
}

//TODO
async function buildAndFetchPericopes(){
    //TODO:
    /* landingPage=false;
    viewStates.views.lookup.state=false;
    dataReady=false;
    // mylog("disabling sortFilter and focus...");
    resetViewOptions();
    buildPericopeRefs();
    fetching = true;
    //fetchTexts();
    emptySelectedLexemes();
    emptySelectedCustomGreek();
    await fetchPostTextsBatch();
    //buildLexArrays();
    populateGroupsText(true);
    dataReady= true;
    */
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
        mylog("Cannot build LexArrays!", true)
    }

    
}

function resetViewOptions(lookup=false){
    
    
    viewStates.reset(lookup);
    
    showUnique=false;
    
    
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
        selectedGreekStrings.length = 0;
    }

    function emptySelectedLexemes(){
        selectedLexes.length = 0;
    }
    function toggleLex(id){
       // mylog("toggleLex("+id+")",true);
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
            view: { description:  "View Options", hotkeys:['v'], state:false,modal:true},
            lookup: { description:  "Lookup passage(s) or select section", hotkeys:['l', 's'], state:true,modal:false},
            words: {description:  "Lexeme/Word Options", hotkeys:['w'], state:false,modal:true},
            highlightOnClick: { description:  "Enable/disable highlight on click.", hotkeys:['c'], state:true,modal:false},
            info: { description:  "Website and project information.", hotkeys:['i'], state:false,modal:true},
            unique: { description:  "Toggle Unique Lexeme color outlining", hotkeys:['u'], state:false,modal:false},
            help: { description:  "Show help menu", hotkeys:['h', '?'], state:false,modal:true},
            sections: { description:  "Jump to a section", hotkeys:['j'], state:false,modal:true},
            identical: { description:  "Show (bold & underline) morphologically identical words shared by different gospels in a parallel group ",
             hotkeys:['m'], state:false,modal:false},
              
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
                .filter(([name,obj])=>obj.hotkeys.includes(key))
                .map(([k,v])=>k);this
            if (matchingViews.length > 0){
                retVal = matchingViews[0]
            }
            
            return retVal;
        },
        reset(lookup=true){
            for (const view of Object.keys(this.views)){
                this.views[view].state = false;
            }
            if (lookup){
                this.views.lookup.state=lookup
            }
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

    const hotkeys=[
        /*
        {key: 'n', name:'Next Section',function: jumpToNextSection},
        {key:'p',name:'Previous Section',function: jumpToPrevSection},
        {key:'t',name:'Top/First Section',function: jumpToFirstSection},
        {key:'b',name:'Bottom/Last Section',function: jumpToLastSection},
        */
         
    ];

     let textAreaFocused=$state(false);

    function textAreaFocus(event){
        textAreaFocused=true;
    }
    function textAreaBlur(event){
        textAreaFocused=false;
    }
    function onkeydown(event){
        if(!textAreaFocused ){
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
    }

    const wordTabs=['lexemes','custom'];
    let selectedWordTabIndex=$state(0);

    let customGreekInputText = $state('');
   $effect(()=>{customGreekInputText=GreekUtils.removeDiacritics(
        GreekUtils.beta2Greek(customGreekInputText).toLocaleLowerCase()).replaceAll(/[^α-ω]+/g,'')
    });
    
</script>
<h2>Coming soon...</h2>