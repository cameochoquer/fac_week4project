const companies = [
  '',
  'foundersandcoders',
  'orangejellyfish',
  'tldraw',
  'policy-in-practice',
  'thisissoon',
]

// const selectElement = document.getElementById('companies')

const createNewCard = (company) => {
  const cardTemplate = document.getElementById('company-card')
  const card = cardTemplate.content.cloneNode(true)
  card.querySelector('h1').textContent = company
}

// companies.forEach((company) => {
//   const optionElement = document.createElement('option')
//   optionElement.innerText = company
//   selectElement.appendChild(optionElement)
// })

function fetchCompanyInfo(company) {
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
        } = org
        const companyInfo = {
          name,
          description,
          followers,
          location,
          email,
          public_repos,
          twitter_username,
        }
        resolve(companyInfo)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
const container = document.getElementById('company-container')

Promise.all(companies.slice(1).map((company) => fetchCompanyInfo(company)))
  .then((companyInfoArray) => {
    companyInfoArray.forEach((company) => {
      const card = document.createElement('div')
      card.className = 'card'
      const h1 = document.createElement('h1')
      h1.textContent = company.name
      card.appendChild(h1)

      Object.keys(company).forEach((key) => {
        if (key !== 'name' && company[key] !== null) {
          const p = document.createElement('p')
          p.textContent = `${key}: ${company[key]}`
          card.appendChild(p)
        }
      })

      container.appendChild(card)
      console.log(company)
    })
  })
  .catch((error) => {
    console.error(error)
  })
