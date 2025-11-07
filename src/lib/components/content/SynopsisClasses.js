import { mylog } from "$lib/env/env";

export class SynopsisOptions{
    unique=false;
    identical=false;
    highlightOnClick=false;
    hideNonPrimary=false;
    hideSolos=false;
    focusOn=false;
    hideNonPrimarySolos=false;

    sort=false;
    /**
     * @type {number[]} pericopes
     */
    pericopes=[];
    /**
     * @type {number[]} pericopes
     */
    sections=[];
 
    selectedGospelIndex=0;
    /**
     * @type {string[]} greekStrings
     */
    greekStrings=[];
    /**
     * @type {string[]} columns
     */
    columns=[];

    /**
     * @type {number[]} lexes
    */
    lexes=[];

    nt="sblgnt"
    //other: "n1904"
    
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
        ],

        numericParams : [
            "selectedGospelIndex",
            "tab",
            
        ],

        intArrayParams: [
            {name: "pericopes", split: ","},
            {name: "sections", split: ","},
            {name: "lexes", split: ","},
        ],

        stringArrayParams: [
            {name: "columns", split: "|"},
            {name: "greekStrings", split: "|"},
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
 * @param {SynopsisOptions} options 
 * @returns 
 */
export function generateURL(options){
        
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
        //

    return url + (uris.length ? "?"+uris.join("&") :'');
}