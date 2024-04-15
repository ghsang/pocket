export type Category = '생활비' | '경조사비' | '문화/여행비' | '저축' | '비자금';

export const categories: readonly Category[] = ['생활비', '경조사비', '문화/여행비', '저축', '비자금'] as const;

export const paymentMethods = new Map<string, string[]>([
	['권혁상', ['국민 LiivM', '신한 트레블', '하나 LG', '현금']],
	['이현경', ['우리 생활비', '우리 예비', '신한', '신한 트레블', '현금']],
]);
