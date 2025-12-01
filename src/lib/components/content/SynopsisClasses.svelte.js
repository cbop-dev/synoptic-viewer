import { mylog,debug } from "$lib/env/env.js";
import { URLParam } from "./urlParams.js";


export class SynopsisOptions3{

    viewOptions=$state({});
    request=$state({});


    reset(){
        //const theCopy=new SynopsisOptions3();
        //this.viewOptions=copyObject(theCopy.viewOptions);
        //this.request=copyObject(theCopy.request);
        for (const [propName,row] of Object.entries(SynopsisOptions3.SynopsisUrlParamsMap)){
            this.resetProp(propName);

        }

    }

    getPropVal(propName){
       // mylog(`In getPropVal(${propName})`,true)
        if (Object.hasOwn(SynopsisOptions3.SynopsisUrlParamsMap,propName)){
            const row = SynopsisOptions3.SynopsisUrlParamsMap[propName];
            if (row.category=='view' && Object.hasOwn(this.viewOptions,propName)){
                //mylog(`getPropVal('${propName}') got a val!'`)
                return this.viewOptions[propName];
                
            }
            else if (row.category=='request' && Object.hasOwn(this.request,propName)){
                //mylog(`In request section`)
                return this.request[propName];
            }
            else{
                //mylog(`row type == ${row.type} but got no value!`)
                return null;
            }

        }
        else{
        //    mylog(`could not find propname '${propName}'`);
            return null;
        }

    }

    /**
     * 
     * @param {string} propName 
     * @returns true if the property was actually reset
     */
    resetProp(propName){
        let reset=false;
        let origVal=this.getPropVal(propName);
       // mylog(`in resetProp(${propName}), origVal='${origVal}'`)
        if(Object.hasOwn(SynopsisOptions3.SynopsisUrlParamsMap,propName)){
            const row=SynopsisOptions3.SynopsisUrlParamsMap[propName];
            
            
            let theDefault=Object.hasOwn(row,'default') ? row.default : null;

            if(theDefault==null ){
                if(row.type=='int'){
                    theDefault=0
                }
                else if(row.type=='boolean'){
                    theDefault=false;
                }
                else if(row.type=='str'){
                    theDefault=''
                }
               /* else if (Object.keys(this.viewOptions).includes(propName) && this.viewOptions[propName] && this.viewOptions[propName]?.length){ //an array type
                    //this.viewOptions[propName].length=0;
                }*/
                

            }

            if(row.category=='view'){
                if (theDefault!=null) {
                    this.viewOptions[propName]=theDefault;
                    reset=true;
                }
                else if (row.type.includes('Array')){
                    if (this.viewOptions[propName].length){
                        this.viewOptions[propName].length=0;
                        reset = true;
                    }

                }

                
            }
            else if(row.category=='request'){
                if (theDefault != null) {
                    this.request[propName]=theDefault;
                    reset=true;
                }
                else if (row.type.includes('Array')){
                    if (this.request[propName].length){
                        this.request[propName].length=0;
                        reset=true;
                    }

                }
            }
        //    mylog(`myOptions.resetProp('${propName}'): reset from '${origVal}', to: '${theDefault}'`)
        }
        else{
            //mylog(`myOptions.resetProp('${propName}'): not found`)
        }

        return reset;
        
    }
    constructor(){
        Object.entries(SynopsisOptions3.SynopsisUrlParamsMap).forEach(([name,row])=>{
            let val=row.default ? row.default : null;

            if(!val){
                if(row.type=='int'){
                    val=0
                }
                else if(row.type=='boolean'){
                    val=false;
                }
                else if(row.type=='str'){
                    val=''
                }
                else{//one of the array types.
                    val=[]
                }

            }

            if(row.category=='view'){
                this.viewOptions[name]=val;
            }
            else if(row.category=='request'){
                this.request[name]=val;
            }
        })
        
    }

    

    /**
     * 
     * @param {URLParam[]} urlParams 
     * @returns {SynopsisOptions3}
     */
    static fromURLParams(urlParams){
        const options=new SynopsisOptions3();
        let foundParams=false;
        for (const param of urlParams){
            if(Object.hasOwn(SynopsisOptions3.SynopsisUrlParamsMap,param.name)){
                const paramDetails=SynopsisOptions3.SynopsisUrlParamsMap[param.name];
                if(paramDetails.category=='view'){
                    options.viewOptions[param.name]=param.value;
                    if (!options.request.fromURL){
                        options.request.fromURL=true;
                    }
                }
                else if(paramDetails.category=='request'){
                    options.request[param.name]=param.value;
                    if (!options.request.fromURL){
                        options.request.fromURL=true;
                    }
                }
            }
        }

        return options;
    }

    static SynopsisUrlParamsMap ={

        hideSolos: {type: 'boolean', category: 'view'},
        hideNonPrimary: { type: 'boolean', category: 'view'},
        focusOn: { type: 'boolean', category: 'view'},
        hideNonPrimarySolos: { type: 'boolean', category: 'view'},
        unique: { type: 'boolean', category: 'view'},
        identical: { type: 'boolean', category: 'view'},
        sort: { type: 'boolean', category: 'view'},
        highlightOnClick: { type: 'boolean', category: 'view',noURL:true},
        hideApp: { type: 'boolean', category: 'view'},
        lexes: {type: 'intArray', split: ",", category: 'view'},
        similarPhrases: {type: 'boolean', category: 'view'},
        exactPhrases: {type: 'boolean', category: 'view'},
        selectedGospelIndex: {type:"int",default:0, category: 'view'},
        greekStrings: {type: 'strArray', split: "|", category: 'view'},
        tab: {type:"int",default:0, category: 'request'},
        mode: {type:"int",default:0, category: 'request'},            
        pericopes: {type: 'intArray', split: ",", category: 'request'},
        sections: {type: 'intArray', split: ",", category: 'request'},   
        columns: {type: 'strArray', split: "|", category: 'request'},
        batch: {type: 'strArray', split:"^", category: 'request'},
        nt: {type:'str', category: 'request', default:'sblgnt'},           
        fromURL: {type:'boolean', category: 'request',noURL:true},
        menuOpen: {type:'boolean', default: false, category: 'view',noURL:true},
        showLookup: {type:'boolean', default: false, category: 'view',noURL:true},
        hideSecondary: {type:'boolean', default: false, category: 'view',noURL:false},
        lexInfoClick:{ type: 'boolean', category: 'view',noURL:true},
        page:{ type: 'int', category: 'view',noURL:false,default: 0},
    }

    /**
     * 
     * @returns {string}
     */
    generateURI(){
        //const baseurl = window.location.protocol  + "//" + window.location.host + "/";
        /**
         * @type {string[]} viewUri
         */
        const validProps=Object.entries(SynopsisOptions3.SynopsisUrlParamsMap).filter(([k,v])=>!v.noURL).map(([k,v])=>k);
        const urlParams= new URLSearchParams();


        [...Object.entries(this.viewOptions),...Object.entries(this.request)].filter(([k,v])=>validProps.includes(k))
        .forEach(([name,val])=> {
            //const pRow = SynopsisOptions3.SynopsisUrlParamsMap[name];
            let str=''
        
            const urlParamRow=SynopsisOptions3.SynopsisUrlParamsMap[name];
            let valStr=val;
            if(urlParamRow.type=='intArray'||urlParamRow.type=='strArray'){
                valStr=val.join(urlParamRow.split);
            }
            else if(urlParamRow.type=='boolean'){
                valStr= val ? "1" : ""
            }//otherwise, it's a string, leave as is.
            
            if(name && val && valStr){
                urlParams.set(name,valStr);
                //mylog(`Got url param: '${name}'='${valStr}'`);
            }
            else {
                //mylog(`Couldn't add url param for name:'${name}', strVal: '${valStr}'`);
            

            }
            
            
            return str;
        });
        
        
        
//        mylog(`generateURI() returning: '${theUris}'`)
        
        return urlParams.size ? "?" + urlParams.toString() : '';

    }
    
    /**
     * 
     * @returns {SynopsisOptions3}
     */
    copy(){
        const theCopy=new SynopsisOptions3();
        theCopy.viewOptions=copyObject(this.viewOptions);
        theCopy.request=copyObject(this.request)
        return theCopy;
    }

    softReset(){

    }
}


function copyObject(obj){
    const copy={};
    Object.entries(obj).forEach(([k,v])=>{
        copy[k]=v;

    });
    return copy;
}



export class SynopsisOptions{

    //viewOptions=new SynopsisViewOptions();
        unique= $state(false);
    identical= $state(false);
    highlightOnClick= $state(false);
    hideNonPrimary= $state(false);
    hideSolos= $state(false);
    focusOn= $state(false);
    hideNonPrimarySolos= $state(false);
    sort= $state(false);
    selectedGospelIndex= $state(0);
     /**
     * @type {string[]} greekStrings
     */
    greekStrings= $state([]);
    hideApp= $state(false);
    mode= $state(0);
    tab= $state(0);
    nt=$state("sblgnt");
    /**
     * @type {number[]} pericopes
     */
    pericopes=[];
    /**
     * @type {number[]} pericopes
     */
    sections=[];
 
  
    /**
     * @type {string[]} columns
     */
    columns=[];
    
    /**
     * @type {string[]} batch
     */
    batch=[];
    /**
     * @type {number[]} lexes
    */
    lexes=[];

    
 //request,text,view

    /**
     * 
     * @param {boolean} unique 
     * @param {boolean} identical 
     * @param {boolean} highlightOnClick 
     * @param {number[]} lexes 
     */
    static propTypes= {
        booleanParams: [
            {name: "hideSolos", type: ''},
            {name: "hideNonPrimary", type: ''},
            {name: "focusOn", type: ''},
            {name: "hideNonPrimarySolos", type: ''},
            {name: "unique", type: ''},
            {name: "identical", type: ''},
            {name: "sort", type: ''},
            {name: "hideApp", type: ''},
        ],

        numericParams : [
            "selectedGospelIndex",
            "tab",
            "mode"
            
        ],

        intArrayParams: [
            {name: "pericopes", split: ","},
            {name: "sections", split: ","},
            {name: "lexes", split: ","},
        ],

        stringArrayParams: [
            {name: "columns", split: "|"},
            {name: "greekStrings", split: "|"},
            {name:"batch", split:"^"}
        ],
        stringParams: [
            "nt"
        ]

    };

    constructor(unique=false,identical=false,highlightOnClick=false,lexes=[],){
        this.unique=unique; 
        
        this.identical=identical;
        
        this.highlightOnClick=highlightOnClick;
        
        this.lexes=lexes;
        
        
    }

    /**
     * 
     * @param {Object} obj 
     * @returns {SynopsisOptions}
     */
    static makeFrom(obj){
        let sop = new SynopsisOptions();
        for (const [prop,val] of Object.entries(obj)){
            sop[prop]=val;
        }

        return sop;
    }
  
}

/**
 * 
 * @param {URLSearchParams} searchParamsObj 
 * @returns {URLParam[]}
 */
export function getRequestParamsObj3(searchParamsObj){
    /**
     * @type {URLParam[]}
     */
    const paramObjs=[];
    Object.entries(SynopsisOptions3.SynopsisUrlParamsMap).forEach(([paramName,paramDetails])=>{
        if(searchParamsObj.has(paramName)){
            const pObj=new URLParam(paramName,searchParamsObj.get(paramName),paramDetails.type, 
                Object.hasOwn(paramDetails,'split') ? paramDetails.split : '');
            paramObjs.push(pObj);
        }

    })

    return paramObjs;
}

/**
 * 
 * @param {URLParam[]} params 
 * @returns 
 */
export function generateURL(params){
    const baseurl = window.location.protocol  + "//" + window.location.host + "/";
    
    const uri=params.reduce((partialURI,p)=>`${partialURI}&${p.toURLstring()}`,"?");
    return baseurl + uri;

   
}

