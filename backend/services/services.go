package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var (
	dynamoDbClient *dynamodb.Client
	tableName      = aws.String("TodoItems")
)

func tableExists(ctx context.Context) (bool, error) {
	exists := true
	_, err := dynamoDbClient.DescribeTable(
		ctx, &dynamodb.DescribeTableInput{TableName: tableName},
	)
	if err != nil {
		exists = false
		var notFoundEx *types.ResourceNotFoundException
		if errors.As(err, &notFoundEx) {
			log.Printf("Table %v does not exist.\n", &tableName)
			err = nil
		} else {
			log.Printf("Couldn't determine existence of table %v. Here's why: %v\n", tableName, err)
		}
	}
	return exists, err
}

func createTodoTable(ctx context.Context) (*types.TableDescription, error) {
	var tableDesc *types.TableDescription
	table, err := dynamoDbClient.CreateTable(ctx, &dynamodb.CreateTableInput{
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("id"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("status"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("createdAt"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("updatedAt"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("id"),
				KeyType:       types.KeyTypeHash,
			},
		},
		TableName:   tableName,
		BillingMode: types.BillingModePayPerRequest,
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("StatusIndex"),
				KeySchema: []types.KeySchemaElement{
					{AttributeName: aws.String("status"), KeyType: types.KeyTypeHash},
				},
				Projection: &types.Projection{ProjectionType: types.ProjectionTypeAll},
			},
			{
				IndexName: aws.String("CreatedAtIndex"),
				KeySchema: []types.KeySchemaElement{
					{AttributeName: aws.String("status"), KeyType: types.KeyTypeHash},
					{AttributeName: aws.String("createdAt"), KeyType: types.KeyTypeRange},
				},
				Projection: &types.Projection{ProjectionType: types.ProjectionTypeAll},
			},
			{
				IndexName: aws.String("UpdatedAtIndex"),
				KeySchema: []types.KeySchemaElement{
					{AttributeName: aws.String("status"), KeyType: types.KeyTypeHash},
					{AttributeName: aws.String("updatedAt"), KeyType: types.KeyTypeRange},
				},
				Projection: &types.Projection{ProjectionType: types.ProjectionTypeAll},
			},
		},
	})

	if err != nil {
		log.Printf("Couldn't create table %v. Here's why: %v\n", tableName, err)
	} else {
		waiter := dynamodb.NewTableExistsWaiter(dynamoDbClient)
		err = waiter.Wait(ctx, &dynamodb.DescribeTableInput{
			TableName: tableName}, 5*time.Minute)
		if err != nil {
			log.Printf("Wait for table exists failed. Here's why: %v\n", err)
		}
		tableDesc = table.TableDescription
		log.Printf("Creating table test")
	}
	return tableDesc, err
}

func ConfigAWS(c *gin.Context) {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic("unable to load SDK config, " + err.Error())
	}
	dynamoDbClient = dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
		o.BaseEndpoint = aws.String("http://localhost:8000")
	})

	fmt.Println("Successfully loaded AWS SDK configuration:", cfg.Region)

	// Check if table exists
	ctx := context.TODO()
	tExists, err := tableExists(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !tExists {
		_, err = createTodoTable(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	fmt.Println("Table exists? :", tExists)
}

func ListTodoItems(c *gin.Context) {
	input := &dynamodb.ScanInput{
		TableName: tableName,
	}

	output, err := dynamoDbClient.Scan(c, input)
	if err != nil {
		log.Printf("Failed to scan table: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch todos"})
		return
	}

	var todos []TodoStruct
	err = attributevalue.UnmarshalListOfMaps(output.Items, &todos)
	if err != nil {
		log.Printf("Failed to unmarshal items: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse todos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"todos": todos})
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

	currentDate := time.Now().Format("2006-01-02")
	fmt.Println(currentDate)

	newTodoDB := DBTodoStruct{
		ID:        uuid.NewString(),
		Value:     values[0],
		Status:    "pending",
		CreatedAt: currentDate,
		UpdatedAt: currentDate,
	}

	// Marshal todo item to DynamoDB format
	item, err := attributevalue.MarshalMap(newTodoDB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal todo item"})
		return
	}

	// Save todo item to DynamoDB
	_, err = dynamoDbClient.PutItem(c, &dynamodb.PutItemInput{
		TableName: tableName,
		Item:      item,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create todo item: %v", err.Error())})
		return
	}

	// Convert to JSON response struct
	newTodoJSON := TodoStruct(newTodoDB)

	// return the created todo item to frontend
	c.JSON(http.StatusCreated, gin.H{"todo": newTodoJSON})
}

func ToggleTodoStatus(c *gin.Context) {
	todoID := c.Param("id")
	if todoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing todo ID"})
		return
	}

	// 1. Get the current item by ID
	getInput := &dynamodb.GetItemInput{
		TableName: tableName,
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: todoID},
		},
	}

	result, err := dynamoDbClient.GetItem(c, getInput)
	if err != nil || result.Item == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo item not found"})
		return
	}

	var existing DBTodoStruct
	err = attributevalue.UnmarshalMap(result.Item, &existing)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal todo item"})
		return
	}

	// 2. Determine new status
	newStatus := "pending"
	if existing.Status == "pending" {
		newStatus = "completed"
	}
	currentTime := time.Now().Format("2006-01-02")

	// 3. Update the item with new status
	updateInput := &dynamodb.UpdateItemInput{
		TableName: tableName,
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: todoID},
		},
		UpdateExpression: aws.String("SET #s = :s, #u = :u"),
		ExpressionAttributeNames: map[string]string{
			"#s": "status",
			"#u": "updatedAt",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":s": &types.AttributeValueMemberS{Value: newStatus},
			":u": &types.AttributeValueMemberS{Value: currentTime},
		},
		ReturnValues: types.ReturnValueAllNew,
	}

	updated, err := dynamoDbClient.UpdateItem(c, updateInput)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update todo status"})
		return
	}

	var updatedTodo DBTodoStruct
	err = attributevalue.UnmarshalMap(updated.Attributes, &updatedTodo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse updated todo"})
		return
	}

	// 4. Convert to JSON response struct
	response := TodoStruct(updatedTodo)

	c.JSON(http.StatusOK, gin.H{"todo": response})
}
