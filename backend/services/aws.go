package services

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/config"
)

func ConfigAWS() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic("unable to load SDK config, " + err.Error())
	}
	fmt.Println("Successfully loaded AWS SDK configuration:", cfg.Region)
}
