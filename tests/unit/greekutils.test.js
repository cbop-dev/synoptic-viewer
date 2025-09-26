import { describe, it, expect,test} from 'vitest';
import { mylog } from '$lib/env/env';
import { GreekUtils as gu } from '$lib/utils/greek-utils';


test('remove diacritics test',()=>{
    const gMap = {"ᾤ":"ω",'ἰδοὺ':"ιδου"};
    for (const [g1,g2] of Object.entries(gMap)) {
        expect(gu.removeDiacritics(g1)).toBe(g2);
    }
        
})
