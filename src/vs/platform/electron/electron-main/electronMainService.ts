/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IElectronService } from 'vs/platform/electron/node/electron';
import { IWindowsMainService, ICodeWindow } from 'vs/platform/windows/electron-main/windows';
import { MessageBoxOptions, MessageBoxReturnValue, shell, OpenDevToolsOptions } from 'electron';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { OpenContext } from 'vs/platform/windows/common/windows';
import { isMacintosh } from 'vs/base/common/platform';

export class ElectronMainService implements IElectronService {

	_serviceBrand: undefined;

	constructor(
		@IWindowsMainService private readonly windowsMainService: IWindowsMainService,
		@ILifecycleMainService private readonly lifecycleMainService: ILifecycleMainService
	) {
	}

	//#region Window

	private get window(): ICodeWindow | undefined {
		return this.windowsMainService.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
	}

	async windowCount(): Promise<number> {
		return this.windowsMainService.getWindowCount();
	}

	async openEmptyWindow(options?: { reuse?: boolean }): Promise<void> {
		this.windowsMainService.openEmptyWindow(OpenContext.API, options);
	}

	//#endregion

	async showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue> {
		const result = await this.windowsMainService.showMessageBox(options, this.window);

		return {
			response: result.button,
			checkboxChecked: !!result.checkboxChecked
		};
	}

	async showItemInFolder(path: string): Promise<void> {
		shell.showItemInFolder(path);
	}

	async relaunch(options?: { addArgs?: string[], removeArgs?: string[] }): Promise<void> {
		return this.lifecycleMainService.relaunch(options);
	}

	async openDevTools(options?: OpenDevToolsOptions): Promise<void> {
		const window = this.window;
		if (window) {
			window.win.webContents.openDevTools(options);
		}
	}

	async toggleDevTools(): Promise<void> {
		const window = this.window;
		if (window) {
			const contents = window.win.webContents;
			if (isMacintosh && window.hasHiddenTitleBarStyle() && !window.isFullScreen() && !contents.isDevToolsOpened()) {
				contents.openDevTools({ mode: 'undocked' }); // due to https://github.com/electron/electron/issues/3647
			} else {
				contents.toggleDevTools();
			}
		}
	}
}
