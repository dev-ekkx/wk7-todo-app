package services

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/aws/aws-sdk-go-v2/config"
)

func ConfigAWS() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic("unable to load SDK config, " + err.Error())
	}
	fmt.Println("Successfully loaded AWS SDK configuration:", cfg.Region)
}

var todos = []TodoStruct{
	{ID: uuid.New().String(), Value: "Learn Go", Status: "Pending", CreatedAt: "2023-10-01", UpdatedAt: "2023-10-01"},
	{ID: uuid.New().String(), Value: "Build a web app", Status: "In Progress", CreatedAt: "2023-10-02", UpdatedAt: "2023-10-03"},
	{ID: uuid.New().String(), Value: "Deploy to AWS", Status: "Completed", CreatedAt: "2023-10-04", UpdatedAt: "2023-10-05"},
	{ID: uuid.New().String(), Value: "Write tests", Status: "Pending", CreatedAt: "2023-10-06", UpdatedAt: "2023-10-07"},
	{ID: uuid.New().String(), Value: "Refactor code", Status: "In Progress", CreatedAt: "2023-10-08", UpdatedAt: "2023-10-09"},
	{ID: uuid.New().String(), Value: "Document the project", Status: "Pending", CreatedAt: "2023-10-10", UpdatedAt: "2023-10-11"},
	{ID: uuid.New().String(), Value: "Optimize performance", Status: "In Progress", CreatedAt: "2023-10-12", UpdatedAt: "2023-10-13"},
}

func ListTodoItems(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"todos": todos,
		"count": len(todos),
	})
}
