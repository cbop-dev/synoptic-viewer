import {test,expect} from 'vitest'
import * as  bu from '$lib/utils/bible-utils.js'
//import * as su  from '$lib/utils/string-utils.js'


test('test',()=>{
    expect(true).toBe(true);
})

test('combineRefs test',()=>{
    const tests1=[
        {input:["Gen 2","Gen 3","Gen 4:15", "Gen 1"], output: "Gen 1-3; 4:15"},
        {input:["Gen 2","Gen 3","Gen 4:1-5", "Gen 1"], output: "Gen 1-3; 4:1-5"},
         {input:["2 Sam"], output: "2 Sam"},
         {input:["2 Sam 3"], output: "2 Sam 3"},
         {input:["2Sam"], output: "2Sam"},


    ]

    for (const t of tests1){
        const theInput = t.input.map((ref)=>bu.expandRefs(ref)).flat();
        expect(bu.combineRefs(theInput)).toBe(t.output);
    }
})



test('sort/compare/getBookOrder',()=>{
    expect(true).toBe(true);
    const tests = [
        {input:["Exod","Gen"], output: ["Gen","Exod"]},
    ]

    expect(bu.getBookOrder("Exod")).toBeGreaterThan(bu.getBookOrder("Gen"));

    for (const t of tests){
        
      expect(t.input.sort(bu.sortBooksFunc)).toEqual(t.output);
    }

})

test('filterOutInvalidBooks test',()=>{
    const tests1=[
        {input:"Gen", filtered: "Gen",bcv:{book:"Gen",chap:null,v:null},expand:["Gen"]},
        {input:"Gent", filtered: "",bcv:{book:"Gent",chap:null,v:null},expand:["Gent"]},
        {input:"1 Kings 3:2; 2;1; Gen; Exod 2:2-4,7,1; Morgan 3; ", 
            filtered: "Gen; Exod 2:1-4,7; 1 Kings 1-2; 3:2"},
        {input:"isa", filtered: "isa",bcv:{book:"isa",chap:null,v:null},expand:["isa"]},
        {input:"Isa", filtered: "Isa",bcv:{book:"Isa",chap:null,v:null},expand:["Isa"]},
        {input:"isa 58", filtered: "isa 58",bcv:{book:"isa",chap:"58",v:null},expand:["isa 58"]},
        {input:"isa 58:1-2", filtered: "isa 58:1-2",bcv:{book:"isa",chap:"58",v:"1-2"},expand:["isa 58:1","isa 58:2"]},

    ]

    for (const t of tests1){
        
        if(t.bcv) {
            const inputBcV=bu.getBookChapVerseFromRef(t.input);
           // inputBcV.book=su.capitalize(inputBcV.book);
            expect(inputBcV).toEqual(t.bcv);
        }
        if (t.expand) expect(bu.expandRefs(t.input)).toEqual(t.expand);
        const filteredInput =bu.filterOutInvalidBooks(t.input);
        expect(filteredInput).toEqual(t.filtered);

        
    }
})

test('getBookChapVerseFromRef',()=>{
    expect(true).toBe(true);
    const tests = [
        {input:"2Sam", output: {book:"2Sam", chap:null, v:null}},
        {input:"2 Sam", output: {book:"2 Sam", chap:null, v:null}},
        {input:"2 Sam 1", output: {book:"2 Sam", chap:"1", v:null}},
        {input:"Isa", output: {book:"Isa", chap:null, v:null}},
        {input:"II_Corinthians 5:19", output: {book:"II_Corinthians", chap:"5", v:"19"}, replaceUnderScores:false},
        {input:"II_Corinthians 5:19", output: {book:"II Corinthians", chap:"5", v:"19"}, replaceUnderScores:true},
    ]

    

    for (const t of tests){
        
      expect(bu.getBookChapVerseFromRef(t.input,t.replaceUnderScores? true:false)).toEqual(t.output);
    }

})


test('bookChapVerseToString',()=>{
    expect(true).toBe(true);
    const tests = [
       // {output:"2Sam", input: {book:"2Sam", chap:null, v:null}},
        //{output:"2 Sam", input: {book:"2 Sam", chap:null, v:null}},
        {output:"2 Sam 1", input: {book:"2 Sam", chap:"1", v:null}},
        //{output:"Isa", input: {book:"Isa", chap:null, v:null}},
    ]

    

    for (const t of tests){
        
      expect(bu.bookChapVerseToString(t.input)).toEqual(t.output);
    }

})



test('cleanString', async () => {
	const tests=[
        {input: 'asdf_asdf', output: 'asdf asdf', replaceUnderscores:true},
        {input: 'asdf_asdf', output: 'asdf_asdf', replaceUnderscores:false},

    ];
    for (const t of tests){
        expect(bu.cleanString(t.input,t.replaceUnderscores)).toEqual(t.output);
    }
	expect(true).toBe(true);

});