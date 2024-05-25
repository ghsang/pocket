use sea_query::*;
use sqlx::{Error, Pool, Postgres};

const CATEGORIES: [&str; 7] = [
    "생활비",
    "용돈",
    "경조사비",
    "문화여행비",
    "비자금",
    "저축",
    "고정지출",
];

struct Transaction {
    user: &'static str,
    description: &'static str,
    amount: i32,
    payment_method: &'static str,
}

const FIXED_TRANSACTIONS: [Transaction; 28] = [
    Transaction {
        user: "이현경",
        description: "중국어",
        amount: 360_000,
        payment_method: "현금",
    },
    Transaction {
        user: "이현경",
        description: "일본어",
        amount: 150_000,
        payment_method: "현금",
    },
    Transaction {
        user: "이현경",
        description: "연금적금",
        amount: 100_000,
        payment_method: "현금",
    },
    Transaction {
        user: "이현경",
        description: "여행 계",
        amount: 50_000,
        payment_method: "현금",
    },
    Transaction {
        user: "이현경",
        description: "경조사 계",
        amount: 30_000,
        payment_method: "현금",
    },
    Transaction {
        user: "이현경",
        description: "교통비",
        amount: 132_000,
        payment_method: "현금",
    },
    Transaction {
        user: "이현경",
        description: "청약",
        amount: 20_000,
        payment_method: "현금",
    },
    Transaction {
        user: "이현경",
        description: "용돈",
        amount: 500_000,
        payment_method: "현금",
    },
    Transaction {
        user: "이현경",
        description: "네이버",
        amount: 3_900,
        payment_method: "현금",
    },
    Transaction {
        user: "이현경",
        description: "통신비",
        amount: 60_000,
        payment_method: "우리 생활비",
    },
    Transaction {
        user: "이현경",
        description: "우체국보험",
        amount: 36_860,
        payment_method: "우리 생활비",
    },
    Transaction {
        user: "이현경",
        description: "인덕션 렌탈",
        amount: 31_400,
        payment_method: "우리 생활비",
    },
    Transaction {
        user: "이현경",
        description: "정수기 렌탈",
        amount: 14_450,
        payment_method: "우리 생활비",
    },
    Transaction {
        user: "이현경",
        description: "관리비",
        amount: 300_000,
        payment_method: "우리 생활비",
    },
    Transaction {
        user: "이현경",
        description: "난방비",
        amount: 200_000,
        payment_method: "우리 생활비",
    },
    Transaction {
        user: "이현경",
        description: "부모님 용돈",
        amount: 500_000,
        payment_method: "현금",
    },
    Transaction {
        user: "권혁상",
        description: "부모님 용돈",
        amount: 700_000,
        payment_method: "현금",
    },
    Transaction {
        user: "권혁상",
        description: "애플뮤직",
        amount: 8900,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "인터넷",
        amount: 35_800,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "드롭박스",
        amount: 15_000,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "대학동기 계",
        amount: 30_000,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "교통비",
        amount: 83_600,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "통신비",
        amount: 46_260,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "넷플릭스",
        amount: 17_000,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "쿠팡",
        amount: 7_800,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "깃헙",
        amount: 13_500,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "챗GPT",
        amount: 27_000,
        payment_method: "국민 LiivM",
    },
    Transaction {
        user: "권혁상",
        description: "어머님 인터넷",
        amount: 33_760,
        payment_method: "국민 LiivM",
    },
];

pub enum TransactionIden {
    Table,
    User,
    Description,
    Amount,
    PaymentMethod,
}

impl Iden for TransactionIden {
    fn unquoted(&self, s: &mut dyn std::fmt::Write) {
        write!(
            s,
            "{}",
            match self {
                Self::Table => "transactions",
                Self::User => "user",
                Self::Description => "description",
                Self::Amount => "amount",
                Self::PaymentMethod => "payment_method",
            }
        )
        .unwrap();
    }
}

pub async fn add_fixed_transactions(pool: Pool<Postgres>) -> Result<(), Error> {
    let mut query = Query::insert()
        .into_table(TransactionIden::Table)
        .columns([
            TransactionIden::User,
            TransactionIden::Description,
            TransactionIden::Amount,
            TransactionIden::PaymentMethod,
        ])
        .to_owned();

    for t in FIXED_TRANSACTIONS.iter() {
        query.values_panic([
            t.user.into(),
            t.description.into(),
            t.amount.into(),
            t.payment_method.into(),
        ]);
    }

    sqlx::query(&query.to_string(PostgresQueryBuilder))
        .execute(&pool)
        .await?;

    Ok(())
}
