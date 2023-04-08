import {key} from './.gitignore/key.js'
import {Octokit} from 'https://cdn.skypack.dev/@octokit/rest'

const octokit = new Octokit({
  auth: key,
})

///delete your art

const searchInput = document.getElementById('search')
const results = document.getElementById('results')
const loadingSpinner = document.getElementById('loading')

const gitNames = async () => {
  const username = searchInput.value
  loadingSpinner.style.display = 'block'

  const nameResponse = await octokit.rest.search.users({
    q: `${username} in:login`,
  })
  const data = nameResponse.data
  let searchResult = ''
  data.items.forEach((item) => {
    searchResult += `<div class="search-result" data-username="${item.login}">${item.login}</div>`
  })
  loadingSpinner.style.display = 'none'

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
    await getChartData(username) // function to create the chart
  }
}

const getChartData = async (username) => {
  const canvas = document.getElementById('chart')
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)

  loadingSpinner.style.display = 'block'

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
  loadingSpinner.style.display = 'none'

  currentChart = new Chart('chart', {
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
}

searchInput.addEventListener('keydown', searchfunction)
results.addEventListener('click', getUserData)
