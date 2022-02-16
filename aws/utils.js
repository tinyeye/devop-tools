const { exec } = require('child_process');

function execute_command(cmd, stdoutHandler=null) {
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }

    if (!stdoutHandler)
      console.log(`stdout: ${stdout}`);
    else
      stdoutHandler(stdout);
  });
}

module.exports = {
  execute_command
}