// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "matlab-interactive-terminal" is now active!');

	const ext_dir = context.asAbsolutePath('');
	const script_dir = path.join(ext_dir, "/src/python_scripts/");

	// Check the dependencies at startup and inform the user
	var correct_setup = true;
	var err_message = "";
	let script_path = path.join(script_dir, "check_dependencies.py");
	const {execFile} = require('child_process');
	try {
		execFile('python', [script_path], (error, stdout, stderr) => {
			if (error){
				err_message = "The Matlab Engine for Python seems to not be installed correctly";
				vscode.window.showErrorMessage(err_message)
				correct_setup = false;
			};
		});
	}
	catch(error) {
		err_message = "The Matlab Engine for Python seems to not be installed correctly";
		vscode.window.showErrorMessage(err_message)
		correct_setup = false;
	};


	const openMlTerminal = () => {
		if (correct_setup){
			let script_path = path.join(script_dir, "ml_terminal.py");
			const terminal = vscode.window.createTerminal({ name: 'Matlab REPL'});
			terminal.sendText("python " + script_path);
			terminal.show();
		}
		else {
			vscode.window.showErrorMessage(err_message)
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.openMatlabTerminal', openMlTerminal));


	const runMlScript = () => {
		if (correct_setup){
			if (vscode.window.activeTextEditor == undefined)
			{
				if (vscode.window.activeTerminal == undefined)
				{
					openMlTerminal();
				}
				else if (vscode.window.activeTerminal.name != "Matlab REPL")
				{
					openMlTerminal();
				};
			}
			else {
				let current_file = path.basename(vscode.window.activeTextEditor.document.fileName);
				let script_path = path.join(script_dir, "ml_script.py");
				if (vscode.window.activeTerminal == undefined)
				{
					const terminal = vscode.window.createTerminal({ name: 'Matlab REPL'});
					terminal.sendText("python " + script_path + ' ' + current_file);
					terminal.show();
				}
				else if (vscode.window.activeTerminal.name == "Matlab REPL")
				{
					vscode.window.activeTerminal.sendText(path.parse(current_file).name)
				}
				else
				{
					const terminal = vscode.window.createTerminal({ name: 'Matlab REPL'});
					terminal.sendText("python " + script_path + ' ' + current_file);
					terminal.show();
				};
			};
		}
		else {
			vscode.window.showErrorMessage(err_message);
		};
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.runMatlabScript', runMlScript));
}

// this method is called when your extension is deactivated
export function deactivate() {}
