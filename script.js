import {key} from './.gitignore/key.js'
import {Octokit} from 'https://cdn.skypack.dev/@octokit/rest'

const octokit = new Octokit({
  auth: key,
})

///delete your art

const username = 'cameochoquer'
const response = await octokit.repos.listForUser({
  username: username,
})

const labels = []
const data = []

for (const repo of response.data) {
  const repoName = repo.name

  try {
    const commitResponse = await octokit.repos.listCommits({
      owner: username,
      repo: repoName,
    })

    if (commitResponse.data.length === 0) {
      console.log(`Repository ${repoName} is empty.`)
      continue
    }

    const commitCount = commitResponse.data.length

    labels.push(repoName)
    data.push(commitCount)
  } catch (error) {
    if (error.status === 409 && error.message === 'Git Repository is empty.') {
      console.log(`Repository ${repoName} is empty.`)
      continue
    } else {
      console.error(
        `Error while processing repository ${repoName}: ${error.message}`
      )
    }
  }
}

let colourArray = []

labels.forEach((label) => {
  let hexCode = '#' + Math.random().toString(16).substring(2, 8)
  colourArray.push(hexCode)
})

const datasets = [
  {
    label: 'Commits',
    backgroundColor: colourArray,
    data: data,
  },
]

new Chart('myChart', {
  type: 'bar',
  data: {
    labels: labels,
    datasets: datasets,
  },
  options: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Commits per Repository',
      fontColor: 'white',
    },
    scales: {
      yAxes: [{ticks: {beginAtZero: true, fontColor: 'white'}}],
      xAxes: [
        {
          ticks: {
            fontColor: 'white',
          },
        },
      ],
    },
  },
})
