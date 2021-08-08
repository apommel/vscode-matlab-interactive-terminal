// Developed by Aurelien Pommel and other contributors

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as util from "util";
import * as fs from "fs";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Get basic directory information
	const extDir = context.asAbsolutePath("");
	let scriptDir = path.join(extDir, "/interfaces/standard");

	// Get configuration parameters
	const getConfigMap = () => {
		return vscode.workspace.getConfiguration("matlab-interactive-terminal");
	};

	// Get Python interpreter path
	const getPythonPath = () => {
		let extConfig = getConfigMap();
		let pythonPath: string;
		let pythonPathSetting: string | undefined;
		pythonPathSetting = extConfig.get("pythonPath");

		pythonPath = pythonPathSetting
			? path.normalize(pythonPathSetting)
			: "python";

		return pythonPath;
	};
	let pythonPath: string | undefined = getPythonPath();

	// Set up common terminal options
	let terminalLaunchOptions: vscode.TerminalOptions = {
		name: "MATLAB",
		shellPath: pythonPath
	};

	const getUnicodeOption = () => {
		let extConfig = getConfigMap();
		let unicodeOption: boolean | undefined;
		unicodeOption = extConfig.get("unicodeSwitch");
		if (unicodeOption === undefined) {
			unicodeOption = false;
		}
		if (unicodeOption) {
			scriptDir = path.join(extDir, "/interfaces/unicode");
		}
		else {
			scriptDir = path.join(extDir, "/interfaces/standard");
		}
	};
	getUnicodeOption();

	// Check the dependencies and inform the user
	let errMessage = "";
	let correctSetup: boolean;

	const checkSetup = () => {
		let scriptPath = path.join(scriptDir, "check_dependencies.py");
		const { execFileSync } = require("child_process");
		if (!pythonPath) {
			return false;
		}
		try {
			let stdout = execFileSync(pythonPath, [scriptPath]);
			if (stdout.toString() === "1") {
				errMessage = "MATLAB Engine for Python seems to not be installed correctly.";
				return false;
			}
		}
		catch (error) { // If an error is caught, it means Python cannot be called
			errMessage = error.message;
			return false;
		}
		return true;
	};

	const openMatlabTerminal = () => {
		getUnicodeOption();
		let scriptPath = path.join(scriptDir, "ml_terminal.py");
		pythonPath = getPythonPath();
		correctSetup = checkSetup();
		if (correctSetup) {
			const opts: vscode.TerminalOptions = { ...terminalLaunchOptions };
			opts.shellPath = pythonPath;
			opts.shellArgs = [scriptPath];
			vscode.window.createTerminal(opts).show(false);
		}
		else {
			console.log(errMessage);
			vscode.window.showErrorMessage(errMessage);
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand("matlab-interactive-terminal.openMatlabTerminal", openMatlabTerminal));


	const terminalFallback = (activeTerminal: vscode.Terminal | undefined) => {
		// The terminal is not opened if there is already a current one
		if (activeTerminal === undefined || (activeTerminal && activeTerminal.name !== "MATLAB")) {
			openMatlabTerminal();
		}
	};


	const runMatlabScript = () => {
		let activeTextEditor = vscode.window.activeTextEditor;
		let activeTerminal = vscode.window.activeTerminal;
		if (activeTextEditor) {
			activeTextEditor.document.save();
			let currentFile = activeTextEditor.document.fileName;
			getUnicodeOption();
			let scriptPath = path.join(scriptDir, "ml_script.py");
			if (activeTerminal && activeTerminal.name === "MATLAB") // If already a Matlab Engine started, the file is run in it
			{
				activeTerminal.sendText("clear functions"); // Force Matlab to reload the scripts
				activeTerminal.sendText(util.format("run(\"%s\")", currentFile));
				activeTerminal.show(false);
			}
			else {
				pythonPath = getPythonPath();
				correctSetup = checkSetup();
				if (correctSetup) {
					const opts: vscode.TerminalOptions = { ...terminalLaunchOptions };
					opts.shellPath = pythonPath;
					opts.shellArgs = [scriptPath, currentFile];
					vscode.window.createTerminal(opts).show(false);
				}
				else {
					console.log(errMessage);
					vscode.window.showErrorMessage(errMessage);
				}
			}
		}
		else { // If not any file is opened, a Matlab terminal is simply opened
			terminalFallback(activeTerminal);
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand("matlab-interactive-terminal.runMatlabScript", runMatlabScript));


	const runMatlabSelection = () => {
		let activeTextEditor = vscode.window.activeTextEditor;
		let activeTerminal = vscode.window.activeTerminal;
		if (activeTextEditor) {
			var currentSelection = null;
			var cwd = path.dirname(activeTextEditor.document.uri.fsPath); // Get current file directory
			if (cwd.charAt(1) === ":") { // Hack to have drive letter in uppercase
				cwd = cwd.charAt(0).toUpperCase() + cwd.slice(1);
			}
			if (activeTextEditor.selection.isEmpty) { // Run current line if selection is empty
				currentSelection = activeTextEditor.document.lineAt(activeTextEditor.selection.active).text;
			}
			else {
				currentSelection = `cd \'${cwd}\'\n`.concat(activeTextEditor.document.getText(activeTextEditor.selection));
			}
			getUnicodeOption();
			let scriptPath = path.join(scriptDir, "ml_selection.py");
			let tempDir = path.join(extDir, "temp"); // A temp file and directory are created in the ext dir
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir);
			}
			else {
				var fileList = fs.readdirSync(tempDir);
				for (const file of fileList) {
					fs.unlinkSync(path.join(tempDir, file));
				}
			}
			let tempPath = path.join(tempDir, "temp.m");
			fs.writeFileSync(tempPath, currentSelection);
			if (activeTerminal && activeTerminal.name === "MATLAB") { // If already a Matlab Engine started, the selection is run in it
				activeTerminal.sendText(util.format("clear(\"%s\")", tempPath)); // Force Matlab to reload the scripts
				activeTerminal.sendText(util.format("run(\"%s\")", tempPath));
				if (getConfigMap().get("CursorBack") === false) {
					activeTerminal.show(false);
				}
			}
			else {
				pythonPath = getPythonPath();
				correctSetup = checkSetup();
				if (correctSetup) {
					const opts: vscode.TerminalOptions = { ...terminalLaunchOptions };
					opts.shellPath = pythonPath;
					opts.shellArgs = [scriptPath, tempPath];
					vscode.window.createTerminal(opts).show(false);
				}
				else {
					console.log(errMessage);
					vscode.window.showErrorMessage(errMessage);
				}
			}
		}
		else {
			terminalFallback(activeTerminal);
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand("matlab-interactive-terminal.runMatlabSelection", runMatlabSelection));

	const resetPythonPath = () => {
		pythonPath = getPythonPath();
	};
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(resetPythonPath));

	const matlabTerminalProfile: vscode.TerminalProfileProvider = {
		provideTerminalProfile() {
			let terminalPath = path.join(scriptDir, "ml_terminal.py");
			return {
				options: {
					...terminalLaunchOptions,
					shellArgs: [terminalPath]
				}
			};
		}
	};
	context.subscriptions.push(vscode.window.registerTerminalProfileProvider('matlab-interactive-terminal.terminal-profile', matlabTerminalProfile));

}

// this method is called when your extension is deactivated
export function deactivate() { }
