import type { Octokit } from '@octokit/rest';
import { Repository, githubConfig } from '../config/github';

interface Tag {
  name: string;
  commit: {
    sha: string;
  };
}

interface GetTagsResponse {
  data: Tag[];
}

interface CommitTag {
  name: string;
  date: string;
}

export const terminator = async (
  daysUntilStale: number,
  org: string,
  repositories: string[],
  minTags: number,
  dry: boolean,
) => {
  try {
    const octokit = githubConfig.auth();
    let repoList = repositories;

    if (repositories.length < 1) {
      const orgRepositories = await octokit.rest.repos.listForOrg({
        org: org,
      });

      repoList = orgRepositories.data.map((repo) => repo.name);
    }
    for (const repo of repoList) {
      console.log('Terminanting: %s...', repo);
      const gitRepo = new Repository({ org: org, name: repo });

      const tags = await getTags(octokit, gitRepo);
      const tagsSortedByDate = await sortTags(octokit, tags, gitRepo);
      await deleteTags(
        octokit,
        tagsSortedByDate,
        daysUntilStale,
        gitRepo,
        minTags,
        dry,
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const getTags = async (octokit: Octokit, gitRepo: Repository) => {
  try {
    const tags = await octokit.rest.repos.listTags({
      owner: gitRepo.org,
      repo: gitRepo.name,
    });

    return tags;
  } catch (error) {
    console.error('Could not list tags from repo: %s', error);
    process.exit(1);
  }
};

const sortTags = async (
  octokit: Octokit,
  tags: GetTagsResponse,
  gitRepo: Repository,
) => {
  try {
    const commitTags: CommitTag[] = [];
    for (const tag of tags.data) {
      const commit = await octokit.rest.repos.getCommit({
        owner: gitRepo.org,
        repo: gitRepo.name,
        ref: tag.commit.sha,
      });

      const committer = commit.data.commit.committer ?? { date: 'n/a' };
      commitTags.push({ name: tag.name, date: committer.date ?? '' });
    }

    return commitTags.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  } catch (error) {
    console.error('Could not sort tags from repo: %s', error);
    process.exit(1);
  }
};

const deleteTags = async (
  octokit: Octokit,
  tagsDate: CommitTag[],
  daysUntilStale: number,
  gitRepo: Repository,
  minTags: number,
  dry: boolean,
) => {
  try {
    tagsDate.splice(0, minTags);

    for (const tag of tagsDate) {
      const tagDaysSinceCreated =
        (new Date().getTime() - new Date(tag.date).getTime()) / 86400000;
      if (tagDaysSinceCreated > daysUntilStale) {
        if (dry) {
          console.log('%s Tag will be deleted\n', tag.name);
        } else {
          await octokit.rest.git.deleteRef({
            owner: gitRepo.name,
            repo: gitRepo.name,
            ref: `tags/${tag.name}`,
          });

          console.log('%s Tag deleted\n', tag.name);
        }
      }
    }
  } catch (error) {
    console.error('Could not delete tags from repo: %s', error);
    process.exit(1);
  }
};
