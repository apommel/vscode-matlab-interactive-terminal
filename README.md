# Matlab Interactive Terminal for Visual Studio Code

Matlab Interactive Terminal is an extension for Visual Studio Code that allows users to launch Matlab scripts and have a working Matlab REPL directly included in Visual Studio Code. This extension uses the Matlab Engine for Python which must be correctly set up for the extension to work. It works equally on Windows, Mac OS and Linux.

## Requirements

- **Python** x64 3.6 or 3.7 (added to PATH), available [here](https://www.python.org/downloads/)  or through other distributions such as [Anaconda](https://www.anaconda.com/distribution/)
- **MATLAB** R2014b (Matlab 8.4) or higher
- **MATLAB Engine API for Python**, installations instructions are available [here](https://www.mathworks.com/help/matlab/matlab_external/install-the-matlab-engine-for-python.html)

N.B.: The Python requirements may vary depending on the Matlab version. It is advised to use the latest Matlab version (R2019b) along with Python 3.6 or 3.7 (x64). More informations about MATLAB-Python compatibility are available on [MathWorks website](https://www.mathworks.com/help/matlab/matlab_external/system-requirements-for-matlab-engine-for-python.html).

## Features

The extension adds three commands to Visual Studio Code, that can then be tied to key-bindings. These are:
- `Open a Matlab Terminal` which opens an interactive Matlab terminal in the VS Code integrated terminal, similar to the Matlab command line
- `Run current Matlab Script` which runs the currently opened Matlab script and then allows the user to interact with it through the opened terminal
- `Run current selection in Matlab` which runs the currently selected text in a Matlab terminal. If no text is selected, the current line is run instead

## Recommended VS Code Extensions

- [Matlab](https://marketplace.visualstudio.com/items?itemName=Gimly81.matlab) (from Xavier Hahn) provides syntax coloration, snippets and linting for the Matlab language. Matlab Interactive Terminal is thought for working with it.
- [Matlab Code Run](https://marketplace.visualstudio.com/items?itemName=bramvanbilsen.matlab-code-run) (from Bram Vanbilsen) is a good alternative to Matlab Interactive Terminal without the Python and Matlab Engine API dependencies. It should provide similar functionalities on both Mac OS and Linux.

## Known Issues

See https://github.com/apommel/vscode-matlab-interactive-terminal/issues
