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
  name: string;

  constructor(org: string, name: string) {
    this.org = org,
    this.name = name
  }
}

export const githubConfig = new GitHubAuth(
  process.env.GITHUB_TOKEN || '',
);

