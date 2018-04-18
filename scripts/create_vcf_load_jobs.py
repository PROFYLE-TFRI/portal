#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright © 2018 rgregoir <rgregoir@laurier>
#
# Distributed under terms of the MIT license.

"""create_vcf_load_jobs.py

Usage:
  create_vcf_load_jobs.py [--gemini <path>] <RAPid> <root>

Options:
  --gemini <path>  Specify gemini executable [default: gemini]
  -h --help        Show this screen
  --version        Show version

"""
from __future__ import division
from __future__ import print_function

import distutils.spawn
import os
import os.path
import re
import subprocess
import sys
import tty
import termios
from docopt import docopt


def main():
    arguments = docopt(__doc__, version='1.0')

    rap_id = arguments['<RAPid>']
    root = arguments['<root>']
    gemini = arguments['--gemini']

    print(bold('Root: ') + root)
    print()

    filesToLoad = []

    for dirname, _, filenames in os.walk(root):
        for filename in filenames:
            if filename.endswith('.vcf') and not some(filenames, lambda o: o == filename + '.db'):
                filesToLoad.append(os.path.join(dirname, filename))

    print(bold('Found %s files not loaded:' % str(len(filesToLoad))))
    print('\n'.join([' - ' + x for x in filesToLoad]))
    print()

    jobs_dir = os.path.join(os.getcwd(), 'jobs')

    if not os.path.isdir(jobs_dir):
        os.mkdir(jobs_dir)

    clear_files(jobs_dir)

    script_files = []
    # Create PBS run scripts
    for filepath in filesToLoad:
        script_id = make_id(root, filepath)
        script_file = os.path.join(jobs_dir, script_id + '.sh')
        script_content = create_script(script_id, rap_id, gemini, filepath)
        write_file(script_file, script_content)
        script_files.append(script_file)

    print(bold('Created job scripts at: ') + jobs_dir)
    print()

    if not distutils.spawn.find_executable(gemini):
        print(yellow(bold('Warning: ') +
            '`{gemini}` is not an executable file. Make sure it\'s in available before running the scripts.'.format(gemini=gemini)))

    if not distutils.spawn.find_executable('qsub'):
        print(red(bold('Error: ') +
                  '`qsub` is not an executable file. Can\'t launch jobs.'))
        exit(1)

    sys.stdout.write(bold(green('? ') + 'Queue jobs? ') + grey('(y/n) '))
    res = getchar()
    sys.stdout.write(res + '\n')
    print()

    if res != 'y':
        exit(0)

    job_ids, exceptions = queue_scripts(script_files)

    if len(exceptions) > 0:
        print(bold('Got %s exceptions while queueing jobs:' % red(str(len(exceptions)))))
        print('\n'.join([' - ' + red(repr(e)) for e in exceptions]))
        print()

    if len(job_ids) > 0:
        print(bold('Queued %s jobs:' % green(str(len(job_ids)))))
        print('\n'.join([' - ' + job_id for job_id in job_ids]))
        print()


def queue_scripts(script_files):
    job_ids = []
    exceptions = []
    for filepath in script_files:
        try:
            job_id, err = run(['qsub', filepath])
            if err:
                exceptions.append(err)
            else:
                job_ids.append(job_id)
        except Exception as exception:
            exceptions.append(exception)
    return (job_ids, exceptions)


def create_script(script_id, rap_id, gemini, vcf_file):
    tmp_file = vcf_file + '.part'
    output_file = vcf_file + '.db'
    return unindent("""#!/bin/bash
        #PBS -l nodes=1:ppn=16
        #PBS -l walltime=12:00:00
        #PBS -A {rap_id}
        #PBS -o {script_id}.output
        #PBS -e {script_id}.error
        #PBS -N {script_id}

        cd $PBS_O_WORKDIR

        if [ ! -f "{tmp_file}" ] && [ ! -f "{output_file}" ]
        then
            {gemini} load -v {vcf_file} {tmp_file}
            mv {tmp_file} {output_file}
        fi
    """.format(
        script_id=script_id,
        rap_id=rap_id,
        gemini=gemini,
        vcf_file=vcf_file,
        tmp_file=tmp_file,
        output_file=output_file
    ))


def clear_files(path):
    files = os.listdir(path)
    for filename in files:
        os.remove(os.path.join(path, filename))


def write_file(filepath, content):
    text_file = open(filepath, 'w')
    text_file.write(content)
    text_file.close()


def run(command):
    process = subprocess.Popen(command,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE,
                               stdin=subprocess.PIPE)
    out, err = process.communicate()
    return (out.strip(), err.strip())


def make_id(root, filename):
    return re.sub(r'[\\/*?:"<>|.]', '_', filename.replace(root + '/', ''))


def some(array, predicate):
    for element in array:
        if predicate(element):
            return True
    return False


def bold(string):
    return '\x1b[1m' + string + '\x1b[21m'


def green(string):
    return '\x1b[92m' + string + '\x1b[39m'


def red(string):
    return '\x1b[91m' + string + '\x1b[39m'


def yellow(string):
    return '\x1b[93m' + string + '\x1b[39m'


def grey(string):
    return '\x1b[90m' + string + '\x1b[39m'


def unindent(string):
    return re.sub(r'\n[ \t]+', '\n', string)


def getchar():
    # Returns a single character from standard input
    if not os.isatty(sys.stdin.fileno()):
        return ''
    file_descriptor = sys.stdin.fileno()
    old_settings = termios.tcgetattr(file_descriptor)
    try:
        tty.setraw(sys.stdin.fileno())
        character = sys.stdin.read(1)
    finally:
        termios.tcsetattr(file_descriptor, termios.TCSADRAIN, old_settings)
    return character


if __name__ == '__main__':
    main()
