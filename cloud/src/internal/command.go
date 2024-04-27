package internal

import (
	"context"
	"fmt"
	"time"

	"pocket/ent"
	"pocket/ent/schema"
)

type Transaction struct {
	User          string
	Description   string
	Amount        int
	PaymentMethod string
}

func CreateTransaction(ctx context.Context, client *ent.Client, transaction Transaction) (*ent.Transaction, error) {
	return client.Transaction.Create().
		SetUser(transaction.User).
		SetDate(time.Now()).
		SetCategory("고정지출").
		SetDescription(transaction.Description).
		SetAmount(transaction.Amount).
		SetPaymentMethod(transaction.PaymentMethod).
		Save(ctx)
}

func getBudgets(ctx context.Context, tx *ent.Tx) (map[string]schema.BudgetPerCategory, error) {
	data, err := tx.Budget.Query().
		First(ctx)

	if err != nil {
		return nil, fmt.Errorf("querying budget: %w", err)
	}

	budgetMap := make(map[string]schema.BudgetPerCategory)

	for _, budget := range data.Value {
		budgetMap[budget.Category] = budget
	}

	return budgetMap, nil
}

type monthlyBudget struct {
	Category string
	Budget   int
}

var monthlyBudgets = []monthlyBudget{
	{Category: "생활비", Budget: 100_0000},
	{Category: "용돈", Budget: 50_0000},
	{Category: "경조사비", Budget: 100_0000},
	{Category: "문화/여행비", Budget: 100_0000},
	{Category: "비자금", Budget: 50_0000},
	{Category: "저축", Budget: 300_0000},
	{Category: "고정지출", Budget: 350_4420},
}

func UpdateBudget(ctx context.Context, client *ent.Client) error {
	tx, err := client.Tx(ctx)
	if err != nil {
		return fmt.Errorf("starting a transaction: %w", err)
	}

	budgets, err := getBudgets(ctx, tx)
	if err != nil {
		return fmt.Errorf("getting budget: %w", err)
	}

	var newBudget []schema.BudgetPerCategory

	for _, budget := range monthlyBudgets {
		old := budgets[budget.Category]
		newBudget = append(newBudget, schema.BudgetPerCategory{
			Current:  0,
			Budget:   budget.Budget,
			Remain:   old.Remain + budget.Budget,
			Category: budget.Category,
		})
	}

	_, err = tx.Budget.Update().
		SetValue(newBudget).
		Save(ctx)

	return err
}
