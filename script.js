const companies = [
  'foundersandcoders',
  'orangejellyfish',
  'tldraw',
  'policyinpractice',
  'soon_',
]

const orgName = 'foundersandcoders'

fetch(`https://api.github.com/orgs/${orgName}`)
  .then((response) => {
    if (response.status === 404) {
      throw new Error('Org not found')
    }
    return response.json() // Access the response using json() method
  })
  .then((org) => {
    console.log(`this is ${org.name}`)
  })

fetch(`https://api.github.com/orgs/${orgName}/members`)
  .then((response) => {
    if (response.status === 404) {
      throw new Error('Org not found')
    }
    return response.json() // Access the response using json() method
  })
  .then((members) => {
    members.forEach((member) => {
      console.log(member.login)
    })
  })
