import { writable, get } from 'svelte/store';

export const tfserverurl = "http://localhost:5000/nt"
const testing = true;

export const apiURI= testing ? 'http://localhost:5000/nt' :'/api/tf';


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
    NONE: 100
};
let defaultLevel = 0; 
/*debugLevel.subscribe((v)=>{
    defaultLevel = v;
})*/
//$: defaultLevel = debugLevel.value;
//debugLevel.set(levels.DEBUG);

export function mylog(msg, debugOn=get(debug),thelevel=defaultLevel) {
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