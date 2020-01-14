# Change Log

All notable changes to the Matlab Interactive Terminal extension for Visual Studio Code will be documented in this file.

## [0.2.1] - 2020-01-14 
### Fixed
- Fixed a bug where the selected text could not be run in an empty terminal if it contained spaces

## [0.2.0] - 2020-01-14 
### Added
- Implemented better code structure for the Python scripts
- Added command to launch current selection or current line in Matlab REPL

## [0.1.4] - 2020-01-14
### Fixed
- The matlab scripts are now properly reloaded when a script is launched in an existing terminal

## [0.1.3] - 2020-01-13
Initial release
- Created extension structure
- Implemented `Open a Matlab Terminal` command
- Implemented `Run current Matlab Script` command
- Added basic dependencies checks at activation to prevent errors