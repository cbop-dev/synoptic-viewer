/**
 * 
 * @param {any[]} array 
 * @param {number} [size=5]
 * @returns {any[][]} an array of subarrays of the input array, each of which has length 'size' (if possible). If there are less than 'size' items in 'array', orginal array will be returned. If size = 0, this is the same as size = 1: each item will be in its own array.
 */
export function splitArray(array,size=5){
    //todo: test!
    let ret = []
    size = size ?  size : 1
    for (let i = 0; i < array.length; i = i+size){
        if (i+size<array.length){
            ret.push(array.slice(i,i+size))

        }
        else{
            ret.push(array.slice(i,array.length));
        }
        
    }
    return ret;
}