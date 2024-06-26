import Kakao from '@auth/core/providers/kakao';
import {defineConfig} from 'auth-astro';

export default defineConfig({
	providers: [
		Kakao({
			clientId: import.meta.env.KAKAO_CLIENT_ID,
			clientSecret: import.meta.env.KAKAO_CLIENT_SECRET,
		}),
	],
});
