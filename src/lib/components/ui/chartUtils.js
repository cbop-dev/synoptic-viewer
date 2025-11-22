export function generateHslColorGradient(num,sat=80,light=50){
    return Array(num).fill(null).map((val,i)=> //like "hsl(56, 80%, 50%)");
                 "hsl(" + Math.round(320 * i/(num)).toString()  +", " + sat +"%, "+ light + "%)"
            );
}

