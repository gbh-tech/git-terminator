#!/usr/bin/env bun

import { Command } from 'commander';
import { terminator } from './src/utils/delete_tags';
import { description, version, name } from './package.json';

const command = new Command();

command
  .name(name)
  .description(description)
  .version(version)
  .requiredOption(
    '-t, --time <time>',
    'Time until a tag is considered stale in days',
    '365'
  )
  .requiredOption(
    '-o, --organization <organization>',
    'GitHub Organization'
  )
  .option(
    '-r, --repository <repository...>',
    'Minimum number of Tags to preserve',
    []
  )
  .option(
    '-n, --minimumTags <minimum>',
    'Minimum number of Tags to preserve',
    '10'
  )
  .option('--dry', 'Dry run command', false)
  .action((options) => {
    const daysUntilStale = options.time.trim();
    const org = options.organization.trim();
    const repositories = options.repository;
    const minTags = options.minimumTags.trim();
    const dry = options.dry;

    terminator(daysUntilStale, org, repositories, minTags, dry);
  });

command.parse();
