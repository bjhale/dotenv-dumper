#!/usr/bin/env node
const dotenv = require('dotenv-parser-serializer');
const removeEmptyLines = require('remove-blank-lines');

const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } =  require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const envprefix = argv.prefix;
const template = argv.template;

let env = process.env;

if(envprefix) {
    env = Object.fromEntries(Object.entries(env).filter(([key]) => key.includes(envprefix)));
    for( const property in env) {
        const newKey = property.replace(envprefix,'');
        delete Object.assign(env, { [newKey]: env[property] })[property];
    }
}

if(template) {
    const templateEnv = dotenv.parse(fs.readFileSync(template,{encoding: "utf8"}));
    env = {
        ...templateEnv,
        ...env
    }
}

const dotenvString = dotenv.serialize(env);

process.stdout.write(removeEmptyLines(dotenvString));