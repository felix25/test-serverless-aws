# Test swapi in  Serveless API

## Setup

### Installing dependencies
1. `npm install -g serverless`
2. `npm install`

### Credentials
For a more permanent solution you can also set up credentials through AWS profiles.

`sls config credentials --provider aws --key <key> --secret <secret>`

Take a look at the
[`config` CLI reference](https://github.com/serverless/serverless/blob/fb7324d271ed663a1dcd8cc93241fc6bf6726812/docs/providers/aws/cli-reference/config-credentials.md)
for more information about credential settings.

### invoke

## GET

>https://6li64h6nc3.execute-api.us-east-2.amazonaws.com/dev/list/all

## POST

>https://6li64h6nc3.execute-api.us-east-2.amazonaws.com/dev/star-wars/create

>Request
```
{
  "page": 1 
}
```