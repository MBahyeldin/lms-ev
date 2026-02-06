import { Client } from "@microsoft/microsoft-graph-client"
import "isomorphic-fetch"
import dotenv from "dotenv"
import { ConfidentialClientApplication } from "@azure/msal-node"

dotenv.config()

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: process.env.CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    clientSecret: process.env.CLIENT_SECRET!
  }
})

let accessToken: string | null = null;

export default async function getClient() {
    const client = await cca.acquireTokenByClientCredential({
        scopes: ["https://graph.microsoft.com/.default"]
    })
   
    return Client.init({
        authProvider: (done) => {
            if (client && client.accessToken) {
                accessToken = client.accessToken;
                done(null, accessToken);
            } else {
                done("Could not get access token", null);
            }
        }
    });
}
