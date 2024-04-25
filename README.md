# AWS API Gateway Custom JWT Authorizer

A [custom authorizer for AWS REST API Gateways](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) 
that will authorize requests to protected endpoints by validating a signed JWT access token. The token should be included
in the `Authorization` header in requests to the API in the form `Bearer accessToken`, and will be validated using the public
key available at the configured JWKS endpoint.

## Prerequisites

You will need:
- An AWS account
- A token issuer (e.g. an IDaaS account with an OIDC application)

When using an IDaaS OIDC application, ensure that the appropriate APIs/URLs resource servers have been configured as well.

## Setup

Install dependencies:
```
bun i
```
Build the sample code:
```
bun run build
```

## Testing Locally

1. Obtain a valid JWT access token from IDaaS for the relevant audience.
2. Create a local event.json file containing the access token. You can use `sample-event.json` as a template:

    ```
    cp sample-event.json event.json
    ```
    Add your JWT token to `authorizationToken`. You can also replace `methodArn` with a method ARN of your API that you 
    intend to protect (optional for local tests).

3. Create a local .env file containing the `JWKS_URI`, `ISSUER`, and `AUDIENCE`. You can use `.sample-env` as a template:

    ```
    cp .sample-env .env
    ```

    | Parameter  | Value                                                                                                      |
    |------------|------------------------------------------------------------------------------------------------------------|
    | `ISSUER`   | The issuer of the token. If IDaaS is the token issuer, use `https://{yourIdaasDomain}/api/oidc`.           |
    | `JWKS_URI` | The URL of the JWKS endpoint. If IDaaS is the token issuer, use `https://{yourIdaasDomain}/api/oidc/jwks`. |
    | `AUDIENCE` | The URL of the domain of the endpoint you are trying to secure. E.g. `https://{yourApiGateway}`.           |

4. Run the test using `bun run test`. If successful, you should see an output similar to the following:
    ```
    info: START RequestId: 3df095ef-8876-c996-919f-cca592e01a62
    info: End - Result:
    info: {
            "principalId": "userId",
            "policyDocument": {
                    "Version": "2012-10-17",
                    "Statement": [
                            {
                                    "Action": "execute-api:Invoke",
                                    "Effect": "Allow",
                                    "Resource": "arn:aws:execute-api:us-east-1:1234567890:apiId/stage/method/resourcePath"
                            }
                    ]
            }
    }
    info: Lambda successfully executed in 316ms.
    ```

## Deploying Sample to AWS
To use this sample to protect your AWS REST API Gateway:
1. Bundle the sample code into an upload-able zip by running `bun run bundle`. It will be located in the `/dist` directory.
2. Navigate to the [AWS Lambda console](https://console.aws.amazon.com/lambda), and click **Create function**.
3. The default should be **Author from scratch** to create a blank function. Under **Basic information**, provide values
   for the following parameters:
 
   | Parameter     | Value                                                          |
   |---------------|----------------------------------------------------------------|
   | Function Name | A name for your Lambda function, such as `jwtCustomAuthorizer` |
   | Runtime       | Select `Node.js 20.x`                                          |

4. Click **Create Function** to continue.
5. On the **Code** page of your function, select the **Upload From** dropdown menu and select **.zip file**.
6. Click **Upload** and select the `token-authorizer.zip` bundle you created earlier.
7. Then creat the following three **Environment variables**. Note that this information is identical to the contents of
   `.env` file:

   | Parameter  | Value                                                                                                      |
   |------------|------------------------------------------------------------------------------------------------------------|
   | `ISSUER`   | The issuer of the token. If IDaaS is the token issuer, use `https://{yourIdaasDomain}/api/oidc`.           |
   | `JWKS_URI` | The URL of the JWKS endpoint. If IDaaS is the token issuer, use `https://{yourIdaasDomain}/api/oidc/jwks`. |
   | `AUDIENCE` | The URL of the domain of the endpoint you are trying to secure. E.g. `https://{yourApiGateway}`.           |

8. To test the Lambda function you just created, click the **Test** tab.
9. Copy the contents of your `event.json` file into the **Event JSON** form. You can use the default "Hello World" event
   template. The `methodArn` *must* be set to a valid method ARN in your gateway.
10. Click **Save**.
11. Run your test by selecting it and clicking **Test**. If the test was successful, you'll see: "Execution result:
    succeeded". Expanding the output window should show a message similar to the one you received after your successful
    local test.

## Next Steps

### Scope Limited Access
After adding this custom authorizer to protect your AWS API Gateway endpoints, you might want to limit access to individual
endpoints based on the allowed scopes of the authorized party (e.g. `read:resource`). To do this, leverage the `authorizationScopes`
property of each gateway method to define the scopes required to invoke the method.