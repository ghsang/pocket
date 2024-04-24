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
	{User: "권혁상", Description: "애플뮤직", Amount: 8900, PaymentMethod: "국민 LiivM"},
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
