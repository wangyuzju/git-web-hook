run:
	DEBUG=git-web-hook:* supervisor ./bin/www

init:
	npm install
