import { SynopsisOptions3 } from "../content/SynopsisClasses.svelte";
import { findNextAnchor,findPrevAnchor, getAnchors} from '$lib/utils/ui-utils';

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

export class Hotkey{

    /**
     * 
     * @param {string} key 
     * @param {string} shortName 
     * @param {string} name 
     * @param {string} description 
     * @param {function} toggle 
     */
    constructor(key,name,toggle=()=>{},optionName='',showNavButton=false,singleletter='',description='',shortName=''){
        this.key=key;
        this.singleletter=singleletter? singleletter:key;
        this.name=name;
        this.description=description
        this.toggle=toggle;
        this.shortName=shortName ? shortName : name;
        this.optionName=optionName;
        this.showNavButton=showNavButton;
    }
}

export class SynopsisHotkeys{
    /**
     * @type {Hotkey[]} hotkeys
     */
    hotkeys=$state([]);
    options=$state(new SynopsisOptions3());
    hotkeysTable=[
        {key:'>', name:'Next Section',function: jumpToNextSection},
        {key:'<',name:'Previous Section',function: jumpToPrevSection},
        {key:'t',name:'Top/First Section',function: jumpToFirstSection},
        {key:'b',name:'Bottom/Last Section',function: jumpToLastSection},
        {key:'c',name:'Highlight on Click',optionName:"highlightOnClick",function: ()=>{this.options.viewOptions.highlightOnClick =!this.options.viewOptions.highlightOnClick},navLetterButton:true},
        {key:'u',name:'Unique Lexemes',optionName:"unique",function: ()=>{this.options.viewOptions.unique =!this.options.viewOptions.unique},navLetterButton:true},
        {key:'i',name:'Identical Words',optionName:"identical",function: ()=>{this.options.viewOptions.identical =!this.options.viewOptions.identical},navLetterButton:true},
        {key:'s',name:'Similar Phrases',optionName:"similarPhrases",function: ()=>{this.options.viewOptions.similarPhrases =!this.options.viewOptions.similarPhrases},navLetterButton:true},
        {key:'e',name:'Exact Phrases',optionName:"exactPhrases",function: ()=>{this.options.viewOptions.exactPhrases =!this.options.viewOptions.exactPhrases},navLetterButton:true},
        {key:'m',letter:'☰', name:'Show/hide options menu',optionName:"menuOpen",function: ()=>{this.options.viewOptions.menuOpen =!this.options.viewOptions.menuOpen},navLetterButton:false},
   
        
    ];
    
    /**
     * 
     * @param {string} hotkeysEnabled a string of hotkeys letters to be enabled. Each char is one key.
     * @param {SynopsisOptions3} options 
     */
    constructor(options=new SynopsisOptions3(),hotkeysEnabled='cuisme'){
        this.hotkeysEnabled=new Set(hotkeysEnabled.split(''));
        this.options=options;
        for (const k of hotkeysEnabled){
            const kRow = this.hotkeysTable.find((r)=>r.key==k);
            if(kRow){
                this.hotkeys.push(new Hotkey(k,kRow.name,kRow.function,kRow.optionName ? kRow.optionName : '',kRow.navLetterButton? true: false,kRow.letter? kRow.letter: ''));
            }
        }
    }

    enableHotkey(key){
        this.hotkeysEnabled.add(key)
    }
    
    /**
     * 
     * @param {string} key 
     * @returns {Hotkey|null}
     */
    getKeyObj(key){
        /**
         * @type {Hotkey|null}
         */
        let ret = null;
        const found = this.hotkeys.find((keyO)=>keyO.key==key);
        if (found){
            ret = found;
        }
        return ret;

    }


    keypress(key){
        if (this.hotkeysEnabled.has(key)){
            const theKeyObj = this.getKeyObj(key)
            if (theKeyObj){
                theKeyObj.toggle();
            }

        }

    }

    getOptionName(key){
        const row = this.hotkeysTable.find((row)=>row.key==key && row.optionName);
        if (row && row.optionName){
            return row.optionName
        }
        else return '';
    }

    /**
     * @returns {Hotkey[]}
     */
    getEnabledKeys(){
        return this.hotkeys.filter((k)=>this.hotkeysEnabled.has(k.key));

    }
    /**
     * @returns {Hotkey[]}
     */
    getNavButtonKeys(){
        return this.hotkeys.filter((k)=>this.hotkeysEnabled.has(k.key) && k.showNavButton);
    }

    //getNavButtonKeys
    
}
