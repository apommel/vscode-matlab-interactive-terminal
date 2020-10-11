# Change Log

All notable changes to the Matlab Interactive Terminal extension for Visual Studio Code will be documented in this file.

## [0.3.3] - 2020-10-11
### Added
- Option to choose to switch focus to terminal or not (weihongliang233 #24)
### Fixed
- Cases where run selection was running behind #12 (fixed by weihongliang233 #19)

## [0.3.2] - 2020-04-26
### Added
- Added option to use unicode output, as if activated the output is not in real-time
### Fixed
- Consolidated temp file managing for run selection
- Corrected errors when spaces were present in the path to the path from which a selection was run

## [0.3.1] - 2020-04-18
### Fixed
- Properly displays error messages with unicode

## [0.3.0] - 2020-04-18
### Added
- Correct implementation and handling of unicode, including CJK, characters
### Fixed
- Impossibility to launch from previous update

## [0.2.11] - 2020-04-18
### Fixed
- Prompt locations in some cases #6
- Relative path issues in run selection #8

## [0.2.10] - 2020-02-26
### Added
- When a script is run, it is saved beforehand in order to be correctly updated
### Fixed
- Fixed discrepancies in run selection by using temporary files
- Updated readme

## [0.2.9] - 2020-02-13
### Added
- The script calling is hidden at initialization
### Fixed
- Implemented correctly Matlab `clc` command
- The terminal is correctly shown in certain situations

## [0.2.8] - 2020-02-07
### Added
- Added basic Python 2 compatibility
- Added prompts in the Matlab terminal Issue #2

## [0.2.7] - 2020-02-03
### Added
- Added option to specify the Python executable to use in case of several versions Issue #1

## [0.2.6] - 2020-01-19
### Fixed
- Resolve encoding issues when running selection in new terminal

## [0.2.5] - 2020-01-16
### Fixed
- The `Run selection` command should now handle properly the double quotes, by using a temporary file

## [0.2.4] - 2020-01-15
### Fixed
- The exceptions are now properly handled when a file or a selection are run
- Cleaned code with TSLint

## [0.2.3] - 2020-01-15
### Fixed
- Fixed bug where terminal was launching when dependencies were not satisfied

## [0.2.2] - 2020-01-15
### Added
- Reworked TypeScript code
### Fixed
- Multi-lines selections when no terminal is open
- Spaces in paths and instructions on all cases 
- Corrected bug in Python related to Matlab error handling

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