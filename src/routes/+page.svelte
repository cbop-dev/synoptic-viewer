<script>
	import NtSynopsisPanel from '$lib/components/content/NtSynopsisPanel.svelte';
	import { onMount } from 'svelte';
	import ParallelGospelSection from '$lib/components/content/ParallelGospelSection.svelte';
	import SynopsisHome from '$lib/components/content/SynopsisHome.svelte';
	//import { SynopsisOptions3.SynopsisUrlParamsMap} from "$lib/components/content/SynopsisClasses.svelte";
	import { URLParam } from '$lib/components/content/urlParams';
	import { SynopsisOptions3 } from '$lib/components/content/SynopsisClasses.svelte';
	import '../app.css';
	import { mylog } from '$lib/env/env.js';
	function onkeydown(event) {
		if (event.key == 'p') {
		}
	}

	/**
	 * @typedef {Object} Props
	 * @property {any} data - export let request;
	 */
	let { data } = $props();

	/**
	 * @type {SynopsisOptions3}
	 */
	let options = $state(data.options ? data.options : new SynopsisOptions3());

	if (!options) {
		//    mylog("Got no options!")
	} else {
		//mylog("page.svelte got options! E.g., highlight on click:"+options.viewOptions.highlightOnClick)
	}

	onMount(() => {
		if (data.newURL) {
			window.history.pushState({}, document.title, data.newURL ? data.newURL : '/');
		} else {
			window.history.pushState({}, document.title, window.location.pathname);
		}
	});
</script>

<div id="page-top-div" class="anchor"></div>

<SynopsisHome {options} />

<!--<ParallelGospelSection/>-->
<!--<NtSynopsisPanel/>-->
<div id="page-bottom-div" class=" anchor"></div>
