const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const html2jade = require('html2jade');
const CSON = require('cson-parser');

const HTML2JADE_OPTIONS = {
	bodyless: true,
	donotencode: true,
	double: true,
	noemptypipe: true,
	tabs: true,
	numeric: true
};

const SNIPPET_SRC_PATH = '../language-html/snippets/language-html.cson';
const SNIPPET_DIST_PATH = '../snippets/snippets-jade.cson';

function htmltojade(html) {
	var jade;
	const cd = (error, result) => {
		if (error) throw error;
		jade = result;
	};
	html2jade.convertHtml(html, HTML2JADE_OPTIONS, cd);
	return jade;
}

function snippetConvert(snippet, key) {
			snippet['body'] = snippet['body']
				.replace(/\$/g, '__').replace('body', 'body_');
			snippet['body'] = htmltojade(snippet['body'])
				.replace(/__/g, '$').replace('body_', 'body')
				.replace(/\| /, '').replace(/\n$/, '');


	return snippet;
};

async.waterfall([
	fs.readFile.bind(null, SNIPPET_SRC_PATH),
	(file, callback) => {
		const snippetsRoot = CSON.parse(file.toString());
		const snippets = snippetsRoot[Object.keys(snippetsRoot)[0]];
		_.map(snippets, snippetConvert);
		callback(null, CSON.stringify({'.source.jade, .source.pug': snippets}, null, '\t'));
	},
	fs.writeFile.bind(null, SNIPPET_DIST_PATH)
], error => {
	if (error) throw error;
});
