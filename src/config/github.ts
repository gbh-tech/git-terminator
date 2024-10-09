import { Octokit } from '@octokit/rest';

class GitHubAuth {
  token: string;

  constructor(token: string) {
    this.token = token;
  }
  auth() {
    return new Octokit({ auth: this.token });
  }
}

interface RepositoryParams {
  org: string;
  name: string;
}

export class Repository {
  org: string;
  name: string;

  constructor({ org, name }: RepositoryParams) {
    this.org = org;
    this.name = name;
  }
}

export const githubConfig = new GitHubAuth(process.env.GITHUB_TOKEN || '');
