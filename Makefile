export TS_NODE_TRANSPILE_ONLY=true
export TS_NODE_FILES=true

NODE=node

ARTICLES_SOURCES=$(wildcard articles/*.yaml)
ARTICLES_HTML=$(patsubst articles/%.yaml,public/articles/%.html,$(ARTICLES_SOURCES))
ARTICLES_JSON=$(patsubst articles/%.yaml,public/json/%.json,$(ARTICLES_SOURCES))

CSS_SOURCES=$(wildcard css/[!_]*.css)
CSS_OBJ=$(patsubst css/%.css,public/css/%.css,$(CSS_SOURCES))

RENDERER_SOURCES=$(wildcard renderer/*.{ts,tsx})
NODE_SOURCES=$(wildcard node/*.{ts,tsx})

STATIC_SOURCES=$(RENDERER_SOURCES) $(NODE_SOURCES)
DYNAMIC_SOURCES=$(RENDERER_SOURCES)

all: articles articles_json css js

schema.json: tsconfig.static.json renderer/Article.ts
	./node_modules/.bin/typescript-json-schema --tsNodeRegister $< Article -o $@

render.js: rollup.static.config.js $(STATIC_SOURCES)
	./node_modules/.bin/rollup -c $<

public/articles/%.html: articles/%.yaml render.js schema.json $(STATIC_SOURCES)
	$(NODE) render.js $< $@

public/404.html: public/articles/404.html
	cp -f $< $@

public/index.html: public/articles/index.html
	cp -f $< $@

articles: $(ARTICLES_HTML) public/index.html public/404.html

public/json/%.json: articles/%.yaml render.js schema.json $(STATIC_SOURCES)
	$(NODE) render.js --format json --private $< $@

articles_json: $(ARTICLES_JSON)

public/css/%.css: css/%.css
	./node_modules/.bin/cleancss $< -o $@

css: $(CSS_OBJ)

public/js/dynamic.js: rollup.dynamic.config.js $(DYNAMIC_SOURCES)
	./node_modules/.bin/rollup -c $<

js: public/js/dynamic.js

# referenced deps

rollup.static.config.js: tsconfig.static.json

tsconfig.static.json: tsconfig.base.json

rollup.dynamic.config.js: tsconfig.dynamic.json

tsconfig.dynamic.json: tsconfig.base.json

clean:
	$(RM) schema.json $(ARTICLES_HTML) $(ARTICLES_JSON) $(CSS_OBJ) public/js/dynamic.js render.js

cleanall: clean
	$(RM) -r public/

.PHONY: clean cleanall
