var _ = require('lodash');
var request = require('request');
var moment = require('moment');
var rp = require('request-promise');

var localGithub = require('./local-git')('./git_repo');

var getCommitDate = localGithub.getCommitDate;

var baseOptions = {
	headers: {
		'User-Agent': 'request',
	},
	json: true
};

var basicAuthPrefix = process.env.USERNAME + ':' + process.env.GITHUB_PERSONAL_STATUS_TOKEN;

var baseUrl = 'https://' + basicAuthPrefix + '@api.github.com/repos/Automattic/wp-calypso';

function optionsForUrl( url ) {
	return {
		url: url,
		headers: {
			'User-Agent': 'request'
		},
		json: true
	};
}

function onError( error ) {
	console.log( error );
	if( error.stack ) {
		console.log( error.stack );
	};
	process.exitCode = 1;
}

function sendTooOldStatus( sha ) {
console.log( 'sendTooOldStatus sha:', sha);
	options = _.merge( {}, baseOptions, {
	    method: 'POST',
		uri: statusesUrl( sha ),
		body: {
			"state": "failure",
			"description": "Branch's base is more than 6 hours old.  Please rebase",
			"context": "branch-too-old"
		}
	} )

	rp(options)
	.then(function(body) {
			// everything is ok
	} ).catch( onError );
};

// sendTooOldStatus('fca84b02e42d5ad577e30c70a9e65848350b2a05');

function commitUrl( sha ) {
	return baseUrl + '/git/commits/' + sha;
}

function statusesUrl(sha) {
	return baseUrl + '/statuses/' + sha;
}

function fetchStatuses( sha ) {
	var options = _.merge( {}, baseOptions, {
		url: statusesUrl(sha)
	} );
	return rp(options);
}

function dateIsTooOld(date) {
	var elapsedHours = moment().diff( moment(date), 'hours', true);

	return elapsedHours > 24;
}

function getBaseFromPR( pr ) {
	return pr.base.sha;
}

function fetchStatusContexts(pr) {
	if(!pr.head) {
		console.log('no head!');
		return new Promise(null);
	}
	console.log( 'hasTooOldStatusPromise for:', pr.number, pr.head.sha );
	return fetchStatuses( pr.head.sha ).then(function( body ) {
		return _.map(body,function(status) {
			return status.context;
		} );
	} ).catch( onError );
}

function prIsTooOld( pr ) {
	if( ! pr.base ) {
		return false;
	}

	// Figure out which commit in master the branch is based on
	var baseSHA = localGithub.getMergeBase( pr.base.sha );
	var baseDate = getCommitDate( baseSHA );
	return dateIsTooOld(baseDate);
}

function debugCheckPR( pr ) {
	var whitelist = [ 4283, 4374, 3650, 3611];
	return _.includes( whitelist, pr.number );
}

function handlePullsResponse( body ) {
	// Make sure local git is up to date
	localGithub.pull();

	// TODO: I need to get the mergebase back out of the PR check
	_(body).filter( prIsTooOld ).forEach( function( pr ) {
		if( debugCheckPR(pr) ) {
			console.log( 'checking pr', pr.number);
			// pr.number and pr.url (api, not html)  might be useful

			fetchStatusContexts( pr ).then( function( statusContexts ) {
				if( ! _.includes( statusContexts, 'branch-too-old' ) ) {
					console.log( 'sending Too Old status for pr:', pr.number);
					sendTooOldStatus( pr.head.sha );
				}
			} ).catch( onError );
		}
	});
}

// Note: the issues url lets us filter by labels, but forces
// another fetch to get the actual PR
var pullsOptions = {
	url: baseUrl + '/pulls',
	headers: {
		'User-Agent': 'request'
	},
	qs: {
		state: 'open',
		per_page: '300'
	},
	json: true
}

rp( pullsOptions).then( handlePullsResponse ).catch( onError );
