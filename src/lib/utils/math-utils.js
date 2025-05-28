export function floatRound(float, decimals=3){
    const factor = Math.pow(10,decimals);
    return Math.round(float * factor) / factor;
}