import chroma from 'chroma-js';
import MathUtils from './math-utils';
import { mylog } from '$lib/env/env';
/**
 * Utility class for using tailwindcss CSS classes for color gradients 
 **/
class ColorUtils{


    static RED = 0.2126;
    static GREEN = 0.7152;
    static BLUE = 0.0722;

    static GAMMA = 2.4;

    static  HSLToRGB(h,s,l) {
        // Must be fractions of 1
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0,
            g = 0,
            b = 0;
    }

    static hslContrast(h, s, l) {
        // Convert HSL to linear RGB:
        // Utility from the W3C Spec
        function hslToRgb(h, s, l) {
            h /= 360;
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            function channel(t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
            }
            return {
            r: channel(h + 1/3),
            g: channel(h),
            b: channel(h - 1/3)
            };
        }

        // Compute relative luminance (WCAG)
        function luminance({r, g, b}) {
            const f = x => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        }

        // Given background luminance, choose darkest or lightest font
        const bgLum = luminance(hslToRgb(h, s, l));

        const contrastBlack = (bgLum + 0.05) / (0 + 0.05);
        const contrastWhite = (1 + 0.05) / (bgLum + 0.05);

        return contrastWhite > contrastBlack
            ? { h: 0, s: 0, l: 1 }   // white
            : { h: 0, s: 0, l: 0 };  // black
    }

    static hslContrast2(h, s, l) {
        // Opposite hue on the wheel
        const newH = (h + 180) % 360;

        // Choose an opposite lightness
        const newL = l < 0.5 ? 0.85 : 0.15;

        // Slightly boost saturation but keep within bounds
        const newS = Math.min(1, s + 0.3);

        return { h: newH, s: newS, l: newL };
    }
    static rgbLuminance(r, g, b) {
    var a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928
        ? v / 12.92
        : Math.pow((v + 0.055) / 1.055, GAMMA);
    });
    return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
    }

    static rgBContrast(rgb1, rgb2) {
        var lum1 = ColorUtils.luminance(...rgb1);
        var lum2 = ColorUtils.luminance(...rgb2);
        var brightest = Math.max(lum1, lum2);
        var darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    /**
     * //TODO: do this!
     * @param {number} size
     * @returns {{bg:string,font:string,border:string}[]} an array of css oklab color values 'bg','font',and optionally 'border': {bg:'oklab(0.3,0.5,0.6), font:'oklab(1,0,0), border: 'oklab(0.8,0.5,0.6'}
     */
    static generateCubeHelixOklchPalette(size){
        const generator= chroma.cubehelix().scale().domain([0,size]).mode('lab').classes(size);
        return MathUtils.range(size,0).map((i)=>{
            let ret={bg:'',font:'',border:''};
                const bgColor =generator(i);
                //const [r,g,b]=bgColor.rgb()
                const [h,s,l]=bgColor.hsl();
                const [r,g,b] = bgColor.darken().desaturate().rgb();
                ret.bg=`hsl(${Math.round(h)},${Math.round(s*100)}%,${Math.round(l*100)}%)`;
                ret.font= l <0.5 ? 'white' : 'black';
                ret.border=`rgb(${r},${g},${b})`;
            return ret;
        })
        //return //chroma.scale(['yellow', 'navy', 'red']).mode('lab').classes(size);
        
    }

    /**
     * 
     * @param {chroma.Color} bg 
     * @param {chroma.Color|null} [font=chroma('black')] the font color to check against. Default is black
     * @param {number} [threshold=5] 
     * @returns {chroma.Color} returns a potentially modified version of bg, so that the contrast between bg and font is greater the original contrast (as returned by chroma.contrast()) is less than the threshold.
     */
    static increaseBgContrast(bg,font, threshold=5){
        if (!font){
            font=chroma('black');
        }
        let ret = bg;
        const contrast = chroma.contrast(bg,font)
        if ( contrast < threshold){
            //gotta do something, but what? Lighten or darken?
            const factor = threshold - contrast > 2 ? 
                threshold - contrast > 3 ?
                    3
                :
                    2 : 1;
            if (bg.luminance()>font.luminance()){
                //bg needs to be lighter:
                ret=bg.brighten(factor);

            }
            else{
                ret=bg.darken(factor);
            }

        }
        return ret;

    }

    static maximallyDifferentPalette(n) {
        const L = 70;   // comfortable lightness for text
        const C = 50;   // safe chroma (avoid clipping)
        return Array.from({ length: n }, (_, i) =>
            chroma.lch(L, C, (360 * i) / n).hex()
        );
    }

       /**
     * //TODO: do this!
     * @param {number} size
     * @param {number} sFactor 
     * @param {number} lFactor 
     * @param {number} [contrastThreshold=7] 
     * @returns {{bg:string,font:string,border:string}[]} an array of css oklab color values 'bg','font',and optionally 'border': {bg:'oklab(0.3,0.5,0.6), font:'oklab(1,0,0), border: 'oklab(0.8,0.5,0.6'}
     */
    static myColorPalette(size,sFactor=0,lFactor=0,contrastThreshold=7){
        const theColorPoints2= {
            simple:['red','orange','yellow', 'green', 'blue','violet'],
            10: ['navy','green','yellow','red'],
            20: ['navy','coral','green','red','chartreuse','teal','hotpink','yellow'],
            long:['#300','#040','#005','#800','#080','#008','#f00','#0f0','#00f','#f88','#8f8','#88f'],
            short:['#f00','#0f0','#00f'],
            first: ['red','yellow','green','blue'],
            second: ['#700','#770','#070','#077','#007'],
            third: ['#d36','#ea3','#4e7','#5dc','#84b'],
            fourth: ['#e8a','#fe0','#af8','#3bf','#c0f'],
        }

        const theColorPoints3= [['red','yellow','green','blue'],
            ['#700','#770','#070','#077','#007'],
            ['#d36','#ea3','#4e7','#5dc','#84b'],
            ['#e8a','#fe0','#af8','#3bf','#c0f']];
    
        const theColorPoints= [
            ['red','#ff0','green','#0ff','blue'], 
            ['#603','#074','#007'],
            ['#d36','#ea3','#4e7','#85d']


            //['red','#ff0','green','#0ff','blue'],
            //['#700','#770','#070','#077','#007'],
            //['#d36','#ea3','#4e7','#5dc','#84b'],
        //    ['#e8a','#fe0','#af8','#3bf','#c0f']
           // ['#d36','#ea3','#4e7','#5dc','#85d']
        ];
    



        function getColorPoints(num){
            
        }
        //.mode('lch')
        //const generator=  chroma.scale(theColorPoints.simple).mode('lch').domain([0,size]).classes(size);
        const batchSize = 8;
        const numRowsToGet = size / batchSize > theColorPoints.length ?   theColorPoints.length : Math.floor(size / batchSize)+1;
       
       const colorArray = [...theColorPoints.entries().filter(([i,item])=>i<numRowsToGet).map(([i,item])=>item)].flat();
       //mylog(`colorArray=${colorArray.join(',')}`,true)
       
        /* const colorArray = size > batchSize*3 ? 
                            [...theColorPoints.first,...theColorPoints.second,...theColorPoints.third,...theColorPoints.fourth]
                            :
                            size > batchSize*2 ?
                                [...theColorPoints.first,...theColorPoints.second,...theColorPoints.third]
                                :
                                size > batchSiztheColorPoints.first
         */                   
//        const generator=  chroma.scale(colorArray).mode('hsl').domain([0,size]);
        //const generator=  chroma.scale(theColorPoints2.simple).mode('lch').domain([0,size]).classes(size);      
        const generator=  chroma.scale(colorArray).mode('lch').domain([0,size]).classes(size);      
        
        //const rotations = -1.1 -(Math.floor(size /12));  
        //const generator = chroma.cubehelix().lightness([0.1,0.8]).hue(4).rotations(rotations).scale().mode('lch').domain([0,size]).classes(size);
        return MathUtils.range(size,0).map((i)=>{
            let ret={bg:'',font:'',border:''};
            //mylog('=asdf;lkjasdf==========================',true);
                let bgColor =generator(i);
                if(lFactor){
                    bgColor=bgColor.brighten(lFactor);
                }
                if(sFactor){
                    bgColor=bgColor.saturate(sFactor);
                }
                //const [r,g,b]=bgColor.rgb()
                
                
                
                const contrasts = {white: chroma.contrast(bgColor,'white'), black: chroma.contrast(bgColor,'black')};
               // const contrastThreshold=7;
                if (contrasts.white < contrastThreshold && contrasts.black < contrastThreshold){
                    //need to increase the contrast by changing the color.
                    if (contrasts.white > contrasts.black){
                        //we're sticking with white font, which means we need to darken the background color:
                        bgColor=ColorUtils.increaseBgContrast(bgColor,chroma('white'),contrastThreshold)
                        ret.font='white';
                    }
                    else{
                        //using black font, thus we'll make the background lighter:
                        bgColor=ColorUtils.increaseBgContrast(bgColor,chroma('black'),contrastThreshold)
                        ret.font='black';
                    }
                }
                else {
                    if (contrasts.white > contrasts.black){
                        ret.font='white';
                    }
                    else{
                        ret.font='black;'
                    }
                }
                const [h,s,l]=bgColor.hsl();
                ret.bg=`hsl(${Math.round(h ? h : 0)},${Math.round(s*100)}%,${Math.round(l*100)}%)`;
                const [r,g,b] = bgColor.darken().saturate(2).rgb();

                //ret.font= bgColor.luminance() <0.5 ? 'white' : 'black';
                ret.border=`rgb(${r},${g},${b})`;
              //  mylog(`got colors:${ret.bg},${ret.font},${ret.border}`, true);
            return ret;
        })
        //return //chroma.scale(['yellow', 'navy', 'red']).mode('lab').classes(size);
        
    }


    /**
     * 
     * @param {number} num 
     * @param {number} sat 
     * @param {number} light 
     * @returns {string[]} array of CSS color values in the form of 'hsl(x,y,z)'.
     */
    static generateHslColorGradient(num,sat=80,light=50){
        return Array(num).fill(null).map((val,i)=> //like "hsl(56, 80%, 50%)");
                    "hsl(" + Math.round(320 * i/(num)).toString()  +", " + sat +"%, "+ light + "%)"
                );
    }



    static generateDistinctColors(n) {
        const colors = [];
        const L = 0.70;   // brightness (0–1)
        const C = 0.12;   // color intensity (0–~0.4 safe for displays)

        for (let i = 0; i < n; i++) {
            const h = (360 / n) * i; // evenly spaced hue
            colors.push(`oklch(${L} ${C} ${h})`);
        }
        return colors;
    }
   
    static generateDistinctColorsSetsPalette(n) {
        const colors = [];
        const L = 0.70;   // brightness (0–1)
        const C = 0.12;   // color intensity (0–~0.4 safe for displays)

        for (let i = 0; i < n; i++) {

            const h = (360 / n) * i; // evenly spaced hue
            
            const bg = `oklch(${L} ${C} ${h})`;
            const font=`oklch(${L<0.5? 1: 0} 0 0)`;
            const border=`oklch(${L* 0.3} ${C*0.5} ${h})`;
            colors.push({bg:bg,font:font,border:border});
        }
        return colors;
    }

   
    /**
     * 
     * @param {number} num 
     * @param {number} sat 
     * @param {number} light 
     * @returns {{bg:string,font:string,border:string}[]} array of CSS color values in the form of {bg:string,font: string} so that the bg and font colors contrast well.
     */
    static generateHslBgFontPalette(num,sat=80,light=50,border=false){

        
        return Array(num).fill(null).map((val,i)=> //like "hsl(56, 80%, 50%)");
            {
                const h=Math.round(340 * i/(num));
                const thefont=ColorUtils.hslContrast(h,sat/100,light/100);
                thefont.l=thefont.l*100;
                thefont.s=thefont.s*100;
                const borderColor= border ? `hsl(${h},50%,${Math.round(70*(light/100))}%)` :''
                return {bg: `hsl(${h.toString()},${sat}%,${light}%)`,
                    font:`hsl(${thefont.h},${thefont.s}%,${thefont.l}%)`,
                    border: border ? borderColor :''
                };
            });
    }
    
    /**
     * 
     * @param {number} index 
     */
    static getGroupColorStyle(index, sat=100,light=50){
        const gap=50;
        return `hsl(${Math.round((40 * index) % 360).toString()}, ${sat}%, ${light}%)`
    }

    static getContrastHsL(h,s,l){

    }
    static getColorFromGradient(){


        
    }



    /**
     * 
     * @param {number} index 
     * @param {boolean} important 
     * @returns 
     */
    static getCustomBgTextColorClasses(index,important=false){
       // let colorClassString = '';
        
        const gradientIndex = ( index % ColorUtils.ColorArrays.length);
        const colorIndex = Math.floor(index / ColorUtils.ColorArrays.length)%ColorUtils.ColorArrays[0].length;
        const colorClassString = ' ' + ColorUtils.ColorArrays[gradientIndex][colorIndex];
    //  mylog(`getColorClasses(${lexid}): selectedIndex = ${selectedIndex}, gradIndex=${gradientIndex}, colorIndex=${colorIndex} colorClassString='${colorClassString}'`,true )
        //return important ? colorClassString.trim().split(" ").filter((s)=>s).map((s)=>s.trim()+"!").join(" ") : colorClassString;
        return colorClassString;
    }

    static ColorPalette ={
        redGradient: [
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
        ],
        orangeGradient :[
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
        ],
        amberGradient: [
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
        ],
        yellowGradient : [
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
        ],
        limeGradient : [
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
        ],
        greenGradient : [
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
        ],
        emeraldGradient : [
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
        ],
        tealGradient : [
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
        ],
        cyanGradient : [
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
        ],
        skyGradient : [
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
        ],
        blueGradient : [
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
        ],
        indigoGradient : [
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
        ],
        violetGradient : [
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
        ],
        purpleGradient : [
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
        ],
        fuchsiaGradient : [
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
        ],
        pinkGradient : [
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
        ],
        roseGradient : [
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
        ],
        slateGradient: [
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
        ],
        stoneGradient: [
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
        ],
    }
    static ColorArrays= [ColorUtils.ColorPalette.redGradient, ColorUtils.ColorPalette.purpleGradient, ColorUtils.ColorPalette.emeraldGradient, ColorUtils.ColorPalette.stoneGradient, ColorUtils.ColorPalette.blueGradient, ColorUtils.ColorPalette.yellowGradient, ColorUtils.ColorPalette.limeGradient, ColorUtils.ColorPalette.cyanGradient, ColorUtils.ColorPalette.indigoGradient, ColorUtils.ColorPalette.amberGradient, ColorUtils.ColorPalette.greenGradient, ColorUtils.ColorPalette.orangeGradient, ColorUtils.ColorPalette.roseGradient, ColorUtils.ColorPalette.tealGradient, ColorUtils.ColorPalette.slateGradient, ColorUtils.ColorPalette.violetGradient, ColorUtils.ColorPalette.skyGradient, ColorUtils.ColorPalette.fuchsiaGradient, ColorUtils.ColorPalette.pinkGradient ];
  
    /**
     * 
     * @param {string} bgcolor  css color value, eg., "hsl(100,50%,80%)"
     * @param {string} fontColor css color value, e.g., "hsl(100,50%,80%)"
     * @returns {string} string with css vars bgColor, fontcolor, and borderColor, e.g.: "--bgColor: hsl(180,50%, 80%); --fontColor: hsl(0,0%, 0%); --borderColor: hsl(180,50%, 80%)"
     */
    static bgFontString(bgColor,fontColor,borderColor=''){
        return bgColor && fontColor ?
            `--bgColor: ${bgColor}; --fontColor:${fontColor}` + (borderColor ? `; --borderColor:${borderColor}`:''):
            '';
    }

}
            
        


          

export {ColorUtils}
