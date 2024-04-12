export type Category = '생활비' | '경조사비' | '문화/여행비' | '저축' | '비자금';

export const categories: readonly Category[] = ['생활비', '경조사비', '문화/여행비', '저축', '비자금'] as const;

export type PaymentMethod = '말랑 국민' | '말랑 신한 트레블' | '말랑 LG' | '복치 우리 생활비' | '복치 우리 예비' | '복치 신한' | '복치 신한 트레블' | '현금';

export const paymentMethods: readonly PaymentMethod[] = ['말랑 국민', '말랑 신한 트레블', '말랑 LG', '복치 우리 생활비', '복치 우리 예비', '복치 신한', '복치 신한 트레블', '현금'] as const;
