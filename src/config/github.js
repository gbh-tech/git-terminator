import { Octokit } from "@octokit/core";

class GitHubAuth {
  constructor(token) {
    this.token = token
  }
  auth() {
    // return new Octokit({ auth: process.env.GITHUB_TOKEN });
    // console.log(this.token);
    return new Octokit({ auth: this.token });
  }
}

export class Repository {
  constructor(org, repo) {
    this.org = org,
    this.repo = repo
  }
}

export const githubConfig = new GitHubAuth(
  // process.env.GITHUB_TOKEN || '',
  // Pass org as a CLI flag??
  process.env.GITHUB_TOKEN ,
);

