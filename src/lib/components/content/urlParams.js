import { mylog } from "$lib/env/env";
import { SynopsisOptions } from "./SynopsisClasses.svelte.js";

export class URLParam {
  /**
   * 
   * @param {string} name 
   * @param {any} value 
   * @param {string} type 
   * @param {string} delimiter 
   */
  constructor(name='',value='', type='str',delimiter=''){
    this.name=name;
    this.type='str';
    this.delimiter='';
    this.value=URLParam.strToObj(value,type,delimiter);
  }

  /**
   * 
   * @param {string} strValue 
   * @param {string} type 
   * @param {string} delimiter 
   * @returns 
   */
  static strToObj(strValue,type='str',delimiter=''){
    let obj=null
    if (type == 'str'){
        obj=strValue;
    }
    else if(type=='boolean'){
        obj= (typeof strValue =='string' && (strValue=="1" || strValue?.toLocaleLowerCase()=="true"|| strValue?.toLocaleLowerCase()=="t")) ? true : false;
    }
    else if(type=='int'){
        obj=parseInt(strValue);
    }
    else if(type=='intArray'){
        obj=strValue.split(delimiter).map((s)=>parseInt(s));
    }
    else if(type=='strArray'){
        obj=strValue.split(delimiter);
    }
    return obj;
}
  

  toURLstring(){
    return this.name+'='+ (this.delimiter ? this.value.join(this.delimiter) : this.value);
  }

}

const booleanParams=[
    "hideSolos",
    "sort",
    "hideNonPrimary",
    "focusOn",
    "hideNonPrimarySolos",
    "unique",
    "identical",
  ];

  const numericParams = [
    "selectedGospelIndex",
    "tab",
  ]

  const intArrayParams=[
    {name: "pericopes", split: ","},
    {name: "sections", split: ","},
  ]

  const stringArrayParams=[
    {name: "columns", split: "|"},
    {name: "greekStrings", split: "|"},
  ]



/**
 * 
 * @param {URLSearchParams} searchParamsObj 
 * @returns {Object<string,boolean|number|number[]|string[]>}
 */
export function getRequestParamsObj(searchParamsObj){

  /**
   * @type {Object<string,any>} req
   */
  let req = {};
  for (const intParam of intArrayParams){
      if (searchParamsObj.get(intParam.name)){
       // mylog("checking string array param " +strParam.name +"='"+searchParamsObj.get(strParam.name)+"'")
        req[intParam.name]=searchParamsObj.get(intParam.name)?.split(intParam.split).map((n)=>parseInt(n));
       // mylog("Got string array param '"+strParam+"'=["+req[strParam.name].join("|")+"]");
      }

  }

   for (const strParam of stringArrayParams){
      if (searchParamsObj.get(strParam.name)){
       // mylog("checking string array param " +strParam.name +"='"+searchParamsObj.get(strParam.name)+"'")
        req[strParam.name]=searchParamsObj.get(strParam.name)?.split(strParam.split);
       // mylog("Got string array param '"+strParam+"'=["+req[strParam.name].join("|")+"]");
      }

  }

  
  for (const param of booleanParams){
    const p = searchParamsObj.get(param);
    if (p && p.length){
        req[param]= (p == "0" || p=="false") ? false : true;
    }

  }

  for (const param of numericParams){
        const p = searchParamsObj.get(param);
    if (p && p.length){
        req[param]= parseInt(p);
    }


  }

  if (searchParamsObj.get('lexes')){
    req.lexes=searchParamsObj.get("lexes")?.split(",").map((l)=>parseInt(l));
  }

  
  if (searchParamsObj.get('greekStrings')){
    req.greekStrings=searchParamsObj.get("greekStrings")?.split("|");
  }

  mylog("getRequest Params returning:");
  mylog(req);
  return req;
}

/**
 * 
 * @param {number[]} alandPericopeNums 
 * @param {boolean} hideSolos 
 * @param {number} selectedGospelIndex 
 * @param {boolean} sort 
 * @param {boolean} hideNonPrimary 
 * @param {boolean} focusOn 
 * @param {boolean} hideNonPrimarySolos 
 * @param {boolean} unique 
 * @param {boolean} identical 
 * @param {number[]} lexes 
 * @param {string[]} greekStrings 
 * @returns 
 */
export function generateURL(alandPericopeNums, hideSolos,selectedGospelIndex, sort, hideNonPrimary,focusOn, 
    hideNonPrimarySolos, unique, identical, lexes=[], greekStrings=[]){
        
    let url = window.location.protocol  + "//" + window.location.host + "/";
    if (alandPericopeNums.length){
        url += "?pericopes=" + alandPericopeNums.join(',');
    }

    let params={
        hideSolos: hideSolos ? 1 : 0,
        selectedGospelIndex: selectedGospelIndex,
        sort: sort ? 1 : 0,
        hideNonPrimary: hideNonPrimary ? 1 : 0,
        focusOn: focusOn ? 1 : 0,
        hideNonPrimarySolos: hideNonPrimarySolos ? 1 : 0,
        unique: unique ? 1 : 0,
        identical: identical ? 1 : 0,
    }

    if (lexes.length) {
        params.lexes=lexes;
    }

    if (greekStrings.length){
        params.greekStrings=greekStrings.join("|");
    }

    const optionsParams = Object.entries(params).filter(([k,v])=>v).map(([k,v])=>k+"="+v).join("&");
    if (optionsParams.length) {
        url += "&" +optionsParams
    }
    return url;
}


/**
 * 
 * @param {SynopsisOptions} options 
 * @returns 
 */
export function generateURL2(options){
        
    let url = window.location.protocol  + "//" + window.location.host + "/";
    if (options.pericopes && options.pericopes.length){
        url += "?pericopes=" + options.pericopes.join(',');
    }

    let params={
        hideSolos: hideSolos ? 1 : 0,
        selectedGospelIndex: selectedGospelIndex,
        sort: sort ? 1 : 0,
        hideNonPrimary: hideNonPrimary ? 1 : 0,
        focusOn: focusOn ? 1 : 0,
        hideNonPrimarySolos: hideNonPrimarySolos ? 1 : 0,
        unique: unique ? 1 : 0,
        identical: identical ? 1 : 0,
    }

    if (lexes.length) {
        params.lexes=lexes;
    }

    if (greekStrings.length){
        params.greekStrings=greekStrings.join("|");
    }

    const optionsParams = Object.entries(params).filter(([k,v])=>v).map(([k,v])=>k+"="+v).join("&");
    if (optionsParams.length) {
        url += "&" +optionsParams
    }
    return url;
}