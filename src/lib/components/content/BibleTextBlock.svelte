<script>
	import {
		ParallelColumnGroup,
		ParallelColumn,
		LexPhraseAndLocations,
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
	import * as BibleUtils from '$lib/utils/bibleRefUtils.js';

	import mathUtils from '$lib/utils/math-utils.js';

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
	 * notesClick:  function():void
	 * wordClick:  function(number,number):void,
	 * selectedGreekPalette:{bg:string,font:string,border:string}[]
	 * lexInfoDict:Object<number,LexemeInfo>
	 * highlightedLexicalIndices:number[]
	 * highlightedExactIndices:number[]
	 * ignoreWordIds:number[]
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
		cssLexClassDict = {}, //not used anymore!
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
		lexInfoDict = {},
		highlightedLexicalIndices = $bindable([]),
		highlightedExactIndices = $bindable([]),
		ignoreWordsIds = []
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
		//mylog(`isUnique(${wordid},(${uniqueSet}))=>${retVal}`);
		return retVal;
	}

	/**
	 * Pre-calculate custom match indices per verse to avoid per-word calculations.
	 */
	function buildCustomMatchMap(customMatchedWords, greekStrings) {
		const map = new Map();
		const sortedEntries = Object.entries(customMatchedWords).sort(
			([a], [b]) => b.length - a.length
		);
		sortedEntries.forEach(([searchPhrase, array2d]) => {
			const matchIndex = greekStrings.indexOf(searchPhrase);
			array2d.flat().forEach((wordIndex) => {
				if (!map.has(wordIndex)) {
					map.set(wordIndex, matchIndex);
				}
			});
		});
		return map;
	}
	//$inspect(`<BibleTextBlock>: textRef.ref=${textRef.reference}`)
	/**
	 * @type {number[]} highlightedLexicalIndices
	 */
	//let highlightedLexicalIndices = $state([]);

	/**
	 *
	 * @param {number} wordid
	 * @param {number} bookid
	 * @param {number[]} exactPhraseIndices
	 * @param {number[]} lexicalPhraseIndices
	 **/
	function myWordClick(wordid, bookid, lexicalPhraseIndices, exactPhraseIndices) {
		wordClick(wordid, bookid);
		if (options.viewOptions.exactPhrases || options.viewOptions.similarPhrases) {
			//			mylog(`myWordclick(). adding exacts: [${exactPhraseIndices.join(',')}]!`, true);
			togglePhraseHighlights(
				Array.from(new Set(lexicalPhraseIndices)),
				Array.from(new Set(exactPhraseIndices))
			);
			//			mylog(`toggled phrases: lex=${highlightedLexicalIndices.join(',')}, exact=${highlightedExactIndices.join(',')}`,true);
		}
	}

	/**
	 *
	 * @param {number[]} lexicalPhraseIndices
	 * @param {number[]} exactPhraseIndices
	 */
	function togglePhraseHighlights(lexicalPhraseIndices, exactPhraseIndices) {
		if (options.viewOptions.similarPhrases) {
			const isToggled = lexicalPhraseIndices.reduce((on, idxVal) => {
				return on || highlightedLexicalIndices.includes(idxVal);
			}, false);
			lexicalPhraseIndices.forEach((index) => {
				if (!isToggled) {
					highlightedLexicalIndices.push(index);
				} else highlightedLexicalIndices.splice(highlightedLexicalIndices.indexOf(index), 1);
			});
		}
		if (options.viewOptions.exactPhrases) {
			//			mylog(`togglePhraseHighlights(). adding exacts: [${exactPhraseIndices.join(',')}]!`, true);
			//			mylog(`exactPhraseIndices.len=${exactPhraseIndices.length}`,true);

			const isToggled = exactPhraseIndices.reduce((on, idxVal) => {
				return on || highlightedExactIndices.includes(idxVal);
			}, false);
			exactPhraseIndices.forEach((index) => {
				//				mylog(`   trying idx=${index}`, true);

				if (!isToggled) {
					highlightedExactIndices.push(index);
					//					mylog(`toggled exact index: ${index} to ON`,true);
				} else {
					highlightedExactIndices.splice(highlightedExactIndices.indexOf(index), 1);
					//					mylog(`toggled exact index: ${index} to OFF`,true);
				}
			});
		} else {
			mylog('ExactPhrases disabled!');
		}
	}

	selectedLexes = options.viewOptions.lexes;

	const tearOffset = $derived.by(() => {
		if (!textRef?.reference) return 0;
		// Create a consistent pseudo-random offset (0-733) based on the reference string
		const hash = textRef.reference.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

		return (hash * 47) % 733;
	});
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
		} else if (word.phrases.exact.length || word.phrases.lexical.length) {
			//should we split exact and lexical blocks?!!

			//wizardry with binary numbers!! :-)
			const thePhrases =
				options.viewOptions.exactPhrases && word.phrases.exact.length
					? word.phrases.exact
					: word.phrases.lexical;
			const lexPhrasesLocMostMatches = thePhrases.reduce((mostColumnsMatch, next) => {
				if (
					mostColumnsMatch.calcMatchTypeIndex(
						parGroup.maxMatchCols ? parGroup.maxMatchCols : parGroup.parallelColumns.length
					) >
					next.calcMatchTypeIndex(
						parGroup.maxMatchCols ? parGroup.maxMatchCols : parGroup.parallelColumns.length
					)
				) {
					return mostColumnsMatch;
				} else {
					return next;
				}
			});

			let colorIndex = lexPhrasesLocMostMatches.calcMatchTypeIndex(
				parGroup.maxMatchCols ? parGroup.maxMatchCols : parGroup.parallelColumns.length
			);

			if (colorIndex >= parGroup.lexIdenticalPhrasePalette.length || colorIndex < 0) {
				//				mylog(`getWordStyle(${word.word}) invalid colorIndex: ${colorIndex}, maxMatchCols=${parGroup.maxMatchCols}; but parGroup.lexIdenticalPhrasePalette=${parGroup.lexIdenticalPhrasePalette.length}; resetting to last index!`,true)
				colorIndex = parGroup.lexIdenticalPhrasePalette.length - 1;
			} else {
				//				mylog(`getWordStyle(${word.word}) valid colorIndex: ${colorIndex}, maxMatchCols=${parGroup.maxMatchCols}; parGroup.lexIdenticalPhrasePalette=${parGroup.lexIdenticalPhrasePalette.length};`,true)
			}
			const colorObj = parGroup.lexIdenticalPhrasePalette[colorIndex];

			//        if (options.viewOptions.similarPhrases) {
			if (colorObj) {
				ret = ColorUtils.bgFontString(colorObj.bg, colorObj.font, colorObj.border);
			} else {
				//				mylog(`BibleBlock: got no colorObj for parGroup.lexIdenticalPhrasePalette.length=${parGroup.lexIdenticalPhrasePalette.length}, colorIndex=${colorIndex}`,true);
			}
			if (!ret) {
				//				mylog(`BibleBlock.getWorStyle(${word.word}) got no color! Color obj.bg=${colorObj?.bg}`,true);
				if (colorIndex >= parGroup.lexIdenticalPhrasePalette.length) {
					//					mylog(`getWordStyle(${word.word}) got no colorObj!  colorIndex=${colorIndex}; but parGroup.lexIdenticalPhrasePalette=${parGroup.lexIdenticalPhrasePalette.length}`,true)
				}
			}
		}

		return ret;
	}
	//$inspect('parGroup.lexIdenticalPhrasePalette',parGroup.lexIdenticalPhrasePalette);
	//$inspect('highlightedLexicalIndices',highlightedLexicalIndices);
	//$inspect('highlightedExactIndices',highlightedExactIndices);
</script>

<div
	class={[
		'bible-block',
		options.viewOptions.exactPhrases ? 'show-exact' : '',
		options.viewOptions.identical ? 'show-identical' : '',
		options.viewOptions.unique ? 'show-unique' : '',
		!options.viewOptions.similarPhrases ? 'hide-similar' : ''
	]}
	style="--tear-offset: {tearOffset}px;"
>
	{#key parGroup && parGroup.updatedCounter && parGroup.lexIdenticalPhrasesMap.size && parGroup.lexIdenticalPhrasesMap}
		{#if textRef.text}
			{@const book = BibleUtils.getBookChapVerseFromRef(textRef.reference)?.book}
			<span class="font-bold bg-white/20 rounded-sm mr-1 ml-0 bible-text-block">
				{#if copyButton}
					<CopyText
						copyText={textRef.reference}
						linkText={textRef.reference}
						btnCssClass="m-0 p-0 hover:link bible-ref  underline text-shadow-[2px_2px_2px_rgba(0,0,0,0.3)]"
						tooltip="Copy reference to clipboard."
						tooltipBottom={true}
						showButton={false}
						svgStyle="filter: opacity(0.6);"
					/>
					{#if !showNotes}{:else if textRef.note}
						<Button
							buttonText={'\u{1F5C8}'}
							buttonStyle="btn btn-xs btn-ghost"
							tooltip={'See Notes'}
							tooltipbottom={true}
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
					{@const customMatchMap = buildCustomMatchMap(
						customMatchedWords,
						options.viewOptions.greekStrings
					)}
					<!-- NB: first index is that of cssCustomDict; second is into textRef.vwords-->
					<!--{#if Object.values(customMatchedWords).length}Custom matched!: {Object.keys(customMatchedWords).join(",")}{/if}-->
					<span class="bg-white/30 border-black/40 border-0 m-0 p-0 rounded-xl">
						{#if copyButton}
							<CopyText
								getTextFunc={() => getText(verseWords.words, options.viewOptions.hideApp)}
								linkText={String(verseWords.verse)}
								showButton={false}
								tooltip={'Copy verse ' + verseWords.verse}
								btnSizeCssClass="btn-xs"
								btnCssClass="btn-circle"
							/>
						{:else}
							{verseWords.verse}
						{/if}
					</span>

					{#each verseWords.words as word, index}
						<!--                    {@const selectedLexIndex=selectedLexes.indexOf(word.id)}-->
						{@const selectedLexIndex = selectedLexes.indexOf(word.id)}
						{@const isIdentical = parGroup.matchingWords.includes(stripWord(word.clean))}
						{@const customMatchIndex = customMatchMap.has(index) ? customMatchMap.get(index) : -1}

						{@const exactPhraseIndices = word.phrases.exact.map((pLoc) => pLoc.phraseIndex)}

						{@const lexicalPhraseIndices = word.phrases.lexical.map((pLoc) => pLoc.phraseIndex)}
						<!-- {#if customMatchIndex > -1 }Got match index={customMatchIndex}{/if}-->
						{#if exactPhraseIndices.length}
							<!--[exact phrases: {exactPhraseIndices.length}-->
						{/if}
						<span
							class={[
								'word',
								word.phrases.lexical.length
									? 'lexical ' +
										word.phrases.lexical.map((pLoc) => 'lexical-' + pLoc.phraseIndex).join(' ')
									: '',
								isIdentical ? 'identical' : '',
								word.phrases.exact.length
									? 'exact ' +
										word.phrases.exact.map((pLoc) => 'exact-' + pLoc.phraseIndex).join(' ')
									: '',
								isUnique(word.id, uniqueSet) ? 'unique' : '',
								selectedLexIndex >= 0 ? 'selected selected-lex' : '',
								customMatchIndex >= 0 ? 'selected selected-custom' : '',
								options.viewOptions.exactPhrases &&
								exactPhraseIndices.some((idx) => highlightedExactIndices.includes(idx))
									? 'highlighted-exact'
									: '',
								options.viewOptions.similarPhrases &&
								lexicalPhraseIndices.some((idx) => highlightedLexicalIndices.includes(idx))
									? 'highlighted-lexical'
									: '',
								ignoreWordsIds.includes(word.id) ? 'ignore' : ''
							]}
							style={getWordStyle(word, selectedLexIndex, customMatchIndex)}
							onclick={() => {
								myWordClick(word.id, book, lexicalPhraseIndices, exactPhraseIndices);
							}}
							>{getText([word], options.viewOptions.hideApp)}{' '}
						</span>
						{#if exactPhraseIndices.length}
							<!--]-->
						{/if}
					{/each}
				{/each}
			{:else if textRef.text}
				{options.viewOptions.hideApp && parGroup.lang == 'greek'
					? GreekUtils.removeApparatusMarks(textRef.text)
					: textRef.text}
			{/if}
		{:else}
			<i class="text-sm">("{textRef.reference}" not found in the selected NT version.)</i>
		{/if}
		{#if copyButton && textRef.text}
			<CopyText
				getTextFunc={() =>
					parGroup.lang == 'greek' && options.viewOptions.hideApp
						? GreekUtils.removeApparatusMarks(textRef.text)
						: textRef.text}
				tooltip="Copy pericope"
				svgStyle="filter: opacity(0.6);"
			/>
		{/if}
	{/key}
</div>

<style>
	@reference "tailwindcss";
	@function makeRgb($hexcolor) {
		$red: red($hexcolor);
		$green: green($hexcolor);
		$blue: blue($hexcolor);
		$alpha: alpha($hexcolor);
		@return unquote('rgb(#{$red},#{$green},#{$blue})');
	}

	/*.bible-block {
        @apply bg-white/20 border-1 border-black/30 rounded p-1;
    }*/

	.show-unique .unique {
		@apply outline-2 pl-0.5 mr-0.5;
		outline-color: var(--cssUniqueColor, red);
	}

	.show-identical .word.identical {
		/*@apply outline-2 p-0 m-0;*/
		/*outline-color: var(--cssUniqueColor, black);*/
		/*@apply outline-1  outline-white;*/
		/*@apply decoration-white p-0 m-0;
		text-decoration: overline underline white;*/
		@apply border-1 border-white/70;
	}

	.word.lexical,
	.word.exact {
		border-color: var(--borderColor, currentColor);
	}

	:not(.hide-similar) .lexical {
		@apply border-t-3 border-b-3;
	}

	:not(.hide-similar) .word.lexical:not(.selected) {
		background-color: var(--bgColor, transparent);
		color: var(--fontColor, inherit);
		border-color: var(--borderColor, currentColor);
	}

	.show-exact .word.exact {
		background-color: var(--bgColor, transparent);
		color: var(--fontColor, inherit);
		border-color: var(--borderColor, currentColor) !important;
		@apply border-t-3 border-b-3 font-bold;
	}

	:not(.hide-similar) .word.lexical.ignore {
		background-color: color-mix(in srgb, var(--bgColor, transparent) 30%, transparent);
		color: var(--fontColor, inherit);
	}

	.word.selected {
		background-color: var(--bgColor, transparent);
		color: var(--fontColor, inherit);
	}

	:not(.hide-similar).show-exact .word.exact {
		text-decoration: underline var(--fontColor, currentColor);
	}

	.show-exact .highlighted-exact,
	.bible-block:not(.hide-similar) .highlighted-lexical {
		background-color: #ffffff !important;
		color: #000000 !important;
	}
	/*background-color: hsl(from var(--bgColor,white) h s l /30%);*/
</style>
