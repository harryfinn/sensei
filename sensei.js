#!/usr/bin/env node

require('shelljs-plugin-ssh');

const program = require('commander'),
      shell = require('shelljs');

program
  .version('0.0.1')
  .command('add <site>')
  .option('--ssh <ssh connection>', 'ssh details to connect with i.e. www-data@xxx.xxx.xxx.xxx')
  .option('--wp-path <path to wordpress installation', 'define the path to your wordpress install i.e. /var/www/html')
  .action(function(site, options) {
    console.log('Add a site called: ' + site, options.ssh, options.wpPath);

    let error = false;

    if(options.ssh === undefined) {
      console.log('Please define the ssh connection details with the `--ssh` flag');
      error = true;
    }

    if(options.wpPath === undefined) {
      console.log('Please define the WordPress Installation Path with the `--wp-path` flag');
      error = true;
    }

    if(error) {
      console.error('Missing option(s) detected. Please ensure that you have set values for `--ssh` & `--wp-path`');
      process.exit(1);
    }

    const newSite = `${site}:${options.ssh}:${options.wpPath}`;

    if(shell.exec(`echo "${newSite}" >> $HOME/.sensei`).code !== 0) {
      console.error('Sorry there was an issue adding this site to Sensei');
      process.exit(1);
    } else {
      console.log(`Successfully added ${site} to Sensei!`);
      console.log('Testing SSH connection...');

      let { out, error } = shell.ssh(
        options.ssh,
        `cd ${options.wpPath} && pwd`,
        { promptPassword : true }
      );

      out = out.replace(/\s/g, '');

      if(out === options.wpPath) {
        console.log('Success!');
      } else {
        console.error('Error connecting to the server. Please ensure that your details are correct and try again.');
      }
    }
  });

program.parse(process.argv);
