import {registerSW} from 'virtual:pwa-register';

registerSW({ // eslint-disable-line @typescript-eslint/no-unsafe-call
	immediate: true,
	onRegisteredSW(swScriptUrl: any) {
		console.log('SW registered:', swScriptUrl);
	},
	onOfflineReady() {
		console.log('PWA application ready to work offline');
	},
});
