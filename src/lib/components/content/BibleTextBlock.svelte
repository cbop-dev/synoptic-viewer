<script>
	import {
		ParallelColumnGroup,
		ParallelColumn,
		Word,
		TextAndRef,
		VerseWords,
		stripWord
	} from './parallelTexts.svelte.js';
	import { SynopsisOptions3 } from './SynopsisClasses.svelte.js';
	import { ColorUtils } from '$lib/utils/color-utils';
	import CopyText from '../ui/CopyText.svelte';
	import { GreekUtils } from '$lib/utils/greek-utils';
	import * as StringUtils from '$lib/utils/string-utils.js';
	import { mylog } from '$lib/env/env.js';
	import Button from '../ui/Button.svelte';
	import { LexemeInfo } from '../datastructures/lexeme.js';
	import * as BibleUtils from '$lib/n1904/bibleRefUtils';

	//import WordComp from "$lib/components/content/Word.svelte"

	/**
	 *
	 * @param {Word[]} words
	 */
	export function getText(words, hideApp = false) {
		const phrase = words.reduce((a, b) => {
			const word = hideApp ? b.clean : b.word;
			return a ? a + ' ' + word : word;
		}, '');
		return phrase;
	}

	/**
	 * @type {{
	 * textRef :  TextAndRef
	 * parGroup:  ParallelColumnGroup
	 * numCols:  number
	 * copyButton:  boolean
	 * cssWordClassDict:Object<number,Object<number,string[]>>
	 * cssLexClassDict:  Object<number,string>
	 * cssCustomStringDict:  Object<string,string>
	 * cssUniqueColor: string
	 * showNotes:  boolean
	 * selectedLexes:number[]
	 * uniqueSet:  Set<number>
	 * options:SynopsisOptions3
	 * notesClick:  function
	 * wordClick:  function,
	 * selectedGreekPalette:{bg:string,font:string,border:string}[]
	 * lexInfoDict:Object<number,LexemeInfo>
	 * }}
	 */
	let {
		textRef,
		parGroup,
		options = new SynopsisOptions3(),
		//options.viewOptions.unique=false,
		numCols,
		copyButton = true,

		//key is index of textRef.vwords, value is array of arrays of css classes (strings) to apply to it. Each array corresponds with a verse/item in textRef.vwords[key]
		// Thus {2:{3: ["text-blue-300"]}}} would mean that for the third verse, i.e., textRef[2], the fourth word, textRef[2].words[3], should have the class "text-blue-300".
		cssWordClassDict = {}, //{2:{3: ["text-blue-300"]}},
		cssLexClassDict = {},
		selectedLexes = [],
		selectedGreekPalette = [],
		//based on strings: key:string, value:
		cssCustomStringDict = {},
		//        cssUniqueColor="border-black",
		showNotes = true,
		uniqueSet = new Set(),
		//options.viewOptions.highlightOnClick=$bindable(false),
		notesClick = () => {},
		wordClick = (wordid, bookid) => {},
		lexInfoDict = {}
		// options.viewOptions.hideApp=false,
	} = $props();
	/**
	 *
	 * @param {number} wordid
	 * @param {Set<number>} uniqueSet
	 * @returns boolean
	 */
	function isUnique(wordid, uniqueSet) {
		const retVal = uniqueSet && uniqueSet.has(wordid);
		if (uniqueSet && uniqueSet.size) 0;
		//mylog("IsUnique("+wordid+", "+Array.from(uniqueSet).join(',')+")--> "+retVal)
		mylog(`isUnique(${wordid},(${uniqueSet}))=>${retVal}`);
		return retVal;
	}
	//$inspect(`<BibleTextBlock>: textRef.ref=${textRef.reference}`)

	selectedLexes = options.viewOptions.lexes;
	/**
	 *
	 * @param {Word} word
	 * @param {number} selectedLexIndex
	 * @param {number} customMatchIndex index in options.viewOptions.greekStrings that this word matches, if any. If not: -1
	 * @returns {string} style to be applied in "style" attrbibute of <span> element
	 */
	function getWordStyle(word, selectedLexIndex, customMatchIndex) {
		// const selectedLexIndex=selectedLexes.indexOf(word.id);
		let ret = '';
		if (selectedLexIndex >= 0 || customMatchIndex >= 0) {
			if (selectedLexIndex >= 0) {
				ret = `--bgColor:${selectedGreekPalette[selectedLexIndex].bg}; --fontColor:${selectedGreekPalette[selectedLexIndex].font}`;
			}
			if (customMatchIndex >= 0) {
				ret +=
					(ret ? '; ' : '') +
					ColorUtils.bgFontString(
						selectedGreekPalette[selectedLexes.length + customMatchIndex].bg,
						selectedGreekPalette[selectedLexes.length + customMatchIndex].font
					);
			}
		} else if (word.phrases.lexical.size) {
			const phraseIndex = [...word.phrases.lexical][word.phrases.lexical.size - 1].index;
			const colorObj = parGroup.lexIdenticalPhrasePalette[phraseIndex];
			//        if (options.viewOptions.similarPhrases) {
			if (colorObj) {
				ret = ColorUtils.bgFontString(colorObj.bg, colorObj.font, colorObj.border);
			}
			//      }
			/*if (options.viewOptions.exactPhrases && word.phrases.exact.size){
            ret+= (ret ? "; " : '') + `--borderColor:${colorObj.border}`;
          //  mylog(`put bordercolor! output= '${ret}'`, true)
        }*/
		}

		return ret;
	}
	//$inspect(`bibleTextBlock: selectedLexes: [${selectedLexes.join(",")}]`);
	//$inspect(`bibleTextBlock: selectedGreekPalette: [${selectedGreekPalette.join(",")}]`);
</script>

<div
	class={[
		'bible-block',
		options.viewOptions.exactPhrases ? 'show-exact' : '',
		options.viewOptions.identical ? 'show-identical' : '',
		options.viewOptions.unique ? 'show-unique' : '',
		!options.viewOptions.similarPhrases ? 'hide-similar' : ''
	]}
>
	{#key parGroup && parGroup.updatedCounter && parGroup.lexIdenticalPhrasesMap.size && parGroup.lexIdenticalPhrasesMap}
		{#if textRef.text}
			{@const book = BibleUtils.getBookChapVerseFromRef(textRef.reference)?.book}
			<span
				class="font-bold bg-white/50 rounded-sm border-2 border-black/60 mr-1 ml-0 bible-text-block"
			>
				{#if copyButton}
					<CopyText
						copyText={textRef.reference}
						linkText={textRef.reference}
						btnCssClass="m-0 p-0 hover:link bible-ref"
						tooltip="Copy reference to clipboard."
						showButton={false}
					/>
					{#if !showNotes}{:else if textRef.note}
						<Button
							buttonText={'\u{1F5C8}'}
							buttonStyle="btn btn-xs btn-ghost"
							tooltip={'See Notes'}
							onclick={() => {
								notesClick(textRef.reference, textRef.note);
							}}
						/>
					{:else}{/if}
				{:else}
					{textRef.reference}
				{/if}</span
			>
			{#if textRef.vwords && textRef.vwords.length}
				{#each textRef.vwords as verseWords, verseIndex}
					{@const customMatchedWords = StringUtils.findPhrases(
						verseWords.words.map((w) => GreekUtils.onlyPlainGreek(w.word, true, true, true)),
						options.viewOptions.greekStrings.map((str) => GreekUtils.onlyPlainGreek(str))
					)}
					<!-- NB: first index is that of cssCustomDict; second is into textRef.vwords-->
					<!--{#if Object.values(customMatchedWords).length}Custom matched!: {Object.keys(customMatchedWords).join(",")}{/if}-->
					<span class="bg-white/40 border-black/40 border-2 m-0 p-0 rounded-xl">
						{#if copyButton}
							<CopyText
								getTextFunc={() => getText(verseWords.words, options.viewOptions.hideApp)}
								linkText={String(verseWords.verse)}
								showButton={false}
								tooltip={'Copy verse ' + verseWords.verse}
							/>
						{:else}
							{verseWords.verse}
						{/if}
					</span>

					{#each verseWords.words as word, index}
						<!--                    {@const selectedLexIndex=selectedLexes.indexOf(word.id)}-->
						{@const selectedLexIndex = selectedLexes.indexOf(word.id)}
						{@const isIdentical = parGroup.matchingWords.includes(stripWord(word.word))}
						{@const customMatchSearchStrings = Object.entries(customMatchedWords)
							.filter(([searchPhrase, array2d]) => array2d.flat().includes(index))
							.map(([s, a2d]) => s)
							.sort((a, b) => b.length - a.length)}
						<!--{#if customMatchSearchStrings.length}Got match search strings![{customMatchSearchStrings.join(",")}]{/if}-->
						{@const customMatchIndex = customMatchSearchStrings.length
							? options.viewOptions.greekStrings.indexOf(customMatchSearchStrings[0])
							: -1}
						<!-- {#if customMatchIndex > -1 }Got match index={customMatchIndex}{/if}-->
						<span
							class={[
								'word',
								word.phrases.lexical.size ? 'lexical' : '',
								isIdentical ? 'identical' : '',
								word.phrases.exact.size ? 'exact' : '',
								isUnique(word.id, uniqueSet) ? 'unique' : '',
								selectedLexIndex >= 0 ? 'selected selected-lex' : '',
								customMatchIndex >= 0 ? 'selected selected-custom' : ''
							]}
							style={getWordStyle(word, selectedLexIndex, customMatchIndex)}
							onclick={() => {
								wordClick(word.id, book);
							}}>{getText([word], options.viewOptions.hideApp)}{' '}</span
						>

						<!--                  <WordComp {word} wordIndex={index}
                         {book} {options} {wordClick}
                            {high}
                            {cssLexClassDict} {customMatchedWords}
                            {cssWordClassDict}
                            {verseIndex}
                            isUnique={isUnique(word.id,uniqueSet)}
                            {cssCustomStringDict}
                            highlightIndex={selectedLexes.indexOf(word.id)}
                            
                            
                            isIdentical={parGroup.matchingWords.includes(stripWord(word.word))}
                    
                    />
-->
						<!--{[...word.phrases.lexical].map((phr)=>parGroup.lexIdenticalPhrasesLocations.findIndex((v)=>v.phrase==phr))}-->

						<!--                    
                         
                        {@const lexicalPhrases = word.phrases['lexical'] ? Array.from(word.phrases['lexical']).
                            map((p)=>parGroup.getCssClassesForPhrase(p)).flat()  : []}
                        
                        {@const phraseNum = parGroup.lexIdenticalPhrasesLocations.findIndex(
                            (v)=>(v.phrase==(word.phrases['lexical'] ? Array.from(word.phrases['lexical']) : [null]).flat()[0]))}
                        
                       
                        {@const lexCssClasses=cssLexClassDict[word.id]}
                        {@const plainGreek=GreekUtils.onlyPlainGreek(word.word)}
                        {@const customMatchSearchStrings=Object.entries(customMatchedWords).filter(([searchPhrase,array2d])=>array2d.flat().includes(index)).map(([s,a2d])=>s)}
                        {@const customClasses = customMatchSearchStrings.map((s)=>cssCustomStringDict[s])}
                        {@const wordClasses = (cssWordClassDict[verseIndex] && cssWordClassDict[verseIndex][index])? cssWordClassDict[verseIndex][index] : []}
                            {#if false && word.specialCss.size}[[Special class={[...word.specialCss].join(",")}]]:
                            {/if}
                        <span role="none"
                            class={["m-0", "word", "lex-"+word.id, 
                                options.viewOptions.unique && uniqueSet && isUnique(word.id,uniqueSet) && "lex-unique",
                                customClasses?.length ? customClasses[0] : '', wordClasses,  lexicalPhrases,
                                options.viewOptions.identical && lexCssClasses && parGroup.matchingWords.includes(stripWord(word.word)) && 'identical-word',
                                lexCssClasses, ...word.specialCss]} 
                            onclick={()=>{if (options.viewOptions.highlightOnClick || options.viewOptions.lexInfoClick) wordClick(word.id,book)}}>{getText([word],options.viewOptions.hideApp)}{'  '} 
                            
                      
                        </span>
-->
					{/each}
				{/each}<!--<CopyText linkText="IDs!" getTextFunc={()=>textRef.getWordIdArray().join(',')} />-->
			{:else if textRef.text}
				{options.viewOptions.hideApp ? GreekUtils.removeApparatusMarks(textRef.text) : textRef.text}
			{/if}
		{:else}
			<i class="text-sm">("{textRef.reference}" not found in the selected NT version.)</i>
		{/if}
		{#if copyButton && textRef.text}
			<CopyText
				getTextFunc={() =>
					options.viewOptions.hideApp
						? GreekUtils.removeApparatusMarks(textRef.text)
						: textRef.text}
				tooltip="Copy pericope"
			/>
		{/if}
	{/key}
</div>

<style>
	@reference "tailwindcss";

	/*.bible-block {
        @apply bg-white/20 border-1 border-black/30 rounded p-1;
    }*/

	.show-unique .unique {
		@apply outline-2 pl-0.5 mr-0.5;
		outline-color: var(--cssUniqueColor, red);
	}

	.show-identical .word.identical {
		@apply outline-1 outline-dashed outline-blue-700;
	}

	.word.lexical,
	.word.exact {
		border-color: var(--borderColor, black);
	}

	/* .hide-similar .lexical{
        @apply bg-transparent;
    }*/

	:not(.hide-similar) .lexical {
		@apply border-t-2 border-b-2;
	}

	/*
    
        .lexical-phrase {

            
        }
       	 .lexical-phrase-1 {
            @apply  border-red-600 bg-red-600/20 decoration-red-600;
        }
        
        .lexical-phrase-2 {
            @apply border-blue-700 bg-blue-700/20 decoration-blue-700;
        }
        .lexical-phrase-3 {
            @apply border-green-500 bg-green-500/20 decoration-green-500;
        }
        .lexical-phrase-4 {
            @apply border-fuchsia-700 bg-fuchsia-700/20 decoration-fuchsia-700;
        }
        .lexical-phrase-5 {
            @apply border-black bg-slate-400/30 decoration-black;
        }
        .lexical-phrase-6 {
            @apply border-amber-600 bg-amber-600/20 decoration-amber-600;
        }
        .lexical-phrase-7 {
            @apply border-amber-300 bg-amber-300/40 decoration-amber-300;
        }
        .lexical-phrase-8 {
            @apply border-rose-600 bg-rose-600/20 decoration-rose-600;
        }
        
        .lexical-phrase-9 {
            @apply border-teal-700 bg-teal-700/20 decoration-teal-700;
        }
        .lexical-phrase-10 {
            @apply border-purple-800 bg-purple-800/20 decoration-purple-800;
        }
        .lexical-phrase-11 {
            @apply border-yellow-950 bg-yellow-950/20 decoration-yellow-950;
        }
        .lexical-phrase-12 {
            @apply border-cyan-700 bg-cyan-700/20 decoration-cyan-700;
        }
        .lexical-phrase-13 {
            @apply  border-orange-900 bg-orange-900/20 decoration-orange-900;
        }
        .lexical-phrase-14 {
            @apply border-amber-300 bg-amber-300/20 decoration-amber-300;
        }
    */

	:not(.hide-similar) .word.lexical:not(.selected) {
		background-color: hsl(from var(--bgColor, black) h s l / 60%);
		/* color: black; /*hsl(var(--fontColor,black) h s 0.3 / 60%);*/

		border-color: var(--borderColor, white);
		/*color: black;*/
		color: var(--fontColor, white);
	}

	.show-exact .word.exact {
		background-color: var(--bgColor, transparent) !important;
		color: var(--fontColor, default) !important;
		border-color: var(--borderColor, black);
		border-color: black !important;
		@apply border-t-2 border-b-3  font-bold;
		/*color: var(--fontColor,default);*/
	}

	.word.selected {
		background-color: var(--bgColor, transparent);
		color: var(--fontColor, default);
	}
	.show-exact .word.exact {
		/*border-color: var(--borderColor,black);*/
	}

	:not(.hide-similar).show-exact .word.exact {
		text-decoration: underline var(--fontColor, black);
	}

	/*.hide-similar.show-exact :not(.selected-lex).word.exact{
     
        border-color: var(--borderColor,black) !important;
        border-top-color: var(--bgColor,black) !important;
        
    }*/

	/*background-color: hsl(from var(--bgColor,white) h s l /30%);*/
</style>
