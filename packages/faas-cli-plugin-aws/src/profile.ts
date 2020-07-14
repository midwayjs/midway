/**
 * Github: https://github.com/serverless/serverless/blob/master/lib/plugins/aws/provider/awsProvider.js
 * TODO: rewrite this part
 */

import { EnvironmentCredentials, SharedIniFileCredentials } from 'aws-sdk';

const readline = require('readline');

/**
 * Determine whether the given credentials are valid.  It turned out that detecting invalid
 * credentials was more difficult than detecting the positive cases we know about.  Hooray for
 * whak-a-mole!
 * @param credentials The credentials to test for validity
 * @return {boolean} Whether the given credentials were valid
 */
export function validCredentials(credentials) {
  let result = false;
  if (credentials) {
    if (
      // check credentials
      (credentials.accessKeyId &&
        credentials.accessKeyId !== 'undefined' &&
        credentials.secretAccessKey &&
        credentials.secretAccessKey !== 'undefined') ||
      // a role to assume has been successfully loaded, the associated STS request has been
      // sent, and the temporary credentials will be asynchronously delivered.
      credentials.roleArn
    ) {
      result = true;
    }
  }
  return result;
}

/**
 * Add credentials, if present, to the given results
 * @param results The results to add the given credentials to if they are valid
 * @param credentials The credentials to validate and add to the results if valid
 */
export function addCredentials(results, credentials) {
  if (validCredentials(credentials)) {
    results.credentials = credentials; // eslint-disable-line no-param-reassign
  }
}

/**
 * Add credentials, if present, from the environment
 * @param results The results to add environment credentials to
 * @param prefix The environment variable prefix to use in extracting credentials
 */
export function addEnvironmentCredentials(results, prefix) {
  if (prefix) {
    const environmentCredentials = new EnvironmentCredentials(prefix);
    addCredentials(results, environmentCredentials);
  }
}

/**
 * Add credentials from a profile, if the profile and credentials for it exists
 * @param results The results to add profile credentials to
 * @param profile The profile to load credentials from
 */
export function addProfileCredentials(results, profile) {
  if (profile) {
    const params: any = { profile };
    if (process.env.AWS_SHARED_CREDENTIALS_FILE) {
      params.filename = process.env.AWS_SHARED_CREDENTIALS_FILE;
    }

    // Setup a MFA callback for asking the code from the user.
    params.tokenCodeFn = (mfaSerial, callback) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(`Enter MFA code for ${mfaSerial}: `, answer => {
        rl.close();
        callback(null, answer);
      });
    };

    const profileCredentials = new SharedIniFileCredentials(params);
    if (
      !(
        profileCredentials.accessKeyId ||
        profileCredentials.sessionToken ||
        (profileCredentials as any).roleArn
      )
    ) {
      throw new Error(`Profile ${profile} does not exist`);
    }

    addCredentials(results, profileCredentials);
  }
}

/**
 * Add credentials, if present, from a profile that is specified within the environment
 * @param results The prefix of the profile's declaration in the environment
 * @param prefix The prefix for the environment variable
 */
export function addEnvironmentProfile(results, prefix) {
  if (prefix) {
    const profile = process.env[`${prefix}_PROFILE`];
    addProfileCredentials(results, profile);
  }
}
