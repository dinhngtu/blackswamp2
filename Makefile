NODE?=node

ARTICLES_SOURCES=$(wildcard articles/*.yaml)
ARTICLES_HTML=$(patsubst articles/%.yaml,public/articles/%.html,$(ARTICLES_SOURCES))
ARTICLES_HTML_TOUCH=$(patsubst articles/%.yaml,public/articles/%.html.touch,$(ARTICLES_SOURCES))
ARTICLES_JSON=$(patsubst articles/%.yaml,public/json/%.json,$(ARTICLES_SOURCES))
ARTICLES_JSON_TOUCH=$(patsubst articles/%.yaml,public/json/%.json.touch,$(ARTICLES_SOURCES))

CSS_SOURCES=$(wildcard css/[!_]*.css)
CSS_OBJ=$(patsubst css/%.css,public/css/%.css,$(CSS_SOURCES))

RENDERER_SOURCES=$(wildcard renderer/*)
NODE_SOURCES=$(wildcard node/*)

STATIC_SOURCES=$(RENDERER_SOURCES) $(NODE_SOURCES) yarn.lock
DYNAMIC_SOURCES=$(RENDERER_SOURCES) yarn.lock

# general prep

all: articles articles_json css js

schema.json: tsconfig.static.json renderer/Article.ts
	@printf SCHEMA\\t$@\\n
	@./node_modules/.bin/typescript-json-schema $< Article -o $@

render.js: rollup.static.config.js $(STATIC_SOURCES)
	@printf JSS\\t$@\\n
	@./node_modules/.bin/rollup -c $<

.SUFFIXES:

# html

# all targeted html files should be newer than this file to allow for cleaning up non-targeted files
public/articles/.guard:
	@touch $@

public/articles/%.html: articles/%.yaml render.js schema.json | public/articles/.guard
	@printf HTML\\t$@\\n
	@$(NODE) render.js $< $@

# this forced static pattern ensures that all targeted html files are newer than guard
$(ARTICLES_HTML_TOUCH): public/articles/%.html.touch: articles/%.yaml render.js schema.json | public/articles/.guard
	@$(NODE) render.js --touch --no-validate $(patsubst public/articles/%.html.touch,articles/%.yaml,$@) $(patsubst public/articles/%.html.touch,public/articles/%.html,$@)
	@touch -c -r $(patsubst public/articles/%.html.touch,public/articles/%.html,$@) $(patsubst public/articles/%.html.touch,public/%.html,$@) 2>/dev/null || true

public/%.html: public/articles/%.html
	@printf INDEX\\t$@\\n
	@cp -f $< $@

# cleanup non-targeted files
articles: $(ARTICLES_HTML) $(ARTICLES_HTML_TOUCH) public/index.html public/404.html
	@find public/articles/ -type f -name '*.html' \! -newer public/articles/.guard -printf 'DELETE\t%p\n' -delete
	@$(RM) public/articles/.guard public/articles/*.touch

# json

public/json/.guard:
	@touch $@

public/json/%.json: articles/%.yaml render.js schema.json | public/json/.guard
	@printf JSON\\t$@\\n
	@$(NODE) render.js --format json --private $< $@

$(ARTICLES_JSON_TOUCH): public/json/%.json.touch: | public/json/.guard
	@touch -c $(patsubst public/json/%.json.touch,public/json/%.json,$@)

articles_json: $(ARTICLES_JSON) $(ARTICLES_JSON_TOUCH)
	@find public/json/ -type f -name '*.json' \! -newer public/json/.guard -printf 'DELETE\t%p\n' -delete
	@$(RM) public/json/.guard public/json/*.touch

# css/js

public/css/%.css: css/%.css
	@printf CSS\\t$@\\n
	@$(NODE) cleancss.js $< -o $@

css: $(CSS_OBJ)

public/js/dynamic.js: rollup.dynamic.config.js $(DYNAMIC_SOURCES)
	@printf JSD\\t$@\\n
	@./node_modules/.bin/rollup -c $<
	@./node_modules/.bin/terser -o $@ -c -m -- $@

js: public/js/dynamic.js

# referenced deps

rollup.static.config.js: tsconfig.static.json
	@touch $@

tsconfig.static.json: tsconfig.base.json
	@touch $@

rollup.dynamic.config.js: tsconfig.dynamic.json
	@touch $@

tsconfig.dynamic.json: tsconfig.base.json
	@touch $@

# clean

clean:
	$(RM) schema.json $(ARTICLES_HTML) $(ARTICLES_JSON) $(CSS_OBJ) public/js/dynamic.js render.js

cleanall: clean
	$(RM) public/articles/*.html public/css/*.css public/js/*.js public/json/*.json

.PHONY: clean cleanall
