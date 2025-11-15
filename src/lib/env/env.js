import { writable, get } from 'svelte/store';
//export const testing =  import.meta.env.MODE =='test' ? true : false;
export const testing = ((typeof process !== 'undefined') && process.env && process.env.TEST) || (import.meta.env.MODE =='test') ? true: false

const useLocalTF=true;
export const tfserverurl = useLocalTF ? "http://localhost:5000" : "";//add alternate tf-fast server

export const useSbl=true;
//export const useSbl=false;

//const testing = true;

export const apiURI= testing ? '' : '/api/tf';

export const debug = writable(false);
//debug.set(true);

//debug = true;

export const levels = {
    RIDICULOUS: -100,
    DEBUG: 0,
    INFO: 1,
    LOG: 2,
    WARNING: 3,
    ERROR: 4,
    NONE: 100,
    SILENCE: 100000
};

let defaultLevel = 0; 
//defaultLevel=levels.SILENCE;
/*debugLevel.subscribe((v)=>{
    defaultLevel = v;
})*/
//$: defaultLevel = debugLevel.value;
//debugLevel.set(levels.DEBUG);

export function mylog(msg, debugOn=get(debug),thelevel=levels.INFO) {
    //mylog("mylog with debug val = " + get(debug))
    if (debugOn && thelevel >= defaultLevel ) {
     //   mylog("mylog level at " + defaultLevel)
        console.log(msg);
    }
}

/**
 * @param {number} level // change default log level to 'level': must be one of values in 'levels' object.
 * @returns {boolean} // true if successfully set level; false if not.
 */
export function setLogLevel(level) {
    let success = false;
    if (Object.values(levels).includes(level)) {
       // debugLevel.set(level);
        success = true;
    }
    return success;
           
}

export let repackageLemmas = false;
//repackageLemmas = true;


export let log = {
    debug: debug,
    defaultLevel: defaultLevel,
    levels: levels,
    mylog: mylog,
    setLogLevel: setLogLevel,
}

/**
export default {
    debug: debug,
    mylog: mylog,
    repackageLemmas: repackageLemmas
}
    */

if(testing){
    mylog("TESTING mode enabled!")
}
else{
    mylog("NOT Testing.")
}