import type { Octokit } from "@octokit/core";
import { githubConfig, Repository } from "../config/github";

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
	tag: string;
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
		if (repositories.length < 1) {
			let orgRepositories = await octokit.request("GET /orgs/{org}/repos", {
				org: org,
				headers: {
					"X-GitHub-Api-Version": "2022-11-28",
				},
			});
			repositories = orgRepositories.data.map((repo) => repo.name);
		}
		for (const repo of repositories) {
			console.log("Terminanting: %s...", repo);
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
		console.error("Eploto:", error);
		process.exit(1);
	}
};

// This func could be added as methods of my githubConfig class
// Need test
const getTags = async (octokit: Octokit, gitRepo: Repository) => {
	try {
		const tags = await octokit.request("GET /repos/{owner}/{repo}/tags", {
			owner: gitRepo.org,
			repo: gitRepo.name,
			headers: {
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});
		return tags;
	} catch (error) {
		console.error("Could not list tags from repo: %s", error);
		process.exit(1);
	}
};

// Need test
const sortTags = async (
	octokit: Octokit,
	tags: GetTagsResponse,
	gitRepo: Repository,
) => {
	try {
		let commitTags: CommitTag[] = [];
		for (const tag of tags.data) {
			const commit = await octokit.request(
				"GET /repos/{owner}/{repo}/commits/{ref}",
				{
					owner: gitRepo.org,
					repo: gitRepo.name,
					ref: tag.commit.sha,
					headers: {
						"X-GitHub-Api-Version": "2022-11-28",
					},
				},
			);
			let committer = commit.data.commit.committer ?? { date: "n/a" };
			commitTags.push({ tag: tag.name, date: committer.date ?? "" });
		}
		return commitTags.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);
	} catch (error) {
		console.error("Could not sort tags from repo: %s", error);
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
		tagsDate.forEach(async (tag) => {
			var tagDaysSinceCreated =
				(new Date().getTime() - new Date(tag.date).getTime()) / 86400000;
			if (tagDaysSinceCreated > daysUntilStale) {
				// These console logs are for Testing
				if (dry) {
					console.log(tag);
					console.log("Stale\n\n");
				} else {
					console.log("WIP\n\n");

					//   await octokit.request('DELETE /repos/{owner}/{repo}/git/refs/{ref}', {
					//     owner: gitRepo.name,
					//     repo: gitRepo.name,
					//     ref: 'tags/'+tag.name,
					//     headers: {
					//       'X-GitHub-Api-Version': '2022-11-28'
					//     }
					//   });
					//   console.log("%s Tag deleted!", tag.name)
					// }
				}
			} else {
				console.log(tag);
			}
		});
	} catch (error) {
		console.error("Could not delete tags from repo: %s", error);
		process.exit(1);
	}
};
