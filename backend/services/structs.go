package services

type TodoStruct struct {
	ID        string `json:"id"`
	Value     string `json:"value"`
	Status    string `json:"status"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}
