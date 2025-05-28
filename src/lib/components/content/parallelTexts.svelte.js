export class ParallelText {
    /**
     * @type {{reference:string, text:string}[]} textRefs
     */
    textRefs = $state([]);


    /**
     * 
     * @param {{reference:string, text:string}[]} textRefs
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