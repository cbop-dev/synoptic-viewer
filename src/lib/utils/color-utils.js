/**
 * Utility class for using tailwindcss CSS classes for color gradients 
 **/
class ColorUtils{
    static generateHslColorGradient(num,sat=80,light=50){
        return Array(num).fill(null).map((val,i)=> //like "hsl(56, 80%, 50%)");
                    "hsl(" + Math.round(320 * i/(num)).toString()  +", " + sat +"%, "+ light + "%)"
                );
    }


    static getColorFromGradient(){


        
    }

    static getCustomBgTextColorClasses(index){
        let colorClassString = '';
            const redGradient =[
        " bg-red-600 text-white",
        " bg-red-200 text-black",
        " bg-red-800 text-white",
        " bg-red-400 text-black",
        " bg-red-100 text-black",
        " bg-red-700 text-white",
        " bg-red-650 text-white",
        " bg-red-150 text-white",
        " bg-red-550 text-white",
        " bg-red-350 text-black",
        " bg-red-850 text-white",
        " bg-red-350 text-black"
        ];
        const orangeGradient =[
        " bg-orange-600 text-white",
        " bg-orange-200 text-black",
        " bg-orange-800 text-white",
        " bg-orange-400 text-black",
        " bg-orange-100 text-black",
        " bg-orange-700 text-white",
        " bg-orange-650 text-white",
        " bg-orange-150 text-white",
        " bg-orange-550 text-white",
        " bg-orange-350 text-black",
        " bg-orange-850 text-white",
        " bg-orange-350 text-black"
        ];
        const amberGradient =[
        " bg-amber-600 text-white",
        " bg-amber-200 text-black",
        " bg-amber-800 text-white",
        " bg-amber-400 text-black",
        " bg-amber-100 text-black",
        " bg-amber-700 text-white",
        " bg-amber-650 text-white",
        " bg-amber-150 text-white",
        " bg-amber-550 text-white",
        " bg-amber-350 text-black",
        " bg-amber-850 text-white",
        " bg-amber-350 text-black"
        ];
        const yellowGradient =[
    " bg-yellow-600 text-white",
        " bg-yellow-200 text-black",
        " bg-yellow-800 text-white",
        " bg-yellow-400 text-black",
        " bg-yellow-100 text-black",
        " bg-yellow-700 text-white",
        " bg-yellow-650 text-white",
        " bg-yellow-150 text-white",
        " bg-yellow-550 text-white",
        " bg-yellow-350 text-black",
        " bg-yellow-850 text-white",
        " bg-yellow-350 text-black"
        ];
        const limeGradient =[
    " bg-lime-600 text-white ",
        " bg-lime-200 text-black",
        " bg-lime-800 text-white",
        " bg-lime-400 text-black",
        " bg-lime-100 text-black",
        " bg-lime-700 text-white",
        " bg-lime-650 text-white",
        " bg-lime-150 text-white",
        " bg-lime-550 text-white",
        " bg-lime-350 text-black",
        " bg-lime-850 text-white",
        " bg-lime-350 text-black"
        ];
        const greenGradient =[
        " bg-green-600 text-white",
        " bg-green-200 text-black",
        " bg-green-800 text-white",
        " bg-green-400 text-black",
        " bg-green-100 text-black",
        " bg-green-700 text-white",
        " bg-green-650 text-white",
        " bg-green-150 text-white",
        " bg-green-550 text-white",
        " bg-green-350 text-black",
        " bg-green-850 text-white",
        " bg-green-350 text-black"
        ];
        const emeraldGradient =[
    " bg-emerald-600 text-white",
        " bg-emerald-200 text-black",
        " bg-emerald-800 text-white",
        " bg-emerald-400 text-black",
        " bg-emerald-100 text-black",
        " bg-emerald-700 text-white",
        " bg-emerald-650 text-white",
        " bg-emerald-150 text-white",
        " bg-emerald-550 text-white",
        " bg-emerald-350 text-black",
        " bg-emerald-850 text-white",
        " bg-emerald-350 text-black"
        ];
        const tealGradient =[
        " bg-teal-600 text-white",
        " bg-teal-200 text-black",
        " bg-teal-800 text-white",
        " bg-teal-400 text-black",
        " bg-teal-100 text-black",
        " bg-teal-700 text-white",
        " bg-teal-650 text-white",
        " bg-teal-150 text-white",
        " bg-teal-550 text-white",
        " bg-teal-350 text-black",
        " bg-teal-850 text-white",
        " bg-teal-350 text-black"
        ];
        const cyanGradient =[
        " bg-cyan-600 text-white",
        " bg-cyan-200 text-black",
        " bg-cyan-800 text-white",
        " bg-cyan-400 text-black",
        " bg-cyan-100 text-black",
        " bg-cyan-700 text-white",
        " bg-cyan-650 text-white",
        " bg-cyan-150 text-white",
        " bg-cyan-550 text-white",
        " bg-cyan-350 text-black",
        " bg-cyan-850 text-white",
        " bg-cyan-350 text-black"
        ];
        const skyGradient =[
        " bg-sky-600 text-white",
        " bg-sky-200 text-black",
        " bg-sky-800 text-white",
        " bg-sky-400 text-black",
        " bg-sky-100 text-black",
        " bg-sky-700 text-white",
        " bg-sky-650 text-white",
        " bg-sky-150 text-white",
        " bg-sky-550 text-white",
        " bg-sky-350 text-black",
        " bg-sky-850 text-white",
        " bg-sky-350 text-black"
        ];
        const blueGradient =[
        " bg-blue-600 text-white",
        " bg-blue-200 text-black",
        " bg-blue-800 text-white",
        " bg-blue-400 text-black",
        " bg-blue-100 text-black",
        " bg-blue-700 text-white",
        " bg-blue-650 text-white",
        " bg-blue-150 text-white",
        " bg-blue-550 text-white",
        " bg-blue-350 text-black",
        " bg-blue-850 text-white",
        " bg-blue-350 text-black"
        ];
        const indigoGradient =[
            " bg-indigo-600 text-white",
        " bg-indigo-700 text-white",
        "  bg-indigo-500 text-white",
        " bg-indigo-600 text-white",
        " bg-indigo-800 text-white",
        " bg-indigo-400 text-black",
        " bg-indigo-650 text-white",
        " bg-indigo-750 text-white",
        " bg-indigo-550 text-white",
        " bg-indigo-650 text-white",
        " bg-indigo-850 text-white",
        " bg-indigo-450 text-black"
        ];
        const violetGradient =[
            " bg-violet-600 text-white",
        " bg-violet-700 text-white",
        "  bg-violet-500 text-white",
        " bg-violet-600 text-white",
        " bg-violet-800 text-white",
        " bg-violet-400 text-black",
        " bg-violet-200 text-black",
        " bg-violet-750 text-white",
        " bg-violet-550 text-white",
        " bg-violet-650 text-white",
        " bg-violet-850 text-white",
        " bg-violet-450 text-black"
        ];
        const purpleGradient =[
        " bg-purple-600 text-white",
        " bg-purple-200 text-black",
        " bg-purple-800 text-white",
        " bg-purple-400 text-black",
        " bg-purple-100 text-black",
        " bg-purple-700 text-white",
        " bg-purple-650 text-white",
        " bg-purple-150 text-white",
        " bg-purple-550 text-white",
        " bg-purple-750 text-black",
        " bg-purple-850 text-white",
        " bg-purple-350 text-black"
        ];
        const fuchsiaGradient =[
        " bg-fuchsia-600 text-white",
        " bg-fuchsia-200 text-black",
        " bg-fuchsia-800 text-white",
        " bg-fuchsia-400 text-black",
        " bg-fuchsia-100 text-black",
        " bg-fuchsia-700 text-white",
        " bg-fuchsia-500 text-white",
        " bg-fuchsia-150 text-white",
        " bg-fuchsia-550 text-white",
        " bg-fuchsia-750 text-black",
        " bg-fuchsia-850 text-white",
        " bg-fuchsia-350 text-black"
        ];
        const pinkGradient =[
            " bg-pink-600 text-white",
        " bg-pink-700 text-white",
        "  bg-pink-500 text-white",
        " bg-pink-600 text-white",
        " bg-pink-800 text-white",
        " bg-pink-400 text-black",
        " bg-pink-650 text-white",
        " bg-pink-750 text-white",
        " bg-pink-550 text-white",
        " bg-pink-650 text-white",
        " bg-pink-850 text-white",
        " bg-pink-450 text-black"
        ];
        const roseGradient =[
            " bg-rose-600 text-white",
        " bg-rose-700 text-white",
        "  bg-rose-500 text-white",
        " bg-rose-600 text-white",
        " bg-rose-800 text-white",
        " bg-rose-400 text-black",
        " bg-rose-650 text-white",
        " bg-rose-750 text-white",
        " bg-rose-550 text-white",
        " bg-rose-650 text-white",
        " bg-rose-850 text-white",
        " bg-rose-450 text-black"
        ];
    const slateGradient=[
        " bg-slate-600 text-white",
        " bg-slate-200 text-black",
        " bg-slate-800 text-white",
        " bg-slate-400 text-white",
        " bg-slate-100 text-black",
        " bg-slate-700 text-white",
        " bg-slate-650 text-white",
        " bg-slate-150 text-white",
        " bg-slate-550 text-white",
        " bg-slate-350 text-black",
        " bg-slate-850 text-white",
        " bg-slate-350 text-black"
        ];
        const stoneGradient=[
        " bg-stone-600 text-white",
        " bg-stone-200 text-black",
        " bg-stone-800 text-white",
        " bg-stone-400 text-white",
        " bg-stone-100 text-black",
        " bg-stone-700 text-white",
        " bg-stone-650 text-white",
        " bg-stone-150 text-white",
        " bg-stone-550 text-white",
        " bg-stone-350 text-black",
        " bg-stone-850 text-white",
        " bg-stone-350 text-black"
        ]
        const colorArrays=[redGradient, purpleGradient, emeraldGradient, stoneGradient,blueGradient,yellowGradient,
        limeGradient, cyanGradient,indigoGradient,amberGradient,  greenGradient,  orangeGradient, roseGradient, tealGradient, slateGradient, violetGradient, skyGradient, fuchsiaGradient, pinkGradient ]
  
        const gradientIndex = ( index % colorArrays.length);
        const colorIndex = Math.floor(index / colorArrays.length)%colorArrays[0].length;
        colorClassString += ' ' + colorArrays[gradientIndex][colorIndex];
    //  mylog(`getColorClasses(${lexid}): selectedIndex = ${selectedIndex}, gradIndex=${gradientIndex}, colorIndex=${colorIndex} colorClassString='${colorClassString}'`,true )
        return colorClassString; 
    }
            
}        


          

export {ColorUtils}
