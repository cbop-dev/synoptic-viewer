class GreekUtils {
	static greekLetters
	static latinBetaCodeLetters
	static latinGreekMap
	
	static {
		this.greekLetters = "αβγδεζηιθκλμνξοπρσςτυφχψωϝΑΒΓΔΕΖΗΙΘΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩϜ".split("")
		this.greekDiac = '\u0314\u0313\u0342\u0301\u0345\u0308\u0300\'';
		this.greek = this.greekLetters + this.greekDiac;
		this.greekBetaDiac = '()=/|+\\#';
		this.latinBetaCodeLetters = "abgdezhiqklmncoprsstufxywvABGDEZHIQKLMNCOPRSTUFXYWV".split("")
		this.beta = this.latinBetaCodeLetters + this.greekBetaDiac;
		this.latinGreekMap = new Object();
		
		for (var i = 0; i < this.greekLetters.length; i++){
			this.latinGreekMap[this.latinBetaCodeLetters[i]] = this.greekLetters[i];
		}
		
		this.greekLatinMap = new Object();
		
		for (var i = 0; i < this.latinBetaCodeLetters.length; i++){
			this.greekLatinMap[this.greekLetters[i]] = this.latinBetaCodeLetters[i];
		}
	}

	/**
	 * 
	 * @param {string} greekString 
	 * @returns {string}
	 */
	static greek2Beta(greekString,caseSensitive=true) {
		/**
		 * @type {string[]} betaChars
		 */
		let betaChars = []
		greekString = this.removeDiacritics( 
			caseSensitive ? greekString : greekString.toLocaleLowerCase());
		let greekChars = greekString.split("");
		for (var i = 0; i <  greekChars.length; i++) {
			var lookupIndex = this.greekLetters.indexOf(greekChars[i]);
			if ( lookupIndex >= 0) {
				betaChars.push(this.latinBetaCodeLetters[lookupIndex] || greekChars[i]);
			}
			
		}
		return betaChars.join("");
	}
	static beta2Greek(betaString) {
		
		var greekChars = []
		var latinChars = betaString.split("");
		for (var i = 0; i < latinChars.length; i++) {
			var lookupIndex = this.beta.indexOf(betaString[i]);
			/* if (lookupIndex >= 0) {*/
			
				greekChars.push(this.greek[lookupIndex] || latinChars[i]);
			/* } */
			
		}
		
		
		return greekChars.join("").replaceAll('ς','σ').replace(/σ$/, 'ς');
	}
	
	/** TODO 
	 *  searches an array of strings for all strings that contain searchString
	 * 
	 * **/
	static fuzzySearchArray(searchString, stringArray, limit = -1) {
		var sString = searchString.replace('ς','σ');
		var toCheck = ['*', '?', '.', '+'];

		if (toCheck.some(c => sString.includes(c))) /* (sString.includes("*"))*/
		{
			sString = sString.replace("*", ".*");
			sString = sString.replace("?", ".?");
			sString = sString.replace("+", ".+");
			var regex = new RegExp("^" + sString);
			var partialMatch = function(stringObj) {
				//console.debug("Limit: " + limit)
				var sObj = stringObj.replace('ς','σ')
				if (false) {
					//console.debug("Yep!")
					return (sObj.search(regex) >= 0);

				}
				else if ((limit < 1 || this.count < limit) && (sObj.search(regex) >= 0)) {
					//console.debug("Here we is!")
					this.count++;

					return true;
				}
				else {
					//console.debug("Dare we are!")
					return false
				}

			}
		}
		else
		{

			var partialMatch = function(stringObj) {
				//console.debug("Limit: " + limit)
				var sObj = stringObj.replace('ς','σ')
				if (false) {
					//console.debug("Yep!")
					return sObj.includes(sString)

				}
				else if ((limit < 1 || this.count < limit) && sObj.includes(sString)) {
					//console.debug("Here we is!")
					this.count++;

					return true;
				}
				else {
					//console.debug("Dare we are!")
					return false
				}

			}
		}
		
		return stringArray.filter(partialMatch, {count: 0})
		
	}
	
	/**
	 * 
	 * @param {string} greek 
	 * @returns {string} input with diacritics removed
	 */
	static removeDiacritics(greek) {
		
		/*var diacKeys = "ΐέήίΰϊϋόύώἀἁἄἅἆἈἉἌἍἎἐἑἔἕἘἙἜἝἠἡἤἥἦἧἨἩἬἰἱἴἵἶἷἸἹὀὁὄὅὈὐὑὔὕὖὗὙὠὡὥὦὧὩὶᾂᾅᾠᾳᾴᾶῃῄῆῇῖῥῦῬῳῴῶῷύά";
		var diacReplacements = "ιεηιυιυουωαααααΑΑΑΑΑεεεεΕΕΕΕηηηηηηΗΗΗιιιιιιΙΙοοοοΟυυυυυυΥωωωωωΩιααωαααηηηηιρυΡωωωωυα";*/
		/*let removeDiacriticsMap = {"A": "Α", "E": "Ε", "O": "Ο", "ΐ": "ι", "ά": "α", "έ": "ε", "ή": "η", "ί": "ι", "ΰ": "υ", "ϊ": "ι", "ϋ": "υ", "ό": "ο", "ύ": "υ", "ώ": "ω", "ἀ": "α", "ἁ": "α", "ἄ": "α", "ἅ": "α", "ἆ": "α", "Ἀ": "Α", "Ἁ": "Α", "Ἄ": "Α", "Ἅ": "Α", "Ἆ": "Α", "ἐ": "ε", "ἑ": "ε", "ἔ": "ε", "ἕ": "ε", "Ἐ": "Ε", "Ἑ": "Ε", "Ἔ": "Ε", "Ἕ": "Ε", "ἠ": "η", "ἡ": "η", "ἤ": "η", "ἥ": "η", "ἦ": "η", "ἧ": "η", "Ἠ": "Η", "Ἡ": "Η", "Ἤ": "Η", "ἰ": "ι", "ἱ": "ι", "ἴ": "ι", "ἵ": "ι", "ἶ": "ι", "ἷ": "ι", "Ἰ": "Ι", "Ἱ": "Ι", "ὀ": "ο", "ὁ": "ο", "ὄ": "ο", "ὅ": "ο", "Ὀ": "Ο", "ὐ": "υ", "ὑ": "υ", "ὔ": "υ", "ὕ": "υ", "ὖ": "υ", "ὗ": "υ", "Ὑ": "Υ", "ὠ": "ω", "ὡ": "ω", "ὥ": "ω", "ὦ": "ω", "ὧ": "ω", "Ὡ": "Ω", "ά": "α", "έ": "ε", "ή": "η", "ὶ": "ι", "ί": "ι", "ό": "ο", "ύ": "υ", "ώ": "ω", "ᾂ": "α", "ᾄ": "α", "ᾅ": "α", "ᾠ": "ω", "ᾳ": "α", "ᾴ": "α", "ᾶ": "α", "ῃ": "η", "ῄ": "η", "ῆ": "η", "ῇ": "η", "ΐ": "ι", "ῖ": "ι", "ῥ": "ρ", "ῦ": "υ", "Ῥ": "Ρ", "ῳ": "ω", "ῴ": "ω", "ῶ": "ω", "ῷ": "ω", "͑Ρ": "Ρ","ᾤ":"ω"};
		let clean = greek.replace(/./g, (c) => {
			let r = c;
			if (removeDiacriticsMap[c])
				r = removeDiacriticsMap[c];
			return r;
			
		});*/

		//return greek.normalize("NFD").replaceAll(/[^α-ωΑ-Ω ;.'"[\]()•]+/g,'');
		return greek.normalize("NFD").replaceAll(/[\u0300-\u036F]+/g,'');
		/*#diacReplacements = "ιεηιυιυουωαααααααεεεεεηηηηηηηηηιιιιιιιοοοοοουυυυυυυυωωωωωωωααεεηηιιοουυωωααηηηηηωωαααααηηηηιιιυρυωωωωΑΑΑΑΑΑΕΕΕΕΕΗΗΗΗΗΗΙΙΙΙΟΟΟΟΟΥΥΥΩΩΩΩΩΡ"*/
	
	}


	/**
	 * 
	 * @param {string} greek 
	 * @returns {string} input without diacritics. Easy for sorting/searching!
	 */
	static plainGreek(greek){

		return this.removeDiacritics(greek);
	}	
}

//module.exports= GreekUtils;
export {GreekUtils};


//GreekUtils.fuzzySearchArray("fred", ["fred", "fresd", "afredas", "Jokfres"]);
