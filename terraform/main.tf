## Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

## APIM
resource "azurerm_resource_group" "apim" {
  location = "northeurope"
  name     = "rg-apim-sand-ne-002"
}

resource "azurerm_api_management" "core_apim" {
  location        = "northeurope"
  name            = "apim-sand-ne-002"
  publisher_email = "shelyagov12@gmail.com"
  publisher_name  = "Mykhailo Sheliahov"

  resource_group_name = azurerm_resource_group.apim.name
  sku_name            = "Consumption_0"
}

resource "azurerm_api_management_api" "products_api" {
  api_management_name = azurerm_api_management.core_apim.name
  name                = "products-service-api"
  resource_group_name = azurerm_resource_group.apim.name
  revision            = "1"
  path                = "products-service"

  display_name = "Products Service API"

  protocols = ["https"]
}

data "azurerm_function_app_host_keys" "products_keys" {
  name                = azurerm_windows_function_app.products_service.name
  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_api_management_backend" "products_fa" {
  name                = "products-service-backend"
  resource_group_name = azurerm_resource_group.apim.name
  api_management_name = azurerm_api_management.core_apim.name
  protocol            = "http"
  url                 = "https://${azurerm_windows_function_app.products_service.name}.azurewebsites.net/api"
  description         = "Products API"

  credentials {
    certificate = []
    query       = {}

    header = {
      "x-functions-key" = data.azurerm_function_app_host_keys.products_keys.default_function_key
    }
  }
}

resource "azurerm_api_management_api_policy" "api_policy" {
  api_management_name = azurerm_api_management.core_apim.name
  api_name            = azurerm_api_management_api.products_api.name
  resource_group_name = azurerm_resource_group.apim.name

  xml_content = <<XML
  <policies>
    <inbound>
      <cors allow-credentials="false">
        <allowed-origins>
          <origin>*</origin>
        </allowed-origins>
        <allowed-methods>
          <method>*</method>
        </allowed-methods>
        <allowed-headers>
          <header>*</header>
        </allowed-headers>
      </cors>
      <set-backend-service backend-id="${azurerm_api_management_backend.products_fa.name}"/>
      <base/>
    </inbound>
  <backend>
    <base/>
  </backend>
  <outbound>
    <base/>
  </outbound>
  <on-error>
    <base/>
  </on-error>
  </policies>
XML
}

resource "azurerm_api_management_api_operation" "get_products" {
  api_management_name = azurerm_api_management.core_apim.name
  api_name            = azurerm_api_management_api.products_api.name
  display_name        = "Get Products"
  method              = "GET"
  operation_id        = "get-products"
  resource_group_name = azurerm_resource_group.apim.name
  url_template        = "/products"
}

resource "azurerm_api_management_api_operation" "get_product_by_id" {
  api_management_name = azurerm_api_management.core_apim.name
  api_name            = azurerm_api_management_api.products_api.name
  display_name        = "Get Product by ID"
  method              = "GET"
  operation_id        = "get-product-by-id"
  resource_group_name = azurerm_resource_group.apim.name
  url_template        = "/products/{id}"

  template_parameter {
    name     = "id"
    required = true
    type     = "string"
  }
}

resource "azurerm_api_management_api_operation" "post_product" {
  api_management_name = azurerm_api_management.core_apim.name
  api_name            = azurerm_api_management_api.products_api.name
  display_name        = "Create Product"
  method              = "POST"
  operation_id        = "post-product"
  resource_group_name = azurerm_resource_group.apim.name
  url_template        = "/products"
}

resource "azurerm_api_management_api_operation" "get_products_total" {
  api_management_name = azurerm_api_management.core_apim.name
  api_name            = azurerm_api_management_api.products_api.name
  display_name        = "Get Products Total"
  method              = "GET"
  operation_id        = "get-products-total"
  resource_group_name = azurerm_resource_group.apim.name
  url_template        = "/product/total"
}

## Product Service Function
resource "azurerm_resource_group" "product_service_rg" {
  location = "northeurope"
  name     = "rg-product-service-sand-ne-003"
}

resource "azurerm_storage_account" "products_service_fa" {
  name     = "stgsangproductsfane003"
  location = "northeurope"

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_storage_share" "products_service_fa" {
  name  = "fa-products-service-share"
  quota = 2

  storage_account_name = azurerm_storage_account.products_service_fa.name
}

resource "azurerm_service_plan" "product_service_plan" {
  name     = "asp-product-service-sand-ne-001"
  location = "northeurope"

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_application_insights" "products_service_fa" {
  name             = "appins-fa-products-service-sand-ne-001"
  application_type = "web"
  location         = "northeurope"


  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_windows_function_app" "products_service" {
  name     = "fa-product-service-sand-ne-003"
  location = "northeurope"

  service_plan_id     = azurerm_service_plan.product_service_plan.id
  resource_group_name = azurerm_resource_group.product_service_rg.name

  storage_account_name       = azurerm_storage_account.products_service_fa.name
  storage_account_access_key = azurerm_storage_account.products_service_fa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.products_service_fa.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.products_service_fa.connection_string

    # For production systems set this to false
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com"]
    }

    application_stack {
      node_version = "~16"
    }
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.products_service_fa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.products_service_fa.name
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      app_settings,
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}

## App Config
resource "azurerm_app_configuration" "products_config" {
  location            = "northeurope"
  name                = "appconfig-products-service-sand-ne-002"
  resource_group_name = azurerm_resource_group.product_service_rg.name

  sku = "free"
}

## Cosmos DB

resource "azurerm_cosmosdb_account" "test_app" {
  location            = "northeurope"
  name                = "cos-app-sand-ne-001"
  offer_type          = "Standard"
  resource_group_name = azurerm_resource_group.product_service_rg.name
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Eventual"
  }

  capabilities {
    name = "EnableServerless"
  }

  geo_location {
    failover_priority = 0
    location          = "North Europe"
  }
}

resource "azurerm_cosmosdb_sql_database" "products_app" {
  account_name        = azurerm_cosmosdb_account.test_app.name
  name                = "products-db"
  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_cosmosdb_sql_container" "products" {
  account_name        = azurerm_cosmosdb_account.test_app.name
  database_name       = azurerm_cosmosdb_sql_database.products_app.name
  name                = "products"
  partition_key_path  = "/id"
  resource_group_name = azurerm_resource_group.product_service_rg.name

  # Cosmos DB supports TTL for the records
  default_ttl = -1


  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }
}

resource "azurerm_cosmosdb_sql_container" "stocks" {
  account_name        = azurerm_cosmosdb_account.test_app.name
  database_name       = azurerm_cosmosdb_sql_database.products_app.name
  name                = "stocks"
  partition_key_path  = "/product_id"
  resource_group_name = azurerm_resource_group.product_service_rg.name

  # Cosmos DB supports TTL for the records
  default_ttl = -1

  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }
}

## Import Service Function
resource "azurerm_resource_group" "import_service_rg" {
  location = "northeurope"
  name     = "rg-import-service-sand-ne-001"
}

resource "azurerm_storage_account" "import_service_fa" {
  name     = "stgsangimportfane002"
  location = "northeurope"

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_storage_account" "import_service_files" {
  name     = "stgsangimportfilesne002"
  location = "northeurope"

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["PUT", "GET"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 0
    }
  }

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_storage_share" "import_service_fa" {
  name  = "fa-import-service-share"
  quota = 2

  storage_account_name = azurerm_storage_account.import_service_fa.name
}

resource "azurerm_service_plan" "import_service_plan" {
  name     = "asp-import-service-sand-ne-001"
  location = "northeurope"

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_application_insights" "import_service_fa" {
  name             = "appins-fa-import-service-sand-ne-001"
  application_type = "web"
  location         = "northeurope"


  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_windows_function_app" "import_service" {
  name     = "fa-import-service-ne-001"
  location = "northeurope"

  service_plan_id     = azurerm_service_plan.import_service_plan.id
  resource_group_name = azurerm_resource_group.import_service_rg.name

  storage_account_name       = azurerm_storage_account.import_service_fa.name
  storage_account_access_key = azurerm_storage_account.import_service_fa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.import_service_fa.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.import_service_fa.connection_string

    # For production systems set this to false
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com"]
    }

    application_stack {
      node_version = "~16"
    }
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.import_service_fa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.import_service_fa.name
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      app_settings,
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}

## Import API

resource "azurerm_api_management_api" "import_api" {
  api_management_name = azurerm_api_management.core_apim.name
  name                = "import-service-api"
  resource_group_name = azurerm_resource_group.apim.name
  revision            = "1"
  path                = "import-service"

  display_name = "Import Service API"

  protocols = ["https"]
}

data "azurerm_function_app_host_keys" "import_keys" {
  name                = azurerm_windows_function_app.import_service.name
  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_api_management_backend" "import_fa" {
  name                = "import-service-backend"
  resource_group_name = azurerm_resource_group.apim.name
  api_management_name = azurerm_api_management.core_apim.name
  protocol            = "http"
  url                 = "https://${azurerm_windows_function_app.import_service.name}.azurewebsites.net/api"
  description         = "Import API"

  credentials {
    certificate = []
    query       = {}

    header = {
      "x-functions-key" = data.azurerm_function_app_host_keys.import_keys.default_function_key
    }
  }
}

resource "azurerm_api_management_api_policy" "import_api_policy" {
  api_management_name = azurerm_api_management.core_apim.name
  api_name            = azurerm_api_management_api.import_api.name
  resource_group_name = azurerm_resource_group.apim.name

  xml_content = <<XML
  <policies>
    <inbound>
      <cors allow-credentials="false">
        <allowed-origins>
          <origin>*</origin>
        </allowed-origins>
        <allowed-methods>
          <method>*</method>
        </allowed-methods>
        <allowed-headers>
          <header>*</header>
        </allowed-headers>
      </cors>
      <set-backend-service backend-id="${azurerm_api_management_backend.import_fa.name}"/>
      <base/>
    </inbound>
    <backend>
      <base/>
    </backend> 
    <outbound>
      <base/>
    </outbound>
    <on-error>
      <base/>
    </on-error>
  </policies>
XML
}

resource "azurerm_api_management_api_operation" "import_file" {
  api_management_name = azurerm_api_management.core_apim.name
  api_name            = azurerm_api_management_api.import_api.name
  display_name        = "Import Products"
  method              = "GET"
  operation_id        = "get-import-url"
  resource_group_name = azurerm_resource_group.apim.name
  url_template        = "/import"

  request {
    query_parameter {
      name     = "name"
      required = true
      type     = "string"
    }
  }
}

## Service Bus

resource "azurerm_resource_group" "service_bus" {
  location = "northeurope"
  name     = "rg-sb-integration-ne-001"
}

resource "azurerm_servicebus_namespace" "integration_sb" {
  location            = "northeurope"
  name                = "sb-integration-ne-001"
  resource_group_name = azurerm_resource_group.service_bus.name
  sku                 = "Standard"
  capacity            = 0 /* standard for sku plan */
  zone_redundant      = false
}

resource "azurerm_servicebus_topic" "products" {
  name                                    = "sb-topic-products-updates"
  namespace_id                            = azurerm_servicebus_namespace.integration_sb.id
  requires_duplicate_detection            = true
  duplicate_detection_history_time_window = "PT20S"
}

resource "azurerm_servicebus_subscription" "product_created" {
  name                                      = "sb-subscription-product-created"
  topic_id                                  = azurerm_servicebus_topic.products.id
  max_delivery_count                        = 2
  dead_lettering_on_filter_evaluation_error = true
  dead_lettering_on_message_expiration      = true
}

resource "azurerm_servicebus_subscription_rule" "product_created_event_type_filter" {
  name            = "event-type-product-created"
  subscription_id = azurerm_servicebus_subscription.product_created.id
  filter_type     = "SqlFilter"
  sql_filter      = "eventType = 'sb-subscription-product-created'"
}

resource "azurerm_servicebus_subscription" "product_batch_created" {
  name                                      = "sb-subscription-product-batch-created"
  topic_id                                  = azurerm_servicebus_topic.products.id
  max_delivery_count                        = 2
  dead_lettering_on_filter_evaluation_error = true
  dead_lettering_on_message_expiration      = true
}

resource "azurerm_servicebus_subscription_rule" "product_updated_event_type_filter" {
  name            = "event-type-product-batch-created"
  subscription_id = azurerm_servicebus_subscription.product_batch_created.id
  filter_type     = "SqlFilter"
  sql_filter      = "eventType = 'sb-subscription-product-batch-created'"
}

resource "azurerm_servicebus_subscription" "product_item" {
  name                                      = "sb-subscription-get-product-by-id"
  topic_id                                  = azurerm_servicebus_topic.products.id
  max_delivery_count                        = 2
  dead_lettering_on_filter_evaluation_error = true
  dead_lettering_on_message_expiration      = true
}

resource "azurerm_servicebus_subscription_rule" "product_item_event_type_filter" {
  name            = "event-type-get-product-by-id"
  subscription_id = azurerm_servicebus_subscription.product_item.id
  filter_type     = "SqlFilter"
  sql_filter      = "eventType = 'sb-subscription-get-product-by-id'"
}
