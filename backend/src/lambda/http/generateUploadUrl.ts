import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { UpdateRequest } from '../../requests/UpdateRequest'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const logger = createLogger('TodosAccess')
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const updateTodo: UpdateRequest = JSON.parse(event.body)
    const contactId = event.pathParameters.contactId
    // TODO_OK: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event);
    const url = getUploadUrl(contactId);
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${contactId}.png`;

    try {
      await createAttachmentPresignedUrl(contactId, userId, url.split("?")[0], updateTodo);
      logger.info('Create attachmentUrl successfully', { attachmentUrl: attachmentUrl });
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          uploadUrl: url
        })
      }
    } catch (e) {
      logger.error('An error occurred updating an attachmentUrl', { error: e });
  }
})

function getUploadUrl(contactId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: contactId,
    Expires: parseInt(urlExpiration)
  })
}

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
