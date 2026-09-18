<script>
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Sources &amp; Licenses | Synoptic Viewer</title>
</svelte:head>

<div class="license-page max-w-4xl mx-auto px-4 py-8 text-base-content">
	<!-- Navigation -->
	<div class="mb-6">
		<a href="{base}/" class="btn btn-sm btn-outline gap-2 hover:btn-primary">
			<span aria-hidden="true">&larr;</span> Back to Synopsis Viewer
		</a>
	</div>

	<!-- Title Section -->
	<header class="mb-10 pb-6 border-b border-base-300">
		<h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Sources &amp; Licenses</h1>
		<p class="text-lg opacity-80">
			Licensing framework, source attributions, and copyright notices for the Synoptic Viewer
			project.
		</p>
	</header>

	<!-- Licensing Framework Overview -->
	<div class="grid md:grid-cols-2 gap-6 mb-12">
		<!-- AGPL Code Card -->
		<div
			class="card bg-base-100 shadow-md border border-base-300 p-6 flex flex-col justify-between"
		>
			<div>
				<div class="flex items-center justify-between gap-3 mb-4">
					<h2 class="text-xl font-bold">Application Code &amp; Markup</h2>
					<img
						src="{base}/license/agplv3-88x31.png"
						alt="GNU AGPLv3 License Badge"
						class="rounded shadow-xs border border-base-300"
						width="88"
						height="31"
					/>
				</div>
				<p class="text-sm opacity-90 mb-3">
					The application source code, user interface components, frontend markup, scripts, and
					stylesheets are licensed under the
					<a
						href="https://www.gnu.org/licenses/agpl-3.0.html"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium">GNU Affero General Public License v3.0 (AGPL-3.0)</a
					>.
				</p>
				<ul class="text-xs opacity-80 list-disc list-inside space-y-1 mb-4">
					<li>Free to run, study, modify, and redistribute.</li>
					<li>
						Network copyleft: modified versions hosted over a network must make their source code
						available.
					</li>
					<li>Provided without warranty of any kind.</li>
				</ul>
			</div>
			<div class="pt-4 border-t border-base-200 flex flex-wrap gap-2 text-xs">
				<a
					href="https://github.com/cbop-dev/synoptic-viewer"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-xs btn-outline"
				>
					View GitHub Repository
				</a>
				<a
					href="https://github.com/cbop-dev/synoptic-viewer/blob/main/LICENSE"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-xs btn-ghost"
				>
					View AGPL-3.0 License
				</a>
			</div>
		</div>

		<!-- CC BY-SA Data Card -->
		<div
			class="card bg-base-100 shadow-md border border-base-300 p-6 flex flex-col justify-between"
		>
			<div>
				<div class="flex items-center justify-between gap-3 mb-4">
					<h2 class="text-xl font-bold">Curated Textual Datasets</h2>
					<span class="badge badge-primary font-mono text-xs font-semibold py-3 px-2"
						>CC BY-SA 4.0</span
					>
				</div>
				<p class="text-sm opacity-90 mb-3">
					The curated static datasets, concordance structures, pericope alignments, and lexical
					index files are licensed under
					<a
						href="https://creativecommons.org/licenses/by-sa/4.0/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium"
					>
						Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
					</a>.
				</p>
				<ul class="text-xs opacity-80 list-disc list-inside space-y-1 mb-4">
					<li>
						<strong>Share:</strong> Copy and redistribute the material in any medium or format.
					</li>
					<li>
						<strong>Adapt:</strong> Remix, transform, and build upon the material for any purpose.
					</li>
					<li>
						<strong>Attribution:</strong> You must give appropriate credit and indicate if changes were
						made.
					</li>
					<li>
						<strong>ShareAlike:</strong> Distributed adaptations must remain under the same license.
					</li>
				</ul>
			</div>
			<div class="pt-4 border-t border-base-200 flex flex-wrap gap-2 text-xs">
				<a
					href="https://creativecommons.org/licenses/by-sa/4.0/"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-xs btn-outline"
				>
					View CC BY-SA 4.0 Deed
				</a>
				<a
					href="https://github.com/cbop-dev/synoptic-viewer/blob/main/LICENSE-DATA"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-xs btn-ghost"
				>
					View LICENSE-DATA
				</a>
			</div>
		</div>
	</div>

	<!-- Upstream Sources and Attributions Section -->
	<section class="space-y-6">
		<h2 class="text-2xl font-bold border-b border-base-300 pb-2">
			Underlying Texts &amp; Attributions
		</h2>
		<p class="text-sm opacity-80">
			The synoptic datasets and annotations incorporate or reference several historic and modern
			biblical editions:
		</p>

		<div class="space-y-4">
			<!-- SBLGNT -->
			<div class="card bg-base-100 border border-base-300 p-5 shadow-xs">
				<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
					<h3 class="text-lg font-bold">The Greek New Testament: SBL Edition (SBLGNT)</h3>
					<span class="text-xs badge badge-outline">CC BY 4.0</span>
				</div>
				<p class="text-sm opacity-90">
					The SBL Greek New Testament (2010), edited by Michael W. Holmes in collaboration with the
					Society of Biblical Literature and Logos Bible Software, is licensed under the
					<a
						href="https://creativecommons.org/licenses/by/4.0/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium">Creative Commons Attribution 4.0 International License</a
					>
					(see the
					<a
						href="https://www.sblgnt.com/license/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium">SBLGNT License</a
					>
					and
					<a
						href="https://github.com/Faithlife/SBLGNT/blob/master/LICENSE"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium">GitHub source</a
					>).
				</p>
			</div>

			<!-- Nestle 1904 -->
			<div class="card bg-base-100 border border-base-300 p-5 shadow-xs">
				<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
					<h3 class="text-lg font-bold">Nestle 1904 Greek New Testament</h3>
					<span class="text-xs badge badge-outline">Public Domain</span>
				</div>
				<p class="text-sm opacity-90">
					Eberhard Nestle's 1904 edition of the <em>Novum Testamentum Graece</em> (published by the British
					and Foreign Bible Society). Free of copyright and in the Public Domain worldwide.
				</p>
			</div>

			<!-- Clementine Vulgate -->
			<div class="card bg-base-100 border border-base-300 p-5 shadow-xs">
				<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
					<h3 class="text-lg font-bold">Biblia Sacra Vulgata (Clementine Edition)</h3>
					<span class="text-xs badge badge-outline">Public Domain</span>
				</div>
				<p class="text-sm opacity-90">
					The Clementine edition of the Latin Vulgate, digitized and converted for lexical
					morphology lookup. In the Public Domain.
				</p>
			</div>

			<!-- World English Bible -->
			<div class="card bg-base-100 border border-base-300 p-5 shadow-xs">
				<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
					<h3 class="text-lg font-bold">World English Bible (WEB Catholic Edition)</h3>
					<span class="text-xs badge badge-outline">Public Domain</span>
				</div>
				<p class="text-sm opacity-90">
					A modern English translation of the Holy Scriptures produced by Rainbow Missions, Inc.,
					dedicated to the Public Domain.
				</p>
			</div>

			<!-- Kurt Aland Synopsis Outline -->
			<div class="card bg-base-100 border border-base-300 p-5 shadow-xs">
				<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
					<h3 class="text-lg font-bold">Kurt Aland's Synopsis Layout</h3>
					<span class="text-xs badge badge-ghost">Structural Reference</span>
				</div>
				<p class="text-sm opacity-90">
					The section numbering, grouping, and parallel pericope boundaries follow the standard
					scholarly arrangement of Kurt Aland's <em>Synopsis Quattuor Evangeliorum</em>, 13th
					Revised Edition (Deutsche Bibelgesellschaft: Stuttgart, 1986).
				</p>
			</div>

			<!-- Text-Fabric Tooling -->
			<div class="card bg-base-100 border border-base-300 p-5 shadow-xs">
				<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
					<h3 class="text-lg font-bold">Text-Fabric</h3>
					<span class="text-xs badge badge-ghost">Tooling &amp; Data Pipeline</span>
				</div>
				<p class="text-sm opacity-90">
					Build-time linguistic extractions and node structures utilize
					<a
						href="https://github.com/annotation/text-fabric"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium"
					>
						Text-Fabric
					</a>, developed by Dirk Roorda (KNAW Humanities Cluster).
				</p>
			</div>
		</div>
	</section>

	<!-- Copyright Notice -->
	<footer class="mt-12 pt-6 border-t border-base-300 text-center text-xs opacity-75">
		Web application &copy; Fr. Christopher Brannan, O.P., 2026. All rights reserved for original
		creative works where not otherwise licensed above.
	</footer>
</div>

<style>
	/* Darker green for text links on the sources & licenses page for strong readability */
	.license-page a:not(.btn) {
		color: #166534; /* dark green (green-800), high contrast on white/light backgrounds */
		text-decoration: underline;
		text-underline-offset: 2px;
		border-radius: 0.25rem;
		padding: 0.05rem 0.25rem;
		margin: -0.05rem -0.1rem;
		transition:
			background-color 0.15s ease-in-out,
			color 0.15s ease-in-out;
	}

	/* Rounded dark green background with white text on hover */
	.license-page a:not(.btn):hover {
		background-color: #14532d; /* dark green background (green-900) */
		color: #ffffff; /* crisp white text */
		text-decoration: none;
	}

	div.license-page {
		background-color: var(--bg-content);
		border-radius: 10px;
	}
</style>
