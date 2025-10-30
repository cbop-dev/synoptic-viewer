//test
/**
 * {{hideSolos: boolean, 
 *       selectedGospelIndex: number,
 *       sort: boolean,
 *       hideNonPrimary: boolean,
 *       focusOn: boolean,
 *       hideNonPrimarySolos: boolean,
 *       unique: boolean,
 *       identical: boolean,
 *       lexes: number[],
 *       greekStrings: string[]}}
 * 
 * 
 */

const booleanParams=[
    "hideSolos",
    "sort",
    "hideNonPrimary",
    "focusOn",
    "hideNonPrimarySolos",
    "unique",
    "identical"
  ];

  const numericParams = [
    "selectedGospelIndex"
  ]


/**
 * 
 * @param {URLSearchParams} searchParamsObj 
 * @returns {Object<string,boolean|number|number[]|string[]>}
 */
export function getRequestParamsObj(searchParamsObj){

  let req = {};
  if (searchParamsObj.get("pericopes")){
    req.pericopes=searchParamsObj.get("pericopes")?.split(',').map((n)=>parseInt(n));

  }
  if (searchParamsObj.get("sections")){
    req.pericopes=searchParamsObj.get("sections")?.split(',').map((n)=>parseInt(n));

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
    req.greekStrings=searchParamsObj.get("greekStrings")?.split(",");
  }
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
        hideSolos: hideSolos,
        selectedGospelIndex: selectedGospelIndex,
        sort: sort,
        hideNonPrimary: hideNonPrimary,
        focusOn: focusOn,
        hideNonPrimarySolos: hideNonPrimarySolos,
        unique: unique,
        identical: identical,
    }

    if (lexes.length) {
        params.lexes=lexes;
    }

    if (greekStrings.length){
        params.greekStrings=greekStrings;
    }

    const optionsParams = Object.entries(params).filter(([k,v])=>v).map(([k,v])=>k+"="+v).join("&");
    if (optionsParams.length) {
        url += "&" +optionsParams
    }
    return url;
}