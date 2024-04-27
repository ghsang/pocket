package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	_ "github.com/lib/pq"
	gonanoid "github.com/matoous/go-nanoid/v2"
	"github.com/rs/zerolog/log"

	"pocket/ent"
	"pocket/internal"
)

var transactions = []internal.Transaction{
	{User: "이현경", Description: "중국어", Amount: 360_000, PaymentMethod: "현금"},
	{User: "이현경", Description: "일본어", Amount: 150_000, PaymentMethod: "현금"},
	{User: "이현경", Description: "연금적금", Amount: 100_000, PaymentMethod: "현금"},
	{User: "이현경", Description: "여행 계", Amount: 50_000, PaymentMethod: "현금"},
	{User: "이현경", Description: "경조사 계", Amount: 30_000, PaymentMethod: "현금"},
	{User: "이현경", Description: "교통비", Amount: 132_000, PaymentMethod: "현금"},
	{User: "이현경", Description: "청약", Amount: 20_000, PaymentMethod: "현금"},
	{User: "이현경", Description: "용돈", Amount: 500_000, PaymentMethod: "현금"},
	{User: "이현경", Description: "네이버", Amount: 3_900, PaymentMethod: "현금"},
	{User: "이현경", Description: "통신비", Amount: 60_000, PaymentMethod: "우리 생활비"},
	{User: "이현경", Description: "우체국보험", Amount: 36_860, PaymentMethod: "우리 생활비"},
	{User: "이현경", Description: "인덕션 렌탈", Amount: 31_400, PaymentMethod: "우리 생활비"},
	{User: "이현경", Description: "정수기 렌탈", Amount: 14_450, PaymentMethod: "우리 생활비"},
	{User: "이현경", Description: "관리비", Amount: 300_000, PaymentMethod: "우리 생활비"},
	{User: "이현경", Description: "난방비", Amount: 200_000, PaymentMethod: "우리 생활비"},
	{User: "이현경", Description: "부모님 용돈", Amount: 500_000, PaymentMethod: "현금"},
	{User: "권혁상", Description: "부모님 용돈", Amount: 700_000, PaymentMethod: "현금"},
	{User: "권혁상", Description: "애플뮤직", Amount: 8900, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "인터넷", Amount: 35_800, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "드롭박스", Amount: 15_000, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "대학동기 계", Amount: 30_000, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "교통비", Amount: 83_600, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "통신비", Amount: 46_260, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "넷플릭스", Amount: 17_000, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "쿠팡", Amount: 7_800, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "깃헙", Amount: 13_500, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "챗GPT", Amount: 27_000, PaymentMethod: "국민 LiivM"},
	{User: "권혁상", Description: "어머님 인터넷", Amount: 33_760, PaymentMethod: "국민 LiivM"},
}

func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	id, err := gonanoid.New()

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "failed generating traceId",
		}, nil
	}

	var logger = log.With().Str("traceId", id).Str("spanId", "/cron/fixed").Logger()

	logger.Info().Msg("invoked")

	client, err := ent.Open("postgres", os.Getenv("GO_DATABASE_URL"))
	if err != nil {
		logger.
			Error().
			Stack().
			Err(fmt.Errorf("failed opening connection to db: %v", err)).
			Msg("")

		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       "failed opening connection to db",
		}, nil
	}

	defer client.Close()

	start := time.Now()

	for _, transaction := range transactions {
		if _, err := internal.CreateTransaction(ctx, client, transaction); err != nil {
			logger.
				Error().
				Stack().
				Err(fmt.Errorf("failed opening connection to db: %v", err)).
				Msg("")

			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
				Body:       "failed creating transaction",
			}, nil
		}
	}

	logger.Info().Int64("duration", time.Since(start).Milliseconds()).Msg("done")

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       "done",
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
