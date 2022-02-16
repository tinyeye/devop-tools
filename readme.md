# AWS Tools
## Building AWS Image
To build an AWS Image, you need to grab the PR's number and then run the command. To learn more about the command, run: `node ./aws/build --help`

## Pre Deployment Tasks
The current deployment process requires some pre-deployment preparation. This script should help speed up the process. Here is the list of things needed:
  * The old Image tag - just in case we needed to revert the deployment.
  * The new Image tag - unfortunately I couldn't find an AWS command line that helps with this task. So far, this needs to be manual.

To learn more about the usage of this script, run: `node ./aws/pre-deploy --help`

## Deploying AWS Image
To deploy an image, you need to grab the new Image tag from CodeBuild. To learn more about the usage of this script, run: `node ./aws/deploy --help`

## Post Deployment Tasks
**TODO:** A new script can be built to update the app_version table to include the new tags.