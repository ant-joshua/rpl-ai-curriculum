.PHONY: pdf-all pdf-clean

PDFS := $(patsubst %,pdf-export/%.pdf,$(shell ls -d [0-9]* | sort))

pdf-all: $(PDFS)

pdf-clean:
	rm -f pdf-export/*.pdf

pdf-export/%.pdf:
	@m=$$(echo $@ | sed 's/pdf-export\///' | sed 's/\.pdf//'); \
	files="$$m/README.md"; \
	for f in $$m/0*.md; do [ -f "$$f" ] && files="$$files $$f"; done; \
	echo "PDF: $$m"; \
	pandoc --from gfm $$files -o "$@" \
		--pdf-engine=xelatex \
		-V mainfont='DejaVu Sans' \
		-V monofont='DejaVu Sans Mono' \
		-V colorlinks=true \
		-V toccolor=blue \
		--metadata title="$$m" \
		-V pagestyle=plain 2>/dev/null && echo "  OK" || echo "  FAIL"
