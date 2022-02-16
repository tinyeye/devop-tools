const { execSync } = require('child_process');
const { program } = require('commander');

program
  .name('pre-deploy')
  .description('CLI to help build images on AWS CodeBuild')
  .version('0.0.1')
  .requiredOption('-p, --project', '(required) Targeted project [BE|FE]')
  .requiredOption('-e, --env', '(required) Targeted environment [PRD|STG|DEV]')
  .showHelpAfterError()
  .parse();

let project = program.args[0].toUpperCase();
const env = program.args[1].toUpperCase();

if (project !== 'BE' && project !== 'FE') {
  throw new Error('Invalid project value.  Type `npm run build-image help` to get more info.');
}

if (env !== 'DEV' && env !== 'PRD' && env !== 'STG') {
  throw new Error('Invalid environment value. Type `npm run build-image help` to get more info.');
}

// grab the pods
const pods = execSync(`kubectl get pods`).toString();
// grab the pod name
let pod = '';
if (project === 'BE') {
  switch(env) {
    case 'DEV': pod = pods.match(/monarch-flask-dev-\w{9}-\w{5}/); break;
    case 'STG': pod = pods.match(/monarch-flask-staging-\w{10}-\w{5}/); break;
    case 'PRD': pod = pods.match(/monarch-flask-\w{10}-\w{5}/); break;
  }
} else if (project === 'FE') {
  switch(env) {
    case 'DEV': pod = pods.match(/dev-monarch-angular-\w{9}-\w{5}/); break;
    case 'STG': pod = pods.match(/staging-monarch-angular-\w{10}-\w{5}/); break;
    case 'PRD': pod = pods.match(/monarch-angular-\w{10}-\w{5}/); break;
  }
}

console.log('');
if (!pod || pod === '') {
  console.log('Could not find pod! You might need to fix the regular expressions');
} else {
  pod = pod[0];
  let image = execSync(`kubectl describe pods ${pod} | findstr /r /c:"Image:"`).toString();
  image = image.match(/^[\s]+Image:[\s]+(.+)/);
  console.log(`Pod: ${pod}`);
  console.log('Old Image: ' + (image && image.length > 0 ? image[1] : 'no image found'));
  console.log('New Image: Visit AWS Console to grab the new image\n\thttps://us-east-2.console.aws.amazon.com/codesuite/codebuild/projects?region=us-east-2');
}
console.log(`\n--DONE!`);