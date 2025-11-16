import { mylog } from "$lib/env/env";
//import { SynopsisOptions3 } from "./SynopsisClasses.svelte.js";

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
