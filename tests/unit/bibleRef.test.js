import { test, expect } from "vitest";
import * as bibleUtils from "$lib/n1904/bibleRefUtils";
test('createNumArrayFromStringListRange', async () => {
	const numLists =[
        {string: "1-2,5", array:[1,2,5]},
        {string: "2-5,1", array:[1,2,3,4,5]},
        {string: "2b-5,1", array:[1,2,3,4,5]},
        {string: "2-4a,1", array:[1,2,3,4]},
        {string: "2-4e,1", array:[1,2,3,4]},
        
    ]
    for (const numObj of numLists) {
        expect(bibleUtils.createNumArrayFromStringListRange(numObj.string)).toEqual(numObj.array);
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

test('sortChapVerseFunc', async () => {
	const chapVerses = [
        {refs: ["1:3", "1:2"], sorted: ["1:2", "1:3"]},
        {refs: ["12:3", "13:2", "13:1","6:1"], sorted: ["6:1", "12:3",  "13:1", "13:2"]}

    ];
    for (const test of chapVerses){
        const sortedRefs = test.refs.toSorted(bibleUtils.sortChapVerseFunc);
        //mylog("sorted Refs ("+test.refs.join(',')+") -> ("+sortedRefs.join(',')+")");
        for (const i in test.sorted){
            expect(test.sorted[i]).toEqual(sortedRefs[i]);
        }
        
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});



test('splitBookChap', async () => {
	const bookChapObjs = [
        {ref: "1 Cor 2", obj: {book: "1 Cor", chap: "2"}},
        {ref: "John 10", obj: {book: "John", chap: "10"}},
        {ref: "John", obj: {book: "John", chap: null}},
        {ref: "1_Thessalonians 3", obj: {book: "1 Thessalonians", chap: "3"}},
        
    ]
	
    for (const testObj of bookChapObjs){
        const theRetObj = bibleUtils.splitBookChap(testObj.ref);
        expect(theRetObj.book).toEqual(testObj.obj.book);
        expect(theRetObj.chap).toEqual(testObj.obj.chap);
    }
        
    expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});



test('refIncludes tests', async () => {
    const inRefs = [
        {container: "Matt 1", contained: "Matt 1:3", result:true},
        {container: "Matt 2", contained: "Matt 1:3", result:false},
        {container: "Matt 2-3", contained: "Matt 1:3", result:false},
        {container: "Matt 1-3", contained: "Matt 1:3", result:true},
        {container: "Matt 1-3", contained: "Matt 1:3", result:true},
        {container: "Matt 1-3", contained: "Matt 4:3", result:false},
        {container: "Matt 4:1-3", contained: "Matt 4:3", result:true},
        {container: "Matt 4:1-3", contained: "Matt 4:4", result:false},
        {container: "1 John", contained: "1 John", result:true},
        {container: "1 John", contained: "2 John 1:2", result:false},
        {container: "1 John", contained: "1 John 1:12", result:true},
        {container: "Matt 3:1-3", contained: "Matt 4:3", result:false},
        {container: "Matt 16:1-2a,4", contained: "Matt 4:3", result:false},
        {container: "Matt 16:1-2a,4", contained: "Matt 16:3", result:false},
        {container: "Matt 16:1-2a,4", contained: "Matt 16:2", result:true},
        {container: "Matt 16:1-2a,4", contained: "Matt 16:4", result:true},
        {container: "1 Peter 4:14", contained: "1 Peter 4:14", result:true},

       

        

    ]
	for (const refPair of inRefs){
       expect(bibleUtils.refIncludes(refPair.container, refPair.contained)).toBe(refPair.result)
    }
	//await expect(page.locator('h1')).toBeVisible();
})


test('getBookChapVerse', async () => {
	const bookChapVerseObjs = [
        {ref: "1 Cor 2:3", obj: {book: "1 Cor", chap: "2", v: "3", range: false}},
        {ref: "1 Cor 2:3-5", obj: {book: "1 Cor", chap: "2", v: "3-5", range: true}},
        {ref: "1 Cor 2", obj: {book: "1 Cor", chap: "2", v: null , range: false}},
        {ref: "John 10:12", obj: {book: "John", chap: "10", v: "12", range: false}},
        {ref: "John 10", obj: {book: "John", chap: "10", v: null, range: false }},
        {ref: "John 10-12", obj: {book: "John", chap: "10-12", v: null, range: true }},
        {ref: "John 10:2-12", obj: {book: "John", chap: "10", v: "2-12", range: true }},
        {ref: "John 10:2-12a", obj: {book: "John", chap: "10", v: "2-12a", range: true }},
        {ref: "John 10:1-3a,6b-12a", obj: {book: "John", chap: "10", v: "1-3a,6b-12a", range: true }},
        {ref: "John", obj: {book: "John", chap: null, v: null, range: false}},
        {ref: "Jude 10", obj: {book: "Jude", chap:"10", v: null, range: false }}, //we'll pretend this is a chapter even though it isn't!
    ]
	//expect(true).toBe(true);
    for (const objs of bookChapVerseObjs){
        const myBcV = bibleUtils.getBookChapVerseFromRef(objs.ref);
        expect(myBcV.book).toEqual(objs.obj.book);
        expect(myBcV.chap).toEqual(objs.obj.chap);
        expect(myBcV.v).toEqual(objs.obj.v);
        //expect(myBcV.range).toEqual(objs.obj.range)
    }
	//await expect(page.locator('h1')).toBeVisible();
});

test('expandRefs', async () => {
	const tests =[
        {input: "Matt 3:15;", output:["Matt 3:15"]},
        {input: "Matt 3:15; 4:1", output:["Matt 3:15","Matt 4:1"]},
        {input: "Matt 3:14-15", output:["Matt 3:14-15"]},
        {input: "Matt 1; Mark 1", output:["Matt 1","Mark 1"]},
     
        
    ]
    for (const t of tests) {
        expect(bibleUtils.expandRefs(t.input, false)).toEqual(t.output);
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

test('formatBibleRefs', async () => {
	const tests =[
        {input: "Matt 1", output:"Matt 1"},
     
        
    ]
    for (const t of tests) {
        expect(bibleUtils.formatBibRefs(t.input)).toEqual(t.output);
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

test('combineRefs', async () => {
	const tests =[
        {input: ["Matt 1","1_Thessalonians 3:3"], output:"Matt 1; 1 Thessalonians 3:3"},
        {input: ["1 Thess 5:17","1 Thess 5:25","2 Thess 1:11"], output:"1 Thess 5:17,25; 2 Thess 1:11"},

        
     
        
    ]
    for (const t of tests) {
        expect(bibleUtils.combineRefs(t.input)).toEqual(t.output);
       // expect(bibleUtils.formatBibRefs(t.input.join(";"))).toEqual(t.output);
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

test('formatRefs', async () => {
	const tests =[
        {input: ["Matt 1","1_Thessalonians 3:3"], output:"Matt 1; 1 Thess 3:3"},
        //{input: ["1 Thess 5:17","1 Thess 5:25","2 Thess 1:11"], output:"1 Thess 5:17,25; 2 Thess 1:11"},

        
     
        
    ]
    for (const t of tests) {
        //expect(bibleUtils.combineRefs(t.input)).toEqual(t.output);
        expect(bibleUtils.formatBibRefs(t.input.join(";"))).toEqual(t.output);
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});