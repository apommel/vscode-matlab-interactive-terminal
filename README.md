# Matlab Interactive Terminal for Visual Studio Code

Matlab Interactive Terminal is an extension for Visual Studio Code that allows users to launch Matlab scripts and have a working Matlab REPL directly included in Visual Studio Code. This extension uses the Matlab Engine for Python which must be correctly set up for the extension to work.

## Requirements

- **Python** x64 3.6 or 3.7 (added to path), available [here](https://www.python.org/downloads/)  or through other distributions such as [Anaconda](https://www.anaconda.com/distribution/)
- **MATLAB** R2014b (Matlab 8.4) or higher
- **MATLAB Engine API for Python**, installations instructions are available [here](https://www.mathworks.com/help/matlab/matlab_external/install-the-matlab-engine-for-python.html)

More informations about MATLAB-Python compatibility are available on [MathWorks website](https://www.mathworks.com/help/matlab/matlab_external/system-requirements-for-matlab-engine-for-python.html).

## Features

The extension adds two commands to Visual Studio Code, that can then be tied to key-bindings. These are:
- `Open a Matlab Terminal` which opens an interactive Matlab terminal in the VS Code integrated terminal, similar to the Matlab command line
- `Run current Matlab Script` which runs the currently opened Matlab script and then allows the user to interact with it through the opened terminal

## Extension Settings

There are none for now.

## Release Notes

### 0.1.0
Basic functionalities and dependencies checks implemented

## Known Issues

Many things are probably bugged for now.
