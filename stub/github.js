const nock = require('nock')

const accessToken = nock('https://github.com')
  .post('/login/oauth/access_token')
  .reply(200, {
    scope: 'repo,user:email',
    token_type: 'bearer',
    access_token: 'tttttttttttttttttttttttttttttttttttttttt'
  })

const user = nock('https://api.github.com')
  .get('/user')
  .reply(200, {
    updated_at: '2018-02-19T16:38:33Z',
    created_at: '2012-02-05T17:28:45Z',
    following: 3,
    followers: 3,
    public_gists: 1,
    public_repos: 77,
    bio: null,
    hireable: null,
    email: null,
    location: null,
    blog: '',
    company: null,
    name: 'Thomas Guillet',
    site_admin: false,
    type: 'User',
    received_events_url: 'https://api.github.com/users/great-user/received_events',
    events_url: 'https://api.github.com/users/great-user/events{/privacy}',
    repos_url: 'https://api.github.com/users/great-user/repos',
    organizations_url: 'https://api.github.com/users/great-user/orgs',
    subscriptions_url: 'https://api.github.com/users/great-user/subscriptions',
    starred_url: 'https://api.github.com/users/great-user/starred{/owner}{/repo}',
    gists_url: 'https://api.github.com/users/great-user/gists{/gist_id}',
    following_url: 'https://api.github.com/users/great-user/following{/other_user}',
    followers_url: 'https://api.github.com/users/great-user/followers',
    html_url: 'https://github.com/great-user',
    url: 'https://api.github.com/users/great-user',
    gravatar_id: '',
    avatar_url: 'https://avatars0.githubusercontent.com/u/1410356?v=4',
    id: 1410356,
    login: 'great-user'
  })

module.exports = {
  accessToken: accessToken,
  user: user
}
