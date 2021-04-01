export PATH:=./node_modules/.bin:$(PATH)

ARTICLES_SOURCES=$(wildcard articles/*.yaml)
ARTICLES_HTML=$(patsubst articles/%.yaml,public/articles/%.html,$(ARTICLES_SOURCES))
ARTICLES_JSON=$(patsubst articles/%.yaml,public/json/%.json,$(ARTICLES_SOURCES))

CSS_SOURCES=$(wildcard css/[!_]*.scss)
CSS_OBJ=$(patsubst css/%.scss,public/css/%.css,$(CSS_SOURCES))

RENDERER_SOURCES=$(wildcard renderer/*.{ts,tsx})
NODE_SOURCES=$(wildcard node/*.{ts,tsx})
SOURCES=$(RENDERER_SOURCES) $(NODE_SOURCES)

all: schema.json articles articles_json css js

schema.json: tsconfig.json renderer/Article.ts
	typescript-json-schema --tsNodeRegister $< Article -o $@

public/articles/%.html: articles/%.yaml render.ts schema.json $(SOURCES)
	ts-node -r tsconfig-paths/register render.ts $< $@

articles: $(ARTICLES_HTML)
	cp -f public/articles/index.html public/index.html
	cp -f public/articles/404.html public/404.html

public/json/%.json: articles/%.yaml render-json.ts
	ts-node render-json.ts $< $@

articles_json: $(ARTICLES_JSON)

public/css/%.css: css/%.scss
	sass -s compressed --no-source-map $< $@

css: $(CSS_OBJ)

public/js/dynamic.js: $(RENDERER_SOURCES)

js: public/js/dynamic.js
	rollup -c

clean:
	$(RM) schema.json $(ARTICLES_HTML) $(ARTICLES_JSON) $(CSS_OBJ) public/js/dynamic.js

.PHONY: clean
