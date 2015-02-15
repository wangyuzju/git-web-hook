dev:
	DEBUG=git-web-hook:* supervisor ./bin/www


init:
	npm install

sync:
	nb sync dev/nobone-sync.coffee

.PHONY: dev
