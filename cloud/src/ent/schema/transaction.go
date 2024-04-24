package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// Transaction holds the schema definition for the Transaction entity.
type Transaction struct {
	ent.Schema
}

// Fields of the Transaction.
func (Transaction) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New),
		field.String("user").NotEmpty(),
		field.Time("date"),
		field.String("category").NotEmpty(),
		field.String("description").NotEmpty(),
		field.Int("amount"),
		field.String("paymentMethod").NotEmpty(),
	}
}

// Edges of the Transaction.
func (Transaction) Edges() []ent.Edge {
	return nil
}

type BudgetPerCategory struct {
	Current  int    `json:"current"`
	Budget   int    `json:"budget"`
	Remain   int    `json:"remain"`
	Category string `json:"category"`
}

// Budget holds the schema definition for the Budget entity.
type Budget struct {
	ent.Schema
}

// Fields of the Budget.
func (Budget) Fields() []ent.Field {
	return []ent.Field{
		field.String("id"),
		field.JSON("value", []BudgetPerCategory{}),
	}
}
