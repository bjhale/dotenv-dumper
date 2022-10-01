#!/usr/bin/env node
const { parse, serialize } = require('dotenv-parser-serializer');
const removeEmptyLines = require('remove-blank-lines');

const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } =  require('yargs/helpers');
const argv = yargs(hideBin(process.argv))
    .usage("$0 --prefix=APPCONFIG_ --template=.env.example")
    .option('prefix',{
        alias: 'p',
        describe: 'Includes environment variables that being with prefix, can be passed more than once to include multiple prefixes.',
        type: 'string',
    })
    .option('template',{
        alias: 't',
        describe: 'Includes dotenv file as a template, can be passed more than once to include multiple templates.',
        type: 'string'
    })
    .option('required', {
        alias: 'r',
        describe: 'Requires a specific variable to exist in the environment, can be passed more than once to require multiple variables.',
        type: 'string'
    })
    .argv;

const envprefix = argv.prefix;
const template = argv.template;
const required = argv.required;

String.prototype.startsWithArray = function (array) {
    if(Array.isArray(array)) {
        return array.some(searchString => this.startsWith(searchString));
    } else {
        return this.startsWith(array);
    }
}

String.prototype.replaceArray = function(array, sub) {
    if(Array.isArray(array)) {
        for( const element of array) {
            if(this.startsWith(element)){
                return this.replace(element,sub);
            }
        }
    } else {
        return this.replace(array, sub);
    }
}

Array.prototype.includesArray = function (array) {
    if(Array.isArray(array)) {
        for(const element in array) {
            if(!this.includes(element)) {
                return false;
            }
        }
        return true;
    } else {
        return this.includes(array);
    }
}

let env = process.env;

if(required) {
    const envKeys = Object.keys(env);
    if(!(envKeys.includesArray(required))){
        process.stderr.write("Required Variable Missing" + "\n");
        process.exit(1);
    }
}

if(envprefix) {
    env = Object.fromEntries(Object.entries(env).filter(([key]) => key.startsWithArray(envprefix)));
    for( const property in env) {
        const newKey = property.replaceArray(envprefix,'');
        delete Object.assign(env, { [newKey]: env[property] })[property];
    }
}

if(template) {
    let templateEnv = {};
    if(Array.isArray(template)){
        for(const element of template) {
            templateEnv = {
                ...templateEnv,
                ...parse(fs.readFileSync(element, { encoding: "utf8" }))
            }
        }
    } else {
        templateEnv = parse(fs.readFileSync(template,{encoding: "utf8"}));
    }
    env = {
        ...templateEnv,
        ...env
    }
}

const dotenvString = serialize(env);

process.stdout.write(removeEmptyLines(dotenvString) + "\n");