branch-too-old
==============

This is a github integration for wp-calypso to scan through open PRs and check that they are based on a change no older than 6 hours.  Branches with an old base show as a failure, and make the merge button ugly and grey:

![branch-too-old-example](https://cloud.githubusercontent.com/assets/5952255/14106999/957f1050-f5f8-11e5-8314-201831efe247.jpg)

To use:

1. checkout or link the wp-calypso git repo in `./git_repo`
1. Generate a personal token with the `repo:status` scope, and `export USERNAME=yourName; export GITHUB_PERSONAL_STATUS_TOKEN=$YOUR_TOKEN`
1. Update the whitelist to include some PRs that you're happy to add statuses to.
1. `node index.js`

The intention right now is to add this to a cron job and run it every hour or two.

Some open questions:

- Is the API throttling relevant here? The local github repo saves a bunch of requests, but it makes it a lot more annoying to use.
- Should we use the issues API?  It has more levers to play with, but you have to figure out whether each hit is an issue or a PR and then do an extra request to get the PR itself.
- Is there a way to get less data?  We get whopping great chunks of data for every single PR, and we only care about a handful of values
- Is 6 hours the right value?
- Can you come up with a better name?  You can hardly do worse :/

