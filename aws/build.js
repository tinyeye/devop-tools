const { program } = require('commander');
const utils = require('./utils');

program
  .name('build')
  .description('CLI to help build images on AWS CodeBuild')
  .version('0.0.1')
  .requiredOption('-p, --project', '(required) Targeted project [BE|FE]')
  .requiredOption('-e, --env', '(required) Targeted environment [PRD|STG|DEV]')
  .requiredOption('-pr, --pull-request', '(required) ID of the source pr to use for the build')
  .option('-d, --dry-run', 'No image will be deployed! The deployment file will be created and the command line will be printed out')
  .showHelpAfterError()
  .parse();

const options = program.opts();
if (options.dryRun) {
  console.log('--- DRY RUN ---');
}

let project = program.args[0].toUpperCase();
const env = program.args[1].toUpperCase();
const pr = program.args[2];

if (project !== 'BE' && project !== 'FE') {
  throw new Error('Invalid project value.  Type `npm run build-image help` to get more info.');
}

if (env !== 'DEV' && env !== 'PRD' && env !== 'STG') {
  throw new Error('Invalid environment value. Type `npm run build-image help` to get more info.');
}

if (isNaN(pr)) {
  throw new Error('Invalid PR number. Type `npm run build-image help` to get more info.');
}

if (project === 'BE') {
  switch(env) {
    case 'DEV': project = 'monarch-api--dev'; break;
    case 'STG': project = 'monarch-api-staging'; break;
    case 'PRD': project = 'monarch-api'; break;
  }
} else if (project === 'FE') {
  switch(env) {
    case 'DEV': project = 'monarch-angular-dev'; break;
    case 'STG': project = 'monarch-angular-staging'; break;
    case 'PRD': project = 'monarch-angular'; break;
  }
}

if (options.dryRun) {
  console.log(`aws codebuild start-build --project-name ${project} --source-version pr/${pr}`);
} else {
  utils.execute_command(`aws codebuild start-build --project-name ${project} --source-version pr/${pr}`);
}
console.log('');
