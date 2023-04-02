const companies = [
  '',
  'foundersandcoders',
  'orangejellyfish',
  'tldraw',
  'policy-in-practice',
  'thisissoon',
]
const container = document.getElementById('company-container')

const fetchCompanyInfo = (company) => {
  return new Promise((resolve, reject) => {
    fetch(`https://api.github.com/orgs/${company}`)
      .then((response) => {
        if (response.status === 404) {
          throw new Error('Org not found')
        }
        return response.json()
      })
      .then((org) => {
        const {
          name,
          description,
          followers,
          location,
          email,
          public_repos,
          twitter_username,
          blog,
        } = org
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
        resolve(companyInfo)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

Promise.all(companies.slice(1).map((company) => fetchCompanyInfo(company)))
  .then((companyInfoArray) => {
    companyInfoArray.forEach((company) => {
      const card = document.createElement('div')
      card.className = 'card'
      const h1 = document.createElement('h2')
      h1.textContent = company.name
      card.appendChild(h1)

      Object.keys(company).forEach((key) => {
        if (key !== 'name' && company[key] !== null) {
          const p = document.createElement('p')
          p.className = key
          if (key === 'twitter_username') {
            const i = document.createElement('i')
            i.className = 'fab fa-twitter'
            const a = document.createElement('a')
            a.href = `https://twitter.com/${company[key]}`
            a.target = '_blank'
            a.rel = 'noopener noreferrer'
            const span = document.createElement('span')
            span.textContent = ` @${company[key]}`
            a.appendChild(i)
            a.appendChild(span)
            p.appendChild(a)
          } else if (key === 'blog') {
            const a = document.createElement('a')
            a.href = `${company[key]}`
            a.target = '_blank'
            a.rel = 'noopener noreferrer'
            const span = document.createElement('span')
            span.textContent = ` 🔗 Website`
            a.appendChild(span)
            p.appendChild(a)
          } else if (typeof company[key] === 'number') {
            p.textContent = `${key}: ${company[key]}`
          } else {
            p.textContent = `${company[key]}`
          }
          card.appendChild(p)
        }
      })

      container.appendChild(card)
    })
  })
  .catch((error) => {
    console.error(error)
  })

const fetchUserInfo = (company, page = 1, perPage = 80) => {
  const apiUrl = `https://api.github.com/orgs/${company}/members?page=${page}&per_page=${perPage}`
  return new Promise((resolve, reject) => {
    fetch(apiUrl)
      .then((response) => {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        return response.json()
      })
      .then((users) => {
        const companyUserInfos = users.map((user) => {
          const {login, avatar_url, url} = user
          return {
            login,
            avatar_url,
            url,
          }
        })
        resolve(companyUserInfos)
      })
      .catch((error) => {
        console.error(error)
        reject(error)
      })
  })
}

fetchUserInfo('foundersandcoders', 1, 80)

Promise.all(
  companies.slice(1).map((company) => fetchUserInfo(company, 1, 80))
).then((userInfoArray) => {
  console.log(userInfoArray)
})
