// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as util from 'util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "matlab-interactive-terminal" is now active!');

	const ext_dir = context.asAbsolutePath('');
	const script_dir = path.join(ext_dir, "/interfaces/");

	// Check the dependencies at startup and inform the user
	let correct_setup = true;
	let err_message = "";
	let script_path = path.join(script_dir, "check_dependencies.py");
	const {execFileSync} = require('child_process');
	try {
		let stdout = execFileSync('python', [script_path]);
		if (stdout.toString() == 1){
				err_message = "The Matlab Engine for Python seems to not be installed correctly";
				vscode.window.showErrorMessage(err_message);
				correct_setup = false;
		};
	}
	catch(error) { // If an error is catched, it means Python cannot be called
		err_message = "Python is not installed or was not added to PATH";
		vscode.window.showErrorMessage(err_message);
		correct_setup = false;
	};


	const openMlTerminal = () => {
		if (correct_setup){
			let script_path = path.join(script_dir, "ml_terminal.py");
			const terminal = vscode.window.createTerminal({ name: 'Matlab REPL'});
			terminal.sendText(util.format("python \"%s\"", script_path));
			terminal.show();
		}
		else {
			console.log(err_message);
			vscode.window.showErrorMessage(err_message)
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.openMatlabTerminal', openMlTerminal));


	const terminalFallback = (activeTerminal) => {
		// The terminal is not opened if there is already a current one
		if (activeTerminal == undefined || (activeTerminal && activeTerminal.name != "Matlab REPL"))
		{
			openMlTerminal();
		};
	};


	const runMlScript = () => {
		let activeTextEditor = vscode.window.activeTextEditor;
		let activeTerminal = vscode.window.activeTerminal;
		if (correct_setup){
			if (activeTextEditor){
				let current_file = activeTextEditor.document.fileName;
				let script_path = path.join(script_dir, "ml_script.py");
				if (activeTerminal && activeTerminal.name == "Matlab REPL") // If already a Matlab Engine started, the file is run in it
				{
					activeTerminal.sendText("clear functions"); // Force Matlab to reload the scripts
					activeTerminal.sendText(util.format("run(\"%s\")", current_file));
				}
				else
				{
					const terminal = vscode.window.createTerminal({ name: 'Matlab REPL'});
					terminal.sendText(util.format("python \"%s\" \"%s\"", script_path, current_file));
					terminal.show();
				};
			}
			else { // If not any file is opened, a Matlab terminal is simply opened
				terminalFallback(activeTerminal);
			}
		}
		else {
			console.log(err_message);
			vscode.window.showErrorMessage(err_message);
		};
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.runMatlabScript', runMlScript));

	
	const runMlSelection = () => {
		let activeTextEditor = vscode.window.activeTextEditor;
		let activeTerminal = vscode.window.activeTerminal;
		if (correct_setup){
			if (activeTextEditor){
				if (activeTextEditor.selection.isEmpty){ // Run current line if selection is empty
					var current_selection = activeTextEditor.document.lineAt(activeTextEditor.selection.active).text;
				}
				else {
					var current_selection = activeTextEditor.document.getText(activeTextEditor.selection);
				};
				let script_path = path.join(script_dir, "ml_selection.py");
				if (activeTerminal && activeTerminal.name == "Matlab REPL") // If already a Matlab Engine started, the file is run in it
				{
					activeTerminal.sendText(current_selection);
				}
				else
				{
					const terminal = vscode.window.createTerminal({ name: 'Matlab REPL'});
					terminal.sendText(util.format("python \"%s\" \"%s\"", script_path, current_selection));
					terminal.show();
				};
			}
			else {
				terminalFallback(activeTerminal);
			};
		}
		else {
			console.log(err_message);
			vscode.window.showErrorMessage(err_message);
		};
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.runMatlabSelection', runMlSelection));

}

// this method is called when your extension is deactivated
export function deactivate() {}
