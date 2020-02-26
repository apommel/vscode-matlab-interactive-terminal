// Copyright (c) 2020 Aurélien Pommel

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Get basic directories informations
	const ext_dir = context.asAbsolutePath('');
	const script_dir = path.join(ext_dir, "/interfaces/");
	
	// Get configuration parameters
	const getPythonPath = () => {
		let extConfig = vscode.workspace.getConfiguration("matlab-interactive-terminal");
		let python_path: string;
		let pythonPathSetting: string|undefined;
		pythonPathSetting = extConfig.get("pythonPath");
		if (pythonPathSetting){
			python_path = path.normalize(pythonPathSetting);
		}
		else {
			python_path = "python";
		}
		console.log(python_path);
		return(python_path);
	};
	let python_path = getPythonPath();
	let terminalLaunchOpt: vscode.TerminalOptions = {name: 'Matlab REPL', hideFromUser: true};

	// Check the dependencies and inform the user
	let err_message = "";
	let correct_setup: boolean;
	const checkSetup = () => {
		let checked_setup = true;
		let script_path = path.join(script_dir, "check_dependencies.py");
		const {execFileSync} = require('child_process');
		try {
			let stdout = execFileSync(python_path, [script_path]);
			if (stdout.toString() == 1){
					err_message = "The Matlab Engine for Python seems to not be installed correctly";
					checked_setup = false;
			}
		}
		catch(error) { // If an error is caught, it means Python cannot be called
			err_message = "Python is not installed or its path is incorrectly specified";
			checked_setup = false;
		}
		return(checked_setup);
	};


	const openMlTerminal = () => {
		let script_path = path.join(script_dir, "ml_terminal.py");
		python_path = getPythonPath();
		correct_setup = checkSetup();
		if (correct_setup){
			const terminal = vscode.window.createTerminal(terminalLaunchOpt);
			terminal.sendText(python_path + util.format(" \"%s\"", script_path));
			terminal.show(false);
		}
		else {
			console.log(err_message);
			vscode.window.showErrorMessage(err_message);
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.openMatlabTerminal', openMlTerminal));


	const terminalFallback = (activeTerminal: vscode.Terminal | undefined) => {
		// The terminal is not opened if there is already a current one
		if (activeTerminal === undefined || (activeTerminal && activeTerminal.name !== "Matlab REPL"))
		{
			openMlTerminal();
		}
	};


	const runMlScript = () => {
		let activeTextEditor = vscode.window.activeTextEditor;
		let activeTerminal = vscode.window.activeTerminal;
		if (activeTextEditor){
			activeTextEditor.document.save();
			let current_file = activeTextEditor.document.fileName;
			let script_path = path.join(script_dir, "ml_script.py");
			if (activeTerminal && activeTerminal.name === "Matlab REPL") // If already a Matlab Engine started, the file is run in it
			{
				activeTerminal.sendText("clear functions"); // Force Matlab to reload the scripts
				activeTerminal.sendText(util.format("run(\"%s\")", current_file));
				activeTerminal.show(false);
			}
			else
			{
				python_path = getPythonPath();
				correct_setup = checkSetup();
				if (correct_setup){
					const terminal = vscode.window.createTerminal(terminalLaunchOpt);
					terminal.sendText(python_path + util.format(" \"%s\" \"%s\"", script_path, current_file));
					terminal.show(false);
				}
				else{
					console.log(err_message);
					vscode.window.showErrorMessage(err_message);
				}
			}
		}
		else { // If not any file is opened, a Matlab terminal is simply opened
			terminalFallback(activeTerminal);
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.runMatlabScript', runMlScript));

	
	const runMlSelection = () => {
		let activeTextEditor = vscode.window.activeTextEditor;
		let activeTerminal = vscode.window.activeTerminal;
		if (activeTextEditor){
			var current_selection = null;
			if (activeTextEditor.selection.isEmpty){ // Run current line if selection is empty
				current_selection = activeTextEditor.document.lineAt(activeTextEditor.selection.active).text;
			}
			else {
				current_selection = activeTextEditor.document.getText(activeTextEditor.selection);
			}
			let script_path = path.join(script_dir, "ml_selection.py");
			let tempDir = path.join(ext_dir, "temp"); // A temp file and directory are created in the ext dir
			if (!fs.existsSync(tempDir)){
				fs.mkdirSync(tempDir);
			}
			let tempPath = path.join(tempDir, 'temp.m');
			fs.writeFileSync(tempPath, current_selection);
			if (activeTerminal && activeTerminal.name === "Matlab REPL") // If already a Matlab Engine started, the selection is run in it
			{
				activeTerminal.sendText(util.format("run(\"%s\")", tempPath));
				activeTerminal.show(false);
			}
			else
			{
				python_path = getPythonPath();
				correct_setup = checkSetup();
				if (correct_setup){
					const terminal = vscode.window.createTerminal(terminalLaunchOpt);
					terminal.sendText(python_path + util.format(" \"%s\" \"%s\"", script_path, tempPath));
					terminal.show(false);
				}
				else{
					console.log(err_message);
					vscode.window.showErrorMessage(err_message);
				}
			}
		}
		else {
			terminalFallback(activeTerminal);
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.runMatlabSelection', runMlSelection));

}

// this method is called when your extension is deactivated
export function deactivate() {}
