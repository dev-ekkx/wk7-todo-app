package services

import (
	"context"
	"fmt"
	"net/http"
	"time"

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
	{ID: uuid.New().String(), Value: "Learn Go", Status: "active", CreatedAt: "2023-10-01", UpdatedAt: "2023-10-01"},
	{ID: uuid.New().String(), Value: "Build a web app", Status: "active", CreatedAt: "2023-10-02", UpdatedAt: "2023-10-03"},
	{ID: uuid.New().String(), Value: "Deploy to AWS", Status: "completed", CreatedAt: "2023-10-04", UpdatedAt: "2023-10-05"},
	{ID: uuid.New().String(), Value: "Write tests", Status: "completed", CreatedAt: "2023-10-06", UpdatedAt: "2023-10-07"},
	{ID: uuid.New().String(), Value: "Refactor code", Status: "completed", CreatedAt: "2023-10-08", UpdatedAt: "2023-10-09"},
	{ID: uuid.New().String(), Value: "Document the project", Status: "active", CreatedAt: "2023-10-10", UpdatedAt: "2023-10-11"},
	{ID: uuid.New().String(), Value: "Optimize performance", Status: "completed", CreatedAt: "2023-10-12", UpdatedAt: "2023-10-13"},
}

func ListTodoItems(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"todos": todos,
	})
}

func CreateTodo(c *gin.Context) {

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid multipart form"})
		return
	}

	values := form.Value["value"]
	if len(values) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing 'value' field in form data"})
		return
	}

	currentDate := time.Now().Format("2025-01-01")

	newTodo := TodoStruct{
		ID:        uuid.New().String(),
		Value:     values[0],
		Status:    "pending",
		CreatedAt: currentDate,
		UpdatedAt: currentDate,
	}

	todos = append(todos, newTodo)
	fmt.Println(todos)
	c.JSON(http.StatusCreated, gin.H{"todo": newTodo})
}
