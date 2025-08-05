package main

import (
	"log"
	"os"

	"github.com/dev-ekkx/wk7-todo-app/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)

	// Load environment variables frm go dojo
	// er := godotenv.Load()
	// if er != nil {
	// 	log.Fatal("Error loading .env file")
	// }
	port := os.Getenv("PORT")

	r := gin.Default()
	r.Use(services.ConfigAWS)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/todos", services.ListTodoItems)
		api.POST("/create-todo", services.CreateTodo)
		api.PUT("/todos/:id/toggle", services.ToggleTodoStatus)
	}

	if port == "" {
		port = "8080"
	}
	err := r.Run(":" + port)
	if err != nil {
		log.Fatal("Error loading env: ", err)
		return
	}
}
