import {key} from './.gitignore/key.js'
import {Octokit} from 'https://cdn.skypack.dev/@octokit/rest'
const octokit = new Octokit({
  auth: key,
})

///
const companies = [
  'foundersandcoders',
  'orangejellyfish',
  'tldraw',
  'policy-in-practice',
  'thisissoon',
]
const container = document.getElementById('company-container')

const fetchCompanyInfo = (company) => {
  return octokit.orgs
    .get({
      org: company,
    })
    .then(({data}) => {
      const {
        name,
        description,
        followers,
        location,
        email,
        public_repos,
        twitter_username,
        blog,
      } = data
      const companyInfo = {
        name,
        description,
        followers,
        location,
        email,
        public_repos,
        twitter_username,
        blog,
      }
      return companyInfo
    })
    .catch((error) => {
      console.error(error)
      throw new Error('Org note found')
    })
}

const fetchMemberInfo = (company, page = 1, perpage = 80) => {
  return octokit.orgs
    .listMembers({
      org: company,
      per_page: perpage,
      page: page,
    })
    .then(({data}) => {
      const companyMemberInfos = data.map((member) => {
        const {login, avatar_url, html_url} = member
        return {login, avatar_url, html_url}
      })
      return companyMemberInfos
    })
    .catch((error) => {
      console.error(error)
      throw new Error('User not found')
    })
}

Promise.all(companies.map((company) => fetchCompanyInfo(company)))
  .then((companyInfoArray) => {
    companyInfoArray.forEach((company, index) => {
      const card = document.createElement('div')
      card.className = 'card'
      const h1 = document.createElement('h2')
      h1.textContent = company.name
      card.appendChild(h1)
      //create p element for each key and change formatting based on key
      Object.keys(company).forEach((key) => {
        if (key !== 'name' && company[key] !== null) {
          const p = document.createElement('p')
          p.className = key
          //twitter icon
          if (key === 'twitter_username') {
            const i = document.createElement('i')
            i.className = 'fab fa-twitter'
            const a = document.createElement('a')
            a.href = `https://twitter.com/${company[key]}`
            a.target = '_blank'
            a.rel = 'noopener noreferrer'
            const twitterHandle = document.createElement('span')
            twitterHandle.textContent = ` @${company[key]}`
            a.appendChild(i)
            a.appendChild(twitterHandle)
            p.appendChild(a)
            //hyperlink to website
          } else if (key === 'blog') {
            const a = document.createElement('a')
            a.href = `${company[key]}`
            a.target = '_blank'
            a.rel = 'noopener noreferrer'
            const span = document.createElement('span')
            span.textContent = ` 🔗 Website`
            a.appendChild(span)
            p.appendChild(a)
            //if it's a number, make sure to inclue the key in the text
          } else if (typeof company[key] === 'number') {
            p.textContent = `${key}: ${company[key]}`
          } else {
            p.textContent = `${company[key]}`
          }
          card.appendChild(p)
        }
      })

      // Get user information for this company (max pagination to 80)
      fetchMemberInfo(companies[index], 1, 80)
        .then((userInfo) => {
          if (userInfo.length > 0) {
            // If the company has more than 0 users, add a button to show/hide user information
            const showMembersButton = document.createElement('button')
            showMembersButton.className = 'show-members'
            showMembersButton.textContent = 'Show Members'
            showMembersButton.addEventListener('click', () => {
              userDiv.style.display =
                userDiv.style.display === 'none' ? 'block' : 'none'
              showMembersButton.textContent =
                showMembersButton.textContent === 'Show Members'
                  ? 'Hide Members'
                  : 'Show Members'
            })
            card.appendChild(showMembersButton)
          }

          // Create a div to hold user information
          const userDiv = document.createElement('div')
          userDiv.className = 'user-info'
          userDiv.style.display = 'none'
          card.appendChild(userDiv)

          // Create a link for each user and append it to the userDiv
          userInfo.forEach((user) => {
            const Member = document.createElement('p')
            const linkToProfile = document.createElement('a')
            linkToProfile.href = `${user.html_url}`
            linkToProfile.target = '_blank'
            linkToProfile.rel = 'noopener noreferrer'
            const githubName = document.createElement('span')
            githubName.textContent = ` ${user.login}`
            linkToProfile.appendChild(githubName)
            Member.appendChild(linkToProfile)
            userDiv.appendChild(Member)
          })
        })
        .catch((error) => {
          console.error(error)
        })

      container.appendChild(card)
    })
  })
  .catch((error) => {
    console.error(error)
  })

const username = 'cameochoquer'
const response = await octokit.repos.listForUser({
  username: username,
})
let allRepoNames = []

for (const repo of response.data) {
  allRepoNames.push(repo.name)
}

allRepoNames.forEach(async (repoName) => {
  const response = await octokit.repos.listCommits({
    owner: username,
    repo: repoName,
  })
  const commitCount = response.data.length
  console.log(`Repository ${repoName} has ${commitCount} commits.`)
})
