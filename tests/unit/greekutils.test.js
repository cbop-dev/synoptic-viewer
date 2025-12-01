import { describe, it, expect,test} from 'vitest';
import { mylog } from '$lib/env/env';
import { GreekUtils, GreekUtils as gu } from '$lib/utils/greek-utils';



test('remove diacritics test',()=>{
    const gMap = {"ᾤ":"ω",'ἰδοὺ':"ιδου",'ὑμῶν':'υμων',
    };
    for (const [g1,g2] of Object.entries(gMap)) {
        expect(gu.removeDiacritics(g1)).toBe(g2);
    }
        
})


test('remove apparatus test',()=>{
    const tests = [
        {input: "⸂εἶπεν δὲ⸃ πρὸς αὐτὸν ⸀ὁ Ἰησοῦς· Μὴ κωλύετε, ὃς γὰρ οὐκ ἔστιν καθ’ ⸂ὑμῶν ὑπὲρ ὑμῶν⸃ ἐστιν.", 
            output: "εἶπεν δὲ πρὸς αὐτὸν ὁ Ἰησοῦς· Μὴ κωλύετε, ὃς γὰρ οὐκ ἔστιν καθ’ ὑμῶν ὑπὲρ ὑμῶν ἐστιν."}

    ];
    

    for (const t of tests) {
        expect(gu.removeApparatusMarks(t.input)).toBe(t.output);
    }
        
});


 "Ὦ γενεὰ ἄπιστος";


 test('plain Greek test',()=>{
    const tests=[
        {input: "Ὦ γενεὰ ἄπιστος,", output:"Ω γενεα απιστος"}

    ]

    const equivs=[
        {one: "Ὦ γενεὰ ἄπιστος, ", two:"Ὦ γενεὰ ἄπιστος "}
    ]

    for (const t of tests){
        expect(GreekUtils.onlyPlainGreek(t.input)).toEqual(t.output);

    }
    for (const e of equivs){
        expect(GreekUtils.onlyPlainGreek(e.one)).toEqual(GreekUtils.onlyPlainGreek(e.two));
    }
        
})