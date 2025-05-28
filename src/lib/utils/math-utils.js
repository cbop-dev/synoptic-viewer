export function floatRound(float, decimals=3){
    const factor = Math.pow(10,decimals);
    return Math.round(float * factor) / factor;
}

export function romanize (num) {
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

/**
 * 
 * @param {string} numString - a list of integers or integer ranges, separated by commas. Eg., "1,2,4-7", "3", "3-6,4", etc.
 * @returns {number[]} - an array of all the numbers in the given list, e.g., "1,2,4-7" --> [1,2,4,5,6,7], etc.
 */
export function createNumArrayFromStringListRange(numString){
    function cleanString(str){
        if (str)
            return str.replaceAll(/\s+/g, ' ').trim();
        else 
            return ''
    }

    function cleanNumString(numString){
        return cleanString(numString);
    }
    const nums=[];
    const sepGroups = cleanNumString(numString).split(',');
    for (const group of sepGroups){
        const ranges = group.split("-");
        const min = parseInt(ranges[0]);
        const max = ranges.length > 1 ? parseInt(ranges[1]) : null;

        if (ranges.length > 2) //bad input!
            return [];
        else if (ranges.length == 2 && max){
            if (min < max){
                for (let i = min; i <= max; i++) {
                    if (!nums.includes(i))
                        nums.push(i);
                }
            }
            
        }
        else if (ranges.length == 1){ //no range, just a plain number!
            
            if (!nums.includes(min))
                nums.push(min);
        }
        else{
            //bad input?; don't add anything.
        }
    }
    return nums.sort((a,b)=>a-b);
}