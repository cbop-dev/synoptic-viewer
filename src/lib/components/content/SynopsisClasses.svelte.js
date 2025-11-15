import { mylog,debug } from "$lib/env/env.js";
import { URLParam } from "./urlParams";

//import { SynopsisOptions,getRequestParamsObj,generateURL } from './SynopsisClasses.svelte.js';

//types: request(tab,type,request-details), UI(windows/modal-screens), text-display(sort/filter/highlight)



export class SynopsisRequest {
    constructor(){
        this.mode= $state(0);
        this.tab= $state(0);
        this.nt=$state("sblgnt");
        this.fromURL=false;

        /**
         * @type {number[]} pericopes
         */
        this.pericopes=[];
        /**
         * @type {number[]} pericopes
         */
        this.sections=[];
    
    
        /**
         * @type {string[]} columns
         */
        this.columns=[];
        
        /**
         * @type {string[]} batch
         */
        this.batch=[];
        

    }


    copy(){
        const theCopy=new SynopsisRequest();
        theCopy.mode=this.mode;
        theCopy.tab=this.tab;
        theCopy.nt=this.nt;
        theCopy.fromURL=this.fromURL;
        theCopy.pericopes=this.pericopes;
        theCopy.sections=this.sections;
        theCopy.columns=this.columns;
        theCopy.batch=this.batch;
        return theCopy;
    }
} 

export class SynopsisViewOptions2 {
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

    /**
     * @type {number[]} lexes
    */
    lexes=$state([]);

    /**
     * @returns {SynopsisViewOptions2}
     */
    copy(){
        const theCopy=new SynopsisViewOptions2();
        theCopy.unique=this.unique;
        theCopy.identical=this.identical;
        theCopy.highlightOnClick=this.highlightOnClick;
        theCopy.hideNonPrimary=this.hideNonPrimary;
        theCopy.hideSolos=this.hideSolos;
        theCopy.focusOn=this.focusOn;
        theCopy.hideNonPrimarySolos=this.hideNonPrimarySolos;
        theCopy.sort=this.sort;
        theCopy.selectedGospelIndex=this.selectedGospelIndex;
        theCopy.greekStrings=this.greekStrings;
        theCopy.hideApp=this.hideApp;
        theCopy.mode=this.mode;
        theCopy.lexes=this.lexes;
        return theCopy;
    }
}




export class SynopsisViewOptions{
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

}


export class SynopsisOptions3{

    viewOptions=$state({});
    request=$state({});

    resetProp(propName){
        let reset=false;
        if(Object.hasOwn(SynopsisOptions3.SynopsisUrlParamsMap,propName)){
            const row=SynopsisOptions3.SynopsisUrlParamsMap[propName];
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
                this.viewOptions[propName]=val;
                reset=true;
            }
            else if(row.category=='request'){
                this.request[propName]=val;
                reset=true;
            }

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
        /*
        unique= $state(false);
        identical= $state(false);
        highlightOnClick= $state(false);
        hideNonPrimary= $state(false);
        hideSolos= $state(false);
        focusOn= $state(false);
        hideNonPrimarySolos= $state(false);
        sort= $state(false);
        selectedGospelIndex= $state(0);
        greekStrings= $state([]);
        hideApp= $state(false);
        mode= $state(0);
        lexes=$state([]);
        */
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

        const theUris = [...Object.entries(this.viewOptions),...Object.entries(this.request)].filter(([k,v])=>validProps.includes(k))
        .map(([name,val])=> {
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
                str=`${name}=${valStr}`;
//                mylog(`Got url param: '${name}'='${valStr}'`)
            }
            else {
//                mylog(`Couldn't add url param for name:'${name}', strVal: '${valStr}'`);
            

            }
            
            
            return str;
        }).filter((s)=>s);
        
        
        
//        mylog(`generateURI() returning: '${theUris}'`)
        
        return theUris.length ? "?" + theUris.join("&") : '';

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
export class SynopsisOptions2 {

    viewOptions=$state(new SynopsisViewOptions2());
    request=$state(new SynopsisRequest());

    /**
     * 
     * @returns {SynopsisOptions2}
     */
    copy(){
        const theCopy=new SynopsisOptions2();

        theCopy.viewOptions=this.viewOptions.copy();
        theCopy.request=this.request.copy();
        return theCopy;
    }

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


class SynopsisOptionsTypes {

    /**
     * 
     * @param {boolean} unique 
     * @param {boolean} identical 
     * @param {boolean} highlightOnClick 
     * @param {number[]} lexes 
     */
    static propTypes= {
        booleanParams: [
        "hideSolos",
        "hideNonPrimary",
        "focusOn",
        "hideNonPrimarySolos",
        "unique",
        "identical",
        "sort",
        "hideApp"
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
}

/**
 * 
 * @param {string} value 
 * @param {string} type 
 * @param {string} split 
 * @returns {number|boolean|string|number[]|string[]|null}
 */
function param2Object(value,type,split=' '){
    let obj=null
    if (type == 'str'){
        obj=value;
    }
    else if(type=='boolean'){
        obj= (value=="1" || value.toLocaleLowerCase()=="true"|| value.toLocaleLowerCase()=="t") ? true : false;
    }
    else if(type=='int'){
        obj=parseInt(value);
    }
    else if(type=='intArray'){
        obj=value.split(split).map((s)=>parseInt(s));
    }
    else if(type=='strArray'){
        obj=value.split(split);
    }
    return obj;
}

/**
 * 
 * @param {URLSearchParams} searchParamsObj 
 * @returns {SynopsisOptions2}
 */
export function getRequestParamsObj2(searchParamsObj){
    const options=new SynopsisOptions2();
    let gotParam = false;
    for (const [param,paramDetails] of Object.entries(SynopsisUrlParamsMap)){
        if (searchParamsObj.has(param)){
            const val = param2Object(searchParamsObj.get(param),paramDetails.type, 
            (paramDetails.type == 'strArray' || paramDetails.type=='intArray') ? paramDetails.split : '');
            if(val){
                if(paramDetails.category=='view'){
                    options.viewOptions[param]=val;
                    
                }
                else if(paramDetails.category=='request'){
                    options.request[param]=val;
                }
                    
                gotParam=true;
                
            }
        }

    }
  if(gotParam){
    options.request.fromURL=true
  }
  return options;
}


export const SynopsisUrlParamsMap ={

        hideSolos: {type: 'boolean', default: false, category: 'view'},
        hideNonPrimary: { type: 'boolean', category: 'view'},
        focusOn: { type: 'boolean', category: 'view'},
        hideNonPrimarySolos: { type: 'boolean', category: 'view'},
        unique: { type: 'boolean', category: 'view'},
        identical: { type: 'boolean', category: 'view'},
        sort: { type: 'boolean', category: 'view'},
        
        hideApp: { type: 'boolean', category: 'view'},
        lexes: {type: 'intArray', split: ",", category: 'view'},
        selectedGospelIndex: {type:"int",default:0, category: 'view'},
        greekStrings: {type: 'strArray', split: "|", category: 'view'},


        tab: {type:"int",default:0, category: 'request'},
        mode: {type:"int",default:0, category: 'request'},            
        pericopes: {type: 'intArray', split: ",", category: 'request'},
        sections: {type: 'intArray', split: ",", category: 'request'},   
        columns: {type: 'strArray', split: "|", category: 'request'},
        batch: {type: 'strArray', split:"^", category: 'request'},
        nt: {type:'str', category: 'request'}            
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
    Object.entries(SynopsisUrlParamsMap).forEach(([paramName,paramDetails])=>{
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



/**
 * 
 * @param {URLSearchParams} searchParamsObj 
 * @returns {Object}
 */
export function getRequestParamsObj(searchParamsObj){

  /**
   * @type {Object} options
   */
  let options = {};
  for (const intParam of SynopsisOptions.propTypes.intArrayParams){
      if (searchParamsObj.get(intParam.name)){
       
        options[intParam.name]=searchParamsObj.get(intParam.name)?.split(intParam.split).map((n)=>parseInt(n));
       // mylog("Got string array param '"+strParam+"'=["+options[strParam.name].join("|")+"]");
      }

  }

   for (const strParam of SynopsisOptions.propTypes.stringArrayParams){
      if (searchParamsObj.get(strParam.name)){
       // mylog("checking string array param " +strParam.name +"='"+searchParamsObj.get(strParam.name)+"'")
        options[strParam.name]=searchParamsObj.get(strParam.name)?.split(strParam.split);
       // mylog("Got string array param '"+strParam+"'=["+options[strParam.name].join("|")+"]");
      }

  }

  
  for (const param of SynopsisOptions.propTypes.booleanParams){
    const p = searchParamsObj.get(param);
    if (p && p.length){
        options[param]= (p == "0" || p=="false") ? false : true;
    }

  }

  for (const param of SynopsisOptions.propTypes.numericParams){
        const p = searchParamsObj.get(param);
    if (p && p.length){
        options[param]= parseInt(p);
    }


  }


  for (const strParam of SynopsisOptions.propTypes.stringParams){
     const p = searchParamsObj.get(strParam);
     if (p && p.length){
        options[strParam]=p;
     }
  }

 

  mylog("getRequest Params returning:");
  mylog(options);
  return options;
}


/**
 * 
 * @param {SynopsisOptions2} options 
 * @returns 
 */
export function generateURLOld2(options){
        
    let url = window.location.protocol  + "//" + window.location.host + "/";
    let uris=[]
    debug.set(true);
    //const propNames=Object.getOwn(options.request);
    //mylog(`propNames.req:['${propNames.join("','")}']`, true);
   /* mylog(`options.viewOptions.hasOwnProperty('unique')=${options.viewOptions.hasOwnProperty('unique')}`,true)
    mylog(`SynopsisViewOptions2.hasOwn('unique')=${Object.hasOwn(options,'unique')}`)
    mylog(`typeof options.viewOptions.unique='${typeof options.viewOptions.unique}'`);
    mylog(`typeof options.viewOptions['unique']=${typeof options.viewOptions['unique']}`)*/
    //const props = [...Object.entries(options.viewOptions),['jack', 'fred'],...Object.entries(options.request)];
    const potentialParams=Object.getOwnPropertyNames(SynopsisUrlParamsMap);
//    mylog(`generateURL: props=['${props.map(([k,v])=>k+"="+v).join("','")}'],  potentialParams=['${potentialParams.join("','")}']`);
    for (const [name,val] of props){
//        mylog(`generateURL trying to get SynopsisUrlParamsMap[${name}]...`)
        
        
        if(potentialParams.includes(name)){
            const urlParamRow=SynopsisUrlParamsMap[name];
            let valStr=val
            if(urlParamRow.type=='intArray'||urlParamRow.type=='strArray'){
                valStr=val.join(urlParamRow.split);
            }
            else if(urlParamRow.type=='boolean'){
                valStr= val ? "1" : ""
            }
            
            if(val && valStr){
                uris.push(`${name}=${valStr}`)
//                mylog(`Got url param: '${name}'='${valStr}'`)
            }
            else {
//                mylog(`Couldn't add url param for name:'${name}', strVal: '${valStr}'`);
            }

        }
        else{
//            mylog(`SynopsisUrlParamsMap[${name}] NOT found!`)
        }
        

        
    }
     return url + encodeURI((uris.length ? "?"+uris.join("&") :''));
}

/**
 * 
 * @param {SynopsisOptions} options 
 * @returns 
 */
export function generateURLOld(options){
        
    let url = window.location.protocol  + "//" + window.location.host + "/";
    let uris=[]
    for (const intParam of SynopsisOptions.propTypes.intArrayParams){
        if (options[intParam.name] && options[intParam.name].length){
            uris.push(intParam.name+"="+options[intParam.name].join(intParam.split));
        }
    }

    for (const strParam of SynopsisOptions.propTypes.stringArrayParams){
        if (options[strParam.name] && options[strParam.name].length){
            uris.push(strParam.name+"="+options[strParam.name].join(strParam.split));
        }
    }
        
    for (const boolParam of SynopsisOptions.propTypes.booleanParams){
        if (options[boolParam]){
            uris.push(boolParam+"=1");
        }
    }

            
    for (const numParam of SynopsisOptions.propTypes.numericParams){
        if (options[numParam]){
            uris.push(numParam+"="+options[numParam]);
        }
    }

    for (const strParam of SynopsisOptions.propTypes.stringParams){
        if (options[strParam]){
            uris.push(strParam+"="+options[strParam]);
        }
    }
        //

    return url + encodeURI((uris.length ? "?"+uris.join("&") :''));
}