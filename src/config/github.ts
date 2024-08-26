import { Octokit } from "@octokit/core";

class GitHubAuth {
  token: string;

  constructor(token: string) {
    this.token = token
  }
  auth() {
    return new Octokit({ auth: this.token });
  }
}

export class Repository {
  org: string;
  repo: string;

  constructor(org: string, repo: string) {
    this.org = org,
    this.repo = repo
  }
}

export const githubConfig = new GitHubAuth(
  process.env.GITHUB_TOKEN || '',
);

