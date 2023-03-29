import {Octokit} from 'octokit'

const octokit = new Octokit({})

///
const newResponse = await octokit.request('GET /repos/{owner}/{repo}/issues', {
  owner: 'github',
  repo: 'docs',
  per_page: 2,
})

console.log(newResponse.data)
