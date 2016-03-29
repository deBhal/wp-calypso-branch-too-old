var child_process = require('child_process');
var _ = require('lodash');

/*
git --no-pager show --format="%cI" 146338cd01ee774e00c6a86075612a87bf07a242
*/

module.exports = function( gitrepo ){
	return {
		getCommitDate: function (sha) {
			var commandString = 'git --no-pager show --quiet --format="%cI" ' + sha;
			var gitProcessOptions = {
				cwd: gitrepo,
				encoding: 'utf-8'
			};

			return child_process.execSync(commandString, gitProcessOptions);
		}
	};
};
