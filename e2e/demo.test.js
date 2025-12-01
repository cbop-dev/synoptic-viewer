import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1').first()).toBeVisible();
});


test('check "with Math.v mark" url loading', async ({ page }) => {
	const uri='/?focusOn=1&sort=1&lexes=3205%2C4718&similarPhrases=1&selectedGospelIndex=1&pericopes=7%2C8%2C20%2C44%2C48%2C49%2C50%2C77%2C90%2C91%2C93%2C95%2C99%2C113%2C117%2C136%2C137%2C138%2C147%2C153%2C160%2C161%2C163%2C188%2C292%2C300%2C308%2C310%2C311%2C312%2C330%2C331%2C332%2C333%2C353%2C359%2C363%2C364&nt=sblgnt';
	await page.goto(uri);
	await expect(page.getByText('7: The Birth of Jesus:')).toBeVisible();
	const theWith = await page.getByText('Μεθ’ ',{exact:true}).getAttribute('class');
	expect(theWith.includes('selected')).toBe(true);
	

	
	//await expect(page.locator('h1').first()).toBeVisible();
});


test('check "with Math vs. mark" url loading with page parameter', async ({ page }) => {
	const uri='/?focusOn=1&sort=1&lexes=3205%2C4718&similarPhrases=1&selectedGospelIndex=1&pericopes=7%2C8%2C20%2C44%2C48%2C49%2C50%2C77%2C90%2C91%2C93%2C95%2C99%2C113%2C117%2C136%2C137%2C138%2C147%2C153%2C160%2C161%2C163%2C188%2C292%2C300%2C308%2C310%2C311%2C312%2C330%2C331%2C332%2C333%2C353%2C359%2C363%2C364&nt=sblgnt&page=3';
	const notVisible=[
		'7: The Birth of Jesus:',
		'πρὶν ἢ συνελθεῖν αὐτοὺς εὑρέθη ἐν γαστρὶ ἔχουσα ἐκ πνεύματος ἁγίου', //'Μεθ’'
	]
	const visible =[
		'Εὐθέως δὲ μετὰ τὴν θλῖψιν τῶν ἡμερῶν ἐκείνων ὁ ἥλιος σκοτισθήσεται, καὶ ἡ σελήνη οὐ δώσει τὸ φέγγος αὐτῆς, καὶ οἱ ἀστέρες πεσοῦνται ἀπὸ τοῦ οὐρανοῦ, καὶ αἱ δυνάμεις τῶν οὐρανῶν σαλευθήσονται.'
	];
	await page.goto('/');
	await page.goto(uri);
	await expect(page.getByText('7: The Birth of Jesus:')).not.toBeVisible();
	await expect(page.getByText('163: Jesus Heals a Boy Possessed by a Spirit:')).toBeVisible();
	'163: Jesus Heals a Boy Possessed by a Spirit';
	
	notVisible.forEach(async (nv)=>{
		//const elementLoc = page.locator('span').getByText(nv,{exact:true});
		//expect(elementLoc).toBeDefined();
		const count = await page.locator('span').getByText(nv,{exact:true}).count();
		expect(count).toEqual(0);
		//await expect(page.locator('span').getByText(nv,{exact:true})).toHaveCount(0);
		//await expect(element).toHaveCount(0);
	
	});

		/*
	visible.forEach((nv)=>{
		const element = page.locator('span').getByText(nv,{exact:true});
		expect(element.count() > 1).toBe(true);
	
	});*/

	//const theWith = page.getByText('Μεθ’ ',{exact:true});
	//'πρὶν ἢ συνελθεῖν αὐτοὺς εὑρέθη ἐν γαστρὶ ἔχουσα ἐκ πνεύματος ἁγίου'
	//expect(theWith).not.toBeDefined();
	//expect(theWith).not.toBeVisible();
	//expect(theWith.includes('selected')).toBe(true);
	
	
	

	
	//await expect(page.locator('h1').first()).toBeVisible();
});

