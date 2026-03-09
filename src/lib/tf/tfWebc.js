import { TfServer } from '$lib/components/content/TfUtils.js';
import { tfWebBooksDict } from './webBooks.js';
import webChaps from './webChaps.json';

export class WebcServer extends TfServer {
    static abbrev = 'web';
    dbURI = '/web';

    constructor() {
        super();
        this.lang = "english";
        this.name = "World English Bible (Catholic)";
        this.longname = "World English Bible, Catholic Edition";
        this.shortname = "WEBC";
        this.abbrev = WebcServer.abbrev;
        this.booksDict = tfWebBooksDict;
        this.chaps = webChaps;
        
        // Capability overrides
        this.hasLexicalInfo = false;
        this.hasApparatus=false;
        this.hasPhraseComparison = false;
        this.hasMorphology = false;
    }

    getCopyright() {
        return "World English Bible, Catholic Edition. Public Domain.";
    }
}
