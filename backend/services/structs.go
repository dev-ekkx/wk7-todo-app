package services

type TodoStruct struct {
	ID        string `json:"id"`
	Value     string `json:"value"`
	Status    string `json:"status"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type DBTodoStruct struct {
	ID        string `dynamodbav:"id"`
	Value     string `dynamodbav:"value"`
	Status    string `dynamodbav:"status"`
	CreatedAt string `dynamodbav:"createdAt"`
	UpdatedAt string `dynamodbav:"updatedAt"`
}
