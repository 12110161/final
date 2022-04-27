import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJUy3C1vy/gx3qMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi0ycnNxODlmYi51cy5hdXRoMC5jb20wHhcNMjIwNDE3MDc1NDM4WhcN
MzUxMjI1MDc1NDM4WjAkMSIwIAYDVQQDExlkZXYtMnJzcTg5ZmIudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxRgY1lWGaE7IyUA1
6T+fHZKC7VwhwW5X/JxS7950vyFp+RfNWOv8H/MgnZJzuE3GzNYboRwWweYzbAq1
RTrXS07BYTxgIw5H2yS693TKDSYSXb/Nw6tEIiDHGE8ET6IEXfhuCIXsz3EHG5W1
uCn2HEQhCFommq9+xTzwXg+Uk1JzyjWns0trsNNmAJpgpkVjHGFdBcVsvQpS0Oqu
zJKt2TbIKnm27bbz7WFRAqWHM8KVLay++G3SOVU58Y8vMgdcysenn7u/mm/fom+7
8Q23AkQ9E+77Jy6AJccXMheq6l0wSZOlAFiPL4K3JNRXdE0fQ07OZ5vnE3Bsajll
9n4V+QIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS+sj5CsGcT
v9k6Z69jhg1UvwZ9gDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AJN41DN60rmQidkn6H7XBp5fUdnpp6oZwmhvlzQv6N5zf+1AmRKRHlLOh1qJksox
+RytvaQBwLC0/cjxA+vLi7CPWc91QzVKd+gMpZOI32svwFcTB8IeFAsYCMtUVAPA
h1J4HEXzWpYKArJNMgSK/ty4DCrNgyTXMFp1i0kLRh182PXRDPy3/8R4IvWfhLlL
rzPpf1Wpb6lTTv8QMPJSevcKZxB7ON9JeorO2oFJNXY3HpT3f4HAN2Y+I/pq5J3Z
xorP1xUuAHPJgDvpdq6H0I0wKykC9WGwnEQrPCFmNllAM+oFcR9DZ+2msTn0m5zg
2JUR06YKIxdXE/KPi3068Ew=
-----END CERTIFICATE-----`

// TODO_OK: Provide a URL that can be used to download a certificate that can be used to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-2rsq89fb.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO_OK: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const jwtPayload:JwtPayload = verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  
  return jwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
