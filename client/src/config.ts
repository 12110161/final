// TODO_OK: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'cr9yvht4rk'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO_OK: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-2rsq89fb.us.auth0.com', // Auth0 domain
  clientId: 'IZRSnzFAKulIjBvKe0DhGE923HeXZwzm', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
