<svelte:head>
	<style>
		/* ===== Prism.js Theme — Dark (matches LMS design) ===== */
		:global(code[class*="language-"]),
		:global(pre[class*="language-"]) {
			color: #e8eaf0;
			background: none;
			font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
			font-size: 14px;
			text-align: left;
			white-space: pre;
			word-spacing: normal;
			word-break: normal;
			word-wrap: normal;
			line-height: 1.6;
			tab-size: 2;
			hyphens: none;
		}

		:global(pre[class*="language-"]) {
			position: relative;
			margin: 0;
			overflow: auto;
			border-radius: 8px;
		}

		:global(.token.comment),
		:global(.token.prolog),
		:global(.token.doctype),
		:global(.token.cdata) {
			color: #546e7a;
			font-style: italic;
		}

		:global(.token.punctuation) {
			color: #89ddff;
		}

		:global(.token.namespace) {
			opacity: 0.7;
		}

		:global(.token.property),
		:global(.token.tag),
		:global(.token.boolean),
		:global(.token.number),
		:global(.token.constant),
		:global(.token.symbol),
		:global(.token.deleted) {
			color: #f78c6c;
		}

		:global(.token.selector),
		:global(.token.attr-name),
		:global(.token.string),
		:global(.token.char),
		:global(.token.builtin),
		:global(.token.inserted) {
			color: #c3e88d;
		}

		:global(.token.operator),
		:global(.token.entity),
		:global(.token.url),
		:global(.language-css .token.string),
		:global(.style .token.string) {
			color: #89ddff;
		}

		:global(.token.atrule),
		:global(.token.attr-value),
		:global(.token.keyword) {
			color: #c792ea;
		}

		:global(.token.function),
		:global(.token.class-name) {
			color: #82aaff;
		}

		:global(.token.regex),
		:global(.token.important),
		:global(.token.variable) {
			color: #ffcb6b;
		}

		:global(.token.important),
		:global(.token.bold) {
			font-weight: bold;
		}

		:global(.token.italic) {
			font-style: italic;
		}

		:global(.token.entity) {
			cursor: help;
		}
	</style>
</svelte:head>
