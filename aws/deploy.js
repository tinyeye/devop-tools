const fs = require('fs');
const { program } = require('commander');
const utils = require('./utils');

program
  .name('deploy')
  .description('CLI to help safely deploy images')
  .version('0.0.1')
  .requiredOption('-p, --project', '(required) Targeted project [BE|FE]')
  .requiredOption('-e, --env', '(required) Targeted environment [PRD|STG|DEV]')
  .requiredOption('-i, --image', '(required) Image to be deployed')
  .option('-d, --dry-run', 'No image will be deployed! The deployment file will be created and the command line will be printed out')
  .showHelpAfterError()
  .parse();

const options = program.opts();
if (options.dryRun) {
  console.log('--- DRY RUN ---');
}

let project = program.args[0].toUpperCase();
const env = program.args[1].toUpperCase();
const image = program.args[2];

if (project !== 'BE' && project !== 'FE') {
  throw new Error('Invalid project value.  Type `npm run build-image help` to get more info.');
}

if (env !== 'DEV' && env !== 'PRD' && env !== 'STG') {
  throw new Error('Invalid environment value. Type `npm run build-image help` to get more info.');
}

let deploymentFile = '';
if (project === 'BE') {
  if (!image.includes('monarch-flask:')) {
    throw new Error('Wrong Backend Image!');
  }

  switch(env) {
    case 'DEV':
      // example: 862150331066.dkr.ecr.us-east-2.amazonaws.com/monarch-flask:dev-01.2022.01.25.221821
      if (!image.includes(':dev-'))
        throw new Error('Wrong Image Environment');
      deploymentFile = 'be-kube-files/kube-deployment-dev.yaml';
      break;

    case 'STG':
      // example: 862150331066.dkr.ecr.us-east-2.amazonaws.com/monarch-flask:staging-01.2022.02.08.211317
      if (!image.includes(':staging-'))
        throw new Error('Wrong Image Environment');
      deploymentFile = 'be-kube-files/kube-deployment-staging.yaml';
      break;

    case 'PRD':
      // example: 862150331066.dkr.ecr.us-east-2.amazonaws.com/monarch-flask:01.2022.02.08.210806
      if (image.includes(':staging-') || image.includes(':dev-'))
        throw new Error('Wrong Image Environment');
      deploymentFile = 'be-kube-files/kube-deployment.yaml';
      break;
  }
} else if (project === 'FE') {
  if (!image.includes('monarch-angular:')) {
    throw new Error('Wrong Frontend Image!');
  }

  switch(env) {
    case 'DEV':
      // example: 862150331066.dkr.ecr.us-east-2.amazonaws.com/monarch-angular:dev-0.1.2022.01.25.221746
      if (!image.includes(':dev-'))
        throw new Error('Wrong Image Environment');
      deploymentFile = 'fe-kube-files/kube-dev-deploy.yaml';
      break;

    case 'STG':
      // example: 862150331066.dkr.ecr.us-east-2.amazonaws.com/monarch-angular:stage-0.1.2022.02.08.211025
      if (!image.includes(':stage-'))
        throw new Error('Wrong Image Environment');
      deploymentFile = 'fe-kube-files/kube-staging-deploy.yaml';
      break;

    case 'PRD':
      // example: 862150331066.dkr.ecr.us-east-2.amazonaws.com/monarch-angular:0.1.2022.02.02.235545
      if (image.includes(':stage-') || image.includes(':dev-'))
        throw new Error('Wrong Image Environment');
      deploymentFile = 'fe-kube-files/kube-deployment.yaml';
      break;
  }
}

// update the appropriate file
let fileContent = fs.readFileSync(`./aws/${deploymentFile}`, {encoding:'utf8', flag:'r'});
// update the Image URI
fileContent = fileContent.replace(/<image URI>/, image);
// save the file into the deployment-history folder
const newDeploymentFileName = `${project}-${env}-Deployment-${new Date().getTime()}.yaml`;

// deploy
if (options.dryRun) {
  // generate the file
  fs.writeFileSync(`./aws/deployment-history/DRY-${newDeploymentFileName}`, fileContent, {encoding: "utf8"});
  // output the command to console
  console.log(`kubectl apply -f ./aws/deployment-history/DRY-${newDeploymentFileName}`);
} else {
  // generate the file
  fs.writeFileSync(`./aws/deployment-history/${newDeploymentFileName}`, fileContent, {encoding: "utf8"});
  // run the command
  utils.execute_command(`kubectl apply -f ./aws/deployment-history/${newDeploymentFileName}`);
}