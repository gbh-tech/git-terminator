// import { Octokit } from "octokit";
import { githubConfig, Repository } from "../config/github";

export const terminator = async (daysUntilStale, org, repo, minTags) => {
  try {
    const octokit = githubConfig.auth();
    const gitRepo = new Repository(org, repo);

    const tags = await getTags(octokit, gitRepo);
    const tagsSortedByDate = await sortTags(octokit, tags, gitRepo);
    await deleteTags(octokit, tagsSortedByDate, daysUntilStale, gitRepo, minTags);
  }
  catch (error) {
    console.error('Eploto:', error);
    process.exit(1);
  }
}

// This func could be added as methods of my githubConfig class
// Need test
const getTags = async (octokit, gitRepo) => {
  try {
    const tags = await octokit.request('GET /repos/{owner}/{repo}/tags', {
      owner: gitRepo.org,
      repo: gitRepo.repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return tags;
  }
  catch (error) {
    console.error('Could not list tags from repo: %s', error);
    process.exit(1);
  }
}

// Need test
const sortTags = async (octokit, tags, gitRepo) => {
  try {
    let commitTags = []
    for (const tag of tags.data) {
      const commit = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
        owner: gitRepo.org,
        repo: gitRepo.repo,
        ref: tag.commit.sha,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      commitTags.push({tag: tag.name, date: commit.data.commit.committer.date});
    }
    return commitTags.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  catch (error) {
    console.error('Could not sort tags from repo: %s', error);
    process.exit(1);
  }
}

const deleteTags = async (octokit, tagsDate, daysUntilStale, gitRepo, minTags) => {
  try {
    tagsDate.splice(0, minTags)
    tagsDate.forEach(async (tag) => {
      var tagDaysSinceCreated = (new Date() - new Date(tag.date))/86400000;
      if (tagDaysSinceCreated > daysUntilStale) {
        // These console logs are for Testing
        console.log(tag)
        console.log("Stale\n\n")
      //   await octokit.request('DELETE /repos/{owner}/{repo}/git/refs/{ref}', {
      //     owner: gitRepo.name,
      //     repo: gitRepo.repo,
      //     ref: 'tags/'+tag.name,
      //     headers: {
      //       'X-GitHub-Api-Version': '2022-11-28'
      //     }
      //   });
      //   console.log("%s Tag deleted!", tag.name)
      // }
      } else {
        console.log(tag)
      }
    });
  }
  catch(error) {
    console.error('Could not delete tags from repo: %s', error);
    process.exit(1);
  }

}
