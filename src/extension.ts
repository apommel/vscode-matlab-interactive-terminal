// Copyright (c) 2020 Aurélien Pommel

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
	const ext_dir = context.asAbsolutePath("");
	let script_dir = path.join(ext_dir, "/interfaces/standard");

	// Get configuration parameters
	const getConfigMap = () => {
		return vscode.workspace.getConfiguration("matlab-interactive-terminal");
	};

	// Get Python interpreter path
	const getPythonPath = () => {
		let extConfig = getConfigMap();
		let python_path: string;
		let pythonPathSetting: string | undefined;
		pythonPathSetting = extConfig.get("pythonPath");

		python_path = pythonPathSetting
			? path.normalize(pythonPathSetting)
			: "python";

		return python_path;
	};
	let python_path: string | undefined = getPythonPath();

	// Set up common terminal options
	let terminalLaunchOptions: vscode.TerminalOptions = {
		name: "MATLAB",
		shellPath: python_path
	};

	const getUnicodeOption = () => {
		let extConfig = getConfigMap();
		let unicodeOption: boolean | undefined;
		unicodeOption = extConfig.get("unicodeSwitch");
		if (unicodeOption === undefined) {
			unicodeOption = false;
		}
		if (unicodeOption) {
			script_dir = path.join(ext_dir, "/interfaces/unicode");
		}
		else {
			script_dir = path.join(ext_dir, "/interfaces/standard");
		}
	};
	getUnicodeOption();

	// Check the dependencies and inform the user
	let err_message = "";
	let correct_setup: boolean;

	const checkSetup = () => {
		let checked_setup = true;
		let script_path = path.join(script_dir, "check_dependencies.py");
		const { execFileSync } = require("child_process");
		if (!python_path) {
			return false;
		}
		try {
			let stdout = execFileSync(python_path, [script_path]);
			if (stdout.toString() === "1") {
				err_message = "MATLAB Engine for Python seems to not be installed correctly.";
				return false;
			}
		}
		catch (error) { // If an error is caught, it means Python cannot be called
			err_message = error.message;
			return false;
		}
		return true;
	};

	const openMatlabTerminal = () => {
		getUnicodeOption();
		let script_path = path.join(script_dir, "ml_terminal.py");
		python_path = getPythonPath();
		correct_setup = checkSetup();
		if (correct_setup) {
			const opts: vscode.TerminalOptions = { ...terminalLaunchOptions };
			opts.shellPath = python_path;
			opts.shellArgs = [script_path];
			vscode.window.createTerminal(opts).show(false);;
		}
		else {
			console.log(err_message);
			vscode.window.showErrorMessage(err_message);
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
			let current_file = activeTextEditor.document.fileName;
			getUnicodeOption();
			let script_path = path.join(script_dir, "ml_script.py");
			if (activeTerminal && activeTerminal.name === "MATLAB") // If already a Matlab Engine started, the file is run in it
			{
				activeTerminal.sendText("clear functions"); // Force Matlab to reload the scripts
				activeTerminal.sendText(util.format("run(\"%s\")", current_file));
				activeTerminal.show(false);
			}
			else {
				python_path = getPythonPath();
				correct_setup = checkSetup();
				if (correct_setup) {
					const opts: vscode.TerminalOptions = { ...terminalLaunchOptions };
					opts.shellPath = python_path;
					opts.shellArgs = [script_path, current_file];
					vscode.window.createTerminal(opts).show(false);
				}
				else {
					console.log(err_message);
					vscode.window.showErrorMessage(err_message);
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
			var current_selection = null;
			var cwd = path.dirname(activeTextEditor.document.uri.fsPath); // Get current file directory
			if (cwd.charAt(1) === ":") { // Hack to have drive letter in uppercase
				cwd = cwd.charAt(0).toUpperCase() + cwd.slice(1);
			}
			if (activeTextEditor.selection.isEmpty) { // Run current line if selection is empty
				current_selection = activeTextEditor.document.lineAt(activeTextEditor.selection.active).text;
			}
			else {
				current_selection = `cd \'${cwd}\'\n`.concat(activeTextEditor.document.getText(activeTextEditor.selection));
			}
			getUnicodeOption();
			let script_path = path.join(script_dir, "ml_selection.py");
			let temp_dir = path.join(ext_dir, "temp"); // A temp file and directory are created in the ext dir
			if (!fs.existsSync(temp_dir)) {
				fs.mkdirSync(temp_dir);
			}
			else {
				var file_list = fs.readdirSync(temp_dir);
				for (const file of file_list) {
					fs.unlinkSync(path.join(temp_dir, file));
				}
			}
			let temp_path = path.join(temp_dir, "temp.m");
			fs.writeFileSync(temp_path, current_selection);
			if (activeTerminal && activeTerminal.name === "MATLAB") { // If already a Matlab Engine started, the selection is run in it
				activeTerminal.sendText(util.format("clear(\"%s\")", temp_path)); // Force Matlab to reload the scripts
				activeTerminal.sendText(util.format("run(\"%s\")", temp_path));
				if (getConfigMap().get("CursorBack") === false) {
					activeTerminal.show(false);
				}
			}
			else {
				python_path = getPythonPath();
				correct_setup = checkSetup();
				if (correct_setup) {
					const opts: vscode.TerminalOptions = { ...terminalLaunchOptions };
					opts.shellPath = python_path;
					opts.shellArgs = [script_path, temp_path];
					vscode.window.createTerminal(opts).show(false);
				}
				else {
					console.log(err_message);
					vscode.window.showErrorMessage(err_message);
				}
			}
		}
		else {
			terminalFallback(activeTerminal);
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand("matlab-interactive-terminal.runMatlabSelection", runMatlabSelection));

}

// this method is called when your extension is deactivated
export function deactivate() { }
