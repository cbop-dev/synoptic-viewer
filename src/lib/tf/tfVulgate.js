import { TfServer } from '$lib/components/content/TfUtils.js';
import { tfVulgateBooksDict } from './vulgateBooks.js';
import vulgateChaps from './vulgateChaps.json';

export class VulgateServer extends TfServer {
    static abbrev = 'vulgate';
    dbURI = '/vul';
    numLexemes=13816;
    totalWords=596440;
    constructor() {
        super();
        this.name = "Latin Vulgate";
        this.lang = "latin";
        this.longname = "Biblia Sacra Vulgata";
        this.shortname = "Vulgate";
        this.abbrev = VulgateServer.abbrev;
        this.booksDict = tfVulgateBooksDict;
        this.chaps = vulgateChaps;
        
        // Capability overrides
        this.hasLexicalInfo = true;
        this.hasPhraseComparison = true;
        this.hasMorphology = false;
    }

    getCopyright() {
        return "Biblia Sacra Vulgata. Public Domain.";
    }
}
