<script>
	import pkg from '../../../../package.json';
</script>

<a
	href={pkg.repository || 'https://github.com/cbop-dev/synoptic-viewer'}
	target="_blank"
	rel="noopener noreferrer"
	class="version-badge"
	title="View Synopsis Reader on GitHub"
>
	v{pkg.version}
</a>

<style>
	@reference "tailwindcss";
	.version-badge {
		/*font-size: 0.7rem;*/
		padding: 0.15rem 0.4rem;
		/*background: #daab2a;*/
		background-color: rgba(102, 204, 138, 80%);
		/*rgb(51, 151, 65);*/
		color: rgba(0, 0, 0, 80%); /*var(--text-mid, #ececd7);*/
		border-radius: 10px;
		text-decoration: none;
		font-weight: 600;
		vertical-align: super;
		@apply text-xs   ml-1;
		box-shadow: -2px 2px 3px rgba(0, 0, 0, 50%);
	}

	a:link.version-badge {
		text-decoration: none !important;
		font-weight: bold;
	}
	.version-badge:hover {
		background: var(--accent, #1f6f7a);
		color: #fff;
	}
</style>
