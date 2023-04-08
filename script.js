import {key} from './.gitignore/key.js'
import {Octokit} from 'https://cdn.skypack.dev/@octokit/rest'

const octokit = new Octokit({
  auth: key,
})

///delete your art

const searchInput = document.getElementById('search')
const results = document.getElementById('results')
const loadingSpinner = document.getElementById('loading')

const gitNames = async (query) => {
  const username = query

  const nameResponse = await octokit.rest.search.users({
    q: `${username} in:login`,
  })
  const data = nameResponse.data
  let searchResult = ''
  data.items.forEach((item) => {
    searchResult += `<div class="search-result" data-username="${item.login}">${item.login}</div>`
  })

  results.innerHTML = searchResult
}

const searchfunction = async (event) => {
  const query = event.target.value.trim().toLowerCase()
  if (query.length >= 1) {
    await gitNames(query)
    results.style.display = 'block'
  } else {
    results.innerHTML = ''
    results.style.display = ''
  }
}

let username
let currentChart

const getUserData = async (event) => {
  const clickedDiv = event.target.closest('div[data-username]')

  if (clickedDiv) {
    username = clickedDiv.getAttribute('data-username')
    results.style.display = 'none'
    searchInput.value = username
    if (currentChart) {
      currentChart.destroy()
    }

    const chartData = await getChartData(username)

    createChart(
      chartData,
      'Commits per Repository',
      'Repository Name',
      'Number of Commits'
    )
  }
}

const getChartData = async (username) => {
  const canvas = document.getElementById('chart')
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)

  loadingSpinner.style.display = 'block'
  let repoLabels = []
  let commitData = []
  const response = await octokit.repos.listForUser({
    username: username,
  })

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

      repoLabels.push(repoName)
      commitData.push(commitCount)
    } catch (error) {
      if (
        error.status === 409 &&
        error.message === 'Git Repository is empty.'
      ) {
        console.log(`Repository ${repoName} is empty.`)
        continue
      } else {
        console.error(
          `Error while processing repository ${repoName}: ${error.message}`
        )
      }
    }
  }
  return {labels: repoLabels, data: commitData}
}

searchInput.addEventListener('keydown', searchfunction)
results.addEventListener('click', getUserData)

const createChart = async (chartData, chartTitle, yAxisLabel, xAxisLabel) => {
  const {labels, data} = chartData

  let colourArray = []

  labels.forEach((label) => {
    let hexCode = '#' + Math.random().toString(16).substring(2, 8)
    colourArray.push(hexCode)
  })
  const chartType = window.innerWidth < 450 ? 'pie' : 'bar'

  const datasets = [
    {
      label: chartTitle,
      backgroundColor: colourArray,
      data: data,
    },
  ]
  loadingSpinner.style.display = 'none'

  currentChart = new Chart('chart', {
    type: 'horizontalBar',
    data: {
      datasets: datasets,
      labels: labels,
    },
    options: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: chartTitle,
        fontColor: 'white',
        fontSize: window.innerWidth < 450 ? 10 : 16,
      },
      responsive: true,
      aspectRatio: 1.5,
      maintainAspectRatio: true,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              fontColor: 'white',
              fontSize: window.innerWidth < 450 ? 10 : 16,
            },
            gridLines: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
            scaleLabel: {
              display: true,
              labelString: yAxisLabel,
              fontColor: 'white',
              fontSize: window.innerWidth < 450 ? 10 : 16,
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              fontColor: 'white',
              fontSize: window.innerWidth < 450 ? 10 : 16,
            },
            gridLines: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
            scaleLabel: {
              display: true,
              labelString: xAxisLabel,
              fontColor: 'white',
              fontSize: window.innerWidth < 450 ? 10 : 16,
            },
          },
        ],
      },
    },
  })
}
