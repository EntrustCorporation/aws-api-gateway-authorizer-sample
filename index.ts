import type { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent, PolicyDocument } from "aws-lambda";
import type { APIGatewayTokenAuthorizerHandler } from "aws-lambda/trigger/api-gateway-authorizer";
import { config } from "dotenv";
import { createRemoteJWKSet, jwtVerify } from "jose";

config();
const JWKS_URL = process.env.JWKS_URI;
const AUDIENCE = process.env.AUDIENCE;
const ISSUER = process.env.ISSUER;

export const handler: APIGatewayTokenAuthorizerHandler = async (
  event: APIGatewayTokenAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  const { authorizationToken, methodArn } = event;

  if (!(JWKS_URL && AUDIENCE && ISSUER)) {
    throw new Error("Misconfigured environment variables");
  }

  const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

  // Expecting the authorization token to be in the form <Bearer authToken>
  const stringTokens = authorizationToken.split(" ");
  if (stringTokens.length !== 2 || stringTokens[0] !== "Bearer") {
    throw new Error("Invalid token format - does not match <Bearer authToken>");
  }

  try {
    // Verify the access token
    const jwtVerifyResult = await jwtVerify(authorizationToken, JWKS, {
      audience: process.env.AUDIENCE,
      issuer: process.env.ISSUER,
    });

    return {
      principalId: jwtVerifyResult.payload.sub ?? "unknown",
      policyDocument: generatePolicyDocument(methodArn, "Allow"),
    };
  } catch (e) {
    throw new Error("Invalid token");
  }
};

const generatePolicyDocument = (resource: string, effect: string): PolicyDocument => {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  };
};
