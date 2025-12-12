import { mylog,debug } from "$lib/env/env.js";
import { FaceGrinStarsOutline } from "flowbite-svelte-icons";
import { URLParam } from "./urlParams.js";

export const ignoreWords = [1156,1058,3635];
export class GospelFilter{
    hide=$state([false,false,false,false]); //each index corresponds with a gospel: 0=Matt, 1=Mark, 2=Luke, 3=John
    
    filter=$derived(GospelFilter.calcFilterValue(this.hide[0],this.hide[1],this.hide[2], this.hide[3]));
    
    static gospels = [
        {name:"Matthew",flag:1},
        {name:"Mark",flag:2},
        {name:"Luke",flag:4},
        {name:"John", flag:8}
    ];

    static calcFilterValue(hideMatt=false,hideMark=false,hideLuke=false,hideJohn=false){
        return [hideMatt,hideMark,hideLuke,hideJohn].reduce((sum,val,index)=>sum+(val ? GospelFilter.gospels[index].flag:0 ),0);

    }

    /**
     * 
     * @param {number} filterVal 
     * @returns {boolean[]}
     */
    static createValues(filterVal){

        const theFilter = new GospelFilter();
       // theFilter.set(filterVal);
        theFilter.set(filterVal);
        return theFilter.hide;

    }

    /**
     * 
     * @param {number} filterVal 
     * @returns {GospelFilter}
     */
    static fromFilterVal(filterVal){
        const newFilter=new GospelFilter();
        newFilter.set(filterVal);
        return newFilter;
    }
    constructor(hideMatt=false,hideMark=false,hideLuke=false,hideJohn=false){
        this.hide=[hideMatt,hideMark,hideLuke,hideJohn];
        //this.filter=$state(GospelFilter.calcFilterValue(hideMatt,hideMark,hideLuke,hideJohn));
    }

    /**
     * 
     * @param {number} gospelIndex An index where 0 = Matt, 1 = Mark, 2 = Luke, 3 = John
     * @returns {boolean} returns true if the given gospel is set to be hidden, false otherwise.
     */
    isHidden(gospelIndex){
        return (gospelIndex >=0 && gospelIndex < GospelFilter.gospels.length) ? 
                (GospelFilter.gospels[gospelIndex].flag & this.filter) > 0
                : false;
    }

    /**
     * 
     * @param {number} filterVal 
     */
    set(filterVal){
        //this.filter=filterVal;
        //this.filterVal=$state(filterVal);
        this.hide.forEach((h,i)=>{
            this.hide[i]=((GospelFilter.gospels[i].flag & filterVal) > 0)
        });
        //this.hide=GospelFilter.createValues(filterVal);
    }

    update(hideMatt=false,hideMark=false,hideLuke=false,hideJohn=false){
        this.hide=[hideMatt,hideMark,hideLuke,hideJohn];
        
    }

    /**
     * 
     * @param {number} index 
     * @param {boolean} value 
     */
    setGospel(index,value){
        if (index < this.hide.length && index >= 0){
            this.hide[index]=value;
        }
    }

    /**
     * 
     * @param {number} index 
     */
    toggleGospel(index){
        this.setGospel(index,!this.hide[index]);
    }
}

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
                    if (false && !options.request.fromURL){
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
        showEverything:{ type: 'boolean', category: 'view',noURL:true,default: false},
        ignoreWords:{ type: 'intArray', category: 'view',noURL:false,default: ignoreWords},
        
        // 4-bit integer, each bit represents a gospel, where 0 = show; 1 = hide; little endian: lowest-> hightest : Matthew -> John
        // thus:
        // 0: 0 0 0 0 = show all
        // 1: 0 0 0 1 = hide Matt
        // 2: 0 0 1 0 = hide Mark
        // 3: 0 0 1 1 = hide Matt + Mark
        // 4: 0 1 0 0 = hide Luke
        // 5: 0 1 0 1 = hide Luke + Matt
        // 6: 0 1 1 0 = hide Luke + mark
        // 7: 0 1 1 1 = hide all but john
        // ... etc.
        gospelFilter:{ type: 'number', category: 'view',noURL:false,default: 0}, 
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

