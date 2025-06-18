export class TextAndRef{
    reference='';
    text=''
    
    constructor(reference='', text=''){
        this.reference=reference;
        this.text=text;
    }
}
export class ParallelText {
    /**
     * @type {TextAndRef[]} textRefs
     */
    textRefs = $state([]);


    /**
     * 
     * @param {TextAndRef[]}     textRefs
     */
    constructor(textRefs=[]){
        this.textRefs = textRefs
        
     //   this.references=references;
    }
}


export class GospelPericopeGroup{
    title = $state('')
    id=$state(0);
    matt = new ParallelText();
    mark = new ParallelText();
    luke = new ParallelText();
    john = new ParallelText();
    other = new ParallelText();
}
export default {
    ParallelText, GospelPericopeGroup
}