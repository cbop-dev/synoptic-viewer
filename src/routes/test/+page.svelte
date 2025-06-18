<script>
    /** @type {{ data: import('./$types').PageData }} */
    import { mylog } from '$lib/env/env';
    let { data } = $props();

    const jsonRequestObj={
        'refs': [
            {book:'Matthew',chapter:1,verses:[1,2,3]},
            {book:'Mark',chapter:1,verses:[1,2,3],},
            {book:'Hebrews',chapter:3,verses:[1,2,3,4,5,6,7,8,9,10,11,12,13]},
            {book:'Romans',chapter:3,verses:[1,2,3,4,5,6,7,8,9,10,11,12,13]},
            {book:'Galatians',chapter:3,verses:[1,2,3,4,5,6,7,8,9,10,11,12,13]}     
        ],
        options: {showVerses: true, lexemes: true}
        /*'options':{
            'lexemes': True
        }
            */
    }
    /**
     * @type {string[]} texts
     */
    let texts=$state([]);

    /**
     * @type {Object<string,Object>|null} texts
     */
    let lexemes=$state(null);
    let textsReady = $state(false)
    async function getTexts() {
        mylog("getTexts!...");
        textsReady = false;
        const bodyData = JSON.stringify(jsonRequestObj)
		const response = await fetch('/api/tf/texts', {method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: bodyData
        });
        mylog("getTexts body data = " + bodyData);
		const jsonResp = await response.json();
        if (jsonResp){
            texts.length = 0;
            for (const text of jsonResp['texts']){
                texts.push(text)

            }
            if (jsonResp['lexemes'])
                lexemes=jsonResp['lexemes'];
        }
        textsReady=true;
	}




function getColorClasses(lexid){
    let colorString = '';
    const redGradient =[
" bg-red-600 text-white",
" bg-red-700 text-white",
"  bg-red-500 text-white",
" bg-red-600 text-white",
" bg-red-800 text-white",
 " bg-red-400 text-black",
" bg-red-650 text-white",
" bg-red-750 text-white",
" bg-red-550 text-white",
" bg-red-650 text-white",
" bg-red-850 text-white",
" bg-red-450 text-black"
];
const orangeGradient =[
	" bg-orange-600 text-white",
" bg-orange-700 text-white",
"  bg-orange-500 text-white",
" bg-orange-600 text-white",
" bg-orange-800 text-white",
 " bg-orange-400 text-black",
" bg-orange-650 text-white",
" bg-orange-750 text-white",
" bg-orange-550 text-white",
" bg-orange-650 text-white",
" bg-orange-850 text-white",
" bg-orange-450 text-black"
];
const amberGradient =[
	" bg-amber-600 text-white",
" bg-amber-700 text-white",
"  bg-amber-500 text-white",
" bg-amber-600 text-white",
" bg-amber-800 text-white",
 " bg-amber-400 text-black",
" bg-amber-650 text-white",
" bg-amber-750 text-white",
" bg-amber-550 text-white",
" bg-amber-650 text-white",
" bg-amber-850 text-white",
" bg-amber-450 text-black"
];
const yellowGradient =[
	" bg-yellow-600 text-white",
" bg-yellow-700 text-white",
"  bg-yellow-500 text-white",
" bg-yellow-600 text-white",
" bg-yellow-800 text-white",
 " bg-yellow-400 text-black",
" bg-yellow-650 text-white",
" bg-yellow-750 text-white",
" bg-yellow-550 text-white",
" bg-yellow-650 text-white",
" bg-yellow-850 text-white",
" bg-yellow-450 text-black"
];
const limeGradient =[
	" bg-lime-600 text-white",
" bg-lime-700 text-white",
"  bg-lime-500 text-white",
" bg-lime-600 text-white",
" bg-lime-800 text-white",
 " bg-lime-400 text-black",
" bg-lime-650 text-white",
" bg-lime-750 text-white",
" bg-lime-550 text-white",
" bg-lime-650 text-white",
" bg-lime-850 text-white",
" bg-lime-450 text-black"
];
const greenGradient =[
	" bg-green-600 text-white",
" bg-green-700 text-white",
"  bg-green-500 text-white",
" bg-green-600 text-white",
" bg-green-800 text-white",
 " bg-green-400 text-black",
" bg-green-650 text-white",
" bg-green-750 text-white",
" bg-green-550 text-white",
" bg-green-650 text-white",
" bg-green-850 text-white",
" bg-green-450 text-black"
];
const emeraldGradient =[
	" bg-emerald-600 text-white",
" bg-emerald-700 text-white",
"  bg-emerald-500 text-white",
" bg-emerald-600 text-white",
" bg-emerald-800 text-white",
 " bg-emerald-400 text-black",
" bg-emerald-650 text-white",
" bg-emerald-750 text-white",
" bg-emerald-550 text-white",
" bg-emerald-650 text-white",
" bg-emerald-850 text-white",
" bg-emerald-450 text-black"
];
const tealGradient =[
	" bg-teal-600 text-white",
" bg-teal-700 text-white",
"  bg-teal-500 text-white",
" bg-teal-600 text-white",
" bg-teal-800 text-white",
 " bg-teal-400 text-black",
" bg-teal-650 text-white",
" bg-teal-750 text-white",
" bg-teal-550 text-white",
" bg-teal-650 text-white",
" bg-teal-850 text-white",
" bg-teal-450 text-black"
];
const cyanGradient =[
	" bg-cyan-600 text-white",
" bg-cyan-700 text-white",
"  bg-cyan-500 text-white",
" bg-cyan-600 text-white",
" bg-cyan-800 text-white",
 " bg-cyan-400 text-black",
" bg-cyan-650 text-white",
" bg-cyan-750 text-white",
" bg-cyan-550 text-white",
" bg-cyan-650 text-white",
" bg-cyan-850 text-white",
" bg-cyan-450 text-black"
];
const skyGradient =[
	" bg-sky-600 text-white",
" bg-sky-700 text-white",
"  bg-sky-500 text-white",
" bg-sky-600 text-white",
" bg-sky-800 text-white",
 " bg-sky-400 text-black",
" bg-sky-650 text-white",
" bg-sky-750 text-white",
" bg-sky-550 text-white",
" bg-sky-650 text-white",
" bg-sky-850 text-white",
" bg-sky-450 text-black"
];
const blueGradient =[
	" bg-blue-600 text-white",
" bg-blue-700 text-white",
"  bg-blue-500 text-white",
" bg-blue-600 text-white",
" bg-blue-800 text-white",
 " bg-blue-400 text-black",
" bg-blue-650 text-white",
" bg-blue-750 text-white",
" bg-blue-550 text-white",
" bg-blue-650 text-white",
" bg-blue-850 text-white",
" bg-blue-450 text-black"
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
" bg-violet-650 text-white",
" bg-violet-750 text-white",
" bg-violet-550 text-white",
" bg-violet-650 text-white",
" bg-violet-850 text-white",
" bg-violet-450 text-black"
];
const purpleGradient =[
	" bg-purple-600 text-white",
" bg-purple-700 text-white",
"  bg-purple-500 text-white",
" bg-purple-600 text-white",
" bg-purple-800 text-white",
 " bg-purple-400 text-black",
" bg-purple-650 text-white",
" bg-purple-750 text-white",
" bg-purple-550 text-white",
" bg-purple-650 text-white",
" bg-purple-850 text-white",
" bg-purple-450 text-black"
];
const fuchsiaGradient =[
	" bg-fuchsia-600 text-white",
" bg-fuchsia-700 text-white",
"  bg-fuchsia-500 text-white",
" bg-fuchsia-600 text-white",
" bg-fuchsia-800 text-white",
 " bg-fuchsia-400 text-black",
" bg-fuchsia-650 text-white",
" bg-fuchsia-750 text-white",
" bg-fuchsia-550 text-white",
" bg-fuchsia-650 text-white",
" bg-fuchsia-850 text-white",
" bg-fuchsia-450 text-black"
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
    const colorArrays=[redGradient, purpleGradient, emeraldGradient, 
    orangeGradient, blueGradient, limeGradient, amberGradient, cyanGradient, yellowGradient, greenGradient, indigoGradient, tealGradient, skyGradient, violetGradient, roseGradient, fuchsiaGradient, pinkGradient ]

    
    if (selectedLexes.includes(lexid)){
        const selectedIndex = selectedLexes.indexOf(lexid)
        const gradientIndex = ( selectedIndex % colorArrays.length);
        const colorIndex = Math.floor(selectedIndex / colorArrays.length)%colorArrays[0].length;
        colorString += ' ' + colorArrays[gradientIndex][colorIndex];
        mylog(`getColorClasses(${lexid}): selectedIndex = ${selectedIndex}, gradIndex=${gradientIndex}, colorIndex=${colorIndex} colorString='${colorString}'`,true )
        
    }
    
    return colorString;

    
}

    let text=$state('');
    async function getText() {
        const response = await fetch("/api/tf/text/1");
        const jsonResp=await response.json();
        if(jsonResp){

            text=jsonResp['text'];
        }
    }
    /**
     * @type {number[]} selectedLexes
    */
    let selectedLexes=$state([]);


    //trying this instead:
    /**
     * @type {Object<number,string>} lexClasses
     */
    let lexClasses=$derived.by(()=>{// id->css color (e.g., "#eee")
        const ret = {}
        if(textsReady && lexemes) {
            //mylog("building lexClasses...",true)
            for(const id of Object.values(lexemes).map((o)=>o.id)) {
                
                let classes = "lex-"+id;
                if(selectedLexes.includes(id)){
                    classes += " " + getColorClasses(id)
                } 
              //  mylog("setting lex " + id + " to: " + classes,true);
                ret[id] = classes;
            }
        }
        return ret;
    });

    function getLexClasses(id){
        let classString="lex-"+id;
        let highlight=highlightLexeme(id)
        return classString + (highlight ? " " + highlight : '');
    }

    function toggleLex(id){
        mylog("toggleLex("+id+")",true);
        if(selectedLexes.includes(id))
            selectedLexes.splice(selectedLexes.indexOf(id),1);
        else
            selectedLexes.push(id);
    }

    function highlightLexeme(id=0,color=null){
        let ret = ''
        ret += "bg-red-500";
        return ret;
    }
   // $inspect("lexClasses:", lexClasses, "selectedLexes:", selectedLexes);
</script>
<h1>Hello World! Testing!</h1>

<button onclick={getTexts} class="btn">Get POST Texts!</button>
<button onclick={getText} class="btn">Get GET Text!</button>
{#if texts.length}
    <h2>Got Texts!</h2>
    {#each texts as text}
        <div>  <b>{text.reference}</b>:      
        {#if text.words && text.words.length}
            {#each text.words as word}
            <span class={'m-0 ' + lexClasses[word.id]} onclick={()=>{console.log("word clicked!"); toggleLex(word.id)}}>{word.word}{'  '}</span>
            {/each}
        {:else}

            {text.text}
       
        {/if}
        </div>
    {/each}

    {#if Object.keys(lexemes).length}
        <h2>Lexemes!</h2>
        {#each Object.keys(lexemes) as lex, index}
        {#if index }|{/if}{lex} 
        {/each}
    {:else}
        Got no lexemes!
    {/if}
{/if}



{#if text.length}
    <h2>Got GET Text!</h2>
    <h3><b>{text}</b></h3>
{/if}

