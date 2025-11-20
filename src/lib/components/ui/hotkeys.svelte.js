import { SynopsisOptions3 } from "../content/SynopsisClasses.svelte";
import { findNextAnchor,findPrevAnchor, getAnchors} from '$lib/utils/ui-utils';
import { mylog } from "$lib/env/env";
import * as UiUtils from '$lib/utils/ui-utils.js';

export class Hotkey{

    /**
     * 
     * @param {string} key 
     * @param {string} shortName 
     * @param {string} name 
     * @param {string} description 
     * @param {function} toggle 
     */
    constructor(key,name,toggle=()=>{},optionName='',showNavButton=false,singleletter='',description='',shortName='',navKeyClasses=''){
        this.key=key;
        this.singleletter=singleletter? singleletter:key;
        this.name=name;
        this.description=description
        this.toggle=toggle;
        this.shortName=shortName ? shortName : name;
        this.optionName=optionName;
        this.showNavButton=showNavButton;
        this.navKeyClasses=navKeyClasses;
    }
}


export class SynopsisHotkeys{
    /**
     * @type {Map<string,Hotkey>} hotkeys
     */
    hotkeys=$state(new Map());
    options=$state(new SynopsisOptions3());
    hotkeysTable=[
        {key:'>', name:'Next Section',function: UiUtils.jumpToNextSection},
        {key:'<',name:'Previous Section',function: UiUtils.jumpToPrevSection},
        {key:'t',name:'Top/First Section',function: UiUtils.jumpToTop},
        {key:'b',name:'Bottom/Last Section',function: UiUtils.jumpToLastSection},
        {key:'2', name:'Show/hide secondary parallels',optionName:"hideSecondary", function: ()=>{this.options.viewOptions.hideSecondary= !this.options.viewOptions.hideSecondary}, navLetterButton:true,navKeyClasses:'line-through text-lg'},
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
        this.hotkeys=new Map();
        this.options=options;
        for (const k of hotkeysEnabled){
            this.enableHotkey(k);
        }
    }

    /**
     * 
     * @param {string} key 
     * @returns {Object|null}
     */
    getKeyRowFromTable(key){
        let ret= this.hotkeysTable.find((row)=>row.key==key);
        return ret ? ret : null;
    }

    disableHotkey(key){
     
        this.hotkeys.delete(key);
    }


    /**
     * 
     * @param {string} key 
     * @returns boolean
     */
    isEnabled(key){
        return this.hotkeys.has(key);
    }
    /**
     * 
     * @param {string} keys one char per key. No spaces needed.
     */
    disableHotkeys(keys){
        keys.split("").forEach((k)=>this.disableHotkey(k));
    }

    /**
     * 
     * @param {string} key a single character key to remove
     */
    enableHotkey(key){
        if (!this.isEnabled(key)){
            const kRow = this.getKeyRowFromTable(key);
                        
            if(kRow && !this.isEnabled(key) ){
                this.hotkeys.set(key,new Hotkey(key,kRow.name,kRow.function,kRow.optionName ? kRow.optionName : '',
                    kRow.navLetterButton? true: false,kRow.letter? kRow.letter: '','','',
                    kRow.navKeyClasses ? kRow.navKeyClasses : ''));
            
            }
        }
        
        
        
    }
    
    /**
     * 
     * @param {string} keyString one char per key to enabl
     */
    enableHotkeys(keyString){
        keyString.split('').forEach((k)=>this.enableHotkey(k));

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
        let ret = this.hotkeys.get(key);
        if (ret){
            
           // mylog(`found hotkey object for key '${key}'`,true)
        }
        else {
            //mylog(`could NOT find hotkey object for key '${key}'`,true)
        }
        return ret ? ret : null;

    }

    

    keypress(key){
       // mylog(`hotkeys.keypress(${key})`);
        if (this.hotkeys.has(key)){
            const theKeyObj = this.getKeyObj(key);
           // mylog(`hotkeys.keypress(${key}), got keyObj '${theKeyObj?.name}'`);
            if (theKeyObj){
                theKeyObj.toggle();
            }
            else{
                //mylog("go not keyobject")
            }

        }
        else{
        //mylog(`key '${key}' not enabled!`)
        }

    }

    getOptionName(key){
        const hkO = this.hotkeys.get(key)
        if (hkO && hkO.optionName){
            return hkO.optionName
        }
        else return '';
    }

    /**
     * @returns {Hotkey[]}
     */
    getEnabledKeys(){
        return Array.from(this.hotkeys.values().filter((k)=>this.hotkeys.has(k.key)));

    }
    /**
     * @returns {Hotkey[]}
     */
    getNavButtonKeys(){
        return Array.from(this.hotkeys.values().filter((k)=>this.hotkeys.has(k.key) && k.showNavButton));
    }

    //getNavButtonKeys
    
}
