var child_process = require('child_process');
var _ = require('lodash');

/*
git --no-pager show --format="%cI" 146338cd01ee774e00c6a86075612a87bf07a242
*/

module.exports = function( gitrepo ) {
	var gitProcessOptions = {
		cwd: gitrepo,
		encoding: 'utf-8'
	};
	return {
		getCommitDate: function (sha) {
			var commandString = 'git --no-pager show --quiet --format="%cI" ' + sha;

			return child_process.execSync(commandString, gitProcessOptions);
		},
		pull: function() {
			var commandString = 'git pull ';
			return child_process.execSync(commandString, gitProcessOptions);
		},
		getMergeBase: function ( sha ) {
			var commandString = 'git merge-base master ' + sha;
			return child_process.execSync(commandString, gitProcessOptions);
		}
	};
};
